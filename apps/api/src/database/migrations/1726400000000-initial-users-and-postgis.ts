import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialUsersAndPostgis1726400000000 implements MigrationInterface {
  name = "InitialUsersAndPostgis1726400000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await queryRunner.query(`CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATIONS', 'FIELD_ENGINEER', 'VIEWER')`);
    await queryRunner.query(`CREATE TYPE user_status AS ENUM ('ACTIVE', 'DISABLED')`);
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(320) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        first_name varchar(120) NOT NULL,
        last_name varchar(120) NOT NULL,
        role user_role NOT NULL DEFAULT 'VIEWER',
        status user_status NOT NULL DEFAULT 'ACTIVE',
        last_login_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_users_status ON users(status)`);
    await queryRunner.query(`CREATE INDEX idx_users_role ON users(role)`);

    await queryRunner.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES
        ('admin@gridlens.local', '$2b$10$pjSuExKjm.rjanwqNheVEOLksBhUyZdY17wW.5FfNKvDxVLU/AM7y', 'Admin', 'User', 'ADMIN'),
        ('operations@gridlens.local', '$2b$10$pjSuExKjm.rjanwqNheVEOLksBhUyZdY17wW.5FfNKvDxVLU/AM7y', 'Operations', 'User', 'OPERATIONS'),
        ('field@gridlens.local', '$2b$10$pjSuExKjm.rjanwqNheVEOLksBhUyZdY17wW.5FfNKvDxVLU/AM7y', 'Field', 'Engineer', 'FIELD_ENGINEER'),
        ('viewer@gridlens.local', '$2b$10$pjSuExKjm.rjanwqNheVEOLksBhUyZdY17wW.5FfNKvDxVLU/AM7y', 'Viewer', 'User', 'VIEWER')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pgcrypto`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
  }
}

