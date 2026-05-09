# Grocify

Grocify is a smart grocery management and meal-planning prototype that connects pantry tracking, recipe planning, budget management, expiry awareness, and nutrition tracking in one web app.

## Overview

The prototype is designed around one connected workflow:

- inventory drives recipe recommendations
- recipes add missing ingredients to the shopping cart
- the shopping cart updates budget totals
- consumed pantry items update nutrition tracking

This version is a frontend prototype built with plain HTML, CSS, and JavaScript and is intended for demo, presentation, and workflow validation.

## Run the prototype

Open [index.html](/Users/boddamarathireddy/Desktop/Grocify/index.html) in a browser.

If you want to serve it locally from the terminal instead of double-clicking the file:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Current Features

### Inventory

- pantry item listing with quantity, category, days left, and estimated price
- add new grocery items
- edit item quantity, expiry window, and price
- mark items as used
- auto-fill staple pantry items for demo use

### Expiry Tracker

- dedicated tab for near-expiry items
- waste-reduction view to prioritize what should be cooked first

### Recipes

- recipe recommendations based on pantry match
- search and filter recipes
- pantry-match percentage per recipe
- custom recipe ingredient checker
- add missing ingredients to cart directly from recipe cards

### Budget

- real cart with quantities and per-item pricing
- cart total and cart item count
- shopping summary for recommended meals
- simple spending trend visualization
- purchase history list from pantry data

### Nutrition

- calorie tracker with customizable daily goal
- protein, carbs, fat, and fiber progress
- log consumed pantry items
- nutrition insight cards and progress bars

### Persistence

- pantry items, cart items, calorie logs, and calorie target are saved in `localStorage`
- app state persists across refreshes in the browser

## Demo Flow

For a short demo, use this order:

1. `Inventory`: add, edit, and use an item
2. `Expiry Tracker`: show expiring items
3. `Recipes`: search and add missing ingredients to cart
4. `Budget`: show real cart totals and remove an item
5. `Nutrition`: log a pantry item and update the calorie goal

## Project Structure

- [index.html](/Users/boddamarathireddy/Desktop/Grocify/index.html): app layout and tab structure
- [styles.css](/Users/boddamarathireddy/Desktop/Grocify/styles.css): dashboard styling and responsive layout
- [app.js](/Users/boddamarathireddy/Desktop/Grocify/app.js): state, interactions, seeded data, and tab logic

## Future Improvements

- replace prompt-based item editing with an in-page form or modal
- add backend persistence and authentication
- generate richer AI-assisted recipe recommendations
- support computer-vision-based pantry updates
- expand budget and nutrition analytics with real datasets
