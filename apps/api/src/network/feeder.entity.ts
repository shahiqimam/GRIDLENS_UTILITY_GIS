import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssetOperationalStatus } from "./network.enums";
import { NetworkNode } from "./network-node.entity";
import { Substation } from "./substation.entity";

@Entity({ name: "feeders" })
export class Feeder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 40, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ name: "substation_id", type: "uuid" })
  substationId!: string;

  @ManyToOne(() => Substation)
  @JoinColumn({ name: "substation_id" })
  substation!: Substation;

  @Column({ name: "source_node_id", type: "uuid" })
  sourceNodeId!: string;

  @ManyToOne(() => NetworkNode)
  @JoinColumn({ name: "source_node_id" })
  sourceNode!: NetworkNode;

  @Column({ name: "nominal_voltage_kv", type: "numeric", precision: 6, scale: 2 })
  nominalVoltageKv!: string;

  @Column({ type: "enum", enum: AssetOperationalStatus, enumName: "asset_operational_status", default: AssetOperationalStatus.Active })
  status!: AssetOperationalStatus;

  @Column({ name: "estimated_customer_count", type: "integer", default: 0 })
  estimatedCustomerCount!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
