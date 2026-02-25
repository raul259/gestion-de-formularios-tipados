import type { PcComponent, PcComponentDraft } from "../types/product";

type ApiSuccess<T> = {
  status: "success";
  data: T;
};

type ApiErrorPayload = {
  status?: "error";
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  statusCode: number | null;
  details: unknown;
  isNetworkError: boolean;

  constructor(
    message: string,
    options: {
      statusCode?: number | null;
      details?: unknown;
      isNetworkError?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = options.statusCode ?? null;
    this.details = options.details ?? null;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").trim();

const buildApiUrl = (path: string): string => {
  if (API_BASE_URL.length === 0) {
    return path;
  }
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Soporta VITE_API_URL con o sin sufijo /api para evitar rutas duplicadas /api/api/*
  const baseEndsWithApi = /\/api$/i.test(normalizedBase);
  const pathStartsWithApi = /^\/api(\/|$)/i.test(normalizedPath);
  if (baseEndsWithApi && pathStartsWithApi) {
    return `${normalizedBase}${normalizedPath.replace(/^\/api/i, "")}`;
  }

  return `${normalizedBase}${normalizedPath}`;
};

const parseApiError = async (response: Response): Promise<ApiError> => {
  let payload: ApiErrorPayload | null = null;

  try {
    const rawPayload: unknown = await response.json();
    if (rawPayload !== null && typeof rawPayload === "object") {
      const status = Reflect.get(rawPayload, "status");
      const message = Reflect.get(rawPayload, "message");
      const details = Reflect.get(rawPayload, "details");
      payload = {
        status: status === "error" ? "error" : undefined,
        message: typeof message === "string" ? message : undefined,
        details,
      };
    } else {
      payload = null;
    }
  } catch {
    payload = null;
  }

  const message =
    typeof payload?.message === "string" && payload.message.trim().length > 0
      ? payload.message
      : `API request failed with status ${response.status}`;

  return new ApiError(message, {
    statusCode: response.status,
    details: payload?.details ?? null,
  });
};

const executeRequest = async (path: string, init?: RequestInit): Promise<Response> => {
  try {
    const response = await fetch(buildApiUrl(path), {
      headers: {
        ...defaultHeaders,
        ...init?.headers,
      },
      ...init,
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("No se pudo conectar con la API", {
      isNetworkError: true,
    });
  }
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await executeRequest(path, init);
  const payload: ApiSuccess<T> = await response.json();
  return payload.data;
};

const requestVoid = async (path: string, init?: RequestInit): Promise<void> => {
  await executeRequest(path, init);
};

export const getComponents = async (): Promise<PcComponent[]> =>
  requestJson<PcComponent[]>("/api/components");

export const createComponent = async (draft: PcComponentDraft): Promise<PcComponent> =>
  requestJson<PcComponent>("/api/components", {
    method: "POST",
    body: JSON.stringify(draft),
  });

export const updateComponent = async (
  id: string,
  draft: PcComponentDraft,
): Promise<PcComponent> =>
  requestJson<PcComponent>(`/api/components/${id}`, {
    method: "PUT",
    body: JSON.stringify(draft),
  });

export const deleteComponent = async (id: string): Promise<void> => {
  await requestVoid(`/api/components/${id}`, {
    method: "DELETE",
  });
};
