export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "ram"
  | "storage"
  | "motherboard"
  | "psu"
  | "cooling"
  | "case";

export const COMPONENT_CATEGORIES: ReadonlyArray<ComponentCategory>;
export const BRAND_OPTIONS_BY_CATEGORY: Readonly<
  Record<ComponentCategory, ReadonlyArray<string>>
>;
export const CATEGORY_LABEL_BY_VALUE: Readonly<Record<ComponentCategory, string>>;

export const normalizeCategory: (value: string) => ComponentCategory;
export const isComponentCategory: (value: string) => value is ComponentCategory;
