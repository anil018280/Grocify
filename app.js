const starterItems = [
  { id: 1, name: "Spinach", quantity: 1, unit: "bunches", category: "Produce", daysLeft: 2, price: 2.5 },
  { id: 2, name: "Tomatoes", quantity: 4, unit: "pcs", category: "Produce", daysLeft: 4, price: 3.2 },
  { id: 3, name: "Greek Yogurt", quantity: 1, unit: "cups", category: "Dairy", daysLeft: 5, price: 4.1 },
  { id: 4, name: "Eggs", quantity: 6, unit: "pcs", category: "Protein", daysLeft: 7, price: 3.9 },
  { id: 5, name: "Brown Rice", quantity: 2, unit: "cups", category: "Grains", daysLeft: 28, price: 2.2 },
  { id: 6, name: "Chickpeas", quantity: 2, unit: "cups", category: "Pantry", daysLeft: 60, price: 1.8 },
  { id: 7, name: "Milk", quantity: 1, unit: "cups", category: "Dairy", daysLeft: 6, price: 3.6 },
  { id: 8, name: "Bananas", quantity: 6, unit: "pcs", category: "Produce", daysLeft: 3, price: 2.8 },
  { id: 9, name: "Chicken Breast", quantity: 2, unit: "lbs", category: "Protein", daysLeft: 3, price: 8.9 },
  { id: 10, name: "Bell Peppers", quantity: 3, unit: "pcs", category: "Produce", daysLeft: 4, price: 3.7 },
  { id: 11, name: "Pasta", quantity: 1, unit: "lbs", category: "Grains", daysLeft: 45, price: 1.9 },
  { id: 12, name: "Cheddar Cheese", quantity: 1, unit: "oz", category: "Dairy", daysLeft: 12, price: 4.8 },
  { id: 13, name: "Apples", quantity: 5, unit: "pcs", category: "Produce", daysLeft: 9, price: 4.2 },
  { id: 14, name: "Oats", quantity: 1, unit: "cups", category: "Pantry", daysLeft: 90, price: 3.1 },
  { id: 15, name: "Bread", quantity: 1, unit: "pcs", category: "Grains", daysLeft: 5, price: 3.4 },
];

const stapleItems = [
  { name: "Onions", quantity: 3, unit: "pcs", category: "Produce", daysLeft: 8, price: 2.4 },
  { name: "Garlic", quantity: 1, unit: "pcs", category: "Produce", daysLeft: 15, price: 1.1 },
  { name: "Olive Oil", quantity: 1, unit: "oz", category: "Pantry", daysLeft: 90, price: 8.0 },
  { name: "Lemons", quantity: 2, unit: "pcs", category: "Produce", daysLeft: 7, price: 1.9 },
  { name: "Black Beans", quantity: 2, unit: "cups", category: "Pantry", daysLeft: 120, price: 2.6 },
];

const recipes = [
  {
    name: "Spinach Shakshuka",
    ingredients: ["Spinach", "Tomatoes", "Eggs", "Onions"],
    minutes: 25,
    cost: 8,
    description: "A one-pan breakfast-for-dinner option that clears out produce fast.",
    instructions: ["Saute onions and tomatoes.", "Add spinach.", "Crack eggs and simmer."],
  },
  {
    name: "Mediterranean Chickpea Bowl",
    ingredients: ["Chickpeas", "Tomatoes", "Brown Rice", "Greek Yogurt"],
    minutes: 20,
    cost: 7,
    description: "Protein-heavy bowl using pantry staples with a yogurt dressing.",
    instructions: ["Cook rice.", "Warm chickpeas.", "Assemble with yogurt and tomatoes."],
  },
  {
    name: "Creamy Tomato Rice",
    ingredients: ["Tomatoes", "Brown Rice", "Greek Yogurt", "Garlic"],
    minutes: 30,
    cost: 6,
    description: "Low-cost comfort meal for nights when the pantry is running thin.",
    instructions: ["Cook rice.", "Saute garlic and tomatoes.", "Stir through yogurt."],
  },
  {
    name: "Pantry Frittata",
    ingredients: ["Eggs", "Spinach", "Onions", "Greek Yogurt"],
    minutes: 18,
    cost: 5,
    description: "Fast, budget-friendly, and useful for ingredients nearing expiration.",
    instructions: ["Whisk eggs.", "Cook vegetables.", "Bake or cover until set."],
  },
  {
    name: "Chicken Pepper Pasta",
    ingredients: ["Chicken Breast", "Bell Peppers", "Pasta", "Garlic"],
    minutes: 32,
    cost: 11,
    description: "A quick weeknight pasta that uses protein and fresh produce already in the kitchen.",
    instructions: ["Cook pasta.", "Saute chicken and peppers.", "Combine with garlic and toss."],
  },
  {
    name: "Banana Oat Breakfast Bowl",
    ingredients: ["Bananas", "Oats", "Milk", "Greek Yogurt"],
    minutes: 10,
    cost: 4,
    description: "Simple breakfast bowl with pantry oats and fruit that is ready in minutes.",
    instructions: ["Cook oats in milk.", "Top with bananas.", "Finish with yogurt."],
  },
  {
    name: "Cheddar Apple Toast",
    ingredients: ["Bread", "Cheddar Cheese", "Apples"],
    minutes: 8,
    cost: 5,
    description: "Fast snack or light lunch with sweet and savory balance.",
    instructions: ["Toast bread.", "Add cheese and apple slices.", "Serve warm."],
  },
  {
    name: "Chickpea Stuffed Peppers",
    ingredients: ["Chickpeas", "Bell Peppers", "Brown Rice", "Tomatoes"],
    minutes: 28,
    cost: 7,
    description: "A filling, low-cost dinner that turns pantry staples into a proper meal.",
    instructions: ["Mix rice, chickpeas, and tomatoes.", "Stuff peppers.", "Bake until tender."],
  },
];

const calorieDefaults = {
  spinach: { calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2 },
  tomatoes: { calories: 22, protein: 1, carbs: 5, fat: 0, fiber: 2 },
  "greek yogurt": { calories: 130, protein: 17, carbs: 6, fat: 4, fiber: 0 },
  eggs: { calories: 72, protein: 6, carbs: 0, fat: 5, fiber: 0 },
  "brown rice": { calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4 },
  chickpeas: { calories: 269, protein: 14, carbs: 45, fat: 4, fiber: 12 },
  onions: { calories: 44, protein: 1, carbs: 10, fat: 0, fiber: 2 },
  garlic: { calories: 13, protein: 1, carbs: 3, fat: 0, fiber: 0 },
  "olive oil": { calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0 },
  milk: { calories: 103, protein: 8, carbs: 12, fat: 2, fiber: 0 },
  bananas: { calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 },
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0 },
  "bell peppers": { calories: 31, protein: 1, carbs: 7, fat: 0, fiber: 2 },
  pasta: { calories: 210, protein: 7, carbs: 42, fat: 1, fiber: 2 },
  "cheddar cheese": { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0 },
  apples: { calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4 },
  oats: { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 },
  bread: { calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 2 },
  lemons: { calories: 17, protein: 1, carbs: 5, fat: 0, fiber: 2 },
  "black beans": { calories: 227, protein: 15, carbs: 41, fat: 1, fiber: 15 },
};

const marketPrices = {
  spinach: 2.5,
  tomatoes: 3.2,
  "greek yogurt": 4.1,
  eggs: 3.9,
  "brown rice": 2.2,
  chickpeas: 1.8,
  onions: 2.4,
  garlic: 1.1,
  "olive oil": 8.0,
  milk: 3.6,
  bananas: 2.8,
  "chicken breast": 8.9,
  "bell peppers": 3.7,
  pasta: 1.9,
  "cheddar cheese": 4.8,
  apples: 4.2,
  oats: 3.1,
  bread: 3.4,
  lemons: 1.9,
  "black beans": 2.6,
};

const spendingTrend = [
  { month: "Jan", value: 120 },
  { month: "Feb", value: 150 },
  { month: "Mar", value: 135 },
  { month: "Apr", value: 110 },
  { month: "May", value: 145 },
  { month: "Jun", value: 130 },
];

const STATE_KEY = "grocify-prototype-v2";
const DEFAULT_NUTRITION = { calories: 120, protein: 4, carbs: 12, fat: 3, fiber: 1 };

function buildNutrition(name) {
  return calorieDefaults[normalize(name)] ?? DEFAULT_NUTRITION;
}

function buildPantryItem(item) {
  return {
    ...item,
    nutrition: item.nutrition ?? buildNutrition(item.name),
  };
}

function buildCartItem(name, quantity = 1) {
  return {
    id: Date.now() + Math.random(),
    name,
    quantity,
    price: marketPrices[normalize(name)] ?? 2.25,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const savedState = loadState();
let pantry = (savedState?.pantry ?? starterItems).map((item) => buildPantryItem(item));
let focusedMode = false;
let searchQuery = "";
let recipeQuery = "";
let nutritionQuery = "";
let activeTab = "inventory";
let calorieTarget = savedState?.calorieTarget ?? 2000;
let calorieEntries = savedState?.calorieEntries ?? [
  { id: 1, itemName: "Greek Yogurt", servings: 1, calories: 130, protein: 17, carbs: 6, fat: 4, fiber: 0 },
  { id: 2, itemName: "Eggs", servings: 2, calories: 144, protein: 12, carbs: 0, fat: 10, fiber: 0 },
  { id: 3, itemName: "Bananas", servings: 1, calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3 },
];
let customIngredients = [];
let cartItems = (savedState?.cartItems ?? ["Lemons", "Black Beans"].map((name) => buildCartItem(name))).map((item) => ({
  ...item,
  quantity: item.quantity ?? 1,
  price: item.price ?? marketPrices[normalize(item.name)] ?? 2.25,
}));

const metricsGrid = document.getElementById("metricsGrid");
const inventoryList = document.getElementById("inventoryList");
const wasteRiskCount = document.getElementById("wasteRiskCount");
const snapshotStrip = document.getElementById("snapshotStrip");
const pantryForm = document.getElementById("pantryForm");
const focusModeButton = document.getElementById("focusModeButton");
const restockButton = document.getElementById("restockButton");
const inventorySearch = document.getElementById("inventorySearch");
const expiringMessage = document.getElementById("expiringMessage");
const cartMessage = document.getElementById("cartMessage");
const jumpToFormButton = document.getElementById("jumpToFormButton");
const viewExpiringButton = document.getElementById("viewExpiringButton");
const viewCartButton = document.getElementById("viewCartButton");
const expiryList = document.getElementById("expiryList");
const recipeFilterTab = document.getElementById("recipeFilterTab");
const recipeSearch = document.getElementById("recipeSearch");
const recipeGridTab = document.getElementById("recipeGridTab");
const customIngredientInput = document.getElementById("customIngredientInput");
const customIngredientList = document.getElementById("customIngredientList");
const addIngredientButton = document.getElementById("addIngredientButton");
const resetRecipeButton = document.getElementById("resetRecipeButton");
const recipeCheckerForm = document.getElementById("recipeCheckerForm");
const customRecipeName = document.getElementById("customRecipeName");
const recipeMatchSummary = document.getElementById("recipeMatchSummary");
const budgetMetricsGrid = document.getElementById("budgetMetricsGrid");
const budgetCardTab = document.getElementById("budgetCardTab");
const shoppingListTab = document.getElementById("shoppingListTab");
const spendingChart = document.getElementById("spendingChart");
const purchaseHistory = document.getElementById("purchaseHistory");
const nutritionSummaryGrid = document.getElementById("nutritionSummaryGrid");
const nutritionInsights = document.getElementById("nutritionInsights");
const macroBars = document.getElementById("macroBars");
const nutritionComparison = document.getElementById("nutritionComparison");
const nutrientProgressList = document.getElementById("nutrientProgressList");
const nutritionSearch = document.getElementById("nutritionSearch");
const calorieConsumed = document.getElementById("calorieConsumed");
const calorieRemaining = document.getElementById("calorieRemaining");
const calorieProgress = document.getElementById("calorieProgress");
const calorieNote = document.getElementById("calorieNote");
const calorieForm = document.getElementById("calorieForm");
const calorieItemSelect = document.getElementById("calorieItemSelect");
const calorieServings = document.getElementById("calorieServings");
const calorieLog = document.getElementById("calorieLog");
const calorieTargetInput = document.getElementById("calorieTargetInput");
const openRecipesButton = document.getElementById("openRecipesButton");
const openBudgetButton = document.getElementById("openBudgetButton");
const openNutritionButton = document.getElementById("openNutritionButton");
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const workspacePanels = Array.from(document.querySelectorAll(".workspace-panel"));

function saveState() {
  localStorage.setItem(
    STATE_KEY,
    JSON.stringify({
      pantry,
      cartItems,
      calorieEntries,
      calorieTarget,
    })
  );
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function getStatus(daysLeft) {
  if (daysLeft <= 2) return { label: "Use now", className: "urgent" };
  if (daysLeft <= 5) return { label: "Plan soon", className: "soon" };
  return { label: "Stable", className: "safe" };
}

function getPantryNames() {
  return new Set(pantry.map((item) => normalize(item.name)));
}

function getRecipeInsights() {
  const pantryNames = getPantryNames();

  return recipes.map((recipe) => {
    const matched = recipe.ingredients.filter((ingredient) => pantryNames.has(normalize(ingredient)));
    const missing = recipe.ingredients.filter((ingredient) => !pantryNames.has(normalize(ingredient)));
    const expiringMatches = matched.filter((ingredient) => {
      const item = pantry.find((entry) => normalize(entry.name) === normalize(ingredient));
      return item && item.daysLeft <= 3;
    });

    return {
      ...recipe,
      matched,
      missing,
      score: Math.round((matched.length / recipe.ingredients.length) * 100),
      expiringMatches,
    };
  });
}

function getNutritionTotals() {
  return calorieEntries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
      fiber: totals.fiber + entry.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

function renderMetricCards(target, metrics) {
  target.innerHTML = "";
  const template = document.getElementById("metricTemplate");

  metrics.forEach((metric) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".metric-label").textContent = metric.label;
    node.querySelector(".metric-value").textContent = metric.value;
    node.querySelector(".metric-note").textContent = metric.note;
    target.appendChild(node);
  });
}

function renderInventoryMetrics() {
  const recipeScores = getRecipeInsights().map((recipe) => recipe.score);
  renderMetricCards(metricsGrid, [
    { label: "Total items", value: pantry.length, note: "Pantry, produce, dairy, and proteins in one view." },
    { label: "Expiring soon", value: pantry.filter((item) => item.daysLeft <= 3).length, note: "These ingredients should influence the next meal plan." },
    { label: "Value", value: `$${pantry.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`, note: "Simple estimate based on tracked purchase cost." },
    { label: "Categories", value: new Set(pantry.map((item) => item.category)).size, note: recipeScores.length ? `${Math.max(...recipeScores)}% best recipe match available.` : "No recipe coverage yet." },
  ]);
}

function renderInventory() {
  inventoryList.innerHTML = "";
  const template = document.getElementById("inventoryTemplate");
  const filteredItems = pantry
    .slice()
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .filter((item) => !searchQuery || [item.name, item.category, item.unit].some((value) => normalize(value).includes(searchQuery)));

  if (!filteredItems.length) {
    inventoryList.innerHTML = `<article class="inventory-card"><div class="inventory-copy"><h3>No matching items</h3><p class="inventory-meta">Try a different search or add a new pantry item.</p></div></article>`;
    return;
  }

  filteredItems.forEach((item) => {
    const status = getStatus(item.daysLeft);
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".inventory-name").textContent = item.name;
    node.querySelector(".inventory-category").textContent = item.category;
    node.querySelector(".inventory-meta").textContent = `${item.quantity} ${item.unit} • ${item.daysLeft} days left • $${item.price.toFixed(2)}`;
    const badge = node.querySelector(".inventory-badge");
    badge.textContent = status.label;
    badge.classList.add(status.className);
    node.querySelector(".consume-button").addEventListener("click", () => consumePantryItem(item.id));
    node.querySelector(".edit-button").addEventListener("click", () => editPantryItem(item.id));
    node.querySelector(".remove-button").addEventListener("click", () => {
      pantry = pantry.filter((entry) => entry.id !== item.id);
      renderApp();
    });
    inventoryList.appendChild(node);
  });
}

function getFilteredRecipes() {
  let filtered = getRecipeInsights();
  const filterValue = recipeFilterTab.value;

  if (filterValue === "high") filtered = filtered.filter((recipe) => recipe.score >= 75);
  if (filterValue === "budget") filtered = filtered.slice().sort((a, b) => a.cost - b.cost);
  if (filterValue === "expiring") filtered = filtered.filter((recipe) => recipe.expiringMatches.length > 0);
  if (focusedMode) filtered = filtered.slice().sort((a, b) => b.expiringMatches.length - a.expiringMatches.length || b.score - a.score);
  if (recipeQuery) filtered = filtered.filter((recipe) => normalize(recipe.name).includes(recipeQuery) || recipe.ingredients.some((ingredient) => normalize(ingredient).includes(recipeQuery)));

  return filtered;
}

function renderRecipes() {
  const filtered = getFilteredRecipes();
  const template = document.getElementById("recipeTemplate");
  recipeGridTab.innerHTML = "";

  filtered.forEach((recipe) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".recipe-tag").textContent = recipe.expiringMatches.length ? "Waste saver" : "Pantry match";
    node.querySelector(".recipe-score").textContent = `${recipe.score}% match`;
    node.querySelector(".recipe-name").textContent = recipe.name;
    node.querySelector(".recipe-description").textContent = recipe.description;
    node.querySelector(".recipe-meta").innerHTML = `<span>${recipe.minutes} min</span><span>$${recipe.cost} estimated</span><span>${recipe.matched.length}/${recipe.ingredients.length} ingredients ready</span>`;
    const ingredients = node.querySelector(".recipe-ingredients");
    recipe.ingredients.forEach((ingredient) => {
      const pill = document.createElement("span");
      pill.className = "recipe-ingredient";
      pill.textContent = recipe.matched.includes(ingredient) ? `${ingredient} ready` : `${ingredient} buy`;
      ingredients.appendChild(pill);
    });
    const actions = node.querySelector(".recipe-actions");
    const addButton = document.createElement("button");
    addButton.className = "ghost-button";
    addButton.type = "button";
    addButton.textContent = `Add ${recipe.missing.length} to cart`;
    addButton.addEventListener("click", () => {
      recipe.missing.forEach((item) => addCartItem(item));
      renderApp();
    });
    actions.appendChild(addButton);
    recipeGridTab.appendChild(node);
  });
}

function renderRecipeChecker() {
  customIngredientList.innerHTML = "";
  customIngredients.forEach((ingredient, index) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "ingredient-pill";
    pill.textContent = ingredient;
    pill.addEventListener("click", () => {
      customIngredients.splice(index, 1);
      renderRecipeChecker();
    });
    customIngredientList.appendChild(pill);
  });
}

function renderBudgetMetrics() {
  const avg = pantry.length ? pantry.reduce((sum, item) => sum + item.price, 0) / pantry.length : 0;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  renderMetricCards(budgetMetricsGrid, [
    { label: "Cart Total", value: `$${cartTotal.toFixed(2)}`, note: "Estimated checkout for current shopping cart." },
    { label: "Items in Cart", value: cartCount, note: "Quantities included across cart items." },
    { label: "Avg. Item Cost", value: `$${avg.toFixed(2)}`, note: "Average cost per pantry item." },
    { label: "Categories", value: new Set(pantry.map((item) => item.category)).size, note: "Budget spread across pantry groups." },
  ]);
}

function addCartItem(itemName, quantity = 1) {
  const existing = cartItems.find((item) => normalize(item.name) === normalize(itemName));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push(buildCartItem(itemName, quantity));
  }
}

function renderBudget() {
  const recipeInsights = getRecipeInsights();
  const selectedPlan = recipeInsights.slice().sort((a, b) => b.score - a.score || a.cost - b.cost)[0];
  const spend = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wasteSaved = pantry.filter((item) => item.daysLeft <= 3).length * 1.8;

  budgetCardTab.innerHTML = `
    <p>Cart and plan summary</p>
    <h3>$${spend.toFixed(2)}</h3>
    <p>Current recommended meal plan: <strong>${selectedPlan ? selectedPlan.name : "a recipe plan"}</strong>. Estimated food saved this week: <strong>$${wasteSaved.toFixed(2)}</strong>.</p>
  `;

  shoppingListTab.innerHTML = "";
  if (!cartItems.length) {
    shoppingListTab.innerHTML = `<article class="shopping-item"><div><strong>Your cart is empty</strong><span>Add missing ingredients from recipe cards or planning flows.</span></div><span>$0.00</span></article>`;
  } else {
    cartItems
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
      const row = document.createElement("article");
      row.className = "shopping-item";
      row.innerHTML = `<div><strong>${item.name}</strong><span>${item.quantity} unit${item.quantity === 1 ? "" : "s"} in cart</span></div><div><strong>$${(item.price * item.quantity).toFixed(2)}</strong><button class="ghost-button compact-button remove-cart-button" type="button">Remove</button></div>`;
      row.querySelector(".remove-cart-button").addEventListener("click", () => {
        cartItems = cartItems.filter((entry) => entry.id !== item.id);
        renderApp();
      });
      shoppingListTab.appendChild(row);
    });
  }

  const maxTrend = Math.max(...spendingTrend.map((item) => item.value));
  spendingChart.innerHTML = "";
  spendingTrend.forEach((entry) => {
    const group = document.createElement("div");
    group.className = "bar-group";
    group.innerHTML = `<span class="bar-value">$${entry.value}</span><div class="bar" style="height:${(entry.value / maxTrend) * 180}px"></div><span class="bar-label">${entry.month}</span>`;
    spendingChart.appendChild(group);
  });

  purchaseHistory.innerHTML = "";
  pantry.slice().sort((a, b) => b.price - a.price).forEach((item) => {
    const row = document.createElement("article");
    row.className = "history-row";
    row.innerHTML = `<div><strong>${item.name}</strong><span>${item.category} • ${item.quantity} ${item.unit}</span></div><strong>$${item.price.toFixed(2)}</strong>`;
    purchaseHistory.appendChild(row);
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartMessage.textContent = `${cartCount} items in your cart • $${spend.toFixed(2)}`;
}

function renderExpiryList() {
  const urgent = pantry.filter((item) => item.daysLeft <= 3).sort((a, b) => a.daysLeft - b.daysLeft);
  expiryList.innerHTML = "";

  if (!urgent.length) {
    expiryList.innerHTML = `<article class="inventory-card"><div class="inventory-copy"><h3>No urgent items</h3><p class="inventory-meta">Nothing is expiring in the next 3 days.</p></div></article>`;
    return;
  }

  urgent.forEach((item) => {
    const card = document.createElement("article");
    card.className = "inventory-card";
    const status = getStatus(item.daysLeft);
    card.innerHTML = `<div class="inventory-copy"><div class="inventory-main"><h3>${item.name}</h3><span class="inventory-category">${item.category}</span></div><p class="inventory-meta">${item.quantity} ${item.unit} • ${item.daysLeft} days left • $${item.price.toFixed(2)}</p></div><div class="inventory-actions"><span class="inventory-badge ${status.className}">${status.label}</span></div>`;
    expiryList.appendChild(card);
  });
}

function renderNutritionSummary() {
  const totals = getNutritionTotals();
  renderMetricCards(nutritionSummaryGrid, [
    { label: "Total Calories", value: totals.calories, note: "Consumed today." },
    { label: "Protein", value: `${totals.protein}g`, note: "Daily protein intake." },
    { label: "Carbs", value: `${totals.carbs}g`, note: "Daily carb intake." },
    { label: "Fiber", value: `${totals.fiber}g`, note: "Daily fiber intake." },
  ]);
}

function renderNutritionInsights() {
  const totals = getNutritionTotals();
  const insights = [
    totals.protein < 50 ? "You're low on protein. Try adding eggs, yogurt, beans, or tofu." : "Protein intake is on a solid track for the day.",
    totals.fiber < 28 ? "You're low on fiber. Add more fruits, vegetables, and whole grains." : "Fiber intake looks balanced today.",
  ];

  nutritionInsights.innerHTML = "";
  insights.forEach((text) => {
    const row = document.createElement("article");
    row.className = "insight-row";
    row.innerHTML = `<strong>${text}</strong>`;
    nutritionInsights.appendChild(row);
  });
}

function renderNutritionCharts() {
  const totals = getNutritionTotals();
  const macroConfig = [
    { key: "protein", label: "Protein", goal: 50, className: "protein" },
    { key: "carbs", label: "Carbs", goal: 275, className: "carbs" },
    { key: "fat", label: "Fat", goal: 65, className: "fat" },
  ];

  macroBars.innerHTML = "";
  macroConfig.forEach((macro) => {
    const percent = Math.min((totals[macro.key] / macro.goal) * 100, 100);
    const row = document.createElement("div");
    row.className = "macro-row";
    row.innerHTML = `<div class="macro-head"><span>${macro.label}</span><span>${totals[macro.key]}g / ${macro.goal}g</span></div><div class="macro-track"><div class="macro-fill ${macro.className}" style="width:${percent}%"></div></div>`;
    macroBars.appendChild(row);
  });

  nutritionComparison.innerHTML = "";
  [
    { label: "Protein", current: totals.protein, target: 50 },
    { label: "Carbs", current: totals.carbs, target: 275 },
    { label: "Fat", current: totals.fat, target: 65 },
    { label: "Fiber", current: totals.fiber, target: 28 },
  ].forEach((item) => {
    const row = document.createElement("div");
    row.className = "comparison-row";
    row.innerHTML = `<div class="comparison-head"><span>${item.label}</span><span>${item.current}g vs ${item.target}g</span></div><div class="comparison-stack"><div class="comparison-track"><div class="comparison-current" style="width:${Math.min((item.current / item.target) * 100, 100)}%"></div></div><div class="comparison-track"><div class="comparison-target" style="width:100%"></div></div></div>`;
    nutritionComparison.appendChild(row);
  });
}

function renderNutrientProgress() {
  const totals = getNutritionTotals();
  const progressItems = [
    { label: "Protein", current: totals.protein, target: 50, className: "" },
    { label: "Carbs", current: totals.carbs, target: 275, className: "orange" },
    { label: "Fat", current: totals.fat, target: 65, className: "yellow" },
    { label: "Fiber", current: totals.fiber, target: 28, className: "green" },
    { label: "Calories", current: totals.calories, target: calorieTarget, className: "red" },
  ];

  nutrientProgressList.innerHTML = "";
  progressItems.forEach((item) => {
    const percent = Math.min((item.current / item.target) * 100, 100);
    const row = document.createElement("div");
    row.className = "progress-row";
    row.innerHTML = `<div class="progress-head"><span>${item.label}: ${item.current}${item.label === "Calories" ? "" : "g"} / ${item.target}${item.label === "Calories" ? "" : "g"}</span><span>${Math.round(percent)}%</span></div><div class="progress-bar-track"><div class="progress-bar-fill ${item.className}" style="width:${percent}%"></div></div>`;
    nutrientProgressList.appendChild(row);
  });
}

function renderNutrition() {
  const totals = getNutritionTotals();
  const filteredPantry = pantry
    .slice()
    .filter((item) => !nutritionQuery || normalize(item.name).includes(nutritionQuery))
    .sort((a, b) => a.name.localeCompare(b.name));

  renderNutritionSummary();
  renderNutritionInsights();
  renderNutritionCharts();
  renderNutrientProgress();

  calorieConsumed.textContent = `${totals.calories}`;
  calorieRemaining.textContent = `${Math.max(calorieTarget - totals.calories, 0)}`;
  calorieProgress.style.width = `${Math.min((totals.calories / calorieTarget) * 100, 100)}%`;
  calorieNote.textContent = `${Math.round(Math.min((totals.calories / calorieTarget) * 100, 100))}% of your ${calorieTarget.toLocaleString()} calorie target used.`;
  calorieTargetInput.value = calorieTarget;

  calorieItemSelect.innerHTML = "";
  filteredPantry.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} • ${item.nutrition.calories} cal per serving`;
    calorieItemSelect.appendChild(option);
  });

  calorieLog.innerHTML = "";
  calorieEntries.slice().reverse().forEach((entry) => {
    const row = document.createElement("article");
    row.className = "calorie-entry";
    row.innerHTML = `<div><strong>${entry.itemName}</strong><span>${entry.servings} serving${entry.servings === 1 ? "" : "s"}</span></div><strong>${entry.calories} cal</strong>`;
    calorieLog.appendChild(row);
  });
}

function renderSnapshot() {
  const urgent = pantry.filter((item) => item.daysLeft <= 3);
  wasteRiskCount.textContent = urgent.length;
  expiringMessage.textContent = `You have ${urgent.length} item${urgent.length === 1 ? "" : "s"} expiring within 3 days`;
  snapshotStrip.innerHTML = "";
  if (!urgent.length) {
    snapshotStrip.innerHTML = `<div class="snapshot-chip">No urgent items right now</div>`;
    return;
  }
  urgent.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "snapshot-chip";
    chip.textContent = `${item.name} • ${item.daysLeft}d`;
    snapshotStrip.appendChild(chip);
  });
}

function renderApp() {
  renderInventoryMetrics();
  renderInventory();
  renderRecipes();
  renderRecipeChecker();
  renderBudgetMetrics();
  renderBudget();
  renderSnapshot();
  renderExpiryList();
  renderNutrition();
  saveState();
}

function logConsumedServing(item, servings = 1) {
  calorieEntries.push({
    id: Date.now(),
    itemName: item.name,
    servings,
    calories: item.nutrition.calories * servings,
    protein: item.nutrition.protein * servings,
    carbs: item.nutrition.carbs * servings,
    fat: item.nutrition.fat * servings,
    fiber: item.nutrition.fiber * servings,
  });
}

function consumePantryItem(itemId) {
  const item = pantry.find((entry) => entry.id === itemId);
  if (!item) return;
  logConsumedServing(item, 1);
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    pantry = pantry.filter((entry) => entry.id !== itemId);
  }
  renderApp();
}

function editPantryItem(itemId) {
  const item = pantry.find((entry) => entry.id === itemId);
  if (!item) return;

  const nextQuantity = window.prompt("Update quantity", String(item.quantity));
  if (nextQuantity === null) return;
  const nextDaysLeft = window.prompt("Update days left", String(item.daysLeft));
  if (nextDaysLeft === null) return;
  const nextPrice = window.prompt("Update price", String(item.price));
  if (nextPrice === null) return;

  item.quantity = Math.max(1, Number(nextQuantity) || item.quantity);
  item.daysLeft = Math.max(0, Number(nextDaysLeft) || item.daysLeft);
  item.price = Math.max(0, Number(nextPrice) || item.price);
  renderApp();
}

pantryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("itemName").value;
  const item = {
    id: Date.now(),
    name,
    quantity: Number(document.getElementById("itemQuantity").value),
    unit: document.getElementById("itemUnit").value,
    category: document.getElementById("itemCategory").value,
    daysLeft: Number(document.getElementById("itemDaysLeft").value),
    price: Number(document.getElementById("itemPrice").value),
    nutrition: buildNutrition(name),
  };
  pantry = [item, ...pantry];
  pantryForm.reset();
  document.getElementById("itemQuantity").value = 1;
  document.getElementById("itemDaysLeft").value = 5;
  document.getElementById("itemPrice").value = "3.50";
  renderApp();
});

recipeFilterTab.addEventListener("change", renderRecipes);
inventorySearch.addEventListener("input", (event) => {
  searchQuery = normalize(event.target.value);
  renderInventory();
});
recipeSearch.addEventListener("input", (event) => {
  recipeQuery = normalize(event.target.value);
  renderRecipes();
});
nutritionSearch.addEventListener("input", (event) => {
  nutritionQuery = normalize(event.target.value);
  renderNutrition();
});

calorieTargetInput.addEventListener("change", (event) => {
  calorieTarget = Math.max(1200, Number(event.target.value) || calorieTarget);
  renderNutrition();
  saveState();
});

focusModeButton.addEventListener("click", () => {
  focusedMode = !focusedMode;
  focusModeButton.textContent = focusedMode ? "Show all" : "Focus mode";
  renderRecipes();
});

restockButton.addEventListener("click", () => {
  const existing = new Set(pantry.map((item) => normalize(item.name)));
  stapleItems.forEach((item) => {
    if (!existing.has(normalize(item.name))) {
      pantry.push({
        ...item,
        id: Date.now() + Math.random(),
        nutrition: buildNutrition(item.name),
      });
    }
  });
  renderApp();
});

jumpToFormButton.addEventListener("click", () => {
  pantryForm.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("itemName").focus();
});

viewExpiringButton.addEventListener("click", () => setActiveTab("expiry"));
viewCartButton.addEventListener("click", () => setActiveTab("budget"));
openRecipesButton.addEventListener("click", () => setActiveTab("recipes"));
openBudgetButton.addEventListener("click", () => setActiveTab("budget"));
openNutritionButton.addEventListener("click", () => setActiveTab("nutrition"));

addIngredientButton.addEventListener("click", () => {
  const ingredient = customIngredientInput.value.trim();
  if (!ingredient) return;
  customIngredients.push(ingredient);
  customIngredientInput.value = "";
  renderRecipeChecker();
});

resetRecipeButton.addEventListener("click", () => {
  customIngredients = [];
  customRecipeName.value = "";
  customIngredientInput.value = "";
  recipeMatchSummary.textContent = "No custom recipe checked yet.";
  renderRecipeChecker();
});

recipeCheckerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const pantryNames = getPantryNames();
  const matched = customIngredients.filter((item) => pantryNames.has(normalize(item)));
  const missing = customIngredients.filter((item) => !pantryNames.has(normalize(item)));
  const recipeName = customRecipeName.value.trim() || "Custom recipe";
  recipeMatchSummary.innerHTML = `<strong>${recipeName}</strong><br>${matched.length} ingredient(s) ready, ${missing.length} ingredient(s) missing.${missing.length ? ` Missing: ${missing.join(", ")}.` : " Everything is available in your pantry."}`;
});

calorieForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedItem = pantry.find((item) => String(item.id) === calorieItemSelect.value);
  if (!selectedItem) return;
  const servings = Number(calorieServings.value);
  calorieEntries.push({
    id: Date.now(),
    itemName: selectedItem.name,
    servings,
    calories: selectedItem.nutrition.calories * servings,
    protein: selectedItem.nutrition.protein * servings,
    carbs: selectedItem.nutrition.carbs * servings,
    fat: selectedItem.nutrition.fat * servings,
    fiber: selectedItem.nutrition.fiber * servings,
  });
  calorieServings.value = 1;
  renderApp();
});

function setActiveTab(tabName) {
  activeTab = tabName;
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName));
  workspacePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
}

navItems.forEach((item) => item.addEventListener("click", () => setActiveTab(item.dataset.tab)));

recipeMatchSummary.textContent = "No custom recipe checked yet.";
renderApp();
