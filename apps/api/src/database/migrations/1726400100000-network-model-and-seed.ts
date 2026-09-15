import { MigrationInterface, QueryRunner } from "typeorm";

export class NetworkModelAndSeed1726400100000 implements MigrationInterface {
  name = "NetworkModelAndSeed1726400100000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE asset_operational_status AS ENUM ('ACTIVE', 'DEGRADED', 'OFFLINE', 'MAINTENANCE')`);
    await queryRunner.query(`CREATE TYPE network_node_type AS ENUM ('SUBSTATION_SOURCE', 'JUNCTION', 'SWITCH', 'TRANSFORMER_CONNECTION', 'TERMINAL')`);
    await queryRunner.query(`CREATE TYPE switch_state AS ENUM ('OPEN', 'CLOSED')`);
    await queryRunner.query(`CREATE TYPE segment_type AS ENUM ('OVERHEAD', 'UNDERGROUND', 'SERVICE')`);
    await queryRunner.query(`CREATE TYPE segment_status AS ENUM ('ENERGIZED', 'DEENERGIZED', 'FAULTED', 'MAINTENANCE')`);
    await queryRunner.query(`CREATE TYPE transformer_status AS ENUM ('ONLINE', 'DEGRADED', 'OFFLINE', 'MAINTENANCE')`);

    await queryRunner.query(`
      CREATE TABLE substations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(40) NOT NULL UNIQUE,
        name varchar(160) NOT NULL,
        status asset_operational_status NOT NULL DEFAULT 'ACTIVE',
        nominal_voltage_kv numeric(6,2) NOT NULL,
        location geometry(Point, 4326) NOT NULL,
        commissioned_at date NULL,
        description text NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_substations_lonlat CHECK (ST_X(location) BETWEEN -180 AND 180 AND ST_Y(location) BETWEEN -90 AND 90)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE network_nodes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(60) NOT NULL UNIQUE,
        node_type network_node_type NOT NULL,
        location geometry(Point, 4326) NOT NULL,
        substation_id uuid NULL REFERENCES substations(id),
        switch_state switch_state NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_network_nodes_lonlat CHECK (ST_X(location) BETWEEN -180 AND 180 AND ST_Y(location) BETWEEN -90 AND 90),
        CONSTRAINT chk_network_nodes_switch_state CHECK (
          (node_type = 'SWITCH' AND switch_state IS NOT NULL) OR
          (node_type <> 'SWITCH' AND switch_state IS NULL)
        )
      )
    `);

    await queryRunner.query(`
      CREATE TABLE feeders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(40) NOT NULL UNIQUE,
        name varchar(160) NOT NULL,
        substation_id uuid NOT NULL REFERENCES substations(id),
        source_node_id uuid NOT NULL REFERENCES network_nodes(id),
        nominal_voltage_kv numeric(6,2) NOT NULL,
        status asset_operational_status NOT NULL DEFAULT 'ACTIVE',
        estimated_customer_count integer NOT NULL DEFAULT 0 CHECK (estimated_customer_count >= 0),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE network_segments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(60) NOT NULL UNIQUE,
        feeder_id uuid NOT NULL REFERENCES feeders(id),
        from_node_id uuid NOT NULL REFERENCES network_nodes(id),
        to_node_id uuid NOT NULL REFERENCES network_nodes(id),
        geometry geometry(LineString, 4326) NOT NULL,
        segment_type segment_type NOT NULL,
        status segment_status NOT NULL DEFAULT 'ENERGIZED',
        length_meters numeric(10,2) NOT NULL CHECK (length_meters >= 0),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_network_segments_distinct_nodes CHECK (from_node_id <> to_node_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE transformers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(60) NOT NULL UNIQUE,
        name varchar(160) NOT NULL,
        feeder_id uuid NOT NULL REFERENCES feeders(id),
        network_node_id uuid NOT NULL REFERENCES network_nodes(id),
        location geometry(Point, 4326) NOT NULL,
        capacity_kva integer NOT NULL CHECK (capacity_kva > 0),
        current_load_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (current_load_percent >= 0 AND current_load_percent <= 100),
        status transformer_status NOT NULL DEFAULT 'ONLINE',
        installed_at date NULL,
        last_maintenance_at date NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_transformers_lonlat CHECK (ST_X(location) BETWEEN -180 AND 180 AND ST_Y(location) BETWEEN -90 AND 90)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE service_areas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(60) NOT NULL UNIQUE,
        name varchar(160) NOT NULL,
        transformer_id uuid NOT NULL REFERENCES transformers(id),
        geometry geometry(Polygon, 4326) NOT NULL,
        estimated_customers integer NOT NULL CHECK (estimated_customers >= 0),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_substations_location_gist ON substations USING GIST(location)`);
    await queryRunner.query(`CREATE INDEX idx_network_nodes_location_gist ON network_nodes USING GIST(location)`);
    await queryRunner.query(`CREATE INDEX idx_network_nodes_substation ON network_nodes(substation_id)`);
    await queryRunner.query(`CREATE INDEX idx_feeders_substation ON feeders(substation_id)`);
    await queryRunner.query(`CREATE INDEX idx_network_segments_geometry_gist ON network_segments USING GIST(geometry)`);
    await queryRunner.query(`CREATE INDEX idx_network_segments_feeder_from ON network_segments(feeder_id, from_node_id)`);
    await queryRunner.query(`CREATE INDEX idx_network_segments_to_node ON network_segments(to_node_id)`);
    await queryRunner.query(`CREATE INDEX idx_transformers_location_gist ON transformers USING GIST(location)`);
    await queryRunner.query(`CREATE INDEX idx_transformers_feeder ON transformers(feeder_id)`);
    await queryRunner.query(`CREATE INDEX idx_transformers_network_node ON transformers(network_node_id)`);
    await queryRunner.query(`CREATE INDEX idx_service_areas_geometry_gist ON service_areas USING GIST(geometry)`);
    await queryRunner.query(`CREATE INDEX idx_service_areas_transformer ON service_areas(transformer_id)`);

    await queryRunner.query(`
      INSERT INTO substations (id, code, name, nominal_voltage_kv, location, commissioned_at, description)
      VALUES (
        '10000000-0000-4000-8000-000000000001',
        'SS-SYN-01',
        'Synthetic North Substation',
        33.00,
        ST_SetSRID(ST_MakePoint(-96.80000, 32.78000), 4326),
        '2020-01-15',
        'Fictional training substation for GridLens demo data.'
      )
    `);

    await queryRunner.query(`
      INSERT INTO network_nodes (id, code, node_type, location, substation_id, switch_state, metadata)
      VALUES
        ('20000000-0000-4000-8000-000000000001', 'ND-SYN-SRC-01', 'SUBSTATION_SOURCE', ST_SetSRID(ST_MakePoint(-96.80000, 32.78000), 4326), '10000000-0000-4000-8000-000000000001', NULL, '{"synthetic":true}'),
        ('20000000-0000-4000-8000-000000000002', 'ND-SYN-A-J01', 'JUNCTION', ST_SetSRID(ST_MakePoint(-96.79480, 32.78240), 4326), '10000000-0000-4000-8000-000000000001', NULL, '{"synthetic":true}'),
        ('20000000-0000-4000-8000-000000000003', 'ND-SYN-A-SW01', 'SWITCH', ST_SetSRID(ST_MakePoint(-96.78980, 32.78420), 4326), NULL, 'CLOSED', '{"synthetic":true}'),
        ('20000000-0000-4000-8000-000000000004', 'ND-SYN-A-TX01', 'TRANSFORMER_CONNECTION', ST_SetSRID(ST_MakePoint(-96.78500, 32.78600), 4326), NULL, NULL, '{"synthetic":true}'),
        ('20000000-0000-4000-8000-000000000005', 'ND-SYN-B-J01', 'JUNCTION', ST_SetSRID(ST_MakePoint(-96.80340, 32.77580), 4326), '10000000-0000-4000-8000-000000000001', NULL, '{"synthetic":true}'),
        ('20000000-0000-4000-8000-000000000006', 'ND-SYN-B-TX01', 'TRANSFORMER_CONNECTION', ST_SetSRID(ST_MakePoint(-96.80780, 32.77240), 4326), NULL, NULL, '{"synthetic":true}'),
        ('20000000-0000-4000-8000-000000000007', 'ND-SYN-B-TX02', 'TRANSFORMER_CONNECTION', ST_SetSRID(ST_MakePoint(-96.81200, 32.76980), 4326), NULL, NULL, '{"synthetic":true}')
    `);

    await queryRunner.query(`
      INSERT INTO feeders (id, code, name, substation_id, source_node_id, nominal_voltage_kv, estimated_customer_count)
      VALUES
        ('30000000-0000-4000-8000-000000000001', 'FD-SYN-A', 'Synthetic Feeder A', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 13.80, 420),
        ('30000000-0000-4000-8000-000000000002', 'FD-SYN-B', 'Synthetic Feeder B', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 13.80, 610)
    `);

    await queryRunner.query(`
      INSERT INTO network_segments (id, code, feeder_id, from_node_id, to_node_id, geometry, segment_type, length_meters)
      VALUES
        ('40000000-0000-4000-8000-000000000001', 'SG-SYN-A-001', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80000, 32.78000), ST_MakePoint(-96.79480, 32.78240)), 4326), 'UNDERGROUND', ST_Length(ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80000, 32.78000), ST_MakePoint(-96.79480, 32.78240)), 4326)::geography)),
        ('40000000-0000-4000-8000-000000000002', 'SG-SYN-A-002', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.79480, 32.78240), ST_MakePoint(-96.78980, 32.78420)), 4326), 'OVERHEAD', ST_Length(ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.79480, 32.78240), ST_MakePoint(-96.78980, 32.78420)), 4326)::geography)),
        ('40000000-0000-4000-8000-000000000003', 'SG-SYN-A-003', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004', ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.78980, 32.78420), ST_MakePoint(-96.78500, 32.78600)), 4326), 'OVERHEAD', ST_Length(ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.78980, 32.78420), ST_MakePoint(-96.78500, 32.78600)), 4326)::geography)),
        ('40000000-0000-4000-8000-000000000004', 'SG-SYN-B-001', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005', ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80000, 32.78000), ST_MakePoint(-96.80340, 32.77580)), 4326), 'UNDERGROUND', ST_Length(ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80000, 32.78000), ST_MakePoint(-96.80340, 32.77580)), 4326)::geography)),
        ('40000000-0000-4000-8000-000000000005', 'SG-SYN-B-002', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000006', ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80340, 32.77580), ST_MakePoint(-96.80780, 32.77240)), 4326), 'OVERHEAD', ST_Length(ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80340, 32.77580), ST_MakePoint(-96.80780, 32.77240)), 4326)::geography)),
        ('40000000-0000-4000-8000-000000000006', 'SG-SYN-B-003', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000007', ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80340, 32.77580), ST_MakePoint(-96.81200, 32.76980)), 4326), 'OVERHEAD', ST_Length(ST_SetSRID(ST_MakeLine(ST_MakePoint(-96.80340, 32.77580), ST_MakePoint(-96.81200, 32.76980)), 4326)::geography))
    `);

    await queryRunner.query(`
      INSERT INTO transformers (id, code, name, feeder_id, network_node_id, location, capacity_kva, current_load_percent, installed_at, last_maintenance_at)
      VALUES
        ('50000000-0000-4000-8000-000000000001', 'TX-SYN-A-001', 'Synthetic Transformer A1', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004', ST_SetSRID(ST_MakePoint(-96.78500, 32.78600), 4326), 750, 54.20, '2021-04-10', '2026-04-12'),
        ('50000000-0000-4000-8000-000000000002', 'TX-SYN-B-001', 'Synthetic Transformer B1', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000006', ST_SetSRID(ST_MakePoint(-96.80780, 32.77240), 4326), 500, 62.80, '2022-03-21', '2026-03-02'),
        ('50000000-0000-4000-8000-000000000003', 'TX-SYN-B-002', 'Synthetic Transformer B2', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000007', ST_SetSRID(ST_MakePoint(-96.81200, 32.76980), 4326), 1000, 47.50, '2023-07-18', '2026-02-18')
    `);

    await queryRunner.query(`
      INSERT INTO service_areas (id, code, name, transformer_id, geometry, estimated_customers)
      VALUES
        ('60000000-0000-4000-8000-000000000001', 'SA-SYN-A-001', 'Synthetic Service Area A1', '50000000-0000-4000-8000-000000000001', ST_SetSRID(ST_GeomFromText('POLYGON((-96.7860 32.7852,-96.7837 32.7852,-96.7837 32.7869,-96.7860 32.7869,-96.7860 32.7852))'), 4326), 420),
        ('60000000-0000-4000-8000-000000000002', 'SA-SYN-B-001', 'Synthetic Service Area B1', '50000000-0000-4000-8000-000000000002', ST_SetSRID(ST_GeomFromText('POLYGON((-96.8090 32.7715,-96.8066 32.7715,-96.8066 32.7733,-96.8090 32.7733,-96.8090 32.7715))'), 4326), 280),
        ('60000000-0000-4000-8000-000000000003', 'SA-SYN-B-002', 'Synthetic Service Area B2', '50000000-0000-4000-8000-000000000003', ST_SetSRID(ST_GeomFromText('POLYGON((-96.8132 32.7689,-96.8108 32.7689,-96.8108 32.7707,-96.8132 32.7707,-96.8132 32.7689))'), 4326), 330)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS service_areas`);
    await queryRunner.query(`DROP TABLE IF EXISTS transformers`);
    await queryRunner.query(`DROP TABLE IF EXISTS network_segments`);
    await queryRunner.query(`DROP TABLE IF EXISTS feeders`);
    await queryRunner.query(`DROP TABLE IF EXISTS network_nodes`);
    await queryRunner.query(`DROP TABLE IF EXISTS substations`);
    await queryRunner.query(`DROP TYPE IF EXISTS transformer_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS segment_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS segment_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS switch_state`);
    await queryRunner.query(`DROP TYPE IF EXISTS network_node_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS asset_operational_status`);
  }
}
