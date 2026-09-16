import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { DetectedFault } from "../rules/detected-fault.entity";
import { DetectedFaultSeverity } from "../rules/rules.enums";
import { Incident } from "./incident.entity";
import { IncidentPriority, IncidentSource, IncidentStatus } from "./incidents.enums";
import { IncidentView } from "./incidents.types";

@Injectable()
export class IncidentsService {
  constructor(@InjectRepository(Incident) private readonly incidents: Repository<Incident>) {}

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