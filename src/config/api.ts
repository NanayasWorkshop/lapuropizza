// API configuration
// In development: use localhost
// In production: use same origin (frontend + backend on same server)

// In dev: use proxy (empty string = relative URL)
// In prod: frontend + backend on same server
export const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}
