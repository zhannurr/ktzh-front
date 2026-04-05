import { apiFetch } from './client';
import { API_BASE_URL } from './config';
import type {
  HealthHistoryItem,
  TelemetryHistoryItem,
  TelemetryResolution,
  TelemetryStats,
} from './types';

// ---------------------------------------------------------------------------
// Telemetry — per locomotive
// ---------------------------------------------------------------------------

/** GET /api/telemetry/:loco/latest */
export async function getLatestTelemetry(
  locomotiveId: string,
): Promise<TelemetryHistoryItem> {
  return apiFetch(`/api/telemetry/${locomotiveId}/latest`);
}

/**
 * GET /api/telemetry/:loco/history
 * @param from - ISO 8601 datetime string
 * @param to   - ISO 8601 datetime string
 * @param resolution - 'raw' | '1m' | '5m'
 */
export async function getTelemetryHistory(
  locomotiveId: string,
  from: string,
  to: string,
  resolution: TelemetryResolution = 'raw',
): Promise<TelemetryHistoryItem[]> {
  const params = new URLSearchParams({ from, to, resolution });
  return apiFetch(`/api/telemetry/${locomotiveId}/history?${params}`);
}

/**
 * GET /api/telemetry/:loco/stats
 * @param from - ISO 8601 datetime string
 * @param to   - ISO 8601 datetime string
 */
export async function getTelemetryStats(
  locomotiveId: string,
  from: string,
  to: string,
): Promise<TelemetryStats> {
  const params = new URLSearchParams({ from, to });
  return apiFetch(`/api/telemetry/${locomotiveId}/stats?${params}`);
}

/**
 * GET /api/telemetry/:loco/health-history
 * @param from - ISO 8601 datetime string
 * @param to   - ISO 8601 datetime string
 */
export async function getHealthHistory(
  locomotiveId: string,
  from: string,
  to: string,
): Promise<HealthHistoryItem[]> {
  const params = new URLSearchParams({ from, to });
  return apiFetch(`/api/telemetry/${locomotiveId}/health-history?${params}`);
}

// ---------------------------------------------------------------------------
// Telemetry — per route
// ---------------------------------------------------------------------------

/**
 * GET /api/telemetry/route/:routeId
 * @param routeId - UUID string
 * @param from    - ISO 8601 datetime string
 */
export async function getRouteTelemetry(
  routeId: string,
  from: string,
): Promise<TelemetryHistoryItem[]> {
  const params = new URLSearchParams({ from });
  return apiFetch(`/api/telemetry/route/${routeId}?${params}`);
}

/**
 * Returns a URL for downloading route telemetry as CSV.
 * Use as an anchor href or trigger with window.open().
 *
 * GET /api/telemetry/route/:routeId/export
 */
export function getRouteTelemetryExportUrl(
  routeId: string,
  from: string,
  to?: string,
): string {
  const params = new URLSearchParams({ from });
  if (to) params.set('to', to);
  return `${API_BASE_URL}/api/telemetry/route/${routeId}/export?${params}`;
}
