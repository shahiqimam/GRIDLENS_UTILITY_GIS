import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TelemetryAssetType, TelemetryDeviceStatus } from "./telemetry.enums";

@Entity({ name: "telemetry_devices" })
export class TelemetryDevice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "device_code", type: "varchar", length: 80, unique: true })
  deviceCode!: string;

  @Column({ name: "asset_type", type: "enum", enum: TelemetryAssetType, enumName: "telemetry_asset_type" })
  assetType!: TelemetryAssetType;

  @Column({ name: "asset_id", type: "uuid" })
  assetId!: string;

  @Column({ type: "enum", enum: TelemetryDeviceStatus, enumName: "telemetry_device_status", default: TelemetryDeviceStatus.Active })
  status!: TelemetryDeviceStatus;

  @Column({ name: "last_seen_at", type: "timestamptz", nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
