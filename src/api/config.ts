// API Base Configuration
// Backend runs at http://localhost:8000 by default
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8000';

export const WS_BASE_URL =
  (import.meta.env.VITE_WS_BASE_URL as string) ??
  API_BASE_URL.replace(/^http/, 'ws');
