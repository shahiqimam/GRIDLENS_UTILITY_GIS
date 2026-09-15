import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Feeder } from "./feeder.entity";
import { NetworkNode } from "./network-node.entity";
import { NetworkSegment } from "./network-segment.entity";
import { NetworkSummary, FeederOverview } from "./network.types";
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
}
