# Grocify

Grocify is an AI-driven grocery planning and food sustainability project for pantry tracking, shopping support, nutrition logging, and meal planning.

## Current Project State

The repository currently contains three app layers:

- A root-level prototype UI served by a small Node server
- A FastAPI backend with PostgreSQL, Redis, SQLAlchemy, Alembic, and JWT auth
- A modern React + Vite + Tailwind frontend that is being connected to the backend

## Repository Structure

```text
.
├── app.js / index.html / styles.css / server.js   # Prototype frontend
├── backend/                                       # FastAPI backend
├── data/                                          # Local JSON store for prototype mode
├── docker-compose.yml                             # Full-stack Docker setup
└── frontend/                                      # React + Vite frontend
```

## What's Implemented

- Pantry inventory management flows
- Shopping cart and grocery planning flows
- Nutrition tracking endpoints and UI support
- Freshness- and nutrition-aware meal and shopping recommendations at `/api/v1/recommendations`
- User authentication with register/login endpoints
- Profile and blackboard API routes
- Alembic migration scaffolding and Docker-based infrastructure

## Run Options

### 1. Root Prototype

Run the original prototype frontend and local Node server:

```bash
npm start
```

Open:

```text
http://127.0.0.1:8001
```

### 2. Backend Locally

Use the backend service directly:

```bash
cp .env.example .env
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
cd backend
../backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8002
```

Health check:

```text
http://127.0.0.1:8002/api/v1/health
```

### 3. React Frontend Locally

Start the newer frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Docker Setup

To run the full stack with Docker:

```bash
cp .env.example .env
docker compose up --build
```

Then apply migrations:

```bash
docker compose exec api alembic upgrade head
```

Current service ports:

- `api` -> `http://127.0.0.1:8002`
- `frontend` -> `http://127.0.0.1:5173`
- `postgres` -> `127.0.0.1:5432`
- `redis` -> `127.0.0.1:6379`

## Notes

- The root prototype and the React frontend currently coexist.
- The backend is available under `/api/v1/*`.
- Local environment files, virtual environments, `node_modules`, and Python cache files are ignored via `.gitignore`.
