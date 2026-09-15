import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole, UserStatus } from "./user.enums";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 320, unique: true })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ name: "first_name", type: "varchar", length: 120 })
  firstName!: string;

  @Column({ name: "last_name", type: "varchar", length: 120 })
  lastName!: string;

  @Column({ type: "enum", enum: UserRole, enumName: "user_role", default: UserRole.Viewer })
  role!: UserRole;

  @Column({ type: "enum", enum: UserStatus, enumName: "user_status", default: UserStatus.Active })
  status!: UserStatus;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}

