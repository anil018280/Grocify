import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./lib/api";
import { useAuth } from "./providers/AuthProvider";

const tabs = ["inventory", "budget", "nutrition", "profile"];

const emptyForm = {
  name: "",
  quantity: 1,
  unit: "pcs",
  category: "Produce",
  days_left: 5,
  price: 3.5,
};

function SectionCard({ children, className = "" }) {
  return <section className={`overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-card ${className}`}>{children}</section>;
}

function MetricCard({ label, value, hint, className = "" }) {
  return (
    <div className={`rounded-3xl border border-stone-200 bg-stone-50 p-5 ${className}`}>
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate">{value}</p>
      <p className="mt-2 text-sm text-stone-500">{hint}</p>
    </div>
  );
}

function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-lime-50 to-stone-100 p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Grocify</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="mt-2 text-sm text-stone-500">Use the documented FastAPI + JWT backend with PostgreSQL-backed resources.</p>
        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-fern p-1">
          {["login", "register"].map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setMode(entry)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold capitalize ${mode === entry ? "bg-white text-slate shadow-sm" : "text-stone-500"}`}
            >
              {entry}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="block text-sm font-medium text-stone-600">
              Name
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none ring-0 transition focus:border-moss"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-stone-600">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-moss"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-600">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-moss"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
          <button className="w-full rounded-2xl bg-moss px-4 py-3 font-bold text-white" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const queryClient = useQueryClient();
  const { token, user, authReady, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [saveState, setSaveState] = useState("All changes saved");
  const [editingItemId, setEditingItemId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const pantryQuery = useQuery({
    queryKey: ["pantry"],
    queryFn: () => apiRequest("/pantry", { token }),
    enabled: Boolean(token),
  });

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiRequest("/cart", { token }),
    enabled: Boolean(token),
  });

  const nutritionQuery = useQuery({
    queryKey: ["nutrition"],
    queryFn: () => apiRequest("/nutrition", { token }),
    enabled: Boolean(token),
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiRequest("/profile", { token }),
    enabled: Boolean(token),
  });

  const pantryItems = pantryQuery.data?.pantry ?? [];
  const cartItems = cartQuery.data?.cart_items ?? [];
  const nutrition = nutritionQuery.data ?? { calorie_target: 2000, calorie_entries: [] };
  const profile = profileQuery.data ?? {
    active_tab: "inventory",
    focused_mode: false,
    custom_recipe_name_value: "",
    custom_ingredients: [],
    calorie_target: 2000,
  };

  const pantryMutation = useMutation({
    mutationFn: (nextPantry) => apiRequest("/pantry", { method: "PUT", body: nextPantry, token }),
    onMutate: () => setSaveState("Saving changes..."),
    onSuccess: () => {
      setSaveState("All changes saved");
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
    onError: (error) => setSaveState(error.message),
  });

  const cartMutation = useMutation({
    mutationFn: (nextCart) => apiRequest("/cart", { method: "PUT", body: nextCart, token }),
    onMutate: () => setSaveState("Saving changes..."),
    onSuccess: () => {
      setSaveState("All changes saved");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => setSaveState(error.message),
  });

  const profileMutation = useMutation({
    mutationFn: (nextProfile) => apiRequest("/profile", { method: "PUT", body: nextProfile, token }),
    onMutate: () => setSaveState("Saving changes..."),
    onSuccess: () => {
      setSaveState("All changes saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => setSaveState(error.message),
  });

  const nutritionMutation = useMutation({
    mutationFn: (nextNutrition) => apiRequest("/nutrition", { method: "PUT", body: nextNutrition, token }),
    onMutate: () => setSaveState("Saving changes..."),
    onSuccess: () => {
      setSaveState("All changes saved");
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
    },
    onError: (error) => setSaveState(error.message),
  });

  const inventoryValue = useMemo(
    () => pantryItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [pantryItems]
  );

  useEffect(() => {
    if (profile.active_tab && tabs.includes(profile.active_tab)) {
      setActiveTab(profile.active_tab);
    }
  }, [profile.active_tab]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center text-lg font-semibold text-stone-500">Loading Grocify...</div>;
  }

  if (!token) {
    return <AuthScreen />;
  }

  function resetForm() {
    setEditingItemId(null);
    setForm(emptyForm);
  }

  function startEditing(item) {
    setEditingItemId(item.id);
    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      days_left: item.days_left,
      price: item.price,
    });
    setActiveTab("inventory");
  }

  function handlePantrySubmit(event) {
    event.preventDefault();
    const nutritionDefaults = {
      calories: 120,
      protein: 4,
      carbs: 12,
      fat: 3,
      fiber: 1,
    };

    const payloadItem = {
      ...form,
      nutrition: nutritionDefaults,
    };

    const nextPantry = editingItemId
      ? pantryItems.map((item) => (item.id === editingItemId ? { ...item, ...payloadItem } : item))
      : [{ id: Date.now(), ...payloadItem }, ...pantryItems];

    pantryMutation.mutate(nextPantry);
    resetForm();
  }

  function removePantryItem(itemId) {
    pantryMutation.mutate(pantryItems.filter((item) => item.id !== itemId));
  }

  function addCartFromPantry(item) {
    const existing = cartItems.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());
    const nextCart = existing
      ? cartItems.map((entry) => (entry.id === existing.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
      : [{ id: Date.now(), name: item.name, quantity: 1, price: item.price }, ...cartItems];
    cartMutation.mutate(nextCart);
  }

  function removeCartItem(itemId) {
    cartMutation.mutate(cartItems.filter((item) => item.id !== itemId));
  }

  function addNutritionFromPantry(item) {
    const nextEntry = {
      id: Date.now(),
      item_name: item.name,
      servings: 1,
      calories: item.nutrition?.calories ?? 120,
      protein: item.nutrition?.protein ?? 4,
      carbs: item.nutrition?.carbs ?? 12,
      fat: item.nutrition?.fat ?? 3,
      fiber: item.nutrition?.fiber ?? 1,
    };
    nutritionMutation.mutate({
      calorie_target: nutrition.calorie_target,
      calorie_entries: [nextEntry, ...nutrition.calorie_entries],
    });
  }

  function updateActiveTab(nextTab) {
    setActiveTab(nextTab);
    profileMutation.mutate({
      active_tab: nextTab,
      focused_mode: profile.focused_mode,
      custom_recipe_name_value: profile.custom_recipe_name_value,
      custom_ingredients: profile.custom_ingredients,
    });
  }

  function renderInventoryPanel() {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const expiringSoon = pantryItems.filter((item) => Number(item.days_left) <= 3).length;

    return (
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Inventory</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate">Items you have</h3>
              <p className="mt-1 text-sm text-stone-500">{pantryItems.length} tracked pantry items worth ${inventoryValue.toFixed(2)}.</p>
            </div>
          </div>
          <form className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handlePantrySubmit}>
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Item name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" type="number" min="1" step="0.5" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} required />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Unit" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} required />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" type="number" min="0" value={form.days_left} onChange={(event) => setForm((current) => ({ ...current, days_left: Number(event.target.value) }))} required />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} required />
            <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-3">
              <button className="rounded-2xl bg-moss px-5 py-3 font-bold text-white" type="submit">{editingItemId ? "Update item" : "Add item"}</button>
              {editingItemId ? (
                <button className="rounded-2xl border border-stone-200 px-5 py-3 font-bold text-stone-700" type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-6 grid max-h-[32rem] gap-3 overflow-y-auto pr-2">
            {pantryQuery.isLoading ? <p className="text-sm text-stone-500">Loading pantry...</p> : null}
            {pantryItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate">{item.name}</h4>
                  <p className="mt-1 text-sm text-stone-500">{item.quantity} {item.unit} • {item.category} • {item.days_left} days left • ${Number(item.price).toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-2xl bg-white px-4 py-2 font-semibold text-stone-700" type="button" onClick={() => startEditing(item)}>Edit</button>
                  <button className="rounded-2xl bg-white px-4 py-2 font-semibold text-stone-700" type="button" onClick={() => addCartFromPantry(item)}>Add to cart</button>
                  <button className="rounded-2xl bg-white px-4 py-2 font-semibold text-stone-700" type="button" onClick={() => addNutritionFromPantry(item)}>Log meal</button>
                  <button className="rounded-2xl bg-red-50 px-4 py-2 font-semibold text-red-600" type="button" onClick={() => removePantryItem(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard
              label="Inventory Value"
              value={`$${inventoryValue.toFixed(2)}`}
              hint={`${pantryItems.length} pantry items currently tracked.`}
            />
            <MetricCard
              label="Expiring Soon"
              value={String(expiringSoon)}
              hint="Items with 3 days or less left should be used first."
            />
          </div>

          <SectionCard className="bg-slate text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/70">Budget snapshot</p>
            <h3 className="mt-2 text-4xl font-extrabold">${cartTotal.toFixed(2)}</h3>
            <p className="mt-2 text-sm text-white/75">{cartItems.length} cart entries synced through TanStack Query mutations.</p>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Cart</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">Shopping list</h3>
            <div className="mt-4 grid max-h-[22rem] gap-3 overflow-y-auto pr-2">
              {cartItems.length ? cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-fern px-4 py-3">
                  <div>
                    <p className="font-bold text-slate">{item.name}</p>
                    <p className="text-sm text-stone-500">{item.quantity} unit(s) • ${Number(item.price).toFixed(2)} each</p>
                  </div>
                  <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-red-600" type="button" onClick={() => removeCartItem(item.id)}>
                    Remove
                  </button>
                </div>
              )) : <p className="text-sm text-stone-500">Your cart is empty.</p>}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  function renderBudgetPanel() {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard className="bg-slate text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/70">Budget</p>
          <h3 className="mt-2 text-4xl font-extrabold">${cartTotal.toFixed(2)}</h3>
          <p className="mt-2 text-sm text-white/75">{cartItems.length} items are currently planned for purchase.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Cart</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate">Shopping list</h3>
          <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto pr-2">
            {cartItems.length ? cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-fern px-4 py-3">
                <div>
                  <p className="font-bold text-slate">{item.name}</p>
                  <p className="text-sm text-stone-500">{item.quantity} unit(s) • ${Number(item.price).toFixed(2)} each</p>
                </div>
                <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-red-600" type="button" onClick={() => removeCartItem(item.id)}>
                  Remove
                </button>
              </div>
            )) : <p className="text-sm text-stone-500">Your cart is empty.</p>}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderNutritionPanel() {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Nutrition</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate">Daily target</h3>
          <p className="mt-2 text-sm text-stone-500">{nutrition.calorie_entries.length} logged entries against a {nutrition.calorie_target} calorie goal.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Meal log</p>
          <div className="mt-4 grid max-h-[30rem] gap-3 overflow-y-auto pr-2">
            {nutrition.calorie_entries.length ? nutrition.calorie_entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="font-bold text-slate">{entry.item_name}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {entry.servings} serving(s) • {entry.calories} cal • P {entry.protein} • C {entry.carbs} • F {entry.fat} • Fiber {entry.fiber}
                </p>
              </div>
            )) : <p className="text-sm text-stone-500">Log meals from Inventory to see them here.</p>}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderProfilePanel() {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Profile</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate">Workspace settings</h3>
          <p className="mt-2 text-sm text-stone-500">Active tab: {profile.active_tab}. Focus mode: {profile.focused_mode ? "On" : "Off"}.</p>
        </SectionCard>
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Account</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate">{user?.name || "Grocify user"}</h3>
          <p className="mt-2 text-sm text-stone-500">{user?.email}</p>
          <p className="mt-4 text-sm text-stone-500">Custom ingredients: {profile.custom_ingredients.length ? profile.custom_ingredients.join(", ") : "None yet"}.</p>
        </SectionCard>
      </div>
    );
  }

  function renderActivePanel() {
    if (activeTab === "budget") {
      return renderBudgetPanel();
    }
    if (activeTab === "nutrition") {
      return renderNutritionPanel();
    }
    if (activeTab === "profile") {
      return renderProfilePanel();
    }
    return renderInventoryPanel();
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const expiringSoonCount = pantryItems.filter((item) => Number(item.days_left) <= 3).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-stone-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-6 px-6 py-6">
        <aside className="sticky top-6 h-fit w-80 self-start rounded-[2rem] border border-stone-200 bg-white p-6 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Workspace</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate">Grocify</h1>
          <p className="mt-2 text-sm text-stone-500">Vite + Tailwind + TanStack Query frontend for the documented architecture.</p>
          <nav className="mt-8 grid gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => updateActiveTab(tab)}
                className={`rounded-2xl px-4 py-3 text-left font-bold capitalize ${activeTab === tab ? "bg-moss text-white" : "bg-fern text-stone-600"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl bg-fern p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Signed in</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate">{user?.name || "Grocify user"}</h2>
            <p className="mt-1 text-sm text-stone-500">JWT-authenticated session against the FastAPI backend.</p>
          </div>
          <button
            className="mt-6 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-bold text-stone-700"
            onClick={logout}
            type="button"
          >
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Dashboard</p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate">Welcome back, {user?.name || "Grocify user"}</h2>
                <p className="mt-2 max-w-2xl text-sm text-stone-500">
                  Keep your pantry organized, catch expiring ingredients early, and stay on top of your shopping plan.
                </p>
              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-bold ${saveState.includes("saved") ? "bg-emerald-50 text-emerald-700" : saveState.includes("Saving") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
                {saveState}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-fern px-5 py-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Pantry Items</p>
                <p className="mt-2 text-3xl font-extrabold text-slate">{pantryItems.length}</p>
                <p className="mt-1 text-sm text-stone-500">Items currently available in your kitchen.</p>
              </div>
              <div className="rounded-3xl bg-stone-50 px-5 py-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Expiring Soon</p>
                <p className="mt-2 text-3xl font-extrabold text-slate">{expiringSoonCount}</p>
                <p className="mt-1 text-sm text-stone-500">Use these within the next 3 days.</p>
              </div>
              <div className="rounded-3xl bg-sand px-5 py-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Cart Total</p>
                <p className="mt-2 text-3xl font-extrabold text-slate">${cartTotal.toFixed(2)}</p>
                <p className="mt-1 text-sm text-stone-500 capitalize">{activeTab} workspace active.</p>
              </div>
            </div>
          </div>

          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
