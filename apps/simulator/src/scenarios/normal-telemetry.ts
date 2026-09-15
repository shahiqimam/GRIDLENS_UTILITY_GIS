import { SeededRandom } from "../generators/seeded-random";

export type TelemetryMetricPayload = {
  metric: "voltage" | "current" | "load_percent" | "temperature" | "frequency" | "heartbeat";
  value: number;
  unit: string;
  quality: "GOOD" | "SUSPECT" | "BAD";
};

export type TelemetryEventPayload = {
  sourceEventId: string;
  deviceCode: string;
  recordedAt: string;
  metrics: TelemetryMetricPayload[];
};

const normalDevices = [
  "SS-SYN-01-DEVICE",
  "FD-SYN-A-DEVICE",
  "FD-SYN-B-DEVICE",
  "TX-SYN-A-001-DEVICE",
  "TX-SYN-B-001-DEVICE",
  "TX-SYN-B-002-DEVICE"
];

export function buildNormalTelemetryBatch(seed: number, recordedAt: Date, count = normalDevices.length): TelemetryEventPayload[] {
  const random = new SeededRandom(seed);
  return normalDevices.slice(0, count).map((deviceCode, index) => ({
    sourceEventId: `sim-normal-${recordedAt.getTime()}-${index + 1}`,
    deviceCode,
    recordedAt: recordedAt.toISOString(),
    metrics: [
      { metric: "voltage", value: round(random.between(13.4, 13.9), 2), unit: "kV", quality: "GOOD" },
      { metric: "load_percent", value: round(random.between(35, 72), 2), unit: "%", quality: "GOOD" },
      { metric: "heartbeat", value: 1, unit: "state", quality: "GOOD" }
    ]
  }));
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
