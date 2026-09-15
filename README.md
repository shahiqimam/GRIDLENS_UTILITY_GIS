# GridLens

GridLens is a synthetic utility network GIS and outage intelligence platform. It is a portfolio engineering project for geospatial data modeling, PostGIS, network topology, telemetry ingestion, outage impact tracing, incident workflows, field crew dispatch, real-time updates, analytics, and Dockerized deployment.

All utility assets, locations, telemetry, incidents, and crew data in this repository must be fictional. Do not use real critical infrastructure maps, real feeder layouts, real SCADA data, employer data, customer records, or confidential operational data.

## Planned Stack

- Next.js, React, TypeScript, Tailwind CSS, TanStack Query, MapLibre GL JS, Recharts
- NestJS, TypeScript, TypeORM, PostgreSQL/PostGIS, Redis, JWT auth
- Separate telemetry simulator using the public ingestion API
- Docker Compose, Nginx, Jenkins, migrations, tests, and production-minded docs

## Target Product

An operations analyst can open a map, inspect synthetic substations/feeders/segments/transformers/service areas/crews/incidents, ingest simulated telemetry, detect deterministic faults, trace downstream impact through directed topology, create outage incidents, dispatch crews, observe live updates, and review analytics.

## Current Status

Phase 0/1 foundation has started:

- Monorepo workspace created
- API, web, simulator, and shared package folders created
- Docker Compose added for PostgreSQL/PostGIS and Redis
- Architecture docs and ADRs started

## Local Development

```bash
pnpm install
pnpm dev
```

Infrastructure only:

```bash
docker compose up -d postgres redis
pnpm --filter @gridlens/api migration:run
```

The implementation is intentionally incomplete. See [docs/roadmap.md](docs/roadmap.md) for the phased build plan and acceptance criteria.

