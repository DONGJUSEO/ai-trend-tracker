"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";

export function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${API_URL}/${path}`;
  }
  return `${API_URL}${path}`;
}

export async function apiFetcher<T = unknown>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

