import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GeoJsonPoint } from "./geojson.types";
import { AssetOperationalStatus } from "./network.enums";

@Entity({ name: "substations" })
export class Substation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 40, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "enum", enum: AssetOperationalStatus, enumName: "asset_operational_status", default: AssetOperationalStatus.Active })
  status!: AssetOperationalStatus;

  @Column({ name: "nominal_voltage_kv", type: "numeric", precision: 6, scale: 2 })
  nominalVoltageKv!: string;

  @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326 })
  location!: GeoJsonPoint;

  @Column({ name: "commissioned_at", type: "date", nullable: true })
  commissionedAt!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
