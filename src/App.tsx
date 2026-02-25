import { useEffect, useState } from "react";
import "./App.css";
import { ComponentForm } from "./components/ProductForm";
import { ComponentList } from "./components/ProductList";
import {
  CATEGORY_LABEL_BY_VALUE,
  normalizeCategory,
  type ComponentCategory,
  type PcComponent,
  type PcComponentDraft,
} from "./types/product";
import {
  ApiError,
  createComponent,
  deleteComponent,
  getComponents,
  updateComponent,
} from "./api/components";

const generateLocalId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sanitizeSku = (value: unknown, fallbackId: string): string => {
  const base = typeof value === "string" ? value : "";
  const normalized = base.trim().toUpperCase().replace(/\s+/g, "");
  if (normalized.length > 0) {
    return normalized;
  }
  return `LEGACY-${fallbackId.slice(0, 8).toUpperCase()}`;
};

const normalizeSkuInput = (value: string): string =>
  value.trim().toUpperCase().replace(/\s+/g, "");

const SKU_PREFIX_BY_CATEGORY: Readonly<Record<ComponentCategory, string>> = {
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  storage: "STO",
  motherboard: "MB",
  psu: "PSU",
  cooling: "COL",
  case: "CAS",
};

const ensureSkuByCategory = (category: ComponentCategory, rawSku: string): string => {
  const cleaned = normalizeSkuInput(rawSku).replace(/[^A-Z0-9-]/g, "");
  const parts = cleaned.split("-").filter((part) => part.length > 0);
  const knownPrefixes = Object.values(SKU_PREFIX_BY_CATEGORY);
  const withoutKnownPrefix =
    parts.length > 1 && knownPrefixes.includes(parts[0]) ? parts.slice(1) : parts;
  const suffix = withoutKnownPrefix.join("-");
  const prefix = SKU_PREFIX_BY_CATEGORY[category];
  return suffix.length > 0 ? `${prefix}-${suffix}` : `${prefix}-0001`;
};

const normalizeComponent = (component: PcComponent): PcComponent => ({
  ...component,
  category: normalizeCategory(component.category),
  especificacion:
    typeof component.especificacion === "string" ? component.especificacion : "",
  sku: sanitizeSku(
    typeof component.sku === "string" ? component.sku : "",
    typeof component.id === "string" ? component.id : generateLocalId(),
  ),
});

type ThemeMode = "light" | "dark";

const isConnectivityError = (error: unknown): boolean =>
  error instanceof ApiError && error.isNetworkError;

const isMissingApiRouteError = (error: unknown): boolean =>
  error instanceof ApiError && error.statusCode === 404;

const getUserErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof ApiError && error.message.trim().length > 0) {
    return error.message;
  }
  return fallbackMessage;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ComponentCategory | null>(null);
  const [editingComponent, setEditingComponent] = useState<PcComponent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  const loadComponents = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await getComponents();
      setComponents(response.map(normalizeComponent));
      setErrorMessage(null);
      setIsOfflineMode(false);
    } catch (error) {
      setLoadError("No se pudo cargar el inventario desde la API.");
      if (isConnectivityError(error) || isMissingApiRouteError(error)) {
        setErrorMessage(
          "API no disponible. Puedes seguir trabajando en modo local temporal.",
        );
        setIsOfflineMode(true);
      } else {
        setErrorMessage(
          getUserErrorMessage(error, "No se pudo cargar el inventario desde la API."),
        );
        setIsOfflineMode(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadComponents();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    window.localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => window.clearTimeout(timerId);
  }, [searchTerm]);

  const handleSaveComponent = async (draft: PcComponentDraft): Promise<void> => {
    if (isSaving) {
      return;
    }

    const normalizedDraft: PcComponentDraft = {
      ...draft,
      sku: ensureSkuByCategory(draft.category, draft.sku),
    };

    const duplicatedSku = components.some(
      (component) =>
        sanitizeSku(component.sku, component.id) === normalizedDraft.sku &&
        (editingComponent === null || component.id !== editingComponent.id),
    );
    if (duplicatedSku) {
      setErrorMessage("El SKU ya existe. Debe ser unico por componente.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      if (isOfflineMode) {
        if (editingComponent === null) {
          const localCreated: PcComponent = { id: generateLocalId(), ...normalizedDraft };
          setComponents((previous) => [...previous, localCreated]);
          return;
        }

        setComponents((previous) =>
          previous.map((component) =>
            component.id === editingComponent.id
              ? { id: editingComponent.id, ...normalizedDraft }
              : component,
          ),
        );
        setEditingComponent(null);
        return;
      }

      if (editingComponent === null) {
        const created = await createComponent(normalizedDraft);
        setComponents((previous) => [...previous, created]);
        return;
      }

      const updated = await updateComponent(editingComponent.id, normalizedDraft);
      setComponents((previous) =>
        previous.map((component) => (component.id === updated.id ? updated : component)),
      );
      setEditingComponent(null);
    } catch (error) {
      if (isConnectivityError(error)) {
        setErrorMessage(
          "No se pudo guardar en backend por falta de conexion. Activo modo local temporal para que no se pierda tu flujo.",
        );
        setIsOfflineMode(true);

        if (editingComponent === null) {
          const localCreated: PcComponent = { id: generateLocalId(), ...normalizedDraft };
          setComponents((previous) => [...previous, localCreated]);
          return;
        }

        setComponents((previous) =>
          previous.map((component) =>
            component.id === editingComponent.id
              ? { id: editingComponent.id, ...normalizedDraft }
              : component,
          ),
        );
        setEditingComponent(null);
        return;
      }

      setErrorMessage(getUserErrorMessage(error, "No se pudo guardar el componente."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditComponent = (component: PcComponent): void => {
    setEditingComponent(normalizeComponent(component));
  };

  const handleDeleteComponent = async (id: string): Promise<void> => {
    try {
      setErrorMessage(null);

      if (isOfflineMode) {
        setComponents((previous) => previous.filter((component) => component.id !== id));
        if (editingComponent !== null && editingComponent.id === id) {
          setEditingComponent(null);
        }
        return;
      }

      await deleteComponent(id);
      setComponents((previous) => previous.filter((component) => component.id !== id));

      if (editingComponent !== null && editingComponent.id === id) {
        setEditingComponent(null);
      }
    } catch (error) {
      if (isConnectivityError(error)) {
        setErrorMessage(
          "No se pudo eliminar en backend por falta de conexion. Se eliminara en modo local temporal.",
        );
        setIsOfflineMode(true);
        setComponents((previous) => previous.filter((component) => component.id !== id));
        if (editingComponent !== null && editingComponent.id === id) {
          setEditingComponent(null);
        }
        return;
      }

      setErrorMessage(getUserErrorMessage(error, "No se pudo eliminar el componente."));
    }
  };

  const handleCancelEdit = (): void => {
    setEditingComponent(null);
  };

  const normalizedSearchTerm = debouncedSearchTerm.trim().toLowerCase();
  const filteredComponents = components.filter((component) => {
    const categoryKey = normalizeCategory(component.category);
    const categoryLabel = CATEGORY_LABEL_BY_VALUE[categoryKey].toLowerCase();
    const bySearch =
      normalizedSearchTerm.length === 0 ||
      component.name.toLowerCase().includes(normalizedSearchTerm) ||
      component.especificacion.toLowerCase().includes(normalizedSearchTerm) ||
      component.sku.toLowerCase().includes(normalizedSearchTerm) ||
      categoryKey.includes(normalizedSearchTerm) ||
      categoryLabel.includes(normalizedSearchTerm);
    const byCategory =
      activeCategoryFilter === null ||
      categoryKey === activeCategoryFilter;
    return bySearch && byCategory;
  });
  const emptyInventoryMessage =
    normalizedSearchTerm.length > 0 || activeCategoryFilter !== null
      ? "Ups, no tenemos nada con ese nombre"
      : "No hay componentes registrados todavia.";
  const totalInventoryItems = components.reduce((sum, component) => sum + component.quantity, 0);
  const totalLowStockCount = components.filter((component) => component.quantity < 5).length;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al Contenido
      </a>

      <div className="theme-switch" role="group" aria-label="Selector de tema">
        <button
          type="button"
          className={`theme-icon-btn${themeMode === "light" ? " active" : ""}`}
          onClick={() => setThemeMode("light")}
          aria-label="Activar modo claro"
          aria-pressed={themeMode === "light"}
        >
          ☀
        </button>
        <button
          type="button"
          className={`theme-icon-btn${themeMode === "dark" ? " active" : ""}`}
          onClick={() => setThemeMode("dark")}
          aria-label="Activar modo oscuro"
          aria-pressed={themeMode === "dark"}
        >
          ☾
        </button>
      </div>

      <main id="main-content" className="app-shell">
        <section className="landing-hero" aria-labelledby="landing-title">
          <p className="hero-kicker">Gestor de Formularios</p>
          <h1 id="landing-title" className="text-balance">
            Centraliza Captura, Validacion y Gestion de Inventario Tecnico
          </h1>
          <p className="hero-copy">
            Una interfaz pensada para registrar componentes de PC, con control de
            stock y edicion rapida desde un unico panel.
          </p>
          <div className="hero-actions">
            <a className="button-link button-primary" href="#formulario">
              Empezar Registro
            </a>
            <a className="button-link button-secondary" href="#inventario">
              Ver Inventario
            </a>
          </div>
        </section>

        <section id="formulario" aria-label="Formulario principal">
          {isLoading ? (
            <div className="panel skeleton-panel" aria-live="polite" aria-label="Cargando formulario">
              <div className="skeleton-line w-35" />
              <div className="skeleton-line w-65" />
              <div className="skeleton-grid">
                <div className="skeleton-input" />
                <div className="skeleton-input" />
                <div className="skeleton-input" />
                <div className="skeleton-input" />
              </div>
            </div>
          ) : null}

          {loadError !== null ? (
            <div className="status-error-block" role="alert">
              <p className="status-error">{loadError}</p>
              <button type="button" className="button-muted" onClick={() => void loadComponents()}>
                Reintentar carga
              </button>
            </div>
          ) : null}

          {errorMessage !== null ? (
            <p aria-live="polite" className="status-error">
              {errorMessage}
            </p>
          ) : null}
          {isOfflineMode ? (
            <p aria-live="polite" className="status-text">
              Modo local activo: para sincronizar con API ejecuta <code>npm run dev:backend</code> en
              local o configura <code>VITE_API_URL</code> en produccion.
            </p>
          ) : null}

          {!isLoading ? (
            <ComponentForm
              editingComponent={editingComponent}
              onSave={handleSaveComponent}
              onCancelEdit={handleCancelEdit}
              isSaving={isSaving}
            />
          ) : null}
        </section>

        <section id="inventario" aria-label="Listado de inventario">
          {isLoading ? (
            <div className="panel skeleton-panel" aria-label="Cargando inventario">
              <div className="skeleton-line w-30" />
              <div className="skeleton-line w-45" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : (
            <ComponentList
              components={filteredComponents}
              totalCount={components.length}
              totalItems={totalInventoryItems}
              lowStockCount={totalLowStockCount}
              onEdit={handleEditComponent}
              onDelete={handleDeleteComponent}
              emptyMessage={emptyInventoryMessage}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              activeCategoryFilter={activeCategoryFilter}
              onCategoryFilterChange={setActiveCategoryFilter}
            />
          )}
        </section>
      </main>
    </>
  );
}

export default App;
