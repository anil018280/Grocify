# Grocify Backend

The Grocify backend is a FastAPI service that provides authentication, pantry management, cart and nutrition tracking, pantry recommendations, AI recipe generation, and weekly meal planning.

## Stack

- FastAPI and Uvicorn
- PostgreSQL with SQLAlchemy
- Alembic database migrations
- Redis for the Blackboard store and coordination support
- JWT authentication
- OpenAI API for structured recipe generation

## Run With Docker

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Apply migrations after the services start:

```bash
docker compose exec api alembic upgrade head
```

The API is available at:

- Interactive documentation: `http://127.0.0.1:8002/docs`
- Health endpoint: `http://127.0.0.1:8002/api/v1/health`

## Run Locally

Create and activate a Python virtual environment, then install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set the required PostgreSQL, Redis, JWT, and optional OpenAI settings in the root `.env` file. Apply migrations from `backend/`, then start Uvicorn:

```bash
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

## API Areas

| Route prefix | Purpose |
| --- | --- |
| `/api/v1/auth` | Register and sign in users |
| `/api/v1/pantry` | Create and manage pantry data, locations, barcode lookup, photo/receipt scan, and fridge simulator |
| `/api/v1/cart` | Manage shopping-cart items and store price comparison |
| `/api/v1/nutrition` | Store nutrition entries, targets, and USDA/OpenFoodFacts lookup |
| `/api/v1/profile` | Manage household preferences, expiry notifications, and RBAC sharing |
| `/api/v1/recommendations` | Pantry-aware recommendations (Redis cached), AI recipes, and saved/rated recipes |
| `/api/v1/meal-plan` | Weekly meal scheduling, 7-day auto-generation, mark cooked, and cart updates |
| `/api/v1/health` | Service health check |

## Run Tests

```bash
docker compose exec api pytest -v
```

## AI Configuration

Add the following settings to the root `.env` file to enable live recipe generation:

```text
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-6-astra
```

The API key is read only by the backend. The recipe service validates structured responses before returning ingredients, steps, substitutions, estimated cost, and nutrition notes to the frontend.

If an API key is unavailable, authentication, inventory, cart, nutrition, and weekly-planning endpoints continue to work; only live AI recipe generation is unavailable.
