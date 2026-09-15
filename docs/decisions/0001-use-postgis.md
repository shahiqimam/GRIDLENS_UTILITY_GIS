# 0001 - Use PostGIS

## Context

GridLens needs to store points, lines, and polygons and query them by viewport, distance, and relationship.

## Decision

Use PostgreSQL with the PostGIS extension for geospatial data.

## Alternatives

- Store latitude and longitude in numeric columns
- Use an external GIS service only

## Consequences

PostGIS gives native geometry types, spatial indexes, and spatial predicates while keeping operational data in the same relational database. The project must include migrations, geometry validation, and clear coordinate-order rules.
