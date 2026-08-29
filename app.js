const recipes = [
  {
    name: "Spinach Shakshuka",
    ingredients: ["Spinach", "Tomatoes", "Eggs", "Onions"],
    minutes: 25,
    cost: 8,
    description: "A one-pan breakfast-for-dinner option that clears out produce fast.",
  },
  {
    name: "Mediterranean Chickpea Bowl",
    ingredients: ["Chickpeas", "Tomatoes", "Brown Rice", "Greek Yogurt"],
    minutes: 20,
    cost: 7,
    description: "Protein-heavy bowl using pantry staples with a yogurt dressing.",
  },
  {
    name: "Creamy Tomato Rice",
    ingredients: ["Tomatoes", "Brown Rice", "Greek Yogurt", "Garlic"],
    minutes: 30,
    cost: 6,
    description: "Low-cost comfort meal for nights when the pantry is running thin.",
  },
  {
    name: "Pantry Frittata",
    ingredients: ["Eggs", "Spinach", "Onions", "Greek Yogurt"],
    minutes: 18,
    cost: 5,
    description: "Fast, budget-friendly, and useful for ingredients nearing expiration.",
  },
  {
    name: "Chicken Pepper Pasta",
    ingredients: ["Chicken Breast", "Bell Peppers", "Pasta", "Garlic"],
    minutes: 32,
    cost: 11,
    description: "A quick weeknight pasta that uses protein and fresh produce already in the kitchen.",
  },
  {
    name: "Banana Oat Breakfast Bowl",
    ingredients: ["Bananas", "Oats", "Milk", "Greek Yogurt"],
    minutes: 10,
    cost: 4,
    description: "Simple breakfast bowl with pantry oats and fruit that is ready in minutes.",
  },
  {
    name: "Cheddar Apple Toast",
    ingredients: ["Bread", "Cheddar Cheese", "Apples"],
    minutes: 8,
    cost: 5,
    description: "Fast snack or light lunch with sweet and savory balance.",
  },
  {
    name: "Chickpea Stuffed Peppers",
    ingredients: ["Chickpeas", "Bell Peppers", "Brown Rice", "Tomatoes"],
    minutes: 28,
    cost: 7,
    description: "A filling, low-cost dinner that turns pantry staples into a proper meal.",
  },
];

const stapleItems = [
  { name: "Onions", quantity: 3, unit: "pcs", category: "Produce", daysLeft: 8, price: 2.4 },
  { name: "Garlic", quantity: 1, unit: "pcs", category: "Produce", daysLeft: 15, price: 1.1 },
  { name: "Olive Oil", quantity: 1, unit: "oz", category: "Pantry", daysLeft: 90, price: 8.0 },
  { name: "Lemons", quantity: 2, unit: "pcs", category: "Produce", daysLeft: 7, price: 1.9 },
  { name: "Black Beans", quantity: 2, unit: "cups", category: "Pantry", daysLeft: 120, price: 2.6 },
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
  "olive oil": 8,
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

const DEFAULT_NUTRITION = { calories: 120, protein: 4, carbs: 12, fat: 3, fiber: 1 };
const inventoryUnits = ["pcs", "cups", "bunches", "lbs", "oz"];
const inventoryCategories = ["Produce", "Dairy", "Protein", "Grains", "Pantry"];

let pantry = [];
let cartItems = [];
let calorieEntries = [];
let calorieTarget = 2000;
let customIngredients = [];
let activeTab = "inventory";
let focusedMode = false;
let customRecipeNameValue = "";
let searchQuery = "";
let recipeQuery = "";
let nutritionQuery = "";
let editingPantryItemId = null;
let currentUser = null;
let authTab = "login";
let saveTimeouts = {};
let appBootstrapped = false;

const metricsGrid = document.getElementById("metricsGrid");
const inventoryList = document.getElementById("inventoryList");
const wasteRiskCount = document.getElementById("wasteRiskCount");
const snapshotStrip = document.getElementById("snapshotStrip");
const pantryForm = document.getElementById("pantryForm");
const pantryFormStatus = document.getElementById("pantryFormStatus");
const savePantryButton = document.getElementById("savePantryButton");
const cancelEditButton = document.getElementById("cancelEditButton");
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
const clearCartButton = document.getElementById("clearCartButton");
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
const clearNutritionLogButton = document.getElementById("clearNutritionLogButton");
const openRecipesButton = document.getElementById("openRecipesButton");
const openBudgetButton = document.getElementById("openBudgetButton");
const openNutritionButton = document.getElementById("openNutritionButton");
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const workspacePanels = Array.from(document.querySelectorAll(".workspace-panel"));
const itemNameInput = document.getElementById("itemName");
const itemQuantityInput = document.getElementById("itemQuantity");
const itemUnitInput = document.getElementById("itemUnit");
const itemCategoryInput = document.getElementById("itemCategory");
const itemDaysLeftInput = document.getElementById("itemDaysLeft");
const itemPriceInput = document.getElementById("itemPrice");
const inventorySectionCopy = document.getElementById("inventorySectionCopy");
const loadingOverlay = document.getElementById("loadingOverlay");
const authOverlay = document.getElementById("authOverlay");
const authMessage = document.getElementById("authMessage");
const saveStatus = document.getElementById("saveStatus");
const authSubtitle = document.getElementById("authSubtitle");
const authTabButtons = Array.from(document.querySelectorAll("[data-auth-tab]"));
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const openAuthButton = document.getElementById("openAuthButton");
const signOutButton = document.getElementById("signOutButton");
const sessionLabel = document.getElementById("sessionLabel");
const sessionUser = document.getElementById("sessionUser");
const profileButton = document.getElementById("profileButton");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

function buildId() {
  return Date.now() + Math.random();
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function buildNutrition(name) {
  return calorieDefaults[normalize(name)] ?? DEFAULT_NUTRITION;
}

function buildPantryItem(item) {
  return {
    id: item.id ?? buildId(),
    name: String(item.name ?? "").trim(),
    quantity: Math.max(1, Number(item.quantity) || 1),
    unit: inventoryUnits.includes(item.unit) ? item.unit : "pcs",
    category: inventoryCategories.includes(item.category) ? item.category : "Pantry",
    daysLeft: Math.max(0, Number(item.daysLeft) || 0),
    price: Math.max(0, Number(item.price) || 0),
    nutrition: item.nutrition ?? buildNutrition(item.name),
  };
}

function buildCartItem(name, quantity = 1, price) {
  return {
    id: buildId(),
    name: String(name).trim(),
    quantity: Math.max(1, Number(quantity) || 1),
    price: Math.max(0, Number(price ?? marketPrices[normalize(name)] ?? 2.25) || 0),
  };
}

function sanitizeCalorieEntry(entry) {
  return {
    id: entry.id ?? buildId(),
    itemName: String(entry.itemName ?? "Meal").trim(),
    servings: Math.max(1, Number(entry.servings) || 1),
    calories: Math.max(0, Number(entry.calories) || 0),
    protein: Math.max(0, Number(entry.protein) || 0),
    carbs: Math.max(0, Number(entry.carbs) || 0),
    fat: Math.max(0, Number(entry.fat) || 0),
    fiber: Math.max(0, Number(entry.fiber) || 0),
  };
}

function applyServerResources(resources) {
  pantry = Array.isArray(resources?.pantry) ? resources.pantry.map(buildPantryItem) : [];
  cartItems = Array.isArray(resources?.cart?.cartItems) ? resources.cart.cartItems.map((item) => buildCartItem(item.name, item.quantity, item.price)) : [];
  calorieEntries = Array.isArray(resources?.nutrition?.calorieEntries) ? resources.nutrition.calorieEntries.map(sanitizeCalorieEntry) : [];
  calorieTarget = Math.max(1200, Number(resources?.nutrition?.calorieTarget) || 2000);
  customIngredients = Array.isArray(resources?.profile?.customIngredients) ? resources.profile.customIngredients.map((item) => String(item).trim()).filter(Boolean) : [];
  activeTab = ["inventory", "expiry", "recipes", "budget", "nutrition"].includes(resources?.profile?.activeTab) ? resources.profile.activeTab : "inventory";
  focusedMode = Boolean(resources?.profile?.focusedMode);
  customRecipeNameValue = String(resources?.profile?.customRecipeNameValue ?? "");
}

function buildPantryPayload() {
  return { pantry };
}

function buildCartPayload() {
  return { cartItems };
}

function buildNutritionPayload() {
  return {
    calorieEntries,
    calorieTarget,
  };
}

function buildProfilePayload() {
  return {
    customIngredients,
    activeTab,
    focusedMode,
    customRecipeNameValue: customRecipeName.value.trim(),
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "same-origin",
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload;
}

function setSaveStatus(message, tone = "") {
  saveStatus.textContent = message;
  saveStatus.classList.remove("saving", "saved", "error");
  if (tone) {
    saveStatus.classList.add(tone);
  }
}

function setLoading(isLoading) {
  loadingOverlay.classList.toggle("hidden", !isLoading);
}

function setAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle("error", isError);
}

function setAuthTab(tab) {
  authTab = tab;
  authTabButtons.forEach((button) => button.classList.toggle("active", button.dataset.authTab === tab));
  loginForm.classList.toggle("active", tab === "login");
  registerForm.classList.toggle("active", tab === "register");
  authSubtitle.textContent =
    tab === "login"
      ? "Use your account to keep pantry, budget, and nutrition data synced."
      : "Create an account so your pantry and nutrition progress stay attached to you.";
}

function openAuthOverlay(tab = authTab) {
  setAuthTab(tab);
  authOverlay.classList.remove("hidden");
}

function closeAuthOverlay() {
  if (!currentUser) return;
  authOverlay.classList.add("hidden");
}

function getInitials(name) {
  const parts = String(name || "Guest")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase() || "G";
}

function updateSessionUi() {
  const isSignedIn = Boolean(currentUser);
  sessionLabel.textContent = isSignedIn ? "Signed in" : "Guest mode";
  sessionUser.textContent = isSignedIn ? currentUser.name : "Sign in required";
  openAuthButton.hidden = isSignedIn;
  signOutButton.hidden = !isSignedIn;
  profileButton.textContent = getInitials(currentUser?.name);
}

async function loadSession() {
  setLoading(true);
  try {
    const payload = await apiRequest("/api/auth/session", { method: "GET" });
    currentUser = payload.user;
    if (currentUser) {
      const [pantryPayload, cartPayload, nutritionPayload, profilePayload] = await Promise.all([
        apiRequest("/api/pantry", { method: "GET" }),
        apiRequest("/api/cart", { method: "GET" }),
        apiRequest("/api/nutrition", { method: "GET" }),
        apiRequest("/api/profile", { method: "GET" }),
      ]);
      applyServerResources({
        pantry: pantryPayload.pantry,
        cart: cartPayload,
        nutrition: nutritionPayload,
        profile: profilePayload,
      });
    }
    if (currentUser) {
      closeAuthOverlay();
    } else {
      openAuthOverlay("login");
    }
    updateSessionUi();
    if (!appBootstrapped) {
      resetPantryForm();
      focusModeButton.textContent = focusedMode ? "Show all" : "Focus mode";
      renderApp();
      appBootstrapped = true;
    } else {
      renderApp();
    }
  } finally {
    setLoading(false);
  }
}

async function persistResource(resourceKey) {
  if (!currentUser) return;
  const resourceMap = {
    pantry: { path: "/api/pantry", payload: buildPantryPayload() },
    cart: { path: "/api/cart", payload: buildCartPayload() },
    nutrition: { path: "/api/nutrition", payload: buildNutritionPayload() },
    profile: { path: "/api/profile", payload: buildProfilePayload() },
  };
  const resource = resourceMap[resourceKey];
  if (!resource) return;
  await apiRequest(resource.path, {
    method: "PUT",
    body: JSON.stringify(resource.payload),
  });
}

function scheduleResourceSave(resourceKey) {
  if (!currentUser) return;
  window.clearTimeout(saveTimeouts[resourceKey]);
  setSaveStatus("Saving changes...", "saving");
  saveTimeouts[resourceKey] = window.setTimeout(async () => {
    try {
      await persistResource(resourceKey);
      setSaveStatus("All changes saved", "saved");
    } catch (error) {
      setSaveStatus(error.message, "error");
      setAuthMessage(error.message, true);
    }
  }, 250);
}

function getStatus(daysLeft) {
  if (daysLeft <= 2) return { label: "Use now", className: "urgent" };
  if (daysLeft <= 5) return { label: "Plan soon", className: "soon" };
  return { label: "Stable", className: "safe" };
}

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
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
    { label: "Value", value: formatCurrency(pantry.reduce((sum, item) => sum + item.price, 0)), note: "Simple estimate based on tracked purchase cost." },
    { label: "Categories", value: new Set(pantry.map((item) => item.category)).size, note: recipeScores.length ? `${Math.max(...recipeScores)}% best recipe match available.` : "No recipe coverage yet." },
  ]);
}

function updatePantryFormUi() {
  const editingItem = pantry.find((item) => item.id === editingPantryItemId);
  const isEditing = Boolean(editingItem);
  savePantryButton.textContent = isEditing ? "Update item" : "Save item";
  cancelEditButton.hidden = !isEditing;
  pantryFormStatus.textContent = isEditing
    ? `Editing ${editingItem.name}. Save changes to update your pantry and nutrition suggestions.`
    : "Add a new item to your pantry inventory.";
}

function resetPantryForm() {
  editingPantryItemId = null;
  pantryForm.reset();
  itemQuantityInput.value = 1;
  itemUnitInput.value = "pcs";
  itemCategoryInput.value = "Produce";
  itemDaysLeftInput.value = 5;
  itemPriceInput.value = "3.50";
  updatePantryFormUi();
}

function populatePantryForm(item) {
  editingPantryItemId = item.id;
  itemNameInput.value = item.name;
  itemQuantityInput.value = item.quantity;
  itemUnitInput.value = item.unit;
  itemCategoryInput.value = item.category;
  itemDaysLeftInput.value = item.daysLeft;
  itemPriceInput.value = item.price.toFixed(2);
  updatePantryFormUi();
}

function findMatchingPantryItem(candidate, excludeId = null) {
  return pantry.find(
    (item) =>
      item.id !== excludeId &&
      normalize(item.name) === normalize(candidate.name) &&
      item.unit === candidate.unit &&
      item.category === candidate.category
  );
}

function addOrMergePantryItem(item, options = {}) {
  const { excludeId = null } = options;
  const normalizedItem = buildPantryItem(item);
  const match = findMatchingPantryItem(normalizedItem, excludeId);
  if (!match) {
    pantry = [normalizedItem, ...pantry.filter((entry) => entry.id !== excludeId)];
    return normalizedItem;
  }
  match.quantity += normalizedItem.quantity;
  match.daysLeft = Math.min(match.daysLeft, normalizedItem.daysLeft);
  match.price = normalizedItem.price;
  match.nutrition = normalizedItem.nutrition;
  if (excludeId !== null) {
    pantry = pantry.filter((entry) => entry.id !== excludeId);
  }
  return match;
}

function removePantryItem(itemId) {
  pantry = pantry.filter((entry) => entry.id !== itemId);
  if (editingPantryItemId === itemId) {
    resetPantryForm();
  }
  renderApp();
  scheduleResourceSave("pantry");
}

function startEditingPantryItem(itemId) {
  const item = pantry.find((entry) => entry.id === itemId);
  if (!item) return;
  populatePantryForm(item);
  pantryForm.scrollIntoView({ behavior: "smooth", block: "start" });
  itemNameInput.focus();
}

function renderInventory() {
  inventoryList.innerHTML = "";
  const template = document.getElementById("inventoryTemplate");
  const filteredItems = pantry
    .slice()
    .sort((a, b) => a.daysLeft - b.daysLeft || a.name.localeCompare(b.name))
    .filter((item) => !searchQuery || [item.name, item.category, item.unit].some((value) => normalize(value).includes(searchQuery)));

  inventorySectionCopy.textContent = searchQuery
    ? `${filteredItems.length} matching item${filteredItems.length === 1 ? "" : "s"} from ${pantry.length} tracked total.`
    : `${pantry.length} item${pantry.length === 1 ? "" : "s"} currently in your pantry.`;

  if (!filteredItems.length) {
    inventoryList.innerHTML = `<article class="inventory-card"><div class="inventory-copy"><h3>No matching items</h3><p class="inventory-meta">Try a different search or add a new pantry item.</p></div></article>`;
    return;
  }

  filteredItems.forEach((item) => {
    const status = getStatus(item.daysLeft);
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".inventory-name").textContent = item.name;
    node.querySelector(".inventory-category").textContent = item.category;
    node.querySelector(".inventory-meta").textContent = `${item.quantity} ${item.unit} • ${item.daysLeft} days left • ${formatCurrency(item.price)}`;
    const badge = node.querySelector(".inventory-badge");
    badge.textContent = status.label;
    badge.classList.add(status.className);
    node.querySelector(".consume-button").addEventListener("click", () => consumePantryItem(item.id));
    node.querySelector(".add-cart-button").addEventListener("click", () => {
      addCartItem(item.name);
      renderApp();
      scheduleResourceSave("cart");
    });
    node.querySelector(".edit-button").addEventListener("click", () => startEditingPantryItem(item.id));
    node.querySelector(".remove-button").addEventListener("click", () => removePantryItem(item.id));
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
  if (!filtered.length) {
    recipeGridTab.innerHTML = `<article class="recipe-card"><h3>No recipes found</h3><p class="recipe-description">Try a different filter or search term.</p></article>`;
    return;
  }

  filtered.forEach((recipe) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".recipe-tag").textContent = recipe.expiringMatches.length ? "Waste saver" : "Pantry match";
    node.querySelector(".recipe-score").textContent = `${recipe.score}% match`;
    node.querySelector(".recipe-name").textContent = recipe.name;
    node.querySelector(".recipe-description").textContent = recipe.description;
    node.querySelector(".recipe-meta").innerHTML = `<span>${recipe.minutes} min</span><span>${formatCurrency(recipe.cost)} estimated</span><span>${recipe.matched.length}/${recipe.ingredients.length} ingredients ready</span>`;
    const ingredients = node.querySelector(".recipe-ingredients");
    recipe.ingredients.forEach((ingredient) => {
      const pill = document.createElement("span");
      pill.className = "recipe-ingredient";
      pill.textContent = recipe.matched.includes(ingredient) ? `${ingredient} ready` : `${ingredient} buy`;
      ingredients.appendChild(pill);
    });
    const addButton = document.createElement("button");
    addButton.className = "ghost-button";
    addButton.type = "button";
    addButton.textContent = recipe.missing.length ? `Add ${recipe.missing.length} to cart` : "Pantry complete";
    addButton.disabled = recipe.missing.length === 0;
    addButton.addEventListener("click", () => {
      recipe.missing.forEach((item) => addCartItem(item));
      renderApp();
      scheduleResourceSave("cart");
    });
    node.querySelector(".recipe-actions").appendChild(addButton);
    recipeGridTab.appendChild(node);
  });
}

function renderRecipeChecker() {
  customIngredientList.innerHTML = "";
  customRecipeName.value = customRecipeNameValue;
  customIngredients.forEach((ingredient, index) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "ingredient-pill";
    pill.textContent = ingredient;
    pill.addEventListener("click", () => {
      customIngredients.splice(index, 1);
      renderRecipeChecker();
      scheduleResourceSave("profile");
    });
    customIngredientList.appendChild(pill);
  });
}

function renderBudgetMetrics() {
  const avg = pantry.length ? pantry.reduce((sum, item) => sum + item.price, 0) / pantry.length : 0;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  renderMetricCards(budgetMetricsGrid, [
    { label: "Cart Total", value: formatCurrency(cartTotal), note: "Estimated checkout for current shopping cart." },
    { label: "Items in Cart", value: cartCount, note: "Quantities included across cart items." },
    { label: "Avg. Item Cost", value: formatCurrency(avg), note: "Average cost per pantry item." },
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

function updateCartQuantity(itemId, delta) {
  const item = cartItems.find((entry) => entry.id === itemId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  renderApp();
  scheduleResourceSave("cart");
}

function buildPantryItemFromCart(item) {
  const pantryMatch = pantry.find((entry) => normalize(entry.name) === normalize(item.name));
  const stapleMatch = stapleItems.find((entry) => normalize(entry.name) === normalize(item.name));
  const reference = pantryMatch ?? stapleMatch;
  return buildPantryItem({
    name: item.name,
    quantity: item.quantity,
    unit: reference?.unit ?? "pcs",
    category: reference?.category ?? "Pantry",
    daysLeft: reference?.daysLeft ?? 7,
    price: item.price,
    nutrition: buildNutrition(item.name),
  });
}

function moveCartItemToPantry(itemId) {
  const item = cartItems.find((entry) => entry.id === itemId);
  if (!item) return;
  addOrMergePantryItem(buildPantryItemFromCart(item));
  cartItems = cartItems.filter((entry) => entry.id !== itemId);
  renderApp();
  scheduleResourceSave("cart");
  scheduleResourceSave("pantry");
}

function renderBudget() {
  const recipeInsights = getRecipeInsights();
  const selectedPlan = recipeInsights.slice().sort((a, b) => b.score - a.score || a.cost - b.cost)[0];
  const spend = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wasteSaved = pantry.filter((item) => item.daysLeft <= 3).length * 1.8;

  budgetCardTab.innerHTML = `
    <p>Cart and plan summary</p>
    <h3>${formatCurrency(spend)}</h3>
    <p>Current recommended meal plan: <strong>${selectedPlan ? selectedPlan.name : "a recipe plan"}</strong>. Estimated food saved this week: <strong>${formatCurrency(wasteSaved)}</strong>.</p>
  `;

  shoppingListTab.innerHTML = "";
  clearCartButton.disabled = cartItems.length === 0;
  if (!cartItems.length) {
    shoppingListTab.innerHTML = `<article class="shopping-item"><div><strong>Your cart is empty</strong><span>Add missing ingredients from recipe cards or planning flows.</span></div><span>${formatCurrency(0)}</span></article>`;
  } else {
    cartItems
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        const row = document.createElement("article");
        row.className = "shopping-item";
        row.innerHTML = `
          <div>
            <strong>${item.name}</strong>
            <span>${formatCurrency(item.price)} each</span>
          </div>
          <div class="shopping-actions">
            <div class="quantity-stepper">
              <button class="ghost-button compact-button cart-decrease-button" type="button">-</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="ghost-button compact-button cart-increase-button" type="button">+</button>
            </div>
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
            <button class="ghost-button compact-button add-pantry-button" type="button">Bought</button>
            <button class="ghost-button compact-button remove-cart-button" type="button">Remove</button>
          </div>
        `;
        row.querySelector(".cart-decrease-button").addEventListener("click", () => updateCartQuantity(item.id, -1));
        row.querySelector(".cart-increase-button").addEventListener("click", () => updateCartQuantity(item.id, 1));
        row.querySelector(".add-pantry-button").addEventListener("click", () => moveCartItemToPantry(item.id));
        row.querySelector(".remove-cart-button").addEventListener("click", () => {
          cartItems = cartItems.filter((entry) => entry.id !== item.id);
          renderApp();
          scheduleResourceSave("cart");
        });
        shoppingListTab.appendChild(row);
      });
  }

  const maxTrend = Math.max(...spendingTrend.map((item) => item.value));
  spendingChart.innerHTML = "";
  spendingTrend.forEach((entry) => {
    const group = document.createElement("div");
    group.className = "bar-group";
    group.innerHTML = `<span class="bar-value">${formatCurrency(entry.value)}</span><div class="bar" style="height:${(entry.value / maxTrend) * 180}px"></div><span class="bar-label">${entry.month}</span>`;
    spendingChart.appendChild(group);
  });

  purchaseHistory.innerHTML = "";
  pantry
    .slice()
    .sort((a, b) => b.price - a.price)
    .forEach((item) => {
      const row = document.createElement("article");
      row.className = "history-row";
      row.innerHTML = `<div><strong>${item.name}</strong><span>${item.category} • ${item.quantity} ${item.unit}</span></div><strong>${formatCurrency(item.price)}</strong>`;
      purchaseHistory.appendChild(row);
    });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartMessage.textContent = `${cartCount} items in your cart • ${formatCurrency(spend)}`;
}

function renderExpiryList() {
  const urgent = pantry.filter((item) => item.daysLeft <= 3).sort((a, b) => a.daysLeft - b.daysLeft);
  expiryList.innerHTML = "";
  if (!urgent.length) {
    expiryList.innerHTML = `<article class="inventory-card"><div class="inventory-copy"><h3>No urgent items</h3><p class="inventory-meta">Nothing is expiring in the next 3 days.</p></div></article>`;
    return;
  }
  urgent.forEach((item) => {
    const status = getStatus(item.daysLeft);
    const card = document.createElement("article");
    card.className = "inventory-card";
    card.innerHTML = `<div class="inventory-copy"><div class="inventory-main"><h3>${item.name}</h3><span class="inventory-category">${item.category}</span></div><p class="inventory-meta">${item.quantity} ${item.unit} • ${item.daysLeft} days left • ${formatCurrency(item.price)}</p></div><div class="inventory-actions"><span class="inventory-badge ${status.className}">${status.label}</span></div>`;
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
    totals.calories > calorieTarget ? "You've passed your calorie goal. Consider lighter meals for the rest of the day." : "You're still within your calorie goal window.",
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

function removeCalorieEntry(entryId) {
  calorieEntries = calorieEntries.filter((entry) => entry.id !== entryId);
  renderApp();
  scheduleResourceSave("nutrition");
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
  calorieItemSelect.disabled = filteredPantry.length === 0;

  calorieLog.innerHTML = "";
  clearNutritionLogButton.disabled = calorieEntries.length === 0;
  if (!calorieEntries.length) {
    calorieLog.innerHTML = `<article class="calorie-entry"><div><strong>No meals logged yet</strong><span>Use pantry items or the quick consume buttons to start your nutrition log.</span></div></article>`;
    return;
  }

  calorieEntries
    .slice()
    .reverse()
    .forEach((entry) => {
      const row = document.createElement("article");
      row.className = "calorie-entry";
      row.innerHTML = `
        <div>
          <strong>${entry.itemName}</strong>
          <span>${entry.servings} serving${entry.servings === 1 ? "" : "s"} • ${entry.protein}g protein • ${entry.fiber}g fiber</span>
        </div>
        <div class="calorie-entry-actions">
          <strong>${entry.calories} cal</strong>
          <button class="ghost-button compact-button remove-calorie-entry-button" type="button">Remove</button>
        </div>
      `;
      row.querySelector(".remove-calorie-entry-button").addEventListener("click", () => removeCalorieEntry(entry.id));
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
  if (!currentUser) return;
  renderInventoryMetrics();
  renderInventory();
  renderRecipes();
  renderRecipeChecker();
  renderBudgetMetrics();
  renderBudget();
  renderSnapshot();
  renderExpiryList();
  renderNutrition();
  updatePantryFormUi();
  setActiveTab(activeTab, false);
}

function logConsumedServing(item, servings = 1) {
  calorieEntries.push(
    sanitizeCalorieEntry({
      id: buildId(),
      itemName: item.name,
      servings,
      calories: item.nutrition.calories * servings,
      protein: item.nutrition.protein * servings,
      carbs: item.nutrition.carbs * servings,
      fat: item.nutrition.fat * servings,
      fiber: item.nutrition.fiber * servings,
    })
  );
}

function consumePantryItem(itemId) {
  const item = pantry.find((entry) => entry.id === itemId);
  if (!item) return;
  logConsumedServing(item, 1);
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    pantry = pantry.filter((entry) => entry.id !== itemId);
    if (editingPantryItemId === itemId) {
      resetPantryForm();
    }
  }
  renderApp();
  scheduleResourceSave("pantry");
  scheduleResourceSave("nutrition");
}

function buildPantryPayloadFromForm() {
  const name = itemNameInput.value.trim();
  return buildPantryItem({
    id: editingPantryItemId ?? buildId(),
    name,
    quantity: Number(itemQuantityInput.value),
    unit: itemUnitInput.value,
    category: itemCategoryInput.value,
    daysLeft: Number(itemDaysLeftInput.value),
    price: Number(itemPriceInput.value),
    nutrition: buildNutrition(name),
  });
}

function setActiveTab(tabName, shouldSave = true) {
  activeTab = tabName;
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName));
  workspacePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
  if (shouldSave) {
    scheduleResourceSave("profile");
  }
}

pantryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const item = buildPantryPayloadFromForm();
  if (editingPantryItemId !== null) {
    pantry = pantry.filter((entry) => entry.id !== editingPantryItemId);
  }
  addOrMergePantryItem(item);
  resetPantryForm();
  renderApp();
  scheduleResourceSave("pantry");
});

recipeFilterTab.addEventListener("change", () => {
  renderRecipes();
});

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
  scheduleResourceSave("nutrition");
});

focusModeButton.addEventListener("click", () => {
  focusedMode = !focusedMode;
  focusModeButton.textContent = focusedMode ? "Show all" : "Focus mode";
  renderRecipes();
  scheduleResourceSave("profile");
});

restockButton.addEventListener("click", () => {
  stapleItems.forEach((item) => addOrMergePantryItem(item));
  renderApp();
  scheduleResourceSave("pantry");
});

jumpToFormButton.addEventListener("click", () => {
  pantryForm.scrollIntoView({ behavior: "smooth", block: "start" });
  itemNameInput.focus();
});

cancelEditButton.addEventListener("click", resetPantryForm);
viewExpiringButton.addEventListener("click", () => setActiveTab("expiry"));
viewCartButton.addEventListener("click", () => setActiveTab("budget"));
openRecipesButton.addEventListener("click", () => setActiveTab("recipes"));
openBudgetButton.addEventListener("click", () => setActiveTab("budget"));
openNutritionButton.addEventListener("click", () => setActiveTab("nutrition"));

addIngredientButton.addEventListener("click", () => {
  const ingredient = customIngredientInput.value.trim();
  if (!ingredient) return;
  if (!customIngredients.some((item) => normalize(item) === normalize(ingredient))) {
    customIngredients.push(ingredient);
  }
  customIngredientInput.value = "";
  renderRecipeChecker();
  scheduleResourceSave("profile");
});

resetRecipeButton.addEventListener("click", () => {
  customIngredients = [];
  customRecipeNameValue = "";
  customRecipeName.value = "";
  customIngredientInput.value = "";
  recipeMatchSummary.textContent = "No custom recipe checked yet.";
  renderRecipeChecker();
  scheduleResourceSave("profile");
});

customRecipeName.addEventListener("input", (event) => {
  customRecipeNameValue = event.target.value;
  scheduleResourceSave("profile");
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
  const servings = Math.max(1, Number(calorieServings.value) || 1);
  logConsumedServing(selectedItem, servings);
  calorieServings.value = 1;
  renderApp();
  scheduleResourceSave("nutrition");
});

clearCartButton.addEventListener("click", () => {
  cartItems = [];
  renderApp();
  scheduleResourceSave("cart");
});

clearNutritionLogButton.addEventListener("click", () => {
  calorieEntries = [];
  renderApp();
  scheduleResourceSave("nutrition");
});

navItems.forEach((item) => item.addEventListener("click", () => setActiveTab(item.dataset.tab)));
authTabButtons.forEach((button) => button.addEventListener("click", () => setAuthTab(button.dataset.authTab)));
openAuthButton.addEventListener("click", () => openAuthOverlay("login"));
profileButton.addEventListener("click", () => {
  if (!currentUser) {
    openAuthOverlay("login");
  }
});

async function loadUserResources() {
  const [pantryPayload, cartPayload, nutritionPayload, profilePayload] = await Promise.all([
    apiRequest("/api/pantry", { method: "GET" }),
    apiRequest("/api/cart", { method: "GET" }),
    apiRequest("/api/nutrition", { method: "GET" }),
    apiRequest("/api/profile", { method: "GET" }),
  ]);

  applyServerResources({
    pantry: pantryPayload.pantry,
    cart: cartPayload,
    nutrition: nutritionPayload,
    profile: profilePayload,
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setAuthMessage("Signing you in...");
  try {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: loginEmail.value.trim(),
        password: loginPassword.value,
      }),
    });
    currentUser = payload.user;
    await loadUserResources();
    updateSessionUi();
    authOverlay.classList.add("hidden");
    loginForm.reset();
    resetPantryForm();
    focusModeButton.textContent = focusedMode ? "Show all" : "Focus mode";
    renderApp();
    setAuthMessage("Signed in successfully.");
  } catch (error) {
    setAuthMessage(error.message, true);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setAuthMessage("Creating your account...");
  try {
    const payload = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: registerName.value.trim(),
        email: registerEmail.value.trim(),
        password: registerPassword.value,
      }),
    });
    currentUser = payload.user;
    await loadUserResources();
    updateSessionUi();
    authOverlay.classList.add("hidden");
    registerForm.reset();
    resetPantryForm();
    focusModeButton.textContent = focusedMode ? "Show all" : "Focus mode";
    renderApp();
    setAuthMessage("Account created and signed in.");
  } catch (error) {
    setAuthMessage(error.message, true);
  }
});

signOutButton.addEventListener("click", async () => {
  await apiRequest("/api/auth/logout", { method: "POST" });
  currentUser = null;
  updateSessionUi();
  openAuthOverlay("login");
});

recipeMatchSummary.textContent = "No custom recipe checked yet.";
setAuthTab("login");
loadSession().catch((error) => {
  setAuthMessage(error.message, true);
  openAuthOverlay("login");
  updateSessionUi();
});
