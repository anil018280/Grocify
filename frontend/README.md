# Grocify Frontend

The Grocify frontend is a React single-page application for pantry tracking, AI meal planning, expiry alerts, shopping support, nutrition logging, and weekly meal scheduling.

## Stack

- Vite
- React 18
- Tailwind CSS
- TanStack Query
- FastAPI API with JWT-authenticated requests

## Setup

```bash
npm install
```

Create a local environment file if the API is not running on the default Docker port:

```text
VITE_API_URL=http://127.0.0.1:8002/api/v1
```

Start the development server:

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

## Available Commands

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run preview  # Preview the production build
```

## Main UI Areas

- **Home Dashboard:** Executive summary of pantry items, expiring-soon alerts, cart total, meal recommender, weekly menu, and daily nutrition.
- **Inventory:** Add, edit, search, filter by category/location, scan barcodes, upload photos/receipts, and run the 3-camera Smart Fridge Simulator.
- **Planner:** Generate pantry-aware recipes (with prep time & appliance controls), save/rate recipes, auto-generate a 7-day menu, mark meals cooked, and add missing items to cart.
- **Budget:** Weekly budget planner, category spend breakdown, food-waste money-at-risk alerts, regional store price comparison, and one-click checkout to pantry.
- **Nutrition:** Calorie progress bar, macro totals, USDA verified food lookup, and meal log.
- **Profile:** Household size & cooking setup, preferred cuisines/likes/allergies, configurable expiry notifications, and household sharing (RBAC).

The frontend expects the FastAPI server to expose endpoints under `/api/v1` and stores the access token in browser local storage after sign-in.
