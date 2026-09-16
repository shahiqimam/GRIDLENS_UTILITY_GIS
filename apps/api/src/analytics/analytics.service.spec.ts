import { CrewStatus, WorkOrderStatus } from "../dispatch/dispatch.enums";
import { IncidentStatus } from "../incidents/incidents.enums";
import { AnalyticsService } from "./analytics.service";

function countRepository(counts: Record<string, number>, findResult: unknown[] = []) {
  return {
    count: jest.fn(({ where }: { where: { status: string } }) => Promise.resolve(counts[where.status] ?? 0)),
    find: jest.fn().mockResolvedValue(findResult)
  };
}

describe("AnalyticsService", () => {
  it("returns operations counts and active customer risk", async () => {
    const incidents = countRepository(
      { [IncidentStatus.Open]: 2, [IncidentStatus.Acknowledged]: 1, [IncidentStatus.Resolved]: 4 },
      [{ feederId: "feeder-1" }, { feederId: "feeder-1" }, { feederId: "feeder-2" }]
    );
    const workOrders = countRepository({ [WorkOrderStatus.Assigned]: 1, [WorkOrderStatus.EnRoute]: 2, [WorkOrderStatus.OnSite]: 3, [WorkOrderStatus.Complete]: 4 });
    const crews = countRepository({ [CrewStatus.Available]: 5, [CrewStatus.Assigned]: 6, [CrewStatus.Offline]: 7 });
    const networkService = {
      traceFeeder: jest
        .fn()
        .mockResolvedValueOnce({ affected: { estimatedCustomers: 400 } })
        .mockResolvedValueOnce({ affected: { estimatedCustomers: 250 } })
    };
    const service = new AnalyticsService(incidents as never, workOrders as never, crews as never, networkService as never);

    await expect(service.getOperationsSummary()).resolves.toEqual({
      incidents: { open: 2, acknowledged: 1, resolved: 4 },
      workOrders: { assigned: 1, enRoute: 2, onSite: 3, complete: 4 },
      crews: { available: 5, assigned: 6, offline: 7 },
      risk: { estimatedCustomers: 650, impactedFeeders: 2 }
    });
    expect(networkService.traceFeeder).toHaveBeenCalledTimes(2);
  });
});