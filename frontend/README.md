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

- **Inventory:** Add, edit, search, filter, and manage pantry items.
- **Planner:** Generate pantry-aware recipes, review expiry alerts, and plan meals by day.
- **Budget:** Review cart items and their total cost.
- **Nutrition:** Log and review nutrition information.
- **Profile:** View account and workspace preferences.

The frontend expects the FastAPI server to expose endpoints under `/api/v1` and stores the access token in browser local storage after sign-in.
