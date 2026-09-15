# GridLens Roadmap

## Estimate

GridLens is a 4-6 week build if implemented as a credible portfolio project with tests, migrations, docs, and demo polish. A compressed prototype could be made faster, but it would not support the interview depth this project is meant to demonstrate.

## Phase 0 - Repository Foundation

- Monorepo structure
- Shared TypeScript config
- Environment example
- Docker Compose for PostGIS and Redis
- Initial architecture documentation and ADRs

## Phase 1 - API Foundation and Auth

- NestJS app
- Config validation
- Health and readiness endpoints
- User entity, roles, password hashing, JWT auth
- Server-side RBAC guards
- Demo users seeded through migrations

## Phase 2 - PostGIS Network Model

Status: started. Core schema, spatial indexes, and initial synthetic seed network are implemented locally.

- PostGIS extension migration
- Substations, network nodes, feeders, segments, transformers, service areas
- Geometry validation and spatial indexes
- Synthetic seed network

## Phase 3 - Map UI

- Next.js app shell
- Authentication flow
- MapLibre map
- Viewport-aware GeoJSON queries
- Layer toggles, asset detail panels, search

## Phase 4 - Telemetry and Simulator

- Telemetry devices and readings
- Authenticated ingest endpoint with idempotency
- Seeded simulator scenarios
- Normal operating telemetry

## Phase 5 - Fault Rules and Network Trace

- Deterministic rule configuration
- Feeder voltage loss, heartbeat loss, transformer temperature warnings
- Downstream trace service with cycle protection and switch-state stopping
- Impact snapshots

## Phase 6 - Incidents and Dispatch

- Incident state machine and timeline
- Automatic outage incident creation
- Nearby crew recommendations using spatial distance
- Transactional dispatch with crew reservation

## Phase 7 - Real-Time Operations

- Authenticated WebSocket gateway
- Incident, network, and crew updates
- Frontend reconnect handling

## Phase 8 - Analytics, CI/CD, and Portfolio Polish

- MTTA/MTTR and outage analytics
- Unit, integration, E2E, smoke tests
- Production compose, Nginx, Jenkinsfile
- Screenshots, interview notes, final README


