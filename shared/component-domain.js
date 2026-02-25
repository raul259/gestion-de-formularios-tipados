export const COMPONENT_CATEGORIES = [
  "cpu",
  "gpu",
  "ram",
  "storage",
  "motherboard",
  "psu",
  "cooling",
  "case",
];

export const BRAND_OPTIONS_BY_CATEGORY = {
  cpu: ["Intel", "AMD"],
  gpu: ["NVIDIA", "AMD", "ASUS", "MSI", "Gigabyte", "Zotac", "EVGA", "PNY", "Sapphire", "PowerColor"],
  ram: ["Corsair", "G.Skill", "Kingston", "TeamGroup", "Crucial", "ADATA", "Patriot"],
  storage: ["Samsung", "Western Digital", "Crucial", "Kingston", "Sabrent", "Seagate", "PNY"],
  motherboard: ["ASUS", "MSI", "Gigabyte", "ASRock", "EVGA"],
  psu: ["Seasonic", "EVGA", "Corsair", "Cooler Master", "Thermaltake", "be quiet!", "SilverStone"],
  cooling: ["Noctua", "Cooler Master", "NZXT", "Arctic", "DeepCool", "be quiet!", "Lian Li"],
  case: ["NZXT", "Lian Li", "Fractal Design", "Cooler Master", "Phanteks", "Corsair", "Hyte"],
};

export const CATEGORY_LABEL_BY_VALUE = {
  cpu: "Procesador (CPU)",
  gpu: "Tarjeta Grafica (GPU)",
  ram: "Memoria RAM",
  storage: "Almacenamiento (SSD/HDD)",
  motherboard: "Placa Base (Motherboard)",
  psu: "Fuente de Alimentacion (PSU)",
  cooling: "Refrigeracion (Cooling)",
  case: "Chasis (Case)",
};

export const normalizeCategory = (value) => {
  if (value === "ssd") {
    return "storage";
  }
  if (COMPONENT_CATEGORIES.includes(value)) {
    return value;
  }
  return "cpu";
};

export const isComponentCategory = (value) =>
  COMPONENT_CATEGORIES.includes(value);
