# Testing

Testing should scale with the risk of each phase.

- Unit tests for rule evaluation, topology tracing, incident state transitions, and analytics calculations
- Integration tests for PostGIS migrations, spatial queries, telemetry idempotency, and dispatch transactions
- API E2E tests for authentication, RBAC, ingest, incident, and dispatch workflows
- Frontend tests for map query behavior, incident workflows, and zero-data states
- Smoke tests for Docker and production routing

Acceptance criteria are complete only when they are directly verified.
