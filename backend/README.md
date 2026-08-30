# Grocify Backend

This backend matches the architecture described in the project contribution report:

- `FastAPI` API layer
- `PostgreSQL` with `SQLAlchemy`
- `Alembic` migrations
- `Redis` Blackboard store with lock + TTL support
- `JWT` authentication

## Run locally

1. Copy `.env.example` to `.env`
2. Start infrastructure:

```bash
docker compose up --build
```

3. Apply migrations inside the API container:

```bash
docker compose exec api alembic upgrade head
```

4. Open the API docs:

```text
http://127.0.0.1:8000/docs
```

## Notes

The current root-level `index.html`/`app.js` frontend is still the prototype UI. The next migration step is to connect that frontend to `/api/v1/*` or replace it with the Vite + Tailwind frontend described in the report.
