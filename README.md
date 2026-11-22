# Grocify

Grocify is an AI-driven grocery planning and food-sustainability application. It helps users organize pantry items, identify ingredients that are expiring soon, generate pantry-first recipes, schedule meals for the week, and build a shopping cart for missing ingredients.

## Highlights

- Secure user registration and sign-in with JWT authentication
- Pantry inventory with quantity, category, price, nutrition, and expiry tracking
- Dashboard summaries for pantry items, expiring ingredients, inventory value, and cart total
- Expiry alerts and a rescue-recipe flow for ingredients that should be used soon
- AI recipe generation using preferences, allergies, servings, and budget
- Weekly meal planning with missing ingredients added to the shopping cart
- Nutrition logging, budget support, user profiles, and pantry-first recommendations

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, TanStack Query |
| Backend | FastAPI, SQLAlchemy, Alembic, JWT |
| Data services | PostgreSQL, Redis |
| AI | OpenAI API with structured recipe responses |
| Local environment | Docker Compose |

## Architecture

```text
React + Vite frontend
        |
        v
FastAPI API (/api/v1)
   |        |        |
   v        v        v
PostgreSQL Redis   OpenAI API
```

## Quick Start With Docker

### Prerequisites

- Docker Desktop
- An OpenAI API key only if you want live AI recipe generation

### 1. Configure environment variables

```bash
cp .env.example .env
```

For live AI recipes, add your key to `.env`:

```text
OPENAI_API_KEY=your_api_key_here
```

### 2. Start the application

```bash
docker compose up --build
```

In another terminal, apply the database migrations:

```bash
docker compose exec api alembic upgrade head
```

### 3. Open Grocify

- Application: `http://127.0.0.1:5173`
- API documentation: `http://127.0.0.1:8002/docs`
- API health check: `http://127.0.0.1:8002/api/v1/health`

Use `docker compose down` to stop the stack.

## Run Without Docker

The frontend can be started independently when a compatible API is available:

```bash
cd frontend
npm install
VITE_API_URL=http://127.0.0.1:8002/api/v1 npm run dev
```

For the backend, install `backend/requirements.txt`, configure PostgreSQL and Redis through `.env`, apply Alembic migrations, and run Uvicorn from `backend/`:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

## Key Workflows

1. Register or sign in.
2. Add pantry items with expiry and nutrition details.
3. Review dashboard summaries and expiry alerts.
4. Use the Planner to generate a pantry-aware recipe.
5. Add a generated recipe to a day in the weekly meal plan.
6. Add recipe ingredients missing from the pantry to the cart.

## Repository Structure

```text
.
├── backend/             # FastAPI API, models, migrations, and services
├── frontend/            # React application
├── meetings/            # Team and advisor meeting records
├── report-assets/       # Application screenshots and UML diagrams
├── docker-compose.yml   # Local multi-service environment
└── .env.example         # Environment-variable template
```

## AI Recipe Generation

The planner sends recipe preferences, allergies, serving count, budget, and pantry context to the FastAPI backend. The backend calls the OpenAI API and validates a structured response before returning the recipe to the frontend.

Recipe and nutrition values are estimates and are not medical or dietary advice. If `OPENAI_API_KEY` is not configured, all non-AI application features remain available, while live recipe generation displays an error message.

## Roadmap

The following improvements are planned and are not yet part of the completed feature set.

### Product Enhancements

- [ ] Add configurable email or push notifications for ingredients approaching expiry.
- [ ] Support multiple pantry locations, such as home, dorm, or shared household.
- [ ] Add barcode scanning and receipt import to speed up pantry entry.
- [ ] Add household sharing with invited users and role-based access.
- [ ] Connect grocery-store or price-comparison APIs for more accurate cart estimates.

### AI And Meal Planning

- [ ] Let users save, rate, and revisit generated recipes.
- [ ] Generate a complete weekly menu that balances dietary preferences, budget, and nutrition targets.
- [ ] Add recipe regeneration controls for cuisine, preparation time, and available appliances.
- [ ] Improve nutrition estimates with a verified food-nutrition data provider.

### Quality, Security, And Deployment

- [ ] Add automated frontend, backend, and end-to-end test coverage.
- [ ] Add API rate limiting, audit logging, and production-ready secret management.
- [ ] Add accessibility testing and keyboard-navigation improvements.
- [ ] Deploy the frontend, API, database, and Redis services to a managed cloud environment.
- [ ] Add CI checks for tests, linting, and Docker image builds.

## Report Assets

The `report-assets/` folder contains Chapter 4 screenshots and UML diagrams used by the project report. The `meetings/` folder contains the team and advisor meeting records.
