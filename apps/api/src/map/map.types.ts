export type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
};

export type GeoJsonFeature<TProperties extends Record<string, unknown>> = {
  type: "Feature";
  id: string;
  geometry: GeoJsonGeometry;
  properties: TProperties;
};

export type GeoJsonFeatureCollection<TProperties extends Record<string, unknown>> = {
  type: "FeatureCollection";
  features: GeoJsonFeature<TProperties>[];
};

export type SubstationMapProperties = {
  layer: "substations";
  code: string;
  name: string;
  status: string;
  nominalVoltageKv: number;
};

export type SegmentMapProperties = {
  layer: "segments";
  code: string;
  feederId: string;
  fromNodeId: string;
  toNodeId: string;
  segmentType: string;
  status: string;
  lengthMeters: number;
};

export type TransformerMapProperties = {
  layer: "transformers";
  code: string;
  name: string;
  feederId: string;
  status: string;
  capacityKva: number;
  currentLoadPercent: number;
};

export type ServiceAreaMapProperties = {
  layer: "serviceAreas";
  code: string;
  name: string;
  transformerId: string;
  estimatedCustomers: number;
};
