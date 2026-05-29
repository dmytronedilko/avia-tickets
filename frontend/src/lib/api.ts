export class AuthExpiredError extends Error {
  constructor() {
    super("Auth expired");
    this.name = "AuthExpiredError";
  }
}

function authHeader(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErrorMessage(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message) && body.message.length > 0) {
      return String(body.message[0]);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

interface ApiOptions {
  token?: string | null;
  signal?: AbortSignal;
  /**
   * When true, a 401 response throws AuthExpiredError instead of a generic Error.
   * Use this on authenticated routes so the caller can sign the user out.
   */
  authRequired?: boolean;
}

export async function apiGet<T>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const res = await fetch(path, {
    headers: authHeader(opts.token),
    signal: opts.signal,
  });
  if (opts.authRequired && res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as T;
}

async function apiSend<T>(
  method: "POST" | "PATCH",
  path: string,
  body: unknown,
  opts: ApiOptions,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(opts.token),
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (opts.authRequired && res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return (await res.json()) as T;
}

export function apiPost<T>(
  path: string,
  body: unknown,
  opts: ApiOptions = {},
): Promise<T> {
  return apiSend<T>("POST", path, body, opts);
}

export function apiPatch<T>(
  path: string,
  body: unknown,
  opts: ApiOptions = {},
): Promise<T> {
  return apiSend<T>("PATCH", path, body, opts);
}
