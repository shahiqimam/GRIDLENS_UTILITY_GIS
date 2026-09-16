import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Incident } from "../incidents/incident.entity";
import { IncidentStatus } from "../incidents/incidents.enums";
import { Crew } from "./crew.entity";
import { CrewSpecialty, CrewStatus, WorkOrderStatus } from "./dispatch.enums";
import { CrewView, WorkOrderView } from "./dispatch.types";
import { WorkOrder } from "./work-order.entity";

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Crew) private readonly crews: Repository<Crew>,
    @InjectRepository(WorkOrder) private readonly workOrders: Repository<WorkOrder>,
    @InjectRepository(Incident) private readonly incidents: Repository<Incident>
  ) {}

  async listCrews(): Promise<CrewView[]> {
    const crews = await this.crews.find({ order: { status: "ASC", code: "ASC" } });
    return crews.map((crew) => this.toCrewView(crew));
  }

  async listOpenWorkOrders(): Promise<WorkOrderView[]> {
    const workOrders = await this.workOrders.find({
      relations: { crew: true },
      where: { status: Not(WorkOrderStatus.Complete) },
      order: { assignedAt: "DESC" },
      take: 100
    });
    return workOrders.map((workOrder) => this.toWorkOrderView(workOrder));
  }

  async dispatchIncident(incidentId: string): Promise<WorkOrderView> {
    const incident = await this.incidents.findOne({ where: { id: incidentId } });
    if (!incident) {
      throw new NotFoundException("Incident not found");
    }
    if (incident.status === IncidentStatus.Resolved) {
      throw new ConflictException("Resolved incidents cannot be dispatched");
    }

    const existing = await this.workOrders.findOne({
      relations: { crew: true },
      where: { incidentId, status: Not(WorkOrderStatus.Cancelled) }
    });
    if (existing) {
      return this.toWorkOrderView(existing);
    }

    const crew = await this.selectCrew();
    if (!crew) {
      throw new ConflictException("No available crews are online");
    }

    const assignedAt = new Date();
    const workOrder = this.workOrders.create({
      workOrderNumber: this.createWorkOrderNumber(incident, assignedAt),
      incidentId,
      crewId: crew.id,
      crew,
      status: WorkOrderStatus.Assigned,
      summary: incident.title,
      assignedAt,
      completedAt: null,
      metadata: {
        incidentNumber: incident.incidentNumber,
        incidentPriority: incident.priority,
        feederId: incident.feederId
      }
    });

    await this.crews.update({ id: crew.id }, { status: CrewStatus.Assigned });
    return this.toWorkOrderView(await this.workOrders.save(workOrder));
  }

  private async selectCrew(): Promise<Crew | null> {
    const feederCrew = await this.crews.findOne({
      where: { status: CrewStatus.Available, specialty: CrewSpecialty.Feeder },
      order: { shiftEndsAt: "DESC", code: "ASC" }
    });
    if (feederCrew) {
      return feederCrew;
    }
    return this.crews.findOne({
      where: { status: CrewStatus.Available },
      order: { shiftEndsAt: "DESC", code: "ASC" }
    });
  }

  private createWorkOrderNumber(incident: Incident, assignedAt: Date): string {
    const date = assignedAt.toISOString().slice(0, 10).replaceAll("-", "");
    return `WO-${date}-${incident.id.slice(0, 8).toUpperCase()}`;
  }

  private toCrewView(crew: Crew): CrewView {
    return {
      id: crew.id,
      code: crew.code,
      name: crew.name,
      specialty: crew.specialty,
      status: crew.status,
      homeBase: crew.homeBase,
      currentLatitude: Number(crew.currentLatitude),
      currentLongitude: Number(crew.currentLongitude),
      shiftEndsAt: crew.shiftEndsAt.toISOString()
    };
  }

  private toWorkOrderView(workOrder: WorkOrder): WorkOrderView {
    return {
      id: workOrder.id,
      workOrderNumber: workOrder.workOrderNumber,
      incidentId: workOrder.incidentId,
      crewId: workOrder.crewId,
      crewCode: workOrder.crew?.code,
      status: workOrder.status,
      summary: workOrder.summary,
      assignedAt: workOrder.assignedAt.toISOString(),
      completedAt: workOrder.completedAt?.toISOString() ?? null,
      metadata: workOrder.metadata
    };
  }
}