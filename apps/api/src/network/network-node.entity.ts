import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GeoJsonPoint } from "./geojson.types";
import { NetworkNodeType, SwitchState } from "./network.enums";
import { Substation } from "./substation.entity";

@Entity({ name: "network_nodes" })
export class NetworkNode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 60, unique: true })
  code!: string;

  @Column({ name: "node_type", type: "enum", enum: NetworkNodeType, enumName: "network_node_type" })
  nodeType!: NetworkNodeType;

  @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326 })
  location!: GeoJsonPoint;

  @Column({ name: "substation_id", type: "uuid", nullable: true })
  substationId!: string | null;

  @ManyToOne(() => Substation, { nullable: true })
  @JoinColumn({ name: "substation_id" })
  substation!: Substation | null;

  @Column({ name: "switch_state", type: "enum", enum: SwitchState, enumName: "switch_state", nullable: true })
  switchState!: SwitchState | null;

  @Column({ type: "jsonb", default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
