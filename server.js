const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 8001;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const defaultAppState = {
  pantry: [
    { id: 1, name: "Spinach", quantity: 1, unit: "bunches", category: "Produce", daysLeft: 2, price: 2.5 },
    { id: 2, name: "Tomatoes", quantity: 4, unit: "pcs", category: "Produce", daysLeft: 4, price: 3.2 },
    { id: 3, name: "Greek Yogurt", quantity: 1, unit: "cups", category: "Dairy", daysLeft: 5, price: 4.1 },
    { id: 4, name: "Eggs", quantity: 6, unit: "pcs", category: "Protein", daysLeft: 7, price: 3.9 },
    { id: 5, name: "Brown Rice", quantity: 2, unit: "cups", category: "Grains", daysLeft: 28, price: 2.2 },
    { id: 6, name: "Chickpeas", quantity: 2, unit: "cups", category: "Pantry", daysLeft: 60, price: 1.8 },
  ],
  cartItems: [
    { id: 11, name: "Lemons", quantity: 1, price: 1.9 },
    { id: 12, name: "Black Beans", quantity: 1, price: 2.6 },
  ],
  calorieEntries: [
    { id: 21, itemName: "Greek Yogurt", servings: 1, calories: 130, protein: 17, carbs: 6, fat: 4, fiber: 0 },
    { id: 22, itemName: "Eggs", servings: 2, calories: 144, protein: 12, carbs: 0, fat: 10, fiber: 0 },
  ],
  calorieTarget: 2000,
  customIngredients: [],
  activeTab: "inventory",
  focusedMode: false,
  customRecipeNameValue: "",
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ users: [], sessions: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function parseCookies(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((cookies, chunk) => {
      const index = chunk.indexOf("=");
      const key = index >= 0 ? chunk.slice(0, index) : chunk;
      const value = index >= 0 ? chunk.slice(index + 1) : "";
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedValue) {
  const [salt, hash] = String(storedValue).split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function createSession(store, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const existing = store.sessions.filter((session) => session.userId !== userId);
  existing.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });
  store.sessions = existing;
  return token;
}

function clearSession(store, token) {
  store.sessions = store.sessions.filter((session) => session.token !== token);
}

function getUserFromRequest(req, store) {
  const cookies = parseCookies(req);
  const token = cookies.grocify_session;
  if (!token) return null;
  const session = store.sessions.find((entry) => entry.token === token);
  if (!session) return null;
  return store.users.find((user) => user.id === session.userId) || null;
}

function requireAuth(req, res, store) {
  const user = getUserFromRequest(req, store);
  if (!user) {
    sendJson(res, 401, { error: "Authentication required" });
    return null;
  }
  return user;
}

function failValidation(message, field) {
  const error = new Error(message);
  error.statusCode = 422;
  error.field = field;
  return error;
}

function ensureNonEmptyString(value, field, label) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw failValidation(`${label} is required.`, field);
  }
  return normalized;
}

function ensureNumber(value, field, label, { min = Number.NEGATIVE_INFINITY, integer = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw failValidation(`${label} must be a valid number.`, field);
  }
  if (integer && !Number.isInteger(parsed)) {
    throw failValidation(`${label} must be a whole number.`, field);
  }
  if (parsed < min) {
    throw failValidation(`${label} must be at least ${min}.`, field);
  }
  return parsed;
}

function ensureArray(value, field, label) {
  if (!Array.isArray(value)) {
    throw failValidation(`${label} must be a list.`, field);
  }
  return value;
}

function validatePantryItem(item, index) {
  const fieldPrefix = `pantry[${index}]`;
  return {
    id: item.id ?? Date.now() + Math.random(),
    name: ensureNonEmptyString(item.name, `${fieldPrefix}.name`, "Item name"),
    quantity: ensureNumber(item.quantity, `${fieldPrefix}.quantity`, "Quantity", { min: 1 }),
    unit: ensureNonEmptyString(item.unit, `${fieldPrefix}.unit`, "Unit"),
    category: ensureNonEmptyString(item.category, `${fieldPrefix}.category`, "Category"),
    daysLeft: ensureNumber(item.daysLeft, `${fieldPrefix}.daysLeft`, "Days left", { min: 0, integer: true }),
    price: ensureNumber(item.price, `${fieldPrefix}.price`, "Price", { min: 0 }),
    nutrition: item.nutrition && typeof item.nutrition === "object" ? item.nutrition : defaultAppState.pantry[0].nutrition,
  };
}

function validateCartItem(item, index) {
  const fieldPrefix = `cartItems[${index}]`;
  return {
    id: item.id ?? Date.now() + Math.random(),
    name: ensureNonEmptyString(item.name, `${fieldPrefix}.name`, "Cart item name"),
    quantity: ensureNumber(item.quantity, `${fieldPrefix}.quantity`, "Cart quantity", { min: 1 }),
    price: ensureNumber(item.price, `${fieldPrefix}.price`, "Cart price", { min: 0 }),
  };
}

function validateCalorieEntry(item, index) {
  const fieldPrefix = `calorieEntries[${index}]`;
  return {
    id: item.id ?? Date.now() + Math.random(),
    itemName: ensureNonEmptyString(item.itemName, `${fieldPrefix}.itemName`, "Nutrition item name"),
    servings: ensureNumber(item.servings, `${fieldPrefix}.servings`, "Servings", { min: 1 }),
    calories: ensureNumber(item.calories, `${fieldPrefix}.calories`, "Calories", { min: 0 }),
    protein: ensureNumber(item.protein, `${fieldPrefix}.protein`, "Protein", { min: 0 }),
    carbs: ensureNumber(item.carbs, `${fieldPrefix}.carbs`, "Carbs", { min: 0 }),
    fat: ensureNumber(item.fat, `${fieldPrefix}.fat`, "Fat", { min: 0 }),
    fiber: ensureNumber(item.fiber, `${fieldPrefix}.fiber`, "Fiber", { min: 0 }),
  };
}

function sanitizePantryInput(payload) {
  return ensureArray(payload?.pantry, "pantry", "Pantry").map(validatePantryItem);
}

function sanitizeCartInput(payload) {
  return ensureArray(payload?.cartItems, "cartItems", "Cart items").map(validateCartItem);
}

function sanitizeNutritionInput(payload) {
  return {
    calorieEntries: ensureArray(payload?.calorieEntries, "calorieEntries", "Calorie entries").map(validateCalorieEntry),
    calorieTarget: ensureNumber(payload?.calorieTarget, "calorieTarget", "Calorie target", { min: 1200 }),
  };
}

function sanitizeProfileInput(payload) {
  const customIngredients = ensureArray(payload?.customIngredients, "customIngredients", "Custom ingredients").map((item, index) =>
    ensureNonEmptyString(item, `customIngredients[${index}]`, "Custom ingredient")
  );
  const activeTab = ensureNonEmptyString(payload?.activeTab, "activeTab", "Active tab");
  const allowedTabs = ["inventory", "expiry", "recipes", "budget", "nutrition"];
  if (!allowedTabs.includes(activeTab)) {
    throw failValidation("Active tab is invalid.", "activeTab");
  }
  return {
    customIngredients,
    activeTab,
    focusedMode: Boolean(payload?.focusedMode),
    customRecipeNameValue: String(payload?.customRecipeNameValue ?? "").trim(),
  };
}

function sanitizeStateInput(payload) {
  return {
    pantry: sanitizePantryInput(payload),
    cartItems: sanitizeCartInput(payload),
    ...sanitizeNutritionInput(payload),
    ...sanitizeProfileInput(payload),
  };
}

function getUserResources(user) {
  if (!user.resources) {
    const state = sanitizeStateInput(user.state || {});
    user.resources = {
      pantry: state.pantry,
      cart: {
        cartItems: state.cartItems,
      },
      nutrition: {
        calorieEntries: state.calorieEntries,
        calorieTarget: state.calorieTarget,
      },
      profile: {
        customIngredients: state.customIngredients,
        activeTab: state.activeTab,
        focusedMode: state.focusedMode,
        customRecipeNameValue: state.customRecipeNameValue,
      },
    };
  }
  return user.resources;
}

function buildLegacyStateFromResources(resources) {
  return {
    pantry: resources.pantry,
    cartItems: resources.cart.cartItems,
    calorieEntries: resources.nutrition.calorieEntries,
    calorieTarget: resources.nutrition.calorieTarget,
    customIngredients: resources.profile.customIngredients,
    activeTab: resources.profile.activeTab,
    focusedMode: resources.profile.focusedMode,
    customRecipeNameValue: resources.profile.customRecipeNameValue,
  };
}

function syncLegacyState(user) {
  user.state = buildLegacyStateFromResources(getUserResources(user));
}

function serveStaticFile(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const resolved = path.normalize(path.join(ROOT, safePath));

  if (!resolved.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(resolved, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendText(res, 404, "Not found");
        return;
      }
      sendText(res, 500, "Server error");
      return;
    }

    const extension = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    });
    res.end(content);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === "/api/auth/register" && req.method === "POST") {
    const body = await getRequestBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || password.length < 6) {
      sendJson(res, 400, { error: "Provide name, email, and a password with at least 6 characters." });
      return;
    }

    const store = readStore();
    if (store.users.some((user) => user.email === email)) {
      sendJson(res, 409, { error: "An account with that email already exists." });
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      state: JSON.parse(JSON.stringify(defaultAppState)),
      resources: {
        pantry: JSON.parse(JSON.stringify(defaultAppState.pantry)),
        cart: { cartItems: JSON.parse(JSON.stringify(defaultAppState.cartItems)) },
        nutrition: {
          calorieEntries: JSON.parse(JSON.stringify(defaultAppState.calorieEntries)),
          calorieTarget: defaultAppState.calorieTarget,
        },
        profile: {
          customIngredients: [],
          activeTab: "inventory",
          focusedMode: false,
          customRecipeNameValue: "",
        },
      },
      createdAt: new Date().toISOString(),
    };

    store.users.push(user);
    const token = createSession(store, user.id);
    writeStore(store);

    sendJson(
      res,
      201,
      { user: sanitizeUser(user) },
      {
        "Set-Cookie": `grocify_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}`,
      }
    );
    return;
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await getRequestBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const store = readStore();
    const user = store.users.find((entry) => entry.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { error: "Invalid email or password." });
      return;
    }

    const token = createSession(store, user.id);
    writeStore(store);

    sendJson(
      res,
      200,
      { user: sanitizeUser(user) },
      {
        "Set-Cookie": `grocify_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}`,
      }
    );
    return;
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const store = readStore();
    const token = parseCookies(req).grocify_session;
    if (token) {
      clearSession(store, token);
      writeStore(store);
    }
    sendJson(
      res,
      200,
      { ok: true },
      {
        "Set-Cookie": "grocify_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0",
      }
    );
    return;
  }

  if (pathname === "/api/auth/session" && req.method === "GET") {
    const store = readStore();
    const user = getUserFromRequest(req, store);
    if (!user) {
      sendJson(res, 200, { user: null });
      return;
    }
    sendJson(res, 200, { user: sanitizeUser(user) });
    return;
  }

  if (pathname === "/api/pantry" && req.method === "GET") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    sendJson(res, 200, { pantry: getUserResources(user).pantry });
    return;
  }

  if (pathname === "/api/pantry" && req.method === "PUT") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    const body = await getRequestBody(req);
    getUserResources(user).pantry = sanitizePantryInput(body);
    syncLegacyState(user);
    writeStore(store);
    sendJson(res, 200, { pantry: getUserResources(user).pantry });
    return;
  }

  if (pathname === "/api/cart" && req.method === "GET") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    sendJson(res, 200, getUserResources(user).cart);
    return;
  }

  if (pathname === "/api/cart" && req.method === "PUT") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    const body = await getRequestBody(req);
    getUserResources(user).cart = { cartItems: sanitizeCartInput(body) };
    syncLegacyState(user);
    writeStore(store);
    sendJson(res, 200, getUserResources(user).cart);
    return;
  }

  if (pathname === "/api/nutrition" && req.method === "GET") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    sendJson(res, 200, getUserResources(user).nutrition);
    return;
  }

  if (pathname === "/api/nutrition" && req.method === "PUT") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    const body = await getRequestBody(req);
    getUserResources(user).nutrition = sanitizeNutritionInput(body);
    syncLegacyState(user);
    writeStore(store);
    sendJson(res, 200, getUserResources(user).nutrition);
    return;
  }

  if (pathname === "/api/profile" && req.method === "GET") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    sendJson(res, 200, getUserResources(user).profile);
    return;
  }

  if (pathname === "/api/profile" && req.method === "PUT") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    const body = await getRequestBody(req);
    getUserResources(user).profile = sanitizeProfileInput(body);
    syncLegacyState(user);
    writeStore(store);
    sendJson(res, 200, getUserResources(user).profile);
    return;
  }

  if (pathname === "/api/state" && req.method === "GET") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    sendJson(res, 200, { state: buildLegacyStateFromResources(getUserResources(user)) });
    return;
  }

  if (pathname === "/api/state" && req.method === "PUT") {
    const store = readStore();
    const user = requireAuth(req, res, store);
    if (!user) return;
    const body = await getRequestBody(req);
    user.state = sanitizeStateInput(body);
    getUserResources(user).pantry = user.state.pantry;
    getUserResources(user).cart = { cartItems: user.state.cartItems };
    getUserResources(user).nutrition = {
      calorieEntries: user.state.calorieEntries,
      calorieTarget: user.state.calorieTarget,
    };
    getUserResources(user).profile = {
      customIngredients: user.state.customIngredients,
      activeTab: user.state.activeTab,
      focusedMode: user.state.focusedMode,
      customRecipeNameValue: user.state.customRecipeNameValue,
    };
    writeStore(store);
    sendJson(res, 200, { state: user.state });
    return;
  }

  if (pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API route not found" });
    return;
  }

  serveStaticFile(req, res, pathname);
}

ensureStore();

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (error.statusCode) {
      sendJson(res, error.statusCode, { error: error.message, field: error.field || null });
      return;
    }
    if (error.message === "Invalid JSON") {
      sendJson(res, 400, { error: error.message });
      return;
    }
    if (error.message === "Request body too large") {
      sendJson(res, 413, { error: error.message });
      return;
    }
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Grocify server running at http://127.0.0.1:${PORT}`);
});
