import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { NetworkService } from "../network/network.service";
import { DetectedFault } from "../rules/detected-fault.entity";
import { DetectedFaultSeverity } from "../rules/rules.enums";
import { Incident } from "./incident.entity";
import { IncidentPriority, IncidentSource, IncidentStatus } from "./incidents.enums";
import { IncidentActionActor, IncidentImpactView, IncidentView } from "./incidents.types";

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident) private readonly incidents: Repository<Incident>,
    private readonly networkService: NetworkService
  ) {}

  async listOpen(): Promise<IncidentView[]> {
    const incidents = await this.incidents.find({
      where: { status: Not(IncidentStatus.Resolved) },
      order: { openedAt: "DESC" },
      take: 100
    });

    return incidents.map((incident) => this.toView(incident));
  }

  async openForFault(fault: DetectedFault): Promise<IncidentView> {
    const existing = await this.incidents.findOne({
      where: {
        sourceFaultId: fault.id,
        status: Not(IncidentStatus.Resolved)
      }
    });

    if (existing) {
      return this.toView(existing);
    }

    const incident = this.incidents.create({
      incidentNumber: this.createIncidentNumber(fault),
      title: this.createTitle(fault),
      description: "Auto-opened from deterministic telemetry fault detection.",
      source: IncidentSource.DetectedFault,
      sourceFaultId: fault.id,
      feederId: fault.feederId,
      priority: fault.severity === DetectedFaultSeverity.Critical ? IncidentPriority.P1 : IncidentPriority.P2,
      status: IncidentStatus.Open,
      openedAt: fault.firstDetectedAt,
      acknowledgedAt: null,
      resolvedAt: null,
      metadata: {
        faultType: fault.faultType,
        faultFingerprint: fault.fingerprint,
        assetType: fault.assetType,
        assetId: fault.assetId,
        evidence: fault.evidence
      }
    });

    return this.toView(await this.incidents.save(incident));
  }



  async getImpact(id: string): Promise<IncidentImpactView> {
    const incident = await this.findByIdOrThrow(id);
    if (!incident.feederId) {
      return {
        incidentId: incident.id,
        incidentNumber: incident.incidentNumber,
        feederId: null,
        affected: { nodes: 0, segments: 0, transformers: 0, serviceAreas: 0, estimatedCustomers: 0 },
        nodeIds: [],
        segmentIds: [],
        transformerIds: [],
        serviceAreaIds: [],
        stoppedAtOpenSwitchNodeIds: []
      };
    }

    const trace = await this.networkService.traceFeeder(incident.feederId);
    return {
      incidentId: incident.id,
      incidentNumber: incident.incidentNumber,
      feederId: incident.feederId,
      affected: trace.affected,
      nodeIds: trace.nodeIds,
      segmentIds: trace.segmentIds,
      transformerIds: trace.transformerIds,
      serviceAreaIds: trace.serviceAreaIds,
      stoppedAtOpenSwitchNodeIds: trace.stoppedAtOpenSwitchNodeIds
    };
  }
  async acknowledge(id: string, actor: IncidentActionActor): Promise<IncidentView> {
    const incident = await this.findByIdOrThrow(id);
    if (incident.status === IncidentStatus.Resolved) {
      return this.toView(incident);
    }

    const acknowledgedAt = incident.acknowledgedAt ?? new Date();
    const updated = await this.incidents.save({
      ...incident,
      status: IncidentStatus.Acknowledged,
      acknowledgedAt,
      metadata: this.appendAction(incident.metadata, "acknowledged", acknowledgedAt, actor)
    });

    return this.toView(updated);
  }

  async resolve(id: string, actor: IncidentActionActor): Promise<IncidentView> {
    const incident = await this.findByIdOrThrow(id);
    if (incident.status === IncidentStatus.Resolved) {
      return this.toView(incident);
    }

    const resolvedAt = new Date();
    const acknowledgedAt = incident.acknowledgedAt ?? resolvedAt;
    const updated = await this.incidents.save({
      ...incident,
      status: IncidentStatus.Resolved,
      acknowledgedAt,
      resolvedAt,
      metadata: this.appendAction(incident.metadata, "resolved", resolvedAt, actor)
    });

    return this.toView(updated);
  }

  private async findByIdOrThrow(id: string): Promise<Incident> {
    const incident = await this.incidents.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException("Incident not found");
    }
    return incident;
  }

  private appendAction(metadata: Record<string, unknown>, action: string, at: Date, actor: IncidentActionActor): Record<string, unknown> {
    const existingActions = Array.isArray(metadata.actions) ? metadata.actions : [];
    return {
      ...metadata,
      actions: [
        ...existingActions,
        {
          action,
          at: at.toISOString(),
          userId: actor.id,
          email: actor.email,
          role: actor.role
        }
      ]
    };
  }
  private createIncidentNumber(fault: DetectedFault): string {
    const date = fault.firstDetectedAt.toISOString().slice(0, 10).replaceAll("-", "");
    return `GL-${date}-${fault.id.slice(0, 8).toUpperCase()}`;
  }

  private createTitle(fault: DetectedFault): string {
    return fault.faultType.replaceAll("_", " ");
  }

  private toView(incident: Incident): IncidentView {
    return {
      id: incident.id,
      incidentNumber: incident.incidentNumber,
      title: incident.title,
      description: incident.description,
      source: incident.source,
      sourceFaultId: incident.sourceFaultId,
      feederId: incident.feederId,
      priority: incident.priority,
      status: incident.status,
      openedAt: incident.openedAt.toISOString(),
      acknowledgedAt: incident.acknowledgedAt?.toISOString() ?? null,
      resolvedAt: incident.resolvedAt?.toISOString() ?? null,
      metadata: incident.metadata
    };
  }
}