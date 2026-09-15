# Security

GridLens is synthetic, but it should be designed like an internal operations application.

- All business APIs require authentication unless explicitly documented otherwise.
- Authorization is enforced on the backend with role checks.
- The telemetry ingest endpoint uses an environment-provided ingest key.
- Passwords are hashed with bcrypt or Argon2id.
- Secrets are never committed and are represented only in `.env.example`.
- Geometry input is validated before persistence.
- Audit events record important operational and administrative actions.
- Frontend button hiding is convenience only, not a security boundary.
