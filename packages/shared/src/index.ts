export const GRIDLENS_SYNTHETIC_DATA_NOTICE =
  "GridLens uses fictional utility network, telemetry, incident, and crew data only.";

export type UserRole = "ADMIN" | "OPERATIONS" | "FIELD_ENGINEER" | "VIEWER";

export type AssetStatus = "ACTIVE" | "DEGRADED" | "OFFLINE" | "MAINTENANCE";

export type SegmentStatus = "ENERGIZED" | "DEENERGIZED" | "FAULTED" | "MAINTENANCE";

export type IncidentStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "DISPATCHED"
  | "ON_SITE"
  | "RESTORED"
  | "RESOLVED"
  | "CANCELLED";

