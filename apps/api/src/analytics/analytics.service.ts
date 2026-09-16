import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Crew } from "../dispatch/crew.entity";
import { CrewStatus, WorkOrderStatus } from "../dispatch/dispatch.enums";
import { WorkOrder } from "../dispatch/work-order.entity";
import { Incident } from "../incidents/incident.entity";
import { IncidentStatus } from "../incidents/incidents.enums";
import { NetworkService } from "../network/network.service";
import { OperationsAnalyticsView } from "./analytics.types";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Incident) private readonly incidents: Repository<Incident>,
    @InjectRepository(WorkOrder) private readonly workOrders: Repository<WorkOrder>,
    @InjectRepository(Crew) private readonly crews: Repository<Crew>,
    private readonly networkService: NetworkService
  ) {}

  async getOperationsSummary(): Promise<OperationsAnalyticsView> {
    const [open, acknowledged, resolved, assigned, enRoute, onSite, complete, availableCrews, assignedCrews, offlineCrews, activeIncidents] = await Promise.all([
      this.incidents.count({ where: { status: IncidentStatus.Open } }),
      this.incidents.count({ where: { status: IncidentStatus.Acknowledged } }),
      this.incidents.count({ where: { status: IncidentStatus.Resolved } }),
      this.workOrders.count({ where: { status: WorkOrderStatus.Assigned } }),
      this.workOrders.count({ where: { status: WorkOrderStatus.EnRoute } }),
      this.workOrders.count({ where: { status: WorkOrderStatus.OnSite } }),
      this.workOrders.count({ where: { status: WorkOrderStatus.Complete } }),
      this.crews.count({ where: { status: CrewStatus.Available } }),
      this.crews.count({ where: { status: CrewStatus.Assigned } }),
      this.crews.count({ where: { status: CrewStatus.Offline } }),
      this.incidents.find({ where: [{ status: IncidentStatus.Open }, { status: IncidentStatus.Acknowledged }] })
    ]);

    const feederIds = [...new Set(activeIncidents.map((incident) => incident.feederId).filter((id): id is string => Boolean(id)))];
    const traces = await Promise.all(feederIds.map((feederId) => this.networkService.traceFeeder(feederId)));

    return {
      incidents: { open, acknowledged, resolved },
      workOrders: { assigned, enRoute, onSite, complete },
      crews: { available: availableCrews, assigned: assignedCrews, offline: offlineCrews },
      risk: {
        estimatedCustomers: traces.reduce((total, trace) => total + trace.affected.estimatedCustomers, 0),
        impactedFeeders: feederIds.length
      }
    };
  }
}