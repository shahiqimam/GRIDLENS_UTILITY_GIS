import { MigrationInterface, QueryRunner } from "typeorm";

export class FaultRuleConfigSeed1726400300000 implements MigrationInterface {
  name = "FaultRuleConfigSeed1726400300000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE fault_rule_type AS ENUM ('FEEDER_VOLTAGE_LOSS', 'DEVICE_HEARTBEAT_LOSS', 'TRANSFORMER_OVERTEMPERATURE')`);
    await queryRunner.query(`
      CREATE TABLE fault_rule_configs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        rule_type fault_rule_type NOT NULL,
        enabled boolean NOT NULL DEFAULT true,
        asset_type telemetry_asset_type NOT NULL,
        warning_threshold numeric(12,4) NULL,
        critical_threshold numeric(12,4) NULL,
        consecutive_count integer NULL CHECK (consecutive_count IS NULL OR consecutive_count > 0),
        timeout_seconds integer NULL CHECK (timeout_seconds IS NULL OR timeout_seconds > 0),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_fault_rule_configs_rule_asset UNIQUE (rule_type, asset_type)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_fault_rule_configs_enabled ON fault_rule_configs(enabled)`);

    await queryRunner.query(`
      INSERT INTO fault_rule_configs (id, rule_type, enabled, asset_type, warning_threshold, critical_threshold, consecutive_count, timeout_seconds)
      VALUES
        ('80000000-0000-4000-8000-000000000001', 'FEEDER_VOLTAGE_LOSS', true, 'FEEDER', NULL, 1.0000, 3, NULL),
        ('80000000-0000-4000-8000-000000000002', 'DEVICE_HEARTBEAT_LOSS', true, 'FEEDER', NULL, NULL, NULL, 60),
        ('80000000-0000-4000-8000-000000000003', 'TRANSFORMER_OVERTEMPERATURE', true, 'TRANSFORMER', 85.0000, 95.0000, NULL, NULL)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS fault_rule_configs`);
    await queryRunner.query(`DROP TYPE IF EXISTS fault_rule_type`);
  }
}
