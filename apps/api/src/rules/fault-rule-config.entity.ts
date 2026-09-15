import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TelemetryAssetType } from "../telemetry/telemetry.enums";
import { FaultRuleType } from "./rules.enums";

@Entity({ name: "fault_rule_configs" })
export class FaultRuleConfig {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "rule_type", type: "enum", enum: FaultRuleType, enumName: "fault_rule_type" })
  ruleType!: FaultRuleType;

  @Column({ type: "boolean", default: true })
  enabled!: boolean;

  @Column({ name: "asset_type", type: "enum", enum: TelemetryAssetType, enumName: "telemetry_asset_type" })
  assetType!: TelemetryAssetType;

  @Column({ name: "warning_threshold", type: "numeric", precision: 12, scale: 4, nullable: true })
  warningThreshold!: string | null;

  @Column({ name: "critical_threshold", type: "numeric", precision: 12, scale: 4, nullable: true })
  criticalThreshold!: string | null;

  @Column({ name: "consecutive_count", type: "integer", nullable: true })
  consecutiveCount!: number | null;

  @Column({ name: "timeout_seconds", type: "integer", nullable: true })
  timeoutSeconds!: number | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
