import { TelemetryAssetType } from "../telemetry/telemetry.enums";
import { DetectedFaultSeverity, DetectedFaultStatus, FaultRuleType } from "../rules/rules.enums";
import { IncidentSource, IncidentStatus } from "./incidents.enums";
import { IncidentsService } from "./incidents.service";

const openedAt = new Date("2026-09-16T12:13:00.000Z");
const actor = { id: "user-1", email: "operations@gridlens.local", role: "OPERATOR" };

const fault = {
  id: "fault-1abcd000-0000-4000-8000-000000000001",
  fingerprint: "FEEDER_VOLTAGE_LOSS:FEEDER:feeder-1",
  faultType: FaultRuleType.FeederVoltageLoss,
  assetType: TelemetryAssetType.Feeder,
  assetId: "feeder-1",
  feederId: "feeder-1",
  severity: DetectedFaultSeverity.Critical,
  status: DetectedFaultStatus.Active,
  firstDetectedAt: openedAt,
  lastDetectedAt: openedAt,
  evidence: { threshold: 1 },
  createdAt: openedAt,
  updatedAt: openedAt
};

function makeIncident(overrides: Record<string, unknown> = {}) {
  return {
    id: "incident-1",
    incidentNumber: "GL-20260916-FAULT-1A",
    title: "FEEDER VOLTAGE LOSS",
    description: "Auto-opened from deterministic telemetry fault detection.",
    source: IncidentSource.DetectedFault,
    sourceFaultId: fault.id,
    feederId: fault.feederId,
    priority: "P1",
    status: IncidentStatus.Open,
    openedAt,
    acknowledgedAt: null,
    resolvedAt: null,
    metadata: { faultType: fault.faultType },
    createdAt: openedAt,
    updatedAt: openedAt,
    ...overrides
  };
}

describe("IncidentsService", () => {
  it("lists non-resolved incidents in API shape", async () => {
    const service = new IncidentsService({
      find: jest.fn().mockResolvedValue([makeIncident()])
    } as never);

    await expect(service.listOpen()).resolves.toEqual([
      expect.objectContaining({
        id: "incident-1",
        incidentNumber: "GL-20260916-FAULT-1A",
        status: "OPEN",
        openedAt: "2026-09-16T12:13:00.000Z"
      })
    ]);
  });

  it("opens a P1 incident for a new critical detected fault", async () => {
    const save = jest.fn(async (incident: unknown) => ({ id: "incident-1", createdAt: openedAt, updatedAt: openedAt, ...(incident as object) }));
    const service = new IncidentsService({
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value: unknown) => value),
      save
    } as never);

    const result = await service.openForFault(fault as never);

    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      sourceFaultId: fault.id,
      priority: "P1",
      status: "OPEN"
    }));
    expect(result).toEqual(expect.objectContaining({ sourceFaultId: fault.id, priority: "P1" }));
  });

  it("returns an existing non-resolved incident for the same fault", async () => {
    const save = jest.fn();
    const service = new IncidentsService({
      findOne: jest.fn().mockResolvedValue(makeIncident()),
      create: jest.fn(),
      save
    } as never);

    await expect(service.openForFault(fault as never)).resolves.toEqual(expect.objectContaining({ id: "incident-1" }));
    expect(save).not.toHaveBeenCalled();
  });

  it("acknowledges an open incident and records the actor", async () => {
    const save = jest.fn(async (incident: unknown) => incident);
    const service = new IncidentsService({
      findOne: jest.fn().mockResolvedValue(makeIncident()),
      save
    } as never);

    const result = await service.acknowledge("incident-1", actor);

    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      status: "ACKNOWLEDGED",
      acknowledgedAt: expect.any(Date),
      metadata: expect.objectContaining({
        actions: [expect.objectContaining({ action: "acknowledged", email: "operations@gridlens.local" })]
      })
    }));
    expect(result.status).toBe("ACKNOWLEDGED");
    expect(result.acknowledgedAt).not.toBeNull();
  });

  it("resolves an open incident and implicitly acknowledges it", async () => {
    const save = jest.fn(async (incident: unknown) => incident);
    const service = new IncidentsService({
      findOne: jest.fn().mockResolvedValue(makeIncident()),
      save
    } as never);

    const result = await service.resolve("incident-1", actor);

    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      status: "RESOLVED",
      acknowledgedAt: expect.any(Date),
      resolvedAt: expect.any(Date),
      metadata: expect.objectContaining({
        actions: [expect.objectContaining({ action: "resolved", userId: "user-1" })]
      })
    }));
    expect(result.status).toBe("RESOLVED");
    expect(result.resolvedAt).not.toBeNull();
  });

  it("returns a resolved incident without writing another action", async () => {
    const save = jest.fn();
    const service = new IncidentsService({
      findOne: jest.fn().mockResolvedValue(makeIncident({ status: IncidentStatus.Resolved, resolvedAt: openedAt })),
      save
    } as never);

    await expect(service.acknowledge("incident-1", actor)).resolves.toEqual(expect.objectContaining({ status: "RESOLVED" }));
    expect(save).not.toHaveBeenCalled();
  });
});