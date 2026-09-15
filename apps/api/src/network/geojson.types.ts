export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonLineString = {
  type: "LineString";
  coordinates: [number, number][];
};

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};
