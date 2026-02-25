import type { MouseEvent } from "react";
import { CATEGORY_LABEL_BY_VALUE, normalizeCategory, type PcComponent } from "../types/product";
import type { ComponentCategory } from "../types/product";

type ComponentListProps = {
  components: PcComponent[];
  totalCount: number;
  totalItems: number;
  lowStockCount: number;
  onEdit: (component: PcComponent) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  activeCategoryFilter: ComponentCategory | null;
  onCategoryFilterChange: (value: ComponentCategory | null) => void;
};

export function ComponentList({
  components,
  totalCount,
  totalItems,
  lowStockCount,
  onEdit,
  onDelete,
  emptyMessage = "No hay componentes registrados todavia.",
  searchTerm,
  onSearchTermChange,
  activeCategoryFilter,
  onCategoryFilterChange,
}: ComponentListProps) {
  const handleEditClick = (
    event: MouseEvent<HTMLButtonElement>,
    component: PcComponent,
  ): void => {
    event.preventDefault();
    onEdit(component);
  };

  const handleDeleteClick = (
    event: MouseEvent<HTMLButtonElement>,
    id: string,
  ): void => {
    event.preventDefault();
    onDelete(id);
  };

  const escapeCsvValue = (value: string): string => `"${value.replace(/"/g, "\"\"")}"`;

  const handleDownloadClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const separator = ";";
    const headers = ["sku", "name", "especificacion", "category", "brand", "quantity", "inStock"];
    const rows = components.map((component) => [
      component.sku,
      component.name,
      component.especificacion,
      CATEGORY_LABEL_BY_VALUE[normalizeCategory(component.category)],
      component.brand,
      String(component.quantity),
      component.inStock ? "true" : "false",
    ]);

    const csvContent = [
      `sep=${separator}`,
      headers.join(separator),
      ...rows.map((row) => row.map(escapeCsvValue).join(separator)),
    ].join("\n");

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario-filtrado-${date}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="panel">
      <h2>Inventario de componentes</h2>

      <div className="inventory-stats" aria-label="Resumen de inventario">
        <p>
          <strong>Total de Items:</strong> {totalItems}
        </p>
        <p>
          <strong>Bajo Stock:</strong> {lowStockCount}
        </p>
      </div>

      <div className="inventory-search">
        <label htmlFor="inventory-search">Buscar por nombre o SKU</label>
        <div className="inventory-search-box">
          <span className="inventory-search-icon" aria-hidden="true">
            &#128270;
          </span>
          <input
            id="inventory-search"
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.currentTarget.value)}
            placeholder="Ej.: RTX 4070 o GPU-NV-3060"
            autoComplete="off"
          />
        </div>
      </div>

      <p className="results-counter" aria-live="polite">
        Mostrando {components.length} de {totalCount} componentes
      </p>
      <div className="inventory-actions">
        <button type="button" className="button-muted" onClick={handleDownloadClick}>
          Descargar resultados
        </button>
      </div>
      {activeCategoryFilter !== null ? (
        <p className="active-filter">
          Filtro activo: {CATEGORY_LABEL_BY_VALUE[activeCategoryFilter]}
          <button type="button" className="button-muted" onClick={() => onCategoryFilterChange(null)}>
            Limpiar filtro
          </button>
        </p>
      ) : null}

      {components.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul className="product-list">
          {components.map((component) => (
            <li
              key={component.id}
              className={`product-row${component.quantity < 5 ? " product-row-critical" : ""}`}
            >
              <div className="product-main">
                <strong>{component.name}</strong>
                <span>SKU: {component.sku || "SIN-SKU"}</span>
                <span className="tech-spec-chip" title={`Especificacion: ${component.especificacion}`}>
                  Spec: {component.especificacion}
                </span>
                <span>Marca: {component.brand}</span>
                <button
                  type="button"
                  className={`category-badge cat-${normalizeCategory(component.category)}`}
                  onClick={() => onCategoryFilterChange(normalizeCategory(component.category))}
                  title="Filtrar por esta categoria"
                >
                  {CATEGORY_LABEL_BY_VALUE[normalizeCategory(component.category)]}
                </button>
                <span>Stock: {component.quantity}</span>
                <span>{component.inStock ? "Disponible" : "Sin disponibilidad"}</span>
                {component.quantity < 5 ? (
                  <span className="stock-critical-badge" role="status" aria-label="Stock critico">
                    ! Reponer
                  </span>
                ) : null}
              </div>

              <div className="row-actions">
                <button type="button" onClick={(event) => handleEditClick(event, component)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="button-danger"
                  onClick={(event) => handleDeleteClick(event, component.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
