import { ValidationError } from "../utils/errors.js";
import {
  BRAND_OPTIONS_BY_CATEGORY,
  COMPONENT_CATEGORIES,
  normalizeCategory,
} from "../../../shared/component-domain.js";

const assertString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} debe ser texto no vacio`);
  }
  return value.trim();
};

const assertCategory = (value) => {
  const normalizedValue = normalizeCategory(value);
  if (!COMPONENT_CATEGORIES.includes(normalizedValue)) {
    throw new ValidationError("category no es valida", {
      allowedValues: COMPONENT_CATEGORIES,
    });
  }
  return normalizedValue;
};

const assertBrand = (value, category) => {
  const brand = assertString(value, "brand");
  const validBrands = BRAND_OPTIONS_BY_CATEGORY[category] ?? [];
  if (validBrands.includes(brand)) {
    return brand;
  }
  if (brand.length < 2 || brand.length > 40) {
    throw new ValidationError("brand personalizada debe tener entre 2 y 40 caracteres");
  }
  return brand;
};

const assertQuantity = (value) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError("quantity debe ser un entero mayor o igual a 0");
  }
  return value;
};

const assertBoolean = (value, fieldName) => {
  if (typeof value !== "boolean") {
    throw new ValidationError(`${fieldName} debe ser booleano`);
  }
  return value;
};

const assertSku = (value) => {
  const sku = assertString(value, "sku").toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9-]{4,40}$/.test(sku)) {
    throw new ValidationError("sku debe tener 4-40 caracteres A-Z, 0-9 o guion");
  }
  return sku;
};

export const validateComponentDraft = (payload) => {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError("Payload invalido");
  }

  const quantity = assertQuantity(payload.quantity);
  const inStock = assertBoolean(payload.inStock, "inStock");
  if (quantity === 0 && inStock) {
    throw new ValidationError("No puedes marcar disponible un item con stock 0");
  }

  const category = assertCategory(payload.category);
  return {
    sku: assertSku(payload.sku),
    name: assertString(payload.name, "name"),
    especificacion: assertString(payload.especificacion, "especificacion"),
    category,
    brand: assertBrand(payload.brand, category),
    quantity,
    inStock,
  };
};
