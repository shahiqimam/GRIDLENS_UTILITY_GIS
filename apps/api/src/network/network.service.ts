import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Feeder } from "./feeder.entity";
import { NetworkNode } from "./network-node.entity";
import { NetworkSegment } from "./network-segment.entity";
import { NetworkNodeType, SwitchState } from "./network.enums";
import { DownstreamTraceResult, FeederOverview, NetworkSummary } from "./network.types";
import { ServiceArea } from "./service-area.entity";
import { Substation } from "./substation.entity";
import { Transformer } from "./transformer.entity";

@Injectable()
export class NetworkService {
  constructor(
    @InjectRepository(Substation) private readonly substations: Repository<Substation>,
    @InjectRepository(Feeder) private readonly feeders: Repository<Feeder>,
    @InjectRepository(NetworkNode) private readonly nodes: Repository<NetworkNode>,
    @InjectRepository(NetworkSegment) private readonly segments: Repository<NetworkSegment>,
    @InjectRepository(Transformer) private readonly transformers: Repository<Transformer>,
    @InjectRepository(ServiceArea) private readonly serviceAreas: Repository<ServiceArea>
  ) {}

  async getSummary(): Promise<NetworkSummary> {
    const [substations, feeders, nodes, segments, transformers, serviceAreas, impact] = await Promise.all([
      this.substations.count(),
      this.feeders.count(),
      this.nodes.count(),
      this.segments.count(),
      this.transformers.count(),
      this.serviceAreas.count(),
      this.serviceAreas
        .createQueryBuilder("serviceArea")
        .select("COALESCE(SUM(serviceArea.estimatedCustomers), 0)", "estimatedCustomers")
        .getRawOne<{ estimatedCustomers: string }>()
    ]);

    return {
      substations,
      feeders,
      nodes,
      segments,
      transformers,
      serviceAreas,
      estimatedCustomers: Number(impact?.estimatedCustomers ?? 0)
    };
  }

  async listFeeders(): Promise<FeederOverview[]> {
    const feeders = await this.feeders.find({ order: { code: "ASC" } });
    return feeders.map((feeder) => ({
      id: feeder.id,
      code: feeder.code,
      name: feeder.name,
      status: feeder.status,
      estimatedCustomerCount: feeder.estimatedCustomerCount
    }));
  }

  async traceFeeder(feederId: string, startNodeId?: string): Promise<DownstreamTraceResult> {
    const feeder = await this.feeders.findOne({ where: { id: feederId } });
    if (!feeder) {
      throw new NotFoundException("Feeder not found");
    }

    const traceStartNodeId = startNodeId ?? feeder.sourceNodeId;
    const [segments, nodes] = await Promise.all([
      this.segments.find({ where: { feederId }, order: { code: "ASC" } }),
      this.nodes.find()
    ]);
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    if (!nodesById.has(traceStartNodeId)) {
      throw new NotFoundException("Trace start node not found");
    }

    const outgoingByNode = new Map<string, NetworkSegment[]>();
    for (const segment of segments) {
      const outgoing = outgoingByNode.get(segment.fromNodeId) ?? [];
      outgoing.push(segment);
      outgoingByNode.set(segment.fromNodeId, outgoing);
    }

    const visitedNodeIds = new Set<string>();
    const affectedSegmentIds = new Set<string>();
    const stoppedAtOpenSwitchNodeIds = new Set<string>();
    const queue = [traceStartNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId || visitedNodeIds.has(nodeId)) {
        continue;
      }

      visitedNodeIds.add(nodeId);
      const node = nodesById.get(nodeId);
      if (node?.nodeType === NetworkNodeType.Switch && node.switchState === SwitchState.Open) {
        stoppedAtOpenSwitchNodeIds.add(node.id);
        continue;
      }

      for (const segment of outgoingByNode.get(nodeId) ?? []) {
        affectedSegmentIds.add(segment.id);
        queue.push(segment.toNodeId);
      }
    }

    const nodeIds = [...visitedNodeIds];
    const affectedTransformers = nodeIds.length > 0 ? await this.transformers.find({ where: { feederId, networkNodeId: In(nodeIds) } }) : [];
    const transformerIds = affectedTransformers.map((transformer) => transformer.id);
    const affectedServiceAreas = transformerIds.length > 0 ? await this.serviceAreas.find({ where: { transformerId: In(transformerIds) } }) : [];
    const estimatedCustomers = affectedServiceAreas.reduce((total, serviceArea) => total + serviceArea.estimatedCustomers, 0);

    return {
      traceId: `trace-${feeder.id}-${traceStartNodeId}`,
      feederId: feeder.id,
      startNodeId: traceStartNodeId,
      affected: {
        nodes: nodeIds.length,
        segments: affectedSegmentIds.size,
        transformers: affectedTransformers.length,
        serviceAreas: affectedServiceAreas.length,
        estimatedCustomers
      },
      nodeIds,
      segmentIds: [...affectedSegmentIds],
      transformerIds,
      serviceAreaIds: affectedServiceAreas.map((serviceArea) => serviceArea.id),
      stoppedAtOpenSwitchNodeIds: [...stoppedAtOpenSwitchNodeIds]
    };
  }
}
