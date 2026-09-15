import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GeoJsonPoint } from "./geojson.types";
import { Feeder } from "./feeder.entity";
import { NetworkNode } from "./network-node.entity";
import { TransformerStatus } from "./network.enums";

@Entity({ name: "transformers" })
export class Transformer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 60, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ name: "feeder_id", type: "uuid" })
  feederId!: string;

  @ManyToOne(() => Feeder)
  @JoinColumn({ name: "feeder_id" })
  feeder!: Feeder;

  @Column({ name: "network_node_id", type: "uuid" })
  networkNodeId!: string;

  @ManyToOne(() => NetworkNode)
  @JoinColumn({ name: "network_node_id" })
  networkNode!: NetworkNode;

  @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326 })
  location!: GeoJsonPoint;

  @Column({ name: "capacity_kva", type: "integer" })
  capacityKva!: number;

  @Column({ name: "current_load_percent", type: "numeric", precision: 5, scale: 2, default: 0 })
  currentLoadPercent!: string;

  @Column({ type: "enum", enum: TransformerStatus, enumName: "transformer_status", default: TransformerStatus.Online })
  status!: TransformerStatus;

  @Column({ name: "installed_at", type: "date", nullable: true })
  installedAt!: string | null;

  @Column({ name: "last_maintenance_at", type: "date", nullable: true })
  lastMaintenanceAt!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
