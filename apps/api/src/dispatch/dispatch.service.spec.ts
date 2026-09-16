import { ConflictException } from "@nestjs/common";
import { IncidentPriority, IncidentSource, IncidentStatus } from "../incidents/incidents.enums";
import { CrewSpecialty, CrewStatus, WorkOrderStatus } from "./dispatch.enums";
import { DispatchService } from "./dispatch.service";

const now = new Date("2026-09-16T13:00:00.000Z");

const incident = {
  id: "incident-1",
  incidentNumber: "GL-20260916-ABCDEF12",
  title: "FEEDER VOLTAGE LOSS",
  description: null,
  source: IncidentSource.DetectedFault,
  sourceFaultId: "fault-1",
  feederId: "feeder-1",
  priority: IncidentPriority.P1,
  status: IncidentStatus.Open,
  openedAt: now,
  acknowledgedAt: null,
  resolvedAt: null,
  metadata: {},
  createdAt: now,
  updatedAt: now
};

const crew = {
  id: "crew-1",
  code: "CREW-FD-01",
  name: "North Feeder Response",
  specialty: CrewSpecialty.Feeder,
  status: CrewStatus.Available,
  homeBase: "North Service Yard",
  currentLatitude: "32.790500",
  currentLongitude: "-96.812300",
  shiftEndsAt: now,
  createdAt: now,
  updatedAt: now
};

function workOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "wo-1",
    workOrderNumber: "WO-20260916-INCIDENT",
    incidentId: incident.id,
    crewId: crew.id,
    crew,
    status: WorkOrderStatus.Assigned,
    summary: incident.title,
    assignedAt: now,
    completedAt: null,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

describe("DispatchService", () => {
  it("lists crews in API shape", async () => {
    const service = new DispatchService(
      { find: jest.fn().mockResolvedValue([crew]) } as never,
      {} as never,
      {} as never
    );

    await expect(service.listCrews()).resolves.toEqual([
      expect.objectContaining({ code: "CREW-FD-01", currentLatitude: 32.7905 })
    ]);
  });

  it("dispatches an incident to an available feeder crew", async () => {
    const save = jest.fn(async (value: unknown) => ({ id: "wo-1", createdAt: now, updatedAt: now, ...(value as object) }));
    const service = new DispatchService(
      { findOne: jest.fn().mockResolvedValue(crew), update: jest.fn().mockResolvedValue(undefined) } as never,
      { findOne: jest.fn().mockResolvedValue(null), create: jest.fn((value: unknown) => value), save } as never,
      { findOne: jest.fn().mockResolvedValue(incident) } as never
    );

    const result = await service.dispatchIncident(incident.id);

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ incidentId: incident.id, crewId: crew.id, status: "ASSIGNED" }));
    expect(result).toEqual(expect.objectContaining({ incidentId: incident.id, crewCode: "CREW-FD-01" }));
  });

  it("returns an existing non-cancelled work order for an incident", async () => {
    const save = jest.fn();
    const service = new DispatchService(
      { findOne: jest.fn(), update: jest.fn() } as never,
      { findOne: jest.fn().mockResolvedValue(workOrder()), save } as never,
      { findOne: jest.fn().mockResolvedValue(incident) } as never
    );

    await expect(service.dispatchIncident(incident.id)).resolves.toEqual(expect.objectContaining({ id: "wo-1" }));
    expect(save).not.toHaveBeenCalled();
  });

  it("rejects dispatch when no crews are available", async () => {
    const service = new DispatchService(
      { findOne: jest.fn().mockResolvedValue(null), update: jest.fn() } as never,
      { findOne: jest.fn().mockResolvedValue(null), create: jest.fn(), save: jest.fn() } as never,
      { findOne: jest.fn().mockResolvedValue(incident) } as never
    );

    await expect(service.dispatchIncident(incident.id)).rejects.toThrow(ConflictException);
  });
});