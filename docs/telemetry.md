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
