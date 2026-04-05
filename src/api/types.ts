// Shared TypeScript types mirroring backend Pydantic schemas

export type LocomotiveState =
  | 'idle'
  | 'running'
  | 'fault'
  | 'maintenance'
  | string;

export interface LocomotiveInfo {
  id: string;
  name: string;
  type: string;
  max_speed_kmh: number;
  power_kw: number;
  mass_t: number;
  axles: number;
  current_state: LocomotiveState | null;
}

export interface RouteInfo {
  id: string;
  name: string;
  from_city: string;
  to_city: string;
  locomotive_type: string;
}

export interface RouteCreate {
  name: string;
  from_city: string;
  to_city: string;
  locomotive_type: string;
}

export interface TelemetryHistoryItem {
  timestamp: string; // ISO 8601
  speed: number;
  health_index: number;
  state: string;
  parameters: Record<string, unknown>;
}

export interface TelemetryFrame {
  locomotive: string;
  route_id: string;
  timestamp: string;
  speed: number;
  health_index: number;
  state: string;
  parameters: Record<string, unknown>;
}

export interface TelemetryStats {
  locomotive: string;
  from_time: string;
  to_time: string;
  speed_min: number;
  speed_max: number;
  speed_avg: number;
  health_min: number;
  health_max: number;
  health_avg: number;
}

export interface HealthHistoryItem {
  timestamp: string;
  health_index: number;
  state: string;
}

export type TelemetryResolution = 'raw' | '1m' | '5m';
