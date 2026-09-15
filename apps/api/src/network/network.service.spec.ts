import { NetworkService } from "./network.service";
import { AssetOperationalStatus } from "./network.enums";

function makeRepository(overrides: Record<string, unknown>) {
  return overrides;
}

describe("NetworkService", () => {
  it("returns aggregate network summary counts", async () => {
    const service = new NetworkService(
      makeRepository({ count: jest.fn().mockResolvedValue(1) }) as never,
      makeRepository({ count: jest.fn().mockResolvedValue(2), find: jest.fn() }) as never,
      makeRepository({ count: jest.fn().mockResolvedValue(7) }) as never,
      makeRepository({ count: jest.fn().mockResolvedValue(6) }) as never,
      makeRepository({ count: jest.fn().mockResolvedValue(3) }) as never,
      makeRepository({
        count: jest.fn().mockResolvedValue(3),
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ estimatedCustomers: "1030" })
        })
      }) as never
    );

    await expect(service.getSummary()).resolves.toEqual({
      substations: 1,
      feeders: 2,
      nodes: 7,
      segments: 6,
      transformers: 3,
      serviceAreas: 3,
      estimatedCustomers: 1030
    });
  });

  it("returns feeder overviews without exposing full entity internals", async () => {
    const feeders = [
      {
        id: "feeder-1",
        code: "FD-SYN-A",
        name: "Synthetic Feeder A",
        status: AssetOperationalStatus.Active,
        estimatedCustomerCount: 420
      }
    ];
    const service = new NetworkService(
      makeRepository({ count: jest.fn() }) as never,
      makeRepository({ count: jest.fn(), find: jest.fn().mockResolvedValue(feeders) }) as never,
      makeRepository({ count: jest.fn() }) as never,
      makeRepository({ count: jest.fn() }) as never,
      makeRepository({ count: jest.fn() }) as never,
      makeRepository({ count: jest.fn(), createQueryBuilder: jest.fn() }) as never
    );

    await expect(service.listFeeders()).resolves.toEqual([
      {
        id: "feeder-1",
        code: "FD-SYN-A",
        name: "Synthetic Feeder A",
        status: "ACTIVE",
        estimatedCustomerCount: 420
      }
    ]);
  });
});
