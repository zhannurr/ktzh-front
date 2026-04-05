/**
 * Re-exports all public API helpers so consumers can import from a single path:
 *
 * import { getLocomotives, getLatestTelemetry, connectRouteWebSocket } from '@/api';
 */
export * from './config';
export * from './types';
export { ApiError } from './client';

export {
  getHealth,
  getLocomotives,
  getLocomotive,
  getRoutes,
  createRoute,
  generateTelemetryForRoute,
} from './locomotives';

export {
  getLatestTelemetry,
  getTelemetryHistory,
  getTelemetryStats,
  getHealthHistory,
  getRouteTelemetry,
  getRouteTelemetryExportUrl,
} from './telemetry';

export { connectRouteWebSocket } from './websocket';
