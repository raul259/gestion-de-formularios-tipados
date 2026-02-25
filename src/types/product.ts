import {
  BRAND_OPTIONS_BY_CATEGORY,
  CATEGORY_LABEL_BY_VALUE,
  COMPONENT_CATEGORIES,
  isComponentCategory,
  normalizeCategory,
} from "../../shared/component-domain.js";
import type { ComponentCategory } from "../../shared/component-domain.js";
export {
  BRAND_OPTIONS_BY_CATEGORY,
  CATEGORY_LABEL_BY_VALUE,
  COMPONENT_CATEGORIES,
  isComponentCategory,
  normalizeCategory,
};
export type { ComponentCategory } from "../../shared/component-domain.js";

export type PcComponent = {
  id: string;
  sku: string;
  name: string;
  especificacion: string;
  category: ComponentCategory;
  brand: string;
  quantity: number;
  inStock: boolean;
};

export type PcComponentDraft = Omit<PcComponent, "id">;

export const EMPTY_COMPONENT_DRAFT: PcComponentDraft = {
  sku: "",
  name: "",
  especificacion: "",
  category: "cpu",
  brand: BRAND_OPTIONS_BY_CATEGORY.cpu[0],
  quantity: 1,
  inStock: true,
};
