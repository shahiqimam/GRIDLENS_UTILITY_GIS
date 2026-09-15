import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { MapViewportDto } from "./dto/map-viewport.dto";
import {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  SegmentMapProperties,
  ServiceAreaMapProperties,
  SubstationMapProperties,
  TransformerMapProperties
} from "./map.types";

type SpatialRow = {
  id: string;
  geometry: string | GeoJsonGeometry;
};

type SubstationRow = SpatialRow & {
  code: string;
  name: string;
  status: string;
  nominalVoltageKv: string;
};

type SegmentRow = SpatialRow & {
  code: string;
  feederId: string;
  fromNodeId: string;
  toNodeId: string;
  segmentType: string;
  status: string;
  lengthMeters: string;
};

type TransformerRow = SpatialRow & {
  code: string;
  name: string;
  feederId: string;
  status: string;
  capacityKva: number;
  currentLoadPercent: string;
};

type ServiceAreaRow = SpatialRow & {
  code: string;
  name: string;
  transformerId: string;
  estimatedCustomers: number;
};

@Injectable()
export class MapService {
  constructor(private readonly dataSource: DataSource) {}

  async getSubstations(viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<SubstationMapProperties>> {
    this.validateViewport(viewport);
    const rows = await this.dataSource.query<SubstationRow[]>(
      `
        SELECT id, code, name, status,
          nominal_voltage_kv AS "nominalVoltageKv",
          ST_AsGeoJSON(location)::json AS geometry
        FROM substations
        WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ORDER BY code ASC
        LIMIT $5
      `,
      [viewport.west, viewport.south, viewport.east, viewport.north, viewport.limit]
    );

    return this.toFeatureCollection(rows, (row) => ({
      layer: "substations",
      code: row.code,
      name: row.name,
      status: row.status,
      nominalVoltageKv: Number(row.nominalVoltageKv)
    }));
  }

  async getSegments(viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<SegmentMapProperties>> {
    this.validateViewport(viewport);
    const rows = await this.dataSource.query<SegmentRow[]>(
      `
        SELECT id, code,
          feeder_id AS "feederId",
          from_node_id AS "fromNodeId",
          to_node_id AS "toNodeId",
          segment_type AS "segmentType",
          status,
          length_meters AS "lengthMeters",
          ST_AsGeoJSON(geometry)::json AS geometry
        FROM network_segments
        WHERE geometry && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ORDER BY code ASC
        LIMIT $5
      `,
      [viewport.west, viewport.south, viewport.east, viewport.north, viewport.limit]
    );

    return this.toFeatureCollection(rows, (row) => ({
      layer: "segments",
      code: row.code,
      feederId: row.feederId,
      fromNodeId: row.fromNodeId,
      toNodeId: row.toNodeId,
      segmentType: row.segmentType,
      status: row.status,
      lengthMeters: Number(row.lengthMeters)
    }));
  }

  async getTransformers(viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<TransformerMapProperties>> {
    this.validateViewport(viewport);
    const rows = await this.dataSource.query<TransformerRow[]>(
      `
        SELECT id, code, name,
          feeder_id AS "feederId",
          status,
          capacity_kva AS "capacityKva",
          current_load_percent AS "currentLoadPercent",
          ST_AsGeoJSON(location)::json AS geometry
        FROM transformers
        WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ORDER BY code ASC
        LIMIT $5
      `,
      [viewport.west, viewport.south, viewport.east, viewport.north, viewport.limit]
    );

    return this.toFeatureCollection(rows, (row) => ({
      layer: "transformers",
      code: row.code,
      name: row.name,
      feederId: row.feederId,
      status: row.status,
      capacityKva: row.capacityKva,
      currentLoadPercent: Number(row.currentLoadPercent)
    }));
  }

  async getServiceAreas(viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<ServiceAreaMapProperties>> {
    this.validateViewport(viewport);
    const rows = await this.dataSource.query<ServiceAreaRow[]>(
      `
        SELECT id, code, name,
          transformer_id AS "transformerId",
          estimated_customers AS "estimatedCustomers",
          ST_AsGeoJSON(geometry)::json AS geometry
        FROM service_areas
        WHERE geometry && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ORDER BY code ASC
        LIMIT $5
      `,
      [viewport.west, viewport.south, viewport.east, viewport.north, viewport.limit]
    );

    return this.toFeatureCollection(rows, (row) => ({
      layer: "serviceAreas",
      code: row.code,
      name: row.name,
      transformerId: row.transformerId,
      estimatedCustomers: row.estimatedCustomers
    }));
  }

  private validateViewport(viewport: MapViewportDto): void {
    if (viewport.west >= viewport.east) {
      throw new BadRequestException("west must be less than east");
    }

    if (viewport.south >= viewport.north) {
      throw new BadRequestException("south must be less than north");
    }
  }

  private toFeatureCollection<TProperties extends Record<string, unknown>, TRow extends SpatialRow>(
    rows: TRow[],
    mapProperties: (row: TRow) => TProperties
  ): GeoJsonFeatureCollection<TProperties> {
    return {
      type: "FeatureCollection",
      features: rows.map((row) => ({
        type: "Feature",
        id: row.id,
        geometry: typeof row.geometry === "string" ? (JSON.parse(row.geometry) as GeoJsonGeometry) : row.geometry,
        properties: mapProperties(row)
      })) satisfies GeoJsonFeature<TProperties>[]
    };
  }
}
