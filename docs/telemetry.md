# Telemetry

The simulator must send telemetry through the API. It must not write directly to the database.

Initial ingest endpoint:

```http
POST /api/v1/telemetry/ingest
X-Ingest-Key: <secret>
```

Ingestion requirements:

- Validate payload shape and metric names
- Reject unknown devices
- Enforce a maximum batch size
- Store `recordedAt` and `receivedAt` separately
- Use `sourceEventId` for idempotency
- Never log the ingest key
- Store late readings historically without letting them rewind live fault state

## Implemented Ingest Slice

The API now has a protected POST /api/v1/telemetry/ingest endpoint using X-Ingest-Key. The first telemetry migration seeds devices for the synthetic substation, feeders, and transformers. Duplicate sourceEventId values are accepted as no-op responses before new readings are written.


## Simulator Slice

The simulator now generates deterministic normal telemetry using a seeded random generator and submits events through the public ingest API. It does not connect to or write directly into PostgreSQL.


## Fault Rule Configuration Slice

Fault detection thresholds are now database-backed through ault_rule_configs. Seeded defaults include feeder voltage loss below 1.0 kV for 3 consecutive readings, feeder heartbeat timeout after 60 seconds, and transformer overtemperature warning/critical thresholds at 85/95 degrees.

