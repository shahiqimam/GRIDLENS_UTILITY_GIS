import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Incident } from "../incidents/incident.entity";
import { Crew } from "./crew.entity";
import { WorkOrderStatus } from "./dispatch.enums";

@Entity({ name: "work_orders" })
export class WorkOrder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "work_order_number", type: "varchar", length: 32, unique: true })
  workOrderNumber!: string;

  @Column({ name: "incident_id", type: "uuid" })
  incidentId!: string;

  @ManyToOne(() => Incident)
  @JoinColumn({ name: "incident_id" })
  incident!: Incident;

  @Column({ name: "crew_id", type: "uuid" })
  crewId!: string;

  @ManyToOne(() => Crew)
  @JoinColumn({ name: "crew_id" })
  crew!: Crew;

  @Column({ type: "enum", enum: WorkOrderStatus, enumName: "work_order_status", default: WorkOrderStatus.Assigned })
  status!: WorkOrderStatus;

  @Column({ type: "varchar", length: 180 })
  summary!: string;

  @Column({ name: "assigned_at", type: "timestamptz" })
  assignedAt!: Date;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt!: Date | null;

  @Column({ type: "jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}