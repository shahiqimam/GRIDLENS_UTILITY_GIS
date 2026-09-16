export enum FaultRuleType {
  FeederVoltageLoss = "FEEDER_VOLTAGE_LOSS",
  DeviceHeartbeatLoss = "DEVICE_HEARTBEAT_LOSS",
  TransformerOvertemperature = "TRANSFORMER_OVERTEMPERATURE"
}

export enum DetectedFaultSeverity {
  Warning = "WARNING",
  Critical = "CRITICAL"
}

export enum DetectedFaultStatus {
  Active = "ACTIVE",
  Cleared = "CLEARED"
}
