"use client";

type ApiFetcherOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export function buildApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

export async function apiFetcher<T = unknown>(
  path: string,
  options: ApiFetcherOptions = {}
): Promise<T> {
  const { headers: customHeaders, ...fetchOptions } = options;
  const response = await fetch(buildApiUrl(path), {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}
