/* MIT License

Copyright (c) 2022-present Eludris

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

export enum ItemType {
  Struct = "struct",
  Enum = "enum",
  Route = "route",
}

export interface FieldInfo {
  name: string;
  doc: string | null;
  field_type: string;
  flattened: boolean;
  nullable: boolean;
  ommitable: boolean;
}

export interface StructInfo {
  type: ItemType.Struct;
  fields: FieldInfo[];
}

export enum VariantType {
  Unit = "unit",
  Tuple = "tuple",
  Struct = "struct",
}

export interface UnitEnumVariant {
  type: VariantType.Unit;
  name: string;
  doc: string | null;
}

export interface TupleEnumVariant {
  type: VariantType.Tuple;
  name: string;
  doc: string | null;
  field_type: string;
}

export interface StructEnumVariant {
  type: VariantType.Struct;
  name: string;
  doc: string | null;
  fields: FieldInfo[];
}

export type EnumVariant =
  | UnitEnumVariant
  | TupleEnumVariant
  | StructEnumVariant;

export interface EnumInfo {
  type: ItemType.Enum;
  tag: string | null;
  untagged: boolean;
  content: string | null;
  rename_all: string | null;
  variants: EnumVariant[];
}

export interface PathParamInfo {
  name: string;
  param_type: string;
}

export interface QueryParamInfo {
  name: string;
  param_type: string;
}

export interface RouteInfo {
  type: ItemType.Route;
  method: string;
  route: string;
  path_params: PathParamInfo[];
  query_params: QueryParamInfo[];
  body_type: string | null;
  return_type: string | null;
  guards: string[];
}

export type Item = StructInfo | EnumInfo | RouteInfo;

export interface ItemInfo<T extends Item = Item> {
  name: string;
  doc: string;
  category: string;
  hidden: boolean;
  package: string;
  item: T;
}
