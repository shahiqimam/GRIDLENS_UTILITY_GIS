# 0004 - In-Memory Trace Before pgRouting

## Context

Downstream outage impact requires traversing a directed network topology.

## Decision

Load one feeder topology into a NestJS service and perform BFS or DFS using an adjacency list.

## Alternatives

- Recursive PostgreSQL CTEs
- pgRouting
- Precomputed frontend impact lists

## Consequences

The trace engine stays transparent, testable, and interview-friendly. Later optimization can move traversal closer to the database if scale demands it.
