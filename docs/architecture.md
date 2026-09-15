# Architecture

GridLens is planned as a modular monorepo with three applications and one shared package.

```text
Browser
   |
   v
Next.js web app
   |
   v
NestJS API
   |
   +--> PostgreSQL/PostGIS
   |
   +--> Redis
   |
   +--> WebSocket clients

Telemetry simulator
   |
   v
Authenticated ingest API
```

The backend owns all domain rules: authentication, authorization, geometry validation, telemetry ingestion, fault evaluation, topology tracing, incident transitions, crew dispatch, and audit events. The frontend visualizes and operates the system, but it does not decide outage impact or authorization.
