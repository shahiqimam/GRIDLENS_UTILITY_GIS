export enum AssetOperationalStatus {
  Active = "ACTIVE",
  Degraded = "DEGRADED",
  Offline = "OFFLINE",
  Maintenance = "MAINTENANCE"
}

export enum NetworkNodeType {
  SubstationSource = "SUBSTATION_SOURCE",
  Junction = "JUNCTION",
  Switch = "SWITCH",
  TransformerConnection = "TRANSFORMER_CONNECTION",
  Terminal = "TERMINAL"
}

export enum SwitchState {
  Open = "OPEN",
  Closed = "CLOSED"
}

export enum SegmentType {
  Overhead = "OVERHEAD",
  Underground = "UNDERGROUND",
  Service = "SERVICE"
}

export enum SegmentStatus {
  Energized = "ENERGIZED",
  Deenergized = "DEENERGIZED",
  Faulted = "FAULTED",
  Maintenance = "MAINTENANCE"
}

export enum TransformerStatus {
  Online = "ONLINE",
  Degraded = "DEGRADED",
  Offline = "OFFLINE",
  Maintenance = "MAINTENANCE"
}
