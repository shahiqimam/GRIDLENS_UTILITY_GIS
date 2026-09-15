# Domain Model

The core domain is a synthetic electrical distribution network.

- `Substation`: source location for one or more feeders.
- `NetworkNode`: topology connection point, including source, junction, switch, transformer connection, and terminal nodes.
- `Feeder`: directed network starting at a source node.
- `NetworkSegment`: directed edge from one node to another.
- `Transformer`: downstream asset attached to a network node.
- `ServiceArea`: synthetic polygon served by one transformer.
- `TelemetryDevice`: simulated source for operational readings.
- `TelemetryReading`: idempotently ingested metric sample.
- `Incident`: operational record created from a detected fault.
- `Crew`: fictional field crew with synthetic location.
- `DispatchAssignment`: transactional assignment of one crew to one incident.

No personal customer records are modeled. Customer impact is stored only as estimated customer counts on synthetic service areas and incident snapshots.

## Implemented Phase 2 Slice

The local seed currently creates one fictional substation, two feeders, seven topology nodes, six directed segments, three transformers, and three synthetic service areas. Estimated customer impact is represented only as aggregate synthetic counts on service areas.

