import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IncidentPriority, IncidentSource, IncidentStatus } from "./incidents.enums";

@Entity({ name: "incidents" })
export class Incident {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "incident_number", type: "varchar", length: 32, unique: true })
  incidentNumber!: string;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "enum", enum: IncidentSource, enumName: "incident_source" })
  source!: IncidentSource;

  @Column({ name: "source_fault_id", type: "uuid", nullable: true })
  sourceFaultId!: string | null;

  @Column({ name: "feeder_id", type: "uuid", nullable: true })
  feederId!: string | null;

  @Column({ type: "enum", enum: IncidentPriority, enumName: "incident_priority" })
  priority!: IncidentPriority;

  @Column({ type: "enum", enum: IncidentStatus, enumName: "incident_status", default: IncidentStatus.Open })
  status!: IncidentStatus;

  @Column({ name: "opened_at", type: "timestamptz" })
  openedAt!: Date;

  @Column({ name: "acknowledged_at", type: "timestamptz", nullable: true })
  acknowledgedAt!: Date | null;

  @Column({ name: "resolved_at", type: "timestamptz", nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: "jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}