import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CrewSpecialty, CrewStatus } from "./dispatch.enums";

@Entity({ name: "crews" })
export class Crew {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 40, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "enum", enum: CrewSpecialty, enumName: "crew_specialty" })
  specialty!: CrewSpecialty;

  @Column({ type: "enum", enum: CrewStatus, enumName: "crew_status", default: CrewStatus.Available })
  status!: CrewStatus;

  @Column({ name: "home_base", type: "varchar", length: 160 })
  homeBase!: string;

  @Column({ name: "current_latitude", type: "numeric", precision: 9, scale: 6 })
  currentLatitude!: string;

  @Column({ name: "current_longitude", type: "numeric", precision: 9, scale: 6 })
  currentLongitude!: string;

  @Column({ name: "shift_ends_at", type: "timestamptz" })
  shiftEndsAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}