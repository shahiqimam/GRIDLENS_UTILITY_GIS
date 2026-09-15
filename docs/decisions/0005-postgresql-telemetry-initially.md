# 0005 - PostgreSQL Telemetry Initially

## Context

Telemetry volume for the portfolio release is synthetic and bounded.

## Decision

Store telemetry readings in PostgreSQL with appropriate indexes and idempotency constraints.

## Alternatives

- TimescaleDB
- Dedicated time-series database
- Message broker as source of truth

## Consequences

This avoids premature infrastructure while still demonstrating data modeling, indexing, and event ordering. Documentation should explain when a specialized time-series store would become appropriate.
