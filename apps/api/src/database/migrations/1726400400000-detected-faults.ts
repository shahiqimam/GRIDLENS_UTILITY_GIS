import { MigrationInterface, QueryRunner } from "typeorm";

export class DetectedFaults1726400400000 implements MigrationInterface {
  name = "DetectedFaults1726400400000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE detected_fault_severity AS ENUM ('WARNING', 'CRITICAL')`);
    await queryRunner.query(`CREATE TYPE detected_fault_status AS ENUM ('ACTIVE', 'CLEARED')`);
    await queryRunner.query(`
      CREATE TABLE detected_faults (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        fingerprint varchar(180) NOT NULL,
        fault_type fault_rule_type NOT NULL,
        asset_type telemetry_asset_type NOT NULL,
        asset_id uuid NOT NULL,
        feeder_id uuid NULL REFERENCES feeders(id),
        severity detected_fault_severity NOT NULL,
        status detected_fault_status NOT NULL DEFAULT 'ACTIVE',
        first_detected_at timestamptz NOT NULL,
        last_detected_at timestamptz NOT NULL,
        evidence jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_detected_faults_active_fingerprint ON detected_faults(fingerprint) WHERE status = 'ACTIVE'`);
    await queryRunner.query(`CREATE INDEX idx_detected_faults_status ON detected_faults(status)`);
    await queryRunner.query(`CREATE INDEX idx_detected_faults_asset ON detected_faults(asset_type, asset_id)`);
    await queryRunner.query(`CREATE INDEX idx_detected_faults_feeder ON detected_faults(feeder_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS detected_faults`);
    await queryRunner.query(`DROP TYPE IF EXISTS detected_fault_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS detected_fault_severity`);
  }
}
