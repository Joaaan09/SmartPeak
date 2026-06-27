// Cliente HTTP de SmartPeak.
//
// Responsabilidades:
// - Base = import.meta.env.VITE_API_URL.
// - `credentials: 'include'` para enviar/recibir la cookie httpOnly de refresh.
// - Inyecta `Authorization: Bearer <accessToken>` cuando hay token en memoria.
// - En 401 intenta UNA vez `POST /auth/refresh`; si va, reintenta la petición
//   original; si no, limpia la sesión.
// - Devuelve errores tipados (status, message, errores por campo).
//
// El accessToken vive en memoria (no en localStorage) por seguridad; lo gestiona
// AuthContext y se lo pasa a este módulo mediante `setAccessToken`.

const BASE_URL = import.meta.env.VITE_API_URL;

/** Errores de validación por campo que devuelve el backend (400). */
export type FieldErrors = Record<string, string>;

/** Error tipado de la capa de API. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: FieldErrors;

  constructor(status: number, message: string, errors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// --- Token en memoria -------------------------------------------------------

let accessToken: string | null = null;

/** Actualiza el accessToken en memoria (lo llama AuthContext). */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Devuelve el accessToken actual (útil para depurar). */
export function getAccessToken(): string | null {
  return accessToken;
}

// Callback que AuthContext registra para limpiar la sesión cuando el refresh
// falla de forma definitiva (evita un import circular con el contexto).
let onSessionExpired: (() => void) | null = null;

/** Registra el handler que se ejecuta cuando la sesión expira sin remedio. */
export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

// --- Núcleo de fetch --------------------------------------------------------

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Cabeceras extra; normalmente no hace falta tocarlas. */
  headers?: Record<string, string>;
  /** Interno: marca un reintento tras refresh para no entrar en bucle. */
  _isRetry?: boolean;
  /** Interno: si false, no intenta refresh en 401 (lo usa el propio refresh). */
  _allowRefresh?: boolean;
};

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
}

/** Extrae un mensaje y los errores de campo de una respuesta no OK. */
async function parseError(response: Response): Promise<ApiError> {
  let message = 'Se produjo un error. Inténtalo de nuevo.';
  let errors: FieldErrors | undefined;
  try {
    const data = (await response.json()) as {
      message?: string;
      errors?: FieldErrors;
    };
    if (data.message) message = data.message;
    if (data.errors) errors = data.errors;
  } catch {
    // Respuesta sin cuerpo JSON: nos quedamos con el mensaje por defecto.
  }
  return new ApiError(response.status, message, errors);
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: buildHeaders(options),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.ok) {
    // 204 / sin cuerpo: devolvemos undefined tipado.
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  throw await parseError(response);
}

/**
 * Petición a la API con refresh transparente.
 * En 401 (y si está permitido) intenta refrescar el token una sola vez y
 * reintenta la petición original. Si el refresh falla, limpia la sesión.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    const allowRefresh = options._allowRefresh !== false;
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      allowRefresh &&
      !options._isRetry
    ) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        // Reintento único con el token nuevo ya inyectado por buildHeaders.
        return rawRequest<T>(path, { ...options, _isRetry: true });
      }
      onSessionExpired?.();
    }
    throw error;
  }
}

// Promesa de refresh en vuelo (single-flight): si varias peticiones reciben 401
// a la vez, comparten un único `POST /auth/refresh` en lugar de dispararlo en
// paralelo. Se resetea al resolverse/rechazarse.
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Intenta renovar el accessToken usando la cookie de refresh.
 * Devuelve true si lo consiguió. No lanza: encapsula el resultado en booleano.
 *
 * Deduplica llamadas concurrentes: mientras hay un refresh pendiente, las
 * peticiones que también caen en 401 reutilizan la misma promesa.
 */
export function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const data = await rawRequest<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
        _allowRefresh: false,
      });
      setAccessToken(data.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
