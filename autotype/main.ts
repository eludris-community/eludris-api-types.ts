import { FileHandle, open } from "fs/promises";
import {
  StructInfo,
  ItemInfo,
  EnumInfo,
  RouteInfo,
  FieldInfo,
  VariantType,
  EnumVariant,
} from "./types";
import { argv } from "process";
import { existsSync } from "fs";
import { createInterface } from "readline/promises";

const converters: Map<RegExp, (str: string) => string> = new Map([
  [/^String$/, (_) => "string"],
  [/^(u|i)(size|\d\d)$/, (str) => "number"],
  [
    /^Option<.+>/,
    (str) => convertType(str.replace(/^Option<(.+)>$/, "$1")) + " | null",
  ],
  [/^bool$/, (_) => "boolean"],
  [/^TempFile$/, (_) => "unknown"],
  [/^Box<.*>/, (str) => convertType(str.replace(/^Box<(.+)>$/, "$1"))],
  [/^IpAddr$/, (_) => "string"],
  [/^Vec<.*>/, (str) => convertType(str.replace(/^Vec<(.+)>$/, "$1[]"))],
]);

function switchCase(content: string, newCase: string | null): string {
  if (newCase == "SCREAMING_SNAKE_CASE") {
    return content.replace(/(\S)([A-Z])/gm, "$1_$2").toUpperCase();
  }
  return content;
}

function convertDoc(doc: string) {
  return doc.replace(/\[`(.+?)`\]/g, "{@link $1}");
}

function convertType(type: string): string {
  for (const [regex, converter] of converters) {
    if (regex.test(type)) {
      console.debug(`[DEBUG] Converting ${type} to ${converter(type)}`);
      return converter(type);
    }
  }
  return type;
}

function indent(str: string, spaces: number) {
  return str
    .split("\n")
    .map((line) => (line === "" ? "" : " ".repeat(spaces) + line))
    .join("\n");
}

function fieldToType(field: FieldInfo): string {
  let doc = "";
  if (field.doc) {
    doc = `/** ${convertDoc(field.doc)} */\n`;
  }
  return `${doc}${field.name}${field.ommitable ? "?" : ""}: ${convertType(
    field.field_type
  )}`;
}

function handleRoute(route: ItemInfo<RouteInfo>, routes: string[]) {
  let doc = "";
  if (route.doc) {
    doc = `/** ${convertDoc(route.doc)} */\n`;
  }
  const camelCaseName = route.name.replace(
    /_(\w)/g,
    (match: string, p1: string) => p1.toUpperCase()
  );
  routes.push(
    `${doc}export const ${camelCaseName} = () => ${route.item.route}`
  );
}

async function buildTypes(fh: FileHandle, typeUrl: string, routes: string[]) {
  console.log(`[INFO] Building types for ${typeUrl}`);
  const type = await (await fetch(typeUrl)).json();
  if (type.item.type === "struct") {
    handleStruct(fh, type);
  } else if (type.item.type === "enum") {
    handleEnum(fh, type);
  } else if (type.item.type === "route") {
    handleRoute(type, routes);
  } else {
    console.log(`[WARN] Unknown type ${type.type} for ${typeUrl}`);
  }
}

async function handleEnum(fh: FileHandle, info: ItemInfo<EnumInfo>) {
  await fh.write(
    `export type ${info.name} = ${
      info.item.variants.map((v) => `${info.name}${v.name}`).join(" | ") ||
      "never"
    }\n`
  );

  for (const variant of info.item.variants) {
    handleEnumVariant(fh, variant, info);
  }
}

async function handleEnumVariant(
  fh: FileHandle,
  variant: EnumVariant,
  info: ItemInfo<EnumInfo>
): Promise<string[]> {
  const { item, name } = info;
  console.log("content", item.content, variant.name);
  let typeStr = "";
  let doc = "";
  let bases: string[] = [];
  if (variant.type === VariantType.Unit) {
    if (item.tag) {
      if (variant.doc) {
        doc = `/** ${convertDoc(variant.doc)} */`;
      }
      typeStr += `  ${item.tag}: "${switchCase(
        variant.name,
        item.rename_all
      )}"\n`;
    }
  } else if (variant.type === VariantType.Tuple) {
    if (item.tag) {
      typeStr += `  ${item.tag}: "${switchCase(
        variant.name,
        item.rename_all
      )}"\n`;
      if (variant.doc) {
        doc += `  /** ${convertDoc(variant.doc)} */`;
      }
      if (item.content) {
        typeStr += `  ${item.content}: ${convertType(variant.field_type)}\n`;
      }
    }
  } else if (variant.type === VariantType.Struct) {
    if (!item.tag) {
      return [];
    }
    if (variant.doc) {
      doc = `/** ${convertDoc(variant.doc)} */`;
    }
    typeStr += `  ${item.tag}: "${switchCase(
      variant.name,
      item.rename_all
    )}"\n`;

    if (item.content) {
      typeStr += `  ${item.content}: {\n`;
    }
    for (const field of variant.fields) {
      if (field.flattened) {
        bases.push(convertType(field.field_type));
      } else {
        typeStr += fieldToType(field) + "\n";
      }
    }
    if (item.content) {
      typeStr += "  }\n";
    }
  }
  typeStr += "}";
  let basesStr = bases.join(", ");
  if (basesStr) {
    basesStr = ` extends ${basesStr}`;
  }

  typeStr =
    `${doc}\nexport interface ${name}${variant.name}${basesStr} {\n` + typeStr;
  await fh.write(typeStr + "\n");

  return bases;
}

async function handleStruct(fh: FileHandle, info: ItemInfo<StructInfo>) {
  let doc = "";
  if (info.doc) {
    doc = `/** ${convertDoc(info.doc)} */\n`;
  }
  let bases: string[] = [];
  let typeStr = '{\n';
  for (const field of info.item.fields) {
    if (field.flattened) {
      bases.push(convertType(field.field_type));
    } else {
      typeStr += fieldToType(field) + "\n";
    }
  }

  await fh.write(`${doc}export interface ${info.name}${ bases.length ? " extends" : "" } ${bases.join(", ")} ${typeStr}}\n`);
}

async function main(inventoryIndex: string, output: string) {
  let routes: string[] = [];

  const inventory: {
    version: string;
    items: string[];
  } = await (await fetch(`${inventoryIndex}/index.json`)).json();
  console.log(inventory);

  if (existsSync(`${output}/v${inventory["version"]}.ts`)) {
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

  let fh = await open(`${output}/v${inventory["version"]}.ts`, "w");
  await fh.write("// This file was @generated by typegen\n");

  await Promise.all(
    inventory.items.map((url) => {
      buildTypes(fh, `${inventoryIndex}/${url}`, routes);
    })
  );

  await fh.write(routes.join("\n"));
}

main(argv[2], argv[3]);
