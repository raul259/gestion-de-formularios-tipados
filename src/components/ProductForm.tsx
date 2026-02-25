import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { Root } from "@radix-ui/react-label";
import {
  BRAND_OPTIONS_BY_CATEGORY,
  CATEGORY_LABEL_BY_VALUE,
  EMPTY_COMPONENT_DRAFT,
  COMPONENT_CATEGORIES,
  isComponentCategory,
  normalizeCategory,
  type PcComponent,
  type PcComponentDraft,
} from "../types/product";

type ComponentFormProps = {
  editingComponent: PcComponent | null;
  onSave: (draft: PcComponentDraft) => Promise<void> | void;
  onCancelEdit: () => void;
  isSaving: boolean;
};

export function ComponentForm({
  editingComponent,
  onSave,
  onCancelEdit,
  isSaving,
}: ComponentFormProps) {
  const [formData, setFormData] = useState<PcComponentDraft>(EMPTY_COMPONENT_DRAFT);
  const [showCustomBrandInput, setShowCustomBrandInput] = useState<boolean>(false);
  const [quantityInput, setQuantityInput] = useState<string>(String(EMPTY_COMPONENT_DRAFT.quantity));
  const [quantityFormatWarning, setQuantityFormatWarning] = useState<string>("");
  const [stockWarning, setStockWarning] = useState<string>("");

  useEffect(() => {
    if (editingComponent !== null) {
      setFormData({
        sku: typeof editingComponent.sku === "string" ? editingComponent.sku : "",
        name: editingComponent.name,
        especificacion:
          typeof editingComponent.especificacion === "string"
            ? editingComponent.especificacion
            : "",
        category: normalizeCategory(editingComponent.category),
        brand: editingComponent.brand,
        quantity: editingComponent.quantity,
        inStock: editingComponent.inStock,
      });
      const categoryBrands = BRAND_OPTIONS_BY_CATEGORY[normalizeCategory(editingComponent.category)];
      setShowCustomBrandInput(!categoryBrands.includes(editingComponent.brand));
      setQuantityInput(String(editingComponent.quantity));
      setQuantityFormatWarning("");
      return;
    }

    setFormData(EMPTY_COMPONENT_DRAFT);
    setShowCustomBrandInput(false);
    setQuantityInput(String(EMPTY_COMPONENT_DRAFT.quantity));
    setQuantityFormatWarning("");
  }, [editingComponent]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value;
    setFormData((previous) => ({
      ...previous,
      name: nextValue,
    }));
  };

  const handleSkuChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value.toUpperCase().replace(/\s+/g, "");
    setFormData((previous) => ({
      ...previous,
      sku: nextValue,
    }));
  };

  const handleSpecificationChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value;
    setFormData((previous) => ({
      ...previous,
      especificacion: nextValue,
    }));
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value;
    if (!isComponentCategory(value)) {
      return;
    }

    const categoryBrands = BRAND_OPTIONS_BY_CATEGORY[value];
    setFormData((previous) => ({
      ...previous,
      category: value,
      brand: categoryBrands[0],
    }));
    setShowCustomBrandInput(false);
  };

  const handleBrandChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextValue = event.currentTarget.value;
    if (nextValue === "__other__") {
      setShowCustomBrandInput(true);
      setFormData((previous) => ({
        ...previous,
        brand: "",
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      brand: nextValue,
    }));
    setShowCustomBrandInput(false);
  };

  const handleCustomBrandChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value;
    setFormData((previous) => ({
      ...previous,
      brand: nextValue,
    }));
  };

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.currentTarget.value;
    setQuantityInput(nextValue);

    if (!/^\d*$/.test(nextValue)) {
      setQuantityFormatWarning("Solo se permiten numeros enteros.");
      return;
    }

    setQuantityFormatWarning("");
    const nextQuantity = nextValue.length > 0 ? Number(nextValue) : 0;

    setFormData((previous) => ({
      ...previous,
      quantity: Number.isNaN(nextQuantity) ? 0 : nextQuantity,
    }));
  };

  const handleStockChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const isChecked = event.currentTarget.checked;
    setFormData((previous) => ({
      ...previous,
      inStock: isChecked,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    const submit = async () => {
      if (isSaving) {
        return;
      }
      if (quantityFormatWarning.length > 0) {
        return;
      }
      if (formData.quantity === 0 && formData.inStock) {
        setStockWarning("No puedes marcar disponible si la cantidad es 0.");
        return;
      }

      setStockWarning("");
      await onSave(formData);

      if (editingComponent === null) {
        setFormData((previous) => ({
          ...previous,
          sku: "",
          name: "",
          especificacion: "",
          quantity: 1,
          inStock: true,
        }));
        setQuantityInput("1");
        setQuantityFormatWarning("");
      }
    };

    event.preventDefault();
    void submit();
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    onCancelEdit();
  };

  return (
    <section className="panel form-step">
      <header className="step-header">
        <span className="step-badge">Paso 1</span>
        <div>
          <h2>{editingComponent === null ? "Datos del componente" : "Actualizar componente"}</h2>
          <p>Completa la ficha tecnica para registrar el item en inventario.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <div className="field-label-row">
            <Root htmlFor="component-sku">SKU</Root>
            <span
              className="info-chip"
              role="img"
              aria-label="Es un codigo unico para identificar cada producto."
              title="Es un codigo unico para identificar cada producto."
            >
              i
            </span>
          </div>
          <input
            id="component-sku"
            name="componentSku"
            type="text"
            value={formData.sku}
            onChange={handleSkuChange}
            placeholder="Ej.: GPU-NV-3060"
            autoComplete="off"
            required
          />
        </div>

        <div className="field">
          <Root htmlFor="component-name">Componente</Root>
          <input
            id="component-name"
            name="componentName"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Ej.: Ryzen 7 7800X3D..."
            autoComplete="off"
            required
          />
        </div>

        <div className="field">
          <Root htmlFor="component-specification">Especificacion Tecnica</Root>
          <input
            id="component-specification"
            name="componentSpecification"
            type="text"
            value={formData.especificacion}
            onChange={handleSpecificationChange}
            placeholder="Ej.: DDR5, NVMe, AM5, ATX"
            autoComplete="off"
            required
          />
        </div>

        <div className="field">
          <Root htmlFor="component-category">Categoria</Root>
          <select
            id="component-category"
            value={formData.category}
            onChange={handleCategoryChange}
          >
            {COMPONENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABEL_BY_VALUE[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <Root htmlFor="component-brand">Marca</Root>
          <select
            id="component-brand"
            name="componentBrand"
            value={showCustomBrandInput ? "__other__" : formData.brand}
            onChange={handleBrandChange}
          >
            {BRAND_OPTIONS_BY_CATEGORY[formData.category].map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
            <option value="__other__">Otra...</option>
          </select>
        </div>

        {showCustomBrandInput ? (
          <div className="field">
            <Root htmlFor="component-brand-other">Marca personalizada</Root>
            <input
              id="component-brand-other"
              name="componentBrandOther"
              type="text"
              value={formData.brand}
              onChange={handleCustomBrandChange}
              placeholder="Ej.: Marca local"
              autoComplete="off"
              required
            />
          </div>
        ) : null}

        <div className="field">
          <Root htmlFor="component-quantity">Cantidad en inventario</Root>
          <input
            id="component-quantity"
            name="componentQuantity"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantityInput}
            onChange={handleQuantityChange}
            className={quantityFormatWarning.length > 0 ? "input-invalid" : ""}
            required
          />
        </div>

        <div className="field stock-field">
          <Root htmlFor="component-in-stock">Disponibilidad</Root>
          <div className="toggle">
            <input
              id="component-in-stock"
              type="checkbox"
              checked={formData.inStock}
              onChange={handleStockChange}
              className="toggle-input"
            />
            <label className="toggle-track" htmlFor="component-in-stock" aria-hidden="true" />
            <span className="toggle-label">
              {formData.inStock ? "Disponible para venta" : "Sin disponibilidad"}
            </span>
          </div>
        </div>

        <div className="form-actions">
          {quantityFormatWarning.length > 0 ? (
            <p className="field-warning" role="alert">
              {quantityFormatWarning}
            </p>
          ) : null}
          {stockWarning.length > 0 ? (
            <p className="field-warning" role="alert">
              {stockWarning}
            </p>
          ) : null}
          <button type="submit" disabled={isSaving}>
            {isSaving
              ? "Guardando..."
              : editingComponent === null
                ? "Guardar"
                : "Actualizar"}
          </button>

          {editingComponent !== null ? (
            <button
              type="button"
              className="button-muted"
              onClick={handleCancelClick}
              disabled={isSaving}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
