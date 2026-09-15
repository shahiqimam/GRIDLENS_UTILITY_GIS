import { MigrationInterface, QueryRunner } from "typeorm";

export class TelemetryModelAndSeed1726400200000 implements MigrationInterface {
  name = "TelemetryModelAndSeed1726400200000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE telemetry_asset_type AS ENUM ('SUBSTATION', 'FEEDER', 'TRANSFORMER')`);
    await queryRunner.query(`CREATE TYPE telemetry_device_status AS ENUM ('ACTIVE', 'DISABLED')`);
    await queryRunner.query(`CREATE TYPE telemetry_metric AS ENUM ('voltage', 'current', 'load_percent', 'temperature', 'frequency', 'heartbeat')`);
    await queryRunner.query(`CREATE TYPE telemetry_quality AS ENUM ('GOOD', 'SUSPECT', 'BAD')`);

    await queryRunner.query(`
      CREATE TABLE telemetry_devices (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        device_code varchar(80) NOT NULL UNIQUE,
        asset_type telemetry_asset_type NOT NULL,
        asset_id uuid NOT NULL,
        status telemetry_device_status NOT NULL DEFAULT 'ACTIVE',
        last_seen_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE telemetry_readings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id uuid NOT NULL REFERENCES telemetry_devices(id),
        asset_type telemetry_asset_type NOT NULL,
        asset_id uuid NOT NULL,
        metric telemetry_metric NOT NULL,
        numeric_value numeric(12,4) NOT NULL,
        unit varchar(24) NOT NULL,
        quality telemetry_quality NOT NULL,
        recorded_at timestamptz NOT NULL,
        received_at timestamptz NOT NULL DEFAULT now(),
        source_event_id varchar(120) NOT NULL,
        raw_payload jsonb NOT NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_telemetry_devices_asset ON telemetry_devices(asset_type, asset_id)`);
    await queryRunner.query(`CREATE INDEX idx_telemetry_readings_asset_metric_recorded ON telemetry_readings(asset_id, metric, recorded_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_telemetry_readings_device_recorded ON telemetry_readings(device_id, recorded_at DESC)`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_telemetry_readings_source_event_metric ON telemetry_readings(source_event_id, metric)`);
    await queryRunner.query(`CREATE INDEX idx_telemetry_readings_source_event ON telemetry_readings(source_event_id)`);

    await queryRunner.query(`
      INSERT INTO telemetry_devices (id, device_code, asset_type, asset_id)
      VALUES
        ('70000000-0000-4000-8000-000000000001', 'SS-SYN-01-DEVICE', 'SUBSTATION', '10000000-0000-4000-8000-000000000001'),
        ('70000000-0000-4000-8000-000000000002', 'FD-SYN-A-DEVICE', 'FEEDER', '30000000-0000-4000-8000-000000000001'),
        ('70000000-0000-4000-8000-000000000003', 'FD-SYN-B-DEVICE', 'FEEDER', '30000000-0000-4000-8000-000000000002'),
        ('70000000-0000-4000-8000-000000000004', 'TX-SYN-A-001-DEVICE', 'TRANSFORMER', '50000000-0000-4000-8000-000000000001'),
        ('70000000-0000-4000-8000-000000000005', 'TX-SYN-B-001-DEVICE', 'TRANSFORMER', '50000000-0000-4000-8000-000000000002'),
        ('70000000-0000-4000-8000-000000000006', 'TX-SYN-B-002-DEVICE', 'TRANSFORMER', '50000000-0000-4000-8000-000000000003')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS telemetry_readings`);
    await queryRunner.query(`DROP TABLE IF EXISTS telemetry_devices`);
    await queryRunner.query(`DROP TYPE IF EXISTS telemetry_quality`);
    await queryRunner.query(`DROP TYPE IF EXISTS telemetry_metric`);
    await queryRunner.query(`DROP TYPE IF EXISTS telemetry_device_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS telemetry_asset_type`);
  }
}
