import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TelemetryAssetType, TelemetryMetric, TelemetryQuality } from "./telemetry.enums";
import { TelemetryDevice } from "./telemetry-device.entity";

@Entity({ name: "telemetry_readings" })
export class TelemetryReading {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "device_id", type: "uuid" })
  deviceId!: string;

  @ManyToOne(() => TelemetryDevice)
  @JoinColumn({ name: "device_id" })
  device!: TelemetryDevice;

  @Column({ name: "asset_type", type: "enum", enum: TelemetryAssetType, enumName: "telemetry_asset_type" })
  assetType!: TelemetryAssetType;

  @Column({ name: "asset_id", type: "uuid" })
  assetId!: string;

  @Column({ type: "enum", enum: TelemetryMetric, enumName: "telemetry_metric" })
  metric!: TelemetryMetric;

  @Column({ name: "numeric_value", type: "numeric", precision: 12, scale: 4 })
  numericValue!: string;

  @Column({ type: "varchar", length: 24 })
  unit!: string;

  @Column({ type: "enum", enum: TelemetryQuality, enumName: "telemetry_quality" })
  quality!: TelemetryQuality;

  @Column({ name: "recorded_at", type: "timestamptz" })
  recordedAt!: Date;

  @CreateDateColumn({ name: "received_at", type: "timestamptz" })
  receivedAt!: Date;

  @Column({ name: "source_event_id", type: "varchar", length: 120 })
  sourceEventId!: string;

  @Column({ name: "raw_payload", type: "jsonb" })
  rawPayload!: Record<string, unknown>;
}
