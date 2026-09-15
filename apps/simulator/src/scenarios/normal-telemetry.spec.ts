import { buildNormalTelemetryBatch } from "./normal-telemetry";

describe("buildNormalTelemetryBatch", () => {
  it("builds deterministic normal telemetry events", () => {
    const recordedAt = new Date("2026-09-15T12:00:00.000Z");
    const first = buildNormalTelemetryBatch(90210, recordedAt, 2);
    const second = buildNormalTelemetryBatch(90210, recordedAt, 2);

    expect(first).toEqual(second);
    expect(first).toHaveLength(2);
    expect(first[0]).toMatchObject({
      sourceEventId: "sim-normal-1789473600000-1",
      deviceCode: "SS-SYN-01-DEVICE",
      recordedAt: "2026-09-15T12:00:00.000Z"
    });
    expect(first[0]?.metrics).toHaveLength(3);
  });
});
