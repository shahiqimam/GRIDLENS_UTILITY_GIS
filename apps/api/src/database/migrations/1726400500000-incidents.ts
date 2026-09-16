import { MigrationInterface, QueryRunner } from "typeorm";

export class Incidents1726400500000 implements MigrationInterface {
  name = "Incidents1726400500000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE incident_priority AS ENUM ('P1', 'P2', 'P3')`);
    await queryRunner.query(`CREATE TYPE incident_source AS ENUM ('DETECTED_FAULT')`);
    await queryRunner.query(`CREATE TYPE incident_status AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')`);
    await queryRunner.query(`
      CREATE TABLE incidents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        incident_number varchar(32) NOT NULL UNIQUE,
        title varchar(180) NOT NULL,
        description text,
        source incident_source NOT NULL,
        source_fault_id uuid REFERENCES detected_faults(id) ON DELETE SET NULL,
        feeder_id uuid REFERENCES feeders(id) ON DELETE SET NULL,
        priority incident_priority NOT NULL,
        status incident_status NOT NULL DEFAULT 'OPEN',
        opened_at timestamptz NOT NULL,
        acknowledged_at timestamptz,
        resolved_at timestamptz,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_incidents_status_opened_at ON incidents(status, opened_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_incidents_feeder ON incidents(feeder_id)`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_incidents_active_source_fault ON incidents(source_fault_id) WHERE source_fault_id IS NOT NULL AND status <> 'RESOLVED'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_incidents_active_source_fault`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_incidents_feeder`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_incidents_status_opened_at`);
    await queryRunner.query(`DROP TABLE IF EXISTS incidents`);
    await queryRunner.query(`DROP TYPE IF EXISTS incident_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS incident_source`);
    await queryRunner.query(`DROP TYPE IF EXISTS incident_priority`);
  }
}