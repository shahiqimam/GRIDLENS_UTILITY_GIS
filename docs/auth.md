# Authentication

GridLens uses JWT authentication for the portfolio release.

Demo accounts seeded for development:

| Email | Role |
| --- | --- |
| admin@gridlens.local | ADMIN |
| operations@gridlens.local | OPERATIONS |
| field@gridlens.local | FIELD_ENGINEER |
| viewer@gridlens.local | VIEWER |

All seeded demo accounts use the local development password:

```text
gridlens-demo
```

These credentials are for development only. Real deployments must set their own user bootstrap process and secrets.

Authorization is enforced in the backend with JWT and role guards. Frontend hiding is not treated as a security boundary.
