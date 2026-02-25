# Gestor de Formularios Tipado (Inventario de Componentes PC)

Aplicacion `React + TypeScript` con backend `Node + Express` para gestionar inventario de componentes informaticos mediante un formulario controlado y tipado estricto.

## Objetivo academico cubierto

- `useState` con tipos explicitos (`PcComponent[]`, `PcComponent | null`, `PcComponentDraft`, etc.)
- Eventos tipados:
  - `ChangeEvent<HTMLInputElement>`
  - `ChangeEvent<HTMLSelectElement>`
  - `FormEvent<HTMLFormElement>`
  - `MouseEvent<HTMLButtonElement>`
- Props tipadas entre componentes (`App` -> `ComponentForm` y `ComponentList`)
- Sin `any`
- Sin cast forzado de elementos del DOM
- `strict: true` habilitado en TypeScript
- Uso de Radix (`@radix-ui/react-label`)

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

- `src/App.tsx`: estado principal, carga de datos, filtros, tema, integracion API
- `src/components/ProductForm.tsx`: formulario controlado (alta/edicion)
- `src/components/ProductList.tsx`: tabla/listado + stats + filtros visuales + export CSV filtrado
- `src/types/product.ts`: modelo tipado y reexport de dominio compartido
- `src/api/components.ts`: cliente API HTTP con manejo tipado de errores (`ApiError`)
- `shared/component-domain.js`: fuente unica de categorias, marcas y normalizacion
- `server/src/*`: backend por capas (routes/controller/service/repository/validation)

## Ejecucion local

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Healthcheck: `http://localhost:3001/api/health`

## Configuracion de API en produccion

En desarrollo, Vite usa proxy a `http://localhost:3001` para rutas `/api`.

En produccion (ejemplo: Vercel), define la variable:

- `VITE_API_URL`: URL base de tu backend.
  - Ejemplo recomendado: `https://tu-backend.com`
  - Tambien soportado: `https://tu-backend.com/api`

El frontend llamara automaticamente a:
- `https://tu-backend.com/api/components`
- `https://tu-backend.com/api/health`

Checklist rapido si aparece `404` en Vercel:

1. Verifica que `VITE_API_URL` existe en Vercel (Production).
2. Haz redeploy despues de guardar variables.
3. Comprueba que `GET <VITE_API_URL>/health` o `GET <VITE_API_URL>/api/health` responde.
4. Revisa en DevTools la URL real que falla (`/api/components`):
   - Si apunta al dominio del frontend, falta `VITE_API_URL`.
   - Si apunta a backend pero responde 404, la ruta backend no coincide.

## Acceso para otras personas

Si otra persona va a usar el formulario desde internet, necesita:

1. Frontend publicado (ejemplo: Vercel).
2. Backend publicado (Render, Railway, Fly.io, VPS, etc.).
3. Variable `VITE_API_URL` en el frontend apuntando al backend publico.

Flujo recomendado:

1. Publica el backend y verifica:
   - `GET https://tu-backend.com/api/health`
2. En el frontend (Vercel), configura:
   - `VITE_API_URL=https://tu-backend.com`
3. Redeploy del frontend.
4. Comparte la URL del frontend con tus usuarios.

Notas importantes:

- Si no configuras `VITE_API_URL`, en produccion el frontend intentara usar su propio dominio para `/api` y puede fallar con `404`.
- El backend actual usa memoria (no base de datos): si se reinicia, los datos se pierden. Para uso real por terceros, conviene persistencia (SQLite/PostgreSQL).

## Scripts

```bash
npm run dev:frontend   # Vite
npm run dev:backend    # Express API
npm run build          # tsc + vite build
npm run lint           # eslint
```

## Cumplimiento de restricciones (actividad)

- Modelo tipado principal:
  - `PcComponent` y `PcComponentDraft` en `src/types/product.ts`
- `useState` tipado:
  - Ejemplos: `useState<PcComponent[]>([])`, `useState<PcComponent | null>(null)`
- Eventos tipados:
  - `ChangeEvent<HTMLInputElement | HTMLSelectElement>`
  - `FormEvent<HTMLFormElement>`
  - `MouseEvent<HTMLButtonElement>`
- Formulario 100% controlado por estado:
  - `input`, `select`, `checkbox` en `src/components/ProductForm.tsx`
- Reglas de tipado estricto:
  - Sin `any`
  - Sin `as HTMLInputElement` ni cast forzados de DOM
  - Sin tipado implicito incorrecto

## Correcciones aplicadas (revision tecnica)

- Error handling API:
  - Se distingue conectividad vs errores de negocio para evitar divergencia local/remota.
- Fallback offline:
  - Solo activa modo local ante error real de red.
- Metrica de inventario:
  - `Total de Items` y `Bajo Stock` se calculan sobre el inventario completo, no sobre la lista filtrada.
- Dominio compartido:
  - Categorias y marcas centralizadas para frontend/backend.
- UI/Accesibilidad:
  - Icono de busqueda corregido.
  - Control de disponibilidad ajustado a tamano compacto (no ocupa todo el ancho).
  - `index.html` principal con `lang="es"`.
- Backend:
  - Logging de errores no controlados en middleware 500.

## Por que hay dos `index.html`

- `index.html` (raiz): plantilla fuente de Vite para desarrollo.
- `dist/index.html`: archivo generado automaticamente al ejecutar `npm run build`.

No edites manualmente `dist/index.html`; se sobrescribe en cada build.

## Notas tecnicas

- El backend actual usa almacenamiento en memoria (sin base de datos persistente).
- Se incluyo compatibilidad con datos legacy de categoria (`ssd` -> `storage`).
