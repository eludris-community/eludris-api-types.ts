import { stat } from "fs/promises";
import { createInterface } from "readline/promises";
import {
  Project,
  SourceFile,
} from "ts-morph";
import {
  EnumInfo,
  Item,
  ItemInfo,
  ItemType,
  RouteInfo,
  StructInfo,
  VariantType,
} from "./types";

import { snakeCase } from "lodash";

import { argv } from "process";

main(argv[2], argv[3]);

const converters: Map<RegExp, (str: string) => string> = new Map([
  [/^String$/, (_) => "string"],
  [/^str$/, (_) => "string"],
  [/^(u|i)(size|\d\d)$/, (str) => "number"],
  [
    /^Option<.+>/,
    (str) =>
      convertType(str.replace(/^(?:Option<)+([^<>]+)>*$/, "$1")) + " | null",
  ],
  [/^bool$/, (_) => "boolean"],
  [/^TempFile$/, (_) => "unknown"],
  [/^Box<.*>/, (str) => convertType(str.replace(/^Box<(.+)>$/, "$1"))],
  [/^IpAddr$/, (_) => "string"],
  [/^Vec<.*>/, (str) => convertType(str.replace(/^Vec<(.+)>$/, "$1[]"))],
]);

function convertType(type: string): string {
  for (const [regex, converter] of converters) {
    if (regex.test(type)) {
      return converter(type);
    }
  }
  return type;
}

function switchCase(content: string, newCase: string | null): string {
  if (newCase === "SCREAMING_SNAKE_CASE") {
    return `"${snakeCase(content).toUpperCase()}"`;
  } else if (newCase === "UPPERCASE") {
    return content.toUpperCase();
  }
  return content;
}

async function main(inventoryIndex: string, output: string) {
  const inventory: {
    version: string;
    items: string[];
  } = await (await fetch(`${inventoryIndex}/index.json`)).json();

  let exists = true;
  await stat(`${output}/v${inventory["version"]}.ts`, 
  ).catch(() => {
    exists = false;
  });


  if (exists) {
    console.log(
      `[INFO] v${inventory["version"]}.ts already exists, do you want to overwrite it?`
    );
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await rl.question("Overwrite? (y/n) ");
    rl.close();
    if (answer !== "y") {
      return;
    }
  }

  const project = new Project();
  const sourceFile = project.createSourceFile(
    `${output}/v${inventory["version"]}.ts`,
    undefined,
    {
      overwrite: true,
    }
  );

  let items: ItemInfo[] = await Promise.all(
    inventory.items.sort().map(async (url) => {
      const response = await fetch(`${inventoryIndex}/${url}`);
      return await response.json();
    })
  );

  const builder = new Builder(sourceFile, items);
  builder.buildTypes();

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    ensureNewLineAtEndOfFile: true,
  });

  sourceFile.organizeImports();
  await sourceFile.save();
  await project.save();
}

class Builder {
  sourceFile: SourceFile;
  routes: ItemInfo<Item>[] = [];
  itemInfos: ItemInfo[] = [];

  constructor(sourceFile: SourceFile, itemInfos: ItemInfo[]) {
    this.sourceFile = sourceFile;
    this.itemInfos = itemInfos;
  }

  convertDoc(doc: string) {
    for (const route of this.routes) {
      doc = doc.replace(route.name, convertToCamelCase(route.name));
    }
    return doc.replace(/\[`(.+?)`\]/g, "{@link $1}");
  }

  buildTypes() {
    for (const itemInfo of this.itemInfos) {
      if (itemInfo.item.type === ItemType.Route) {
        this.routes.push(itemInfo);
      }
    }

    for (const itemInfo of this.itemInfos) {
      if (itemInfo.item.type === ItemType.Struct) {
        this.handleStruct(itemInfo as ItemInfo<StructInfo>);
      } else if (itemInfo.item.type === ItemType.Enum) {
        this.handleEnum(itemInfo as ItemInfo<EnumInfo>);
      } else if (itemInfo.item.type === ItemType.Route) {
        this.handleRoute(itemInfo as ItemInfo<RouteInfo>);
      }
    }

    this.sourceFile.addStatements((writer) => {
      writer.writeLine("export const ROUTES = {");
      for (const route of this.routes) {
        //docs
        writer.writeLine(formatDocString(route.doc));

        writer.writeLine(`${convertToCamelCase(route.name)},`);
      }
      writer.writeLine("};");
    });
  }

  handleStruct(itemInfo: ItemInfo<StructInfo>) {
    const { item, name, doc } = itemInfo;
    const struct = this.sourceFile.addInterface({
      name,
      isExported: false,
      docs: [this.convertDoc(doc)],
      extends: item.fields.filter((f) => f.flattened).map((f) => f.field_type),
    });
    struct.setIsExported(true);

    for (const field of item.fields.filter((f) => !f.flattened)) {
      const { name, doc, field_type } = field;

      const property = struct.addProperty({
        name,
        type: convertType(field_type),
        hasQuestionToken: field.ommitable,
      });

      if (doc) {
        property.addJsDoc(this.convertDoc(doc));
      }
    }
  }

  handleEnum(itemInfo: ItemInfo<EnumInfo>) {
    const { item, name, doc } = itemInfo;
    const union = this.sourceFile.addTypeAlias({
      name,
      isExported: true,
      docs: [this.convertDoc(doc)],
      type: item.variants.map((v) => name + v.name).join(" | "),
    });
    union.setIsExported(true);

    for (const variant of item.variants) {
      const variantInterface = this.sourceFile.addInterface({
        name: name + variant.name,
      });
      variantInterface.setIsExported(true);

      if (variant.type === VariantType.Unit) {
        if (item.tag) {
          const property = variantInterface.addProperty({
            name: item.tag,
            type: switchCase(`"${variant.name}"`, item.rename_all),
          });

          if (variant.doc) {
            property.addJsDoc(this.convertDoc(variant.doc));
          }
        } else {
          variantInterface.remove();
          const typeAlias = this.sourceFile.addTypeAlias({
            name: name + variant.name,
            type: switchCase(`"${variant.name}"`, item.rename_all),
          });
          if (variant.doc) {
            typeAlias.addJsDoc(this.convertDoc(variant.doc));
          }

          continue;
        }
      } else if (variant.type === VariantType.Tuple) {
        if (!item.tag) {
          continue;
        }

        const property = variantInterface.addProperty({
          name: item.tag,
          type: switchCase(`"${variant.name}"`, item.rename_all),
        });

        if (variant.doc) {
          property.addJsDoc(this.convertDoc(variant.doc));
        }

        if (item.content) {
          variantInterface.addProperty({
            name: item.content,
            type: convertType(variant.field_type),
          });
        }
      } else if (variant.type === VariantType.Struct) {
        if (!item.tag) {
          continue;
        }

        const property = variantInterface.addProperty({
          name: item.tag,
          type: switchCase(`"${variant.name}"`, item.rename_all),
        });

        if (variant.doc) {
          property.addJsDoc(this.convertDoc(variant.doc));
        }
        let toExtend: string[] = [];
        variantInterface.addMember((writer) => {
          writer.writeLine(`${item.content}: {`);
          for (const field of variant.fields) {
            if (field.flattened) {
              toExtend.push(convertType(field.field_type));
            } else {
              if (field.doc) {
                writer.writeLine(formatDocString(field.doc));
              }

              writer.write(`${field.name}`);

              if (field.ommitable) {
                writer.write("?");
              }

              writer.write(": ");

              writer.write(convertType(field.field_type));
              writer.write(";\n");
            }
          }
          writer.writeLine("}");
        });
        for (const type of toExtend) {
          variantInterface.addExtends(type);
        }

      }
    }
  }

  handleRoute(itemInfo: ItemInfo<RouteInfo>) {
    let params = [
      {
        name: "baseUrl",
        param_type: "string",
      },
    ];
    params = params.concat(itemInfo.item.path_params);
    params = params.concat(itemInfo.item.query_params);
    const camelCaseName = itemInfo.name.replace(/_(\w)/g, (_, c) =>
      c.toUpperCase()
    );

    const routeFunction = this.sourceFile.addFunction({
      name: camelCaseName,
      parameters: params.map((p) => ({
        name: convertToCamelCase(p.name),
        type: convertType(p.param_type),
      })),

      returnType: "string",
    });

    routeFunction.addStatements((writer) => {
      writer.write("return `${baseUrl}");
      const route = itemInfo.item.route.replace(/\/?\??<.+>/g, "");
      writer.write(`${route}/`);

      for (const pathParam of itemInfo.item.path_params) {
        const camelCaseParamName = convertToCamelCase(pathParam.name);
        writer.write(`\${${camelCaseParamName}}/`);
      }

      if (itemInfo.item.query_params.length > 0) {
        writer.write("?");
      }

      let queryParams = itemInfo.item.query_params.map(
        (p) => `\${${convertToCamelCase(p.name)}}`
      );
      writer.write(queryParams.join("&"));

      writer.write("`;");
    });
  }
}

function convertToCamelCase(str: string) {
  return str.replace(/_(\w)/g, (_, c) => c.toUpperCase());
}

function formatDocString(doc: string): string {
  const formattedDoc = " * " + doc.split("\n").join("\n * ").replace(/\* \n/g, "*\n");
  return `/**\n${formattedDoc}\n */`;
}