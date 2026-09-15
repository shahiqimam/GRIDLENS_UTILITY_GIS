import { NetworkService } from "./network.service";
import { AssetOperationalStatus, NetworkNodeType, SwitchState } from "./network.enums";

function makeRepository(overrides: Record<string, unknown>) {
  return overrides;
}

const feederA = {
  id: "feeder-a",
  code: "FD-SYN-A",
  name: "Synthetic Feeder A",
  status: AssetOperationalStatus.Active,
  sourceNodeId: "source",
  estimatedCustomerCount: 420
};

const topologyNodes = [
  { id: "source", nodeType: NetworkNodeType.SubstationSource, switchState: null },
  { id: "junction", nodeType: NetworkNodeType.Junction, switchState: null },
  { id: "switch", nodeType: NetworkNodeType.Switch, switchState: SwitchState.Closed },
  { id: "tx-node", nodeType: NetworkNodeType.TransformerConnection, switchState: null }
];

const topologySegments = [
  { id: "seg-1", code: "SG-001", feederId: "feeder-a", fromNodeId: "source", toNodeId: "junction" },
  { id: "seg-2", code: "SG-002", feederId: "feeder-a", fromNodeId: "junction", toNodeId: "switch" },
  { id: "seg-3", code: "SG-003", feederId: "feeder-a", fromNodeId: "switch", toNodeId: "tx-node" }
];

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

  it("traces downstream feeder topology and calculates service impact", async () => {
    const service = new NetworkService(
      makeRepository({ count: jest.fn() }) as never,
      makeRepository({ findOne: jest.fn().mockResolvedValue(feederA) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue(topologyNodes) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue(topologySegments) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue([{ id: "tx-1" }]) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue([{ id: "sa-1", estimatedCustomers: 420 }]) }) as never
    );

    await expect(service.traceFeeder("feeder-a")).resolves.toMatchObject({
      feederId: "feeder-a",
      startNodeId: "source",
      affected: {
        nodes: 4,
        segments: 3,
        transformers: 1,
        serviceAreas: 1,
        estimatedCustomers: 420
      },
      nodeIds: ["source", "junction", "switch", "tx-node"],
      segmentIds: ["seg-1", "seg-2", "seg-3"],
      transformerIds: ["tx-1"],
      serviceAreaIds: ["sa-1"],
      stoppedAtOpenSwitchNodeIds: []
    });
  });

  it("stops tracing at an open switch", async () => {
    const openSwitchNodes = topologyNodes.map((node) =>
      node.id === "switch" ? { ...node, switchState: SwitchState.Open } : node
    );
    const service = new NetworkService(
      makeRepository({ count: jest.fn() }) as never,
      makeRepository({ findOne: jest.fn().mockResolvedValue(feederA) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue(openSwitchNodes) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue(topologySegments) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue([]) }) as never,
      makeRepository({ find: jest.fn().mockResolvedValue([]) }) as never
    );

    await expect(service.traceFeeder("feeder-a")).resolves.toMatchObject({
      affected: {
        nodes: 3,
        segments: 2,
        transformers: 0,
        serviceAreas: 0,
        estimatedCustomers: 0
      },
      nodeIds: ["source", "junction", "switch"],
      segmentIds: ["seg-1", "seg-2"],
      stoppedAtOpenSwitchNodeIds: ["switch"]
    });
  });
});
