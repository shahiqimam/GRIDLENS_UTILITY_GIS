# Spatial Design

GridLens uses PostGIS for native geometry types, spatial indexes, and spatial predicates.

Primary coordinate system:

```text
EPSG:4326
```

Coordinate order is always:

```text
longitude, latitude
```

Planned geometry types:

- `geometry(Point, 4326)` for substations, nodes, transformers, and crews
- `geometry(LineString, 4326)` for network segments
- `geometry(Polygon, 4326)` for service areas

Meter-based proximity queries should cast geometry to geography where appropriate, for example nearby crew recommendation by radius.
