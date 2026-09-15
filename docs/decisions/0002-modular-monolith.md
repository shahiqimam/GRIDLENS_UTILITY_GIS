# 0002 - Start With a Modular Monolith

## Context

The domain contains several capabilities: network modeling, telemetry, rules, incidents, dispatch, analytics, audit, and real-time updates.

## Decision

Implement the backend as a modular NestJS monolith first.

## Alternatives

- Separate microservices from the start
- A single unstructured API module

## Consequences

A modular monolith keeps boundaries explainable without adding deployment and distributed-systems complexity before the domain is proven.
