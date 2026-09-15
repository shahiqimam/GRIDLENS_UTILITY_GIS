# 0003 - REST Ingestion Before MQTT

## Context

The simulator needs to send telemetry safely and idempotently.

## Decision

Start with an authenticated REST ingestion endpoint.

## Alternatives

- MQTT broker and adapter
- Direct database writes from the simulator

## Consequences

REST keeps the first portfolio release simpler and testable. The simulator remains decoupled because it talks to the same public application boundary that a later MQTT adapter could use.
