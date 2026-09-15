import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GeoJsonLineString } from "./geojson.types";
import { Feeder } from "./feeder.entity";
import { NetworkNode } from "./network-node.entity";
import { SegmentStatus, SegmentType } from "./network.enums";

@Entity({ name: "network_segments" })
export class NetworkSegment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 60, unique: true })
  code!: string;

  @Column({ name: "feeder_id", type: "uuid" })
  feederId!: string;

  @ManyToOne(() => Feeder)
  @JoinColumn({ name: "feeder_id" })
  feeder!: Feeder;

  @Column({ name: "from_node_id", type: "uuid" })
  fromNodeId!: string;

  @ManyToOne(() => NetworkNode)
  @JoinColumn({ name: "from_node_id" })
  fromNode!: NetworkNode;

  @Column({ name: "to_node_id", type: "uuid" })
  toNodeId!: string;

  @ManyToOne(() => NetworkNode)
  @JoinColumn({ name: "to_node_id" })
  toNode!: NetworkNode;

  @Column({ type: "geometry", spatialFeatureType: "LineString", srid: 4326 })
  geometry!: GeoJsonLineString;

  @Column({ name: "segment_type", type: "enum", enum: SegmentType, enumName: "segment_type" })
  segmentType!: SegmentType;

  @Column({ type: "enum", enum: SegmentStatus, enumName: "segment_status", default: SegmentStatus.Energized })
  status!: SegmentStatus;

  @Column({ name: "length_meters", type: "numeric", precision: 10, scale: 2 })
  lengthMeters!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
