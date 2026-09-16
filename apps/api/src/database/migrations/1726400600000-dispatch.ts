import { MigrationInterface, QueryRunner } from "typeorm";

export class Dispatch1726400600000 implements MigrationInterface {
  name = "Dispatch1726400600000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE crew_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'OFFLINE')`);
    await queryRunner.query(`CREATE TYPE crew_specialty AS ENUM ('FEEDER', 'TRANSFORMER', 'GENERAL')`);
    await queryRunner.query(`CREATE TYPE work_order_status AS ENUM ('ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'COMPLETE', 'CANCELLED')`);
    await queryRunner.query(`
      CREATE TABLE crews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(40) NOT NULL UNIQUE,
        name varchar(160) NOT NULL,
        specialty crew_specialty NOT NULL,
        status crew_status NOT NULL DEFAULT 'AVAILABLE',
        home_base varchar(160) NOT NULL,
        current_latitude numeric(9,6) NOT NULL,
        current_longitude numeric(9,6) NOT NULL,
        shift_ends_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE work_orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        work_order_number varchar(32) NOT NULL UNIQUE,
        incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE RESTRICT,
        status work_order_status NOT NULL DEFAULT 'ASSIGNED',
        summary varchar(180) NOT NULL,
        assigned_at timestamptz NOT NULL,
        completed_at timestamptz,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_crews_status_specialty ON crews(status, specialty)`);
    await queryRunner.query(`CREATE INDEX idx_work_orders_status_assigned_at ON work_orders(status, assigned_at DESC)`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_work_orders_active_incident ON work_orders(incident_id) WHERE status <> 'CANCELLED'`);
    await queryRunner.query(`
      INSERT INTO crews (id, code, name, specialty, status, home_base, current_latitude, current_longitude, shift_ends_at)
      VALUES
        ('70000000-0000-4000-8000-000000000001', 'CREW-FD-01', 'North Feeder Response', 'FEEDER', 'AVAILABLE', 'North Service Yard', 32.790500, -96.812300, '2026-09-16T23:00:00Z'),
        ('70000000-0000-4000-8000-000000000002', 'CREW-TX-02', 'Transformer Field Team', 'TRANSFORMER', 'AVAILABLE', 'East Service Yard', 32.772800, -96.759400, '2026-09-16T22:00:00Z'),
        ('70000000-0000-4000-8000-000000000003', 'CREW-GN-03', 'General Trouble Crew', 'GENERAL', 'OFFLINE', 'Central Service Yard', 32.781100, -96.798200, '2026-09-16T18:00:00Z')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_work_orders_active_incident`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_work_orders_status_assigned_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_crews_status_specialty`);
    await queryRunner.query(`DROP TABLE IF EXISTS work_orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS crews`);
    await queryRunner.query(`DROP TYPE IF EXISTS work_order_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS crew_specialty`);
    await queryRunner.query(`DROP TYPE IF EXISTS crew_status`);
  }
}