import { TelemetryAssetType, TelemetryDeviceStatus, TelemetryMetric } from "../telemetry/telemetry.enums";
import { DetectedFaultStatus, FaultRuleType } from "./rules.enums";
import { RulesService } from "./rules.service";

function makeRepository(overrides: Record<string, unknown>) {
  return overrides;
}

const feederDevice = {
  id: "device-1",
  deviceCode: "FD-SYN-A-DEVICE",
  assetType: TelemetryAssetType.Feeder,
  assetId: "feeder-1",
  status: TelemetryDeviceStatus.Active,
  lastSeenAt: null,
  createdAt: new Date("2026-09-15T00:00:00.000Z"),
  updatedAt: new Date("2026-09-15T00:00:00.000Z")
};

const incidentsService = { openForFault: jest.fn().mockResolvedValue({ id: "incident-1" }) };

describe("RulesService", () => {
  beforeEach(() => incidentsService.openForFault.mockClear());

  it("returns normalized rule configuration views", async () => {
    const service = new RulesService(
      makeRepository({
        find: jest.fn().mockResolvedValue([
          {
            id: "rule-1",
            ruleType: FaultRuleType.FeederVoltageLoss,
            enabled: true,
            assetType: TelemetryAssetType.Feeder,
            warningThreshold: null,
            criticalThreshold: "1.0000",
            consecutiveCount: 3,
            timeoutSeconds: null
          }
        ])
      }) as never,
      makeRepository({}) as never,
      makeRepository({}) as never,
      incidentsService as never
    );

    await expect(service.listConfigs()).resolves.toEqual([
      {
        id: "rule-1",
        ruleType: "FEEDER_VOLTAGE_LOSS",
        enabled: true,
        assetType: "FEEDER",
        warningThreshold: null,
        criticalThreshold: 1,
        consecutiveCount: 3,
        timeoutSeconds: null
      }
    ]);
  });

  it("creates an active feeder voltage-loss fault and opens an incident after consecutive low readings", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const create = jest.fn((value: unknown) => value);
    const service = new RulesService(
      makeRepository({
        findOne: jest.fn().mockResolvedValue({
          ruleType: FaultRuleType.FeederVoltageLoss,
          assetType: TelemetryAssetType.Feeder,
          enabled: true,
          criticalThreshold: "1.0000",
          consecutiveCount: 3
        })
      }) as never,
      makeRepository({ findOne: jest.fn().mockResolvedValue(null), create, save }) as never,
      makeRepository({
        find: jest.fn().mockResolvedValue([
          { id: "r3", metric: TelemetryMetric.Voltage, numericValue: "0.7000", recordedAt: new Date("2026-09-15T12:02:00.000Z") },
          { id: "r2", metric: TelemetryMetric.Voltage, numericValue: "0.8000", recordedAt: new Date("2026-09-15T12:01:00.000Z") },
          { id: "r1", metric: TelemetryMetric.Voltage, numericValue: "0.9000", recordedAt: new Date("2026-09-15T12:00:00.000Z") }
        ])
      }) as never,
      incidentsService as never
    );

    await expect(service.evaluateTelemetry(feederDevice, new Date("2026-09-15T12:02:00.000Z"))).resolves.toEqual({
      faultDetected: true,
      fingerprint: "FEEDER_VOLTAGE_LOSS:FEEDER:feeder-1"
    });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      fingerprint: "FEEDER_VOLTAGE_LOSS:FEEDER:feeder-1",
      feederId: "feeder-1"
    }));
    expect(incidentsService.openForFault).toHaveBeenCalledWith(expect.objectContaining({ fingerprint: "FEEDER_VOLTAGE_LOSS:FEEDER:feeder-1" }));
  });

  it("does not detect feeder voltage loss until every required reading is below threshold", async () => {
    const service = new RulesService(
      makeRepository({
        findOne: jest.fn().mockResolvedValue({
          ruleType: FaultRuleType.FeederVoltageLoss,
          assetType: TelemetryAssetType.Feeder,
          enabled: true,
          criticalThreshold: "1.0000",
          consecutiveCount: 3
        })
      }) as never,
      makeRepository({ findOne: jest.fn(), create: jest.fn(), save: jest.fn() }) as never,
      makeRepository({
        find: jest.fn().mockResolvedValue([
          { id: "r3", metric: TelemetryMetric.Voltage, numericValue: "0.7000", recordedAt: new Date("2026-09-15T12:02:00.000Z") },
          { id: "r2", metric: TelemetryMetric.Voltage, numericValue: "13.8000", recordedAt: new Date("2026-09-15T12:01:00.000Z") },
          { id: "r1", metric: TelemetryMetric.Voltage, numericValue: "0.9000", recordedAt: new Date("2026-09-15T12:00:00.000Z") }
        ])
      }) as never,
      incidentsService as never
    );

    await expect(service.evaluateTelemetry(feederDevice, new Date("2026-09-15T12:02:00.000Z"))).resolves.toEqual({
      faultDetected: false
    });
    expect(incidentsService.openForFault).not.toHaveBeenCalled();
  });

  it("updates an existing active fault instead of creating a duplicate incident", async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const service = new RulesService(
      makeRepository({
        findOne: jest.fn().mockResolvedValue({ criticalThreshold: "1.0000", consecutiveCount: 3 })
      }) as never,
      makeRepository({ findOne: jest.fn().mockResolvedValue({ id: "fault-1", status: DetectedFaultStatus.Active }), update }) as never,
      makeRepository({
        find: jest.fn().mockResolvedValue([
          { id: "r3", numericValue: "0.7000", recordedAt: new Date("2026-09-15T12:02:00.000Z") },
          { id: "r2", numericValue: "0.8000", recordedAt: new Date("2026-09-15T12:01:00.000Z") },
          { id: "r1", numericValue: "0.9000", recordedAt: new Date("2026-09-15T12:00:00.000Z") }
        ])
      }) as never,
      incidentsService as never
    );

    await service.evaluateTelemetry(feederDevice, new Date("2026-09-15T12:02:00.000Z"));

    expect(update).toHaveBeenCalledWith({ id: "fault-1" }, expect.objectContaining({ lastDetectedAt: new Date("2026-09-15T12:02:00.000Z") }));
    expect(incidentsService.openForFault).not.toHaveBeenCalled();
  });
});