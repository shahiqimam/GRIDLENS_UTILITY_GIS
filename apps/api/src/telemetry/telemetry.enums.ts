export enum TelemetryAssetType {
  Substation = "SUBSTATION",
  Feeder = "FEEDER",
  Transformer = "TRANSFORMER"
}

export enum TelemetryDeviceStatus {
  Active = "ACTIVE",
  Disabled = "DISABLED"
}

export enum TelemetryMetric {
  Voltage = "voltage",
  Current = "current",
  LoadPercent = "load_percent",
  Temperature = "temperature",
  Frequency = "frequency",
  Heartbeat = "heartbeat"
}

export enum TelemetryQuality {
  Good = "GOOD",
  Suspect = "SUSPECT",
  Bad = "BAD"
}
