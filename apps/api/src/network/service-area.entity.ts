import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GeoJsonPolygon } from "./geojson.types";
import { Transformer } from "./transformer.entity";

@Entity({ name: "service_areas" })
export class ServiceArea {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 60, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ name: "transformer_id", type: "uuid" })
  transformerId!: string;

  @ManyToOne(() => Transformer)
  @JoinColumn({ name: "transformer_id" })
  transformer!: Transformer;

  @Column({ type: "geometry", spatialFeatureType: "Polygon", srid: 4326 })
  geometry!: GeoJsonPolygon;

  @Column({ name: "estimated_customers", type: "integer" })
  estimatedCustomers!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
