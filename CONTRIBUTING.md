# Contributing

GridLens is built phase by phase. Keep changes small, tested, and documented.

## Rules

- Use synthetic data only.
- Keep backend business rules out of controllers.
- Add migrations for database changes.
- Update docs when architecture or behavior changes.
- Do not commit secrets.
- Verify acceptance criteria before marking work complete.

## Local Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
