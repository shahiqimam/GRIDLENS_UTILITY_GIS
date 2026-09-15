# Interview Notes

GridLens should prepare concise explanations for:

- Why PostGIS is useful compared with plain latitude/longitude columns
- How SRID 4326 and longitude/latitude ordering are handled
- How GIST indexes support spatial queries
- Why map endpoints must be viewport-aware
- How the directed topology graph is represented
- How downstream trace handles cycles and open switches
- Why telemetry has both recorded and received timestamps
- How duplicate telemetry is handled idempotently
- How incidents are created once per active fault
- How dispatch prevents two operators assigning the same crew
- Why WebSockets are used for operational updates
- What would need to change for a real utility environment
