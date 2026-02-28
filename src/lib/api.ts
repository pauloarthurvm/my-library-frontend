import "server-only";

function getApiBaseUrl(): string {
  const value = process.env.API_BASE_URL;

  if (!value) {
    throw new Error("Missing API_BASE_URL environment variable");
  }

  return value;
}

export function buildApiUrl(path: string): string {
  const normalizedBase = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status} ${response.statusText})`);
  }

  return (await response.json()) as T;
}
