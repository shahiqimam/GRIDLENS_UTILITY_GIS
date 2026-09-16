import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TelemetryAssetType } from "../telemetry/telemetry.enums";
import { DetectedFaultSeverity, DetectedFaultStatus, FaultRuleType } from "./rules.enums";

@Entity({ name: "detected_faults" })
export class DetectedFault {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 180 })
  fingerprint!: string;

  @Column({ name: "fault_type", type: "enum", enum: FaultRuleType, enumName: "fault_rule_type" })
  faultType!: FaultRuleType;

  @Column({ name: "asset_type", type: "enum", enum: TelemetryAssetType, enumName: "telemetry_asset_type" })
  assetType!: TelemetryAssetType;

  @Column({ name: "asset_id", type: "uuid" })
  assetId!: string;

  @Column({ name: "feeder_id", type: "uuid", nullable: true })
  feederId!: string | null;

  @Column({ type: "enum", enum: DetectedFaultSeverity, enumName: "detected_fault_severity" })
  severity!: DetectedFaultSeverity;

  @Column({ type: "enum", enum: DetectedFaultStatus, enumName: "detected_fault_status", default: DetectedFaultStatus.Active })
  status!: DetectedFaultStatus;

  @Column({ name: "first_detected_at", type: "timestamptz" })
  firstDetectedAt!: Date;

  @Column({ name: "last_detected_at", type: "timestamptz" })
  lastDetectedAt!: Date;

  @Column({ type: "jsonb" })
  evidence!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
