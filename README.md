# Gestor de Formularios Tipado (Inventario de Componentes PC)

Aplicacion `React + TypeScript` para gestionar inventario de componentes informaticos mediante un formulario controlado y tipado estricto.

## Funcionalidades principales

- CRUD de componentes (crear, editar, eliminar, listar)
- Formulario controlado con validaciones de negocio:
  - SKU obligatorio y unico
  - SKU normalizado a mayusculas
  - Especificacion tecnica obligatoria (ej.: `DDR5`, `NVMe`, `AM5`, `ATX`)
  - Prefijo de SKU generado/forzado por categoria (`CPU-`, `GPU-`, `RAM-`, etc.)
  - Regla de stock: no permite `inStock=true` con `quantity=0`
  - Marca dependiente de categoria + opcion `Otra...`
- Busqueda en tiempo real (nombre, SKU, especificacion y categoria)
- Debounce de busqueda (300ms)
- Filtro por clic en badge de categoria
- Contador de resultados (`Mostrando X de Y componentes`)
- Resumen de inventario (`Total de Items`, `Bajo Stock`)
- Alerta visual de stock critico (`quantity < 5`)
- Exportacion CSV del inventario filtrado (busqueda/categoria) con compatibilidad Excel ES (`sep=;`)
- Modo claro/oscuro con persistencia en `localStorage`
- Estados de UI:
  - Loading con skeletons
  - Error state con boton de reintento
  - Mensaje de no resultados (`Ups, no tenemos nada con ese nombre`)

## Categorias normalizadas

- Procesador (CPU)
- Tarjeta Grafica (GPU)
- Memoria RAM
- Almacenamiento (SSD/HDD)
- Placa Base (Motherboard)
- Fuente de Alimentacion (PSU)
- Refrigeracion (Cooling)
- Chasis (Case)

## Arquitectura

- `src/App.tsx`: estado principal, carga de datos, filtros, tema y persistencia local (`localStorage`)
- `src/components/ProductForm.tsx`: formulario controlado (alta/edicion)
- `src/components/ProductList.tsx`: tabla/listado + stats + filtros visuales + export CSV filtrado
- `src/types/product.ts`: modelo tipado y reexport de dominio compartido
- `shared/component-domain.js`: fuente unica de categorias, marcas y normalizacion

## Ejecucion local

```bash
npm install
npm run dev:frontend
```

- Frontend: `http://localhost:5173`
- Persistencia de inventario: `localStorage` del navegador

## Scripts

```bash
npm run dev:frontend   # Vite
npm run build          # tsc + vite build
npm run lint           # eslint
```

## Correcciones aplicadas (revision tecnica)

- Metrica de inventario:
  - `Total de Items` y `Bajo Stock` se calculan sobre el inventario completo, no sobre la lista filtrada.
- Dominio compartido:
  - Categorias y marcas centralizadas para frontend/backend.
- UI/Accesibilidad:
  - Icono de busqueda corregido.
  - Control de disponibilidad ajustado a tamano compacto (no ocupa todo el ancho).
  - `index.html` principal con `lang="es"`.

## Por que hay dos `index.html`

- `index.html` (raiz): plantilla fuente de Vite para desarrollo.
- `dist/index.html`: archivo generado automaticamente al ejecutar `npm run build`.

No edites manualmente `dist/index.html`; se sobrescribe en cada build.

## Notas tecnicas

- La app guarda inventario en `localStorage` del navegador.
- Se incluyo compatibilidad con datos legacy de categoria (`ssd` -> `storage`).
