import { apiFetch } from './client';
import type { LocomotiveInfo, RouteCreate, RouteInfo, TelemetryFrame } from './types';

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/** GET /api/health */
export async function getHealth(): Promise<{ status: string }> {
  return apiFetch('/api/health');
}

// ---------------------------------------------------------------------------
// Locomotives
// ---------------------------------------------------------------------------

/** GET /api/locomotives */
export async function getLocomotives(): Promise<LocomotiveInfo[]> {
  return apiFetch('/api/locomotives');
}

/** GET /api/locomotives/:id */
export async function getLocomotive(id: string): Promise<LocomotiveInfo> {
  return apiFetch(`/api/locomotives/${id}`);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET /api/routes */
export async function getRoutes(): Promise<RouteInfo[]> {
  return apiFetch('/api/routes');
}

/** POST /api/routes */
export async function createRoute(data: RouteCreate): Promise<RouteInfo> {
  return apiFetch('/api/routes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** POST /api/routes/:routeId/generate — generates a single telemetry frame */
export async function generateTelemetryForRoute(
  routeId: string,
): Promise<TelemetryFrame> {
  return apiFetch(`/api/routes/${routeId}/generate`, { method: 'POST' });
}
