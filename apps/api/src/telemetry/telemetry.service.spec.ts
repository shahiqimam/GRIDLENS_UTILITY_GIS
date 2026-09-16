import { NotFoundException } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";
import { TelemetryService } from "./telemetry.service";
import { TelemetryAssetType, TelemetryDeviceStatus, TelemetryMetric, TelemetryQuality } from "./telemetry.enums";

const activeDevice = {
  id: "device-1",
  deviceCode: "FD-SYN-A-DEVICE",
  assetType: TelemetryAssetType.Feeder,
  assetId: "feeder-1",
  status: TelemetryDeviceStatus.Active,
  lastSeenAt: null,
  createdAt: new Date("2026-09-15T00:00:00.000Z"),
  updatedAt: new Date("2026-09-15T00:00:00.000Z")
};

const ingestDto = {
  sourceEventId: "sim-evt-0001",
  deviceCode: "FD-SYN-A-DEVICE",
  recordedAt: "2026-09-15T12:00:00.000Z",
  metrics: [
    { metric: TelemetryMetric.Voltage, value: 13.7, unit: "kV", quality: TelemetryQuality.Good },
    { metric: TelemetryMetric.LoadPercent, value: 61.2, unit: "%", quality: TelemetryQuality.Good }
  ]
};

function makeManager() {
  return {
    create: jest.fn((_entity, value: unknown) => value),
    save: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined)
  } as unknown as EntityManager;
}

describe("TelemetryService", () => {
  it("stores telemetry readings and updates device last-seen time", async () => {
    const manager = makeManager();
    const dataSource = {
      transaction: jest.fn(async (callback: (manager: EntityManager) => Promise<void>) => callback(manager))
    } as unknown as DataSource;
    const devices = { findOne: jest.fn().mockResolvedValue(activeDevice) };
    const readings = { exist: jest.fn().mockResolvedValue(false) };
    const rulesService = { evaluateTelemetry: jest.fn().mockResolvedValue({ faultDetected: false }) };
    const service = new TelemetryService(dataSource, devices as never, readings as never, rulesService as never);

    await expect(service.ingest(ingestDto)).resolves.toEqual({
      accepted: true,
      duplicate: false,
      readingsCreated: 2
    });
    expect(manager.save).toHaveBeenCalledWith(expect.any(Function), expect.arrayContaining([expect.objectContaining({ sourceEventId: "sim-evt-0001" })]));
    expect(manager.update).toHaveBeenCalledWith(expect.any(Function), { id: "device-1" }, { lastSeenAt: new Date("2026-09-15T12:00:00.000Z") });
    expect(rulesService.evaluateTelemetry).toHaveBeenCalledWith(activeDevice, new Date("2026-09-15T12:00:00.000Z"));
  });

  it("accepts duplicate source events as no-ops", async () => {
    const dataSource = { transaction: jest.fn() } as unknown as DataSource;
    const devices = { findOne: jest.fn().mockResolvedValue(activeDevice) };
    const readings = { exist: jest.fn().mockResolvedValue(true) };
    const rulesService = { evaluateTelemetry: jest.fn().mockResolvedValue({ faultDetected: false }) };
    const service = new TelemetryService(dataSource, devices as never, readings as never, rulesService as never);

    await expect(service.ingest(ingestDto)).resolves.toEqual({
      accepted: true,
      duplicate: true,
      readingsCreated: 0
    });
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it("rejects unknown telemetry devices", async () => {
    const dataSource = { transaction: jest.fn() } as unknown as DataSource;
    const devices = { findOne: jest.fn().mockResolvedValue(null) };
    const readings = { exist: jest.fn() };
    const rulesService = { evaluateTelemetry: jest.fn().mockResolvedValue({ faultDetected: false }) };
    const service = new TelemetryService(dataSource, devices as never, readings as never, rulesService as never);

    await expect(service.ingest(ingestDto)).rejects.toThrow(NotFoundException);
    expect(readings.exist).not.toHaveBeenCalled();
  });
});

