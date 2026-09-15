# Network Tracing

Network tracing is a backend domain service, not frontend map logic.

The first implementation should load one feeder topology, build an adjacency list keyed by `fromNodeId`, and run BFS or DFS from the fault source. It collects downstream nodes, segments, transformers, service areas, and estimated customer impact.

The traversal must:

- Treat `NetworkSegment.fromNodeId -> NetworkSegment.toNodeId` as directed
- Track visited nodes to prevent infinite loops
- Stop traversal at open switch nodes
- Return both IDs and aggregate impact counts
- Store incident impact snapshots so historical incidents are not changed by later topology edits

Later versions may use recursive SQL CTEs or pgRouting, but the initial implementation should stay explainable and testable in TypeScript.

## Implemented Trace Slice

The API now exposes GET /api/v1/network/feeders/:feederId/trace. The first implementation loads feeder segments and nodes, builds an adjacency list, performs BFS, tracks visited nodes to avoid cycles, stops at open switches, and returns affected node, segment, transformer, service-area, and estimated-customer counts.

