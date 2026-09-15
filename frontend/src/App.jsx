import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./lib/api";
import { useAuth } from "./providers/AuthProvider";
import plannerHero from "./assets/ai-meal-planner-hero.png";

const tabs = ["inventory", "planner", "budget", "nutrition", "profile"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
  const [showItemForm, setShowItemForm] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [recipeForm, setRecipeForm] = useState({ preferences: "", allergies: "", servings: 2, budget: 20 });
  const [selectedPlanDay, setSelectedPlanDay] = useState("Monday");

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

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => apiRequest("/recommendations", { token }),
    enabled: Boolean(token),
  });

  const mealPlanQuery = useQuery({
    queryKey: ["meal-plan"],
    queryFn: () => apiRequest("/meal-plan", { token }),
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
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
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
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error) => setSaveState(error.message),
  });

  const recipeMutation = useMutation({
    mutationFn: (payload) => apiRequest("/recommendations/recipe", { method: "POST", body: payload, token }),
  });

  const scheduleMealMutation = useMutation({
    mutationFn: ({ day, recipe }) => apiRequest(`/meal-plan/${day}`, {
      method: "PUT",
      body: { title: recipe.title, servings: Number(recipeForm.servings), ingredients: recipe.ingredients },
      token,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plan"] }),
  });

  const missingToCartMutation = useMutation({
    mutationFn: (day) => apiRequest(`/meal-plan/${day}/missing-to-cart`, { method: "POST", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeMealMutation = useMutation({
    mutationFn: (day) => apiRequest(`/meal-plan/${day}`, { method: "DELETE", token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plan"] }),
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
    setShowItemForm(false);
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
    setShowItemForm(true);
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

  function generateAiRecipe(event) {
    event.preventDefault();
    recipeMutation.mutate({
      preferences: recipeForm.preferences,
      allergies: recipeForm.allergies.split(",").map((entry) => entry.trim()).filter(Boolean),
      servings: Number(recipeForm.servings),
      budget: Number(recipeForm.budget),
    });
  }

  function planExpiringItems() {
    const urgentNames = pantryItems
      .filter((item) => Number(item.days_left) <= 3)
      .sort((a, b) => Number(a.days_left) - Number(b.days_left))
      .map((item) => item.name);
    setRecipeForm((current) => ({
      ...current,
      preferences: `Create a meal that uses ${urgentNames.join(", ")} first. ${current.preferences}`.trim(),
    }));
    updateActiveTab("planner");
  }

  function renderInventoryPanel() {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const expiringSoon = pantryItems.filter((item) => Number(item.days_left) <= 3).length;
    const categories = ["All", ...new Set(pantryItems.map((item) => item.category).filter(Boolean))];
    const visibleItems = pantryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
      return matchesSearch && (activeCategory === "All" || item.category === activeCategory);
    });
    const useFirstItem = pantryItems.slice().sort((a, b) => Number(a.days_left) - Number(b.days_left))[0];

    return (
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SectionCard className="bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Your pantry</p>
              <h3 className="text-2xl font-extrabold text-slate">Items you have</h3>
              <p className="mt-1 text-sm text-stone-500">{pantryItems.length} tracked pantry items worth ${inventoryValue.toFixed(2)}.</p>
            </div>
            <button className="rounded-2xl bg-moss px-5 py-3 font-extrabold text-white shadow-lg shadow-moss/20 transition hover:-translate-y-0.5 hover:bg-[#255a32]" type="button" onClick={() => setShowItemForm((current) => !current)}>
              {showItemForm ? "Close quick add" : "Add pantry item"}
            </button>
          </div>
          {showItemForm ? (
            <form className="mt-6 grid gap-3 rounded-3xl border border-moss/15 bg-fern p-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handlePantrySubmit}>
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Item name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" type="number" min="1" step="0.5" aria-label="Quantity" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Unit (for example, pcs)" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" type="number" min="0" aria-label="Days left" value={form.days_left} onChange={(event) => setForm((current) => ({ ...current, days_left: Number(event.target.value) }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" type="number" min="0" step="0.01" aria-label="Item price" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} required />
              <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-3">
                <button className="rounded-2xl bg-moss px-5 py-3 font-bold text-white" type="submit">{editingItemId ? "Save changes" : "Add item"}</button>
                <button className="rounded-2xl border border-stone-200 bg-white px-5 py-3 font-bold text-stone-700" type="button" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 border-y border-stone-100 py-4 md:flex-row md:items-center md:justify-between">
            <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-moss md:max-w-xs" placeholder="Search your pantry" value={inventorySearch} onChange={(event) => setInventorySearch(event.target.value)} />
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${activeCategory === category ? "bg-slate text-white" : "bg-fern text-stone-600 hover:bg-stone-100"}`}>{category}</button>)}
            </div>
          </div>

          <div className="mt-5 grid max-h-[34rem] gap-3 overflow-y-auto pr-2">
            {pantryQuery.isLoading ? <p className="text-sm text-stone-500">Loading pantry...</p> : null}
            {visibleItems.map((item) => (
              <div key={item.id} className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 transition hover:-translate-y-0.5 hover:border-moss/30 hover:bg-white hover:shadow-card">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-extrabold text-slate">{item.name}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${Number(item.days_left) <= 3 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>{item.days_left} days left</span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{item.quantity} {item.unit} • {item.category} • ${Number(item.price).toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-2xl bg-white px-4 py-2 font-semibold text-stone-700" type="button" onClick={() => startEditing(item)}>Edit</button>
                  <button className="rounded-2xl bg-slate px-4 py-2 font-semibold text-white" type="button" onClick={() => addCartFromPantry(item)}>Cart</button>
                  <button className="rounded-2xl bg-white px-4 py-2 font-semibold text-stone-700" type="button" onClick={() => addNutritionFromPantry(item)}>Log</button>
                  <button className="rounded-2xl bg-red-50 px-4 py-2 font-semibold text-red-600" type="button" onClick={() => removePantryItem(item.id)}>Remove</button>
                </div>
              </div>
            ))}
            {!pantryQuery.isLoading && !visibleItems.length ? <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-500">No pantry items match that search yet.</p> : null}
          </div>
        </SectionCard>

        <div className="grid gap-6">
          {useFirstItem ? (
            <SectionCard className="relative bg-gradient-to-br from-moss to-[#1e4930] text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-lime-200">Use first</p>
              <h3 className="mt-3 text-3xl font-extrabold">{useFirstItem.name}</h3>
              <p className="mt-2 text-sm text-white/75">{useFirstItem.days_left} days left. Turn it into a meal before it is forgotten.</p>
              <button className="mt-6 rounded-2xl bg-lime-200 px-4 py-3 font-extrabold text-slate transition hover:bg-white" type="button" onClick={() => updateActiveTab("planner")}>Plan a meal</button>
            </SectionCard>
          ) : null}
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

  function renderPlannerPanel() {
    const recommendations = recommendationsQuery.data;
    const scheduledMeals = Object.fromEntries((mealPlanQuery.data?.meals ?? []).map((meal) => [meal.day, meal]));
    const riskStyles = {
      low: "bg-emerald-50 text-emerald-700",
      moderate: "bg-amber-50 text-amber-700",
      high: "bg-red-50 text-red-700",
    };

    return (
      <div className="space-y-6">
        <section className="relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-stone-200 bg-slate shadow-card">
          <img className="absolute inset-0 h-full w-full object-cover" src={plannerHero} alt="Colorful meal bowl with fresh vegetables and grains" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate via-slate/90 to-slate/20" />
          <div className="relative flex min-h-[25rem] max-w-2xl flex-col justify-between p-7 text-white sm:p-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-lime-200">AI-inspired meal planner</p>
              <h3 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">A fresher plan for every ingredient.</h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/80">Your planner turns pantry freshness and nutrition signals into practical, low-waste meal ideas.</p>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="rounded-3xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/65">Calories remaining</p>
                <p className="mt-1 text-4xl font-extrabold">{recommendations?.calorie_remaining ?? "--"}</p>
              </div>
              <button className="rounded-2xl bg-lime-200 px-5 py-3 font-extrabold text-slate transition hover:bg-lime-100" type="button" onClick={() => recommendationsQuery.refetch()}>
                Refresh my plan
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <SectionCard className="bg-[#fff8e8]">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Generate with AI</p>
            <h3 className="mt-2 text-3xl font-extrabold text-slate">Make tonight&apos;s recipe</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">Tell Grocify what you want. It will use your pantry first and suggest substitutions when needed.</p>
            <form className="mt-5 grid gap-3" onSubmit={generateAiRecipe}>
              <label className="text-sm font-bold text-stone-600">
                Preferences or cuisine
                <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" placeholder="For example: quick vegetarian Indian meal" value={recipeForm.preferences} onChange={(event) => setRecipeForm((current) => ({ ...current, preferences: event.target.value }))} />
              </label>
              <label className="text-sm font-bold text-stone-600">
                Allergies or ingredients to avoid
                <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" placeholder="For example: peanuts, dairy" value={recipeForm.allergies} onChange={(event) => setRecipeForm((current) => ({ ...current, allergies: event.target.value }))} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-bold text-stone-600">
                  Servings
                  <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" type="number" min="1" max="12" value={recipeForm.servings} onChange={(event) => setRecipeForm((current) => ({ ...current, servings: event.target.value }))} required />
                </label>
                <label className="text-sm font-bold text-stone-600">
                  Budget ($)
                  <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" type="number" min="1" step="0.5" value={recipeForm.budget} onChange={(event) => setRecipeForm((current) => ({ ...current, budget: event.target.value }))} required />
                </label>
              </div>
              <button className="mt-2 rounded-2xl bg-moss px-5 py-3 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#255a32] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={recipeMutation.isPending}>
                {recipeMutation.isPending ? "Creating your recipe..." : "Generate recipe"}
              </button>
              <p className="text-xs leading-5 text-stone-500">Recipe nutrition and cost are estimates, not medical or dietary advice.</p>
            </form>
          </SectionCard>

          <SectionCard className="bg-white">
            {recipeMutation.isError ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{recipeMutation.error.message}</p> : null}
            {!recipeMutation.data && !recipeMutation.isPending && !recipeMutation.isError ? (
              <div className="flex h-full min-h-80 flex-col justify-center rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Your recipe canvas</p>
                <h3 className="mt-3 text-3xl font-extrabold text-slate">A pantry-led recipe will appear here.</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-stone-500">Generate a recipe to get tailored ingredients, steps, substitutions, and estimated nutrition in one place.</p>
              </div>
            ) : null}
            {recipeMutation.isPending ? <div className="flex min-h-80 items-center justify-center rounded-3xl bg-fern p-8 text-center text-sm font-bold text-moss">Reviewing your pantry and building a meal plan...</div> : null}
            {recipeMutation.data ? (
              <article>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Your AI recipe</p>
                    <h3 className="mt-2 text-3xl font-extrabold text-slate">{recipeMutation.data.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{recipeMutation.data.summary}</p>
                  </div>
                  <div className="rounded-2xl bg-fern px-4 py-3 text-right">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">Estimated cost</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate">${Number(recipeMutation.data.estimated_cost).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-3xl bg-slate p-4 text-white">
                  <div className="min-w-40 flex-1">
                    <p className="text-sm font-extrabold">Put this recipe on your week</p>
                    <p className="mt-1 text-xs text-white/70">Schedule it, then add any missing ingredients to your cart.</p>
                  </div>
                  <select className="rounded-2xl border-0 bg-white px-4 py-3 font-bold text-slate" value={selectedPlanDay} onChange={(event) => setSelectedPlanDay(event.target.value)}>
                    {weekDays.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                  <button className="rounded-2xl bg-lime-200 px-4 py-3 font-extrabold text-slate disabled:opacity-70" type="button" disabled={scheduleMealMutation.isPending} onClick={() => scheduleMealMutation.mutate({ day: selectedPlanDay, recipe: recipeMutation.data })}>
                    {scheduleMealMutation.isPending ? "Scheduling..." : "Add to week"}
                  </button>
                </div>
                {scheduleMealMutation.isError ? <p className="mt-3 text-sm font-medium text-red-600">{scheduleMealMutation.error.message}</p> : null}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-4"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-moss">Prep</p><p className="mt-1 text-xl font-extrabold text-slate">{recipeMutation.data.prep_minutes} min</p></div>
                  <div className="rounded-2xl bg-stone-50 p-4"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-moss">Cook</p><p className="mt-1 text-xl font-extrabold text-slate">{recipeMutation.data.cook_minutes} min</p></div>
                  <div className="rounded-2xl bg-stone-50 p-4"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-moss">Per serving</p><p className="mt-1 text-xl font-extrabold text-slate">~{recipeMutation.data.estimated_calories_per_serving} cal</p></div>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="font-extrabold text-slate">Ingredients</h4>
                    <div className="mt-3 grid gap-2">
                      {recipeMutation.data.ingredients.map((ingredient) => <div key={`${ingredient.name}-${ingredient.amount}`} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm"><span className="font-bold text-slate">{ingredient.name}</span><span className={ingredient.from_pantry ? "font-bold text-moss" : "text-stone-500"}>{ingredient.amount}{ingredient.from_pantry ? " - in pantry" : ""}</span></div>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate">Method</h4>
                    <ol className="mt-3 grid gap-3">
                      {recipeMutation.data.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-stone-600"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss text-xs font-extrabold text-white">{index + 1}</span>{step}</li>)}
                    </ol>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 rounded-3xl bg-sand p-5"><p className="text-sm"><span className="font-extrabold text-slate">Substitutions:</span> {recipeMutation.data.substitutions.join(" ")}</p><p className="text-sm text-stone-600"><span className="font-extrabold text-slate">Nutrition note:</span> {recipeMutation.data.nutrition_note}</p></div>
              </article>
            ) : null}
          </SectionCard>
        </section>

        <SectionCard className="bg-white">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">This week&apos;s menu</p>
              <h3 className="mt-2 text-3xl font-extrabold text-slate">Plan it. Cook it. Use it.</h3>
            </div>
            <p className="text-sm text-stone-500">{mealPlanQuery.data?.week_start ? `Week of ${new Date(`${mealPlanQuery.data.week_start}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "Loading your week..."}</p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {weekDays.map((day) => {
              const meal = scheduledMeals[day];
              return (
                <article key={day} className={`min-h-48 rounded-3xl border p-4 ${meal ? "border-moss/20 bg-fern" : "border-stone-200 bg-stone-50"}`}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">{day.slice(0, 3)}</p>
                  {meal ? (
                    <div className="mt-4 flex h-[9.5rem] flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold leading-5 text-slate">{meal.title}</h4>
                        <p className="mt-2 text-xs text-stone-500">{meal.servings} servings</p>
                        <p className="mt-1 text-xs font-bold text-amber-700">{meal.missing_ingredients.length} missing item{meal.missing_ingredients.length === 1 ? "" : "s"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meal.missing_ingredients.length ? <button className="rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-moss" type="button" onClick={() => missingToCartMutation.mutate(day)}>Add to cart</button> : null}
                        <button className="rounded-xl px-2 py-2 text-xs font-bold text-red-600" type="button" onClick={() => removeMealMutation.mutate(day)}>Remove</button>
                      </div>
                    </div>
                  ) : <div className="mt-4 flex h-[9.5rem] items-center text-sm leading-6 text-stone-400">Choose a generated recipe and add it here.</div>}
                </article>
              );
            })}
          </div>
          {missingToCartMutation.isError ? <p className="mt-4 text-sm font-medium text-red-600">{missingToCartMutation.error.message}</p> : null}
          {missingToCartMutation.isSuccess ? <p className="mt-4 text-sm font-bold text-moss">Missing ingredients were added to your cart.</p> : null}
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <SectionCard className="bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Curated for today</p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate">Freshness-first meal ideas</h3>
              </div>
              {recommendations ? <span className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${riskStyles[recommendations.food_waste_risk]}`}>{recommendations.food_waste_risk} risk</span> : null}
            </div>
            {recommendationsQuery.isLoading ? <p className="mt-5 text-sm text-stone-500">Building a fresh plan from your pantry...</p> : null}
            {recommendationsQuery.isError ? <p className="mt-5 text-sm text-red-600">{recommendationsQuery.error.message}</p> : null}
            <div className="mt-6 grid gap-4">
              {recommendations?.meal_ideas?.length ? recommendations.meal_ideas.map((idea, index) => (
                <article key={idea.title} className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-50">
                  <div className="flex items-center justify-between bg-fern px-5 py-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Idea {String(index + 1).padStart(2, "0")}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-moss">~{idea.estimated_calories} cal</span>
                  </div>
                  <div className="p-5">
                    <h4 className="text-xl font-extrabold text-slate">{idea.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{idea.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {idea.ingredients.map((ingredient) => <span key={ingredient} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-semibold text-stone-600">{ingredient}</span>)}
                    </div>
                    <p className="mt-4 border-t border-stone-200 pt-4 text-sm text-stone-500"><span className="font-bold text-slate">Why it works:</span> {idea.reason}</p>
                  </div>
                </article>
              )) : !recommendationsQuery.isLoading ? <p className="text-sm text-stone-500">Add pantry items to generate meal suggestions.</p> : null}
            </div>
          </SectionCard>
          <SectionCard className="bg-sand">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Complete the plan</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">Suggested next buys</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">Small additions that make your pantry more versatile.</p>
            <div className="mt-5 grid gap-3">
              {recommendations?.shopping_suggestions?.map((suggestion) => (
                <div key={suggestion.name} className="rounded-2xl bg-white/80 p-4">
                  <p className="text-lg font-extrabold text-slate">{suggestion.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{suggestion.reason}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
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
    if (activeTab === "planner") {
      return renderPlannerPanel();
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
  const urgentPantryItems = pantryItems.filter((item) => Number(item.days_left) <= 3).sort((a, b) => Number(a.days_left) - Number(b.days_left));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4f9d9,_transparent_34%),linear-gradient(180deg,_#fbfcf7_0%,_#edf4ec_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col gap-6 p-4 sm:p-6 xl:flex-row">
        <aside className="h-fit self-start rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-card backdrop-blur xl:sticky xl:top-6 xl:w-80 xl:p-6">
          <div className="flex items-center justify-between xl:block">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Workspace</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate">Grocify</h1>
            </div>
            <span className="rounded-full bg-lime-100 px-3 py-1.5 text-xs font-extrabold text-moss xl:mt-4 xl:inline-block">Smart pantry</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-stone-500">A calmer kitchen starts with one clear plan for what you have.</p>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => updateActiveTab(tab)}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left font-bold capitalize transition xl:w-full ${activeTab === tab ? "bg-gradient-to-r from-moss to-[#245a35] text-white shadow-lg shadow-moss/20" : "bg-fern text-stone-600 hover:bg-stone-100"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="mt-6 hidden rounded-3xl bg-fern p-5 xl:block">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Signed in</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate">{user?.name || "Grocify user"}</h2>
            <p className="mt-1 text-sm text-stone-500">Your pantry is synced and ready for planning.</p>
          </div>
          <button
            className="mt-5 hidden w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-bold text-stone-700 transition hover:bg-stone-50 xl:block"
            onClick={logout}
            type="button"
          >
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="rounded-[2rem] border border-white/90 bg-white/90 px-6 py-6 shadow-card backdrop-blur sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Today&apos;s kitchen</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate sm:text-4xl">Welcome back, {user?.name || "Grocify user"}</h2>
                <p className="mt-2 max-w-2xl text-sm text-stone-500">
                  Keep your pantry organized, catch expiring ingredients early, and stay on top of your shopping plan.
                </p>
              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-bold ${saveState.includes("saved") ? "bg-emerald-50 text-emerald-700" : saveState.includes("Saving") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
                {saveState}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <button className="rounded-3xl bg-fern px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-card" type="button" onClick={() => updateActiveTab("inventory")}>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Pantry Items</p>
                <p className="mt-2 text-3xl font-extrabold text-slate">{pantryItems.length}</p>
                <p className="mt-1 text-sm text-stone-500">Items currently available in your kitchen.</p>
              </button>
              <button className="rounded-3xl bg-[#fff8e8] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-card" type="button" onClick={() => updateActiveTab("planner")}>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Expiring Soon</p>
                <p className="mt-2 text-3xl font-extrabold text-slate">{expiringSoonCount}</p>
                <p className="mt-1 text-sm text-stone-500">Use these within the next 3 days.</p>
              </button>
              <button className="rounded-3xl bg-sand px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-card" type="button" onClick={() => updateActiveTab("budget")}>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Cart Total</p>
                <p className="mt-2 text-3xl font-extrabold text-slate">${cartTotal.toFixed(2)}</p>
                <p className="mt-1 text-sm text-stone-500 capitalize">{activeTab} workspace active.</p>
              </button>
            </div>
          </div>

          {urgentPantryItems.length ? (
            <section className="overflow-hidden rounded-[2rem] border border-amber-200 bg-[#fff7e7] shadow-card">
              <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-amber-800">Expiry alert</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-slate">Use these ingredients before they go to waste.</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {urgentPantryItems.slice(0, 4).map((item) => <span key={item.id} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-stone-700">{item.name} <span className="text-amber-700">{item.days_left}d left</span></span>)}
                    {urgentPantryItems.length > 4 ? <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-stone-500">+{urgentPantryItems.length - 4} more</span> : null}
                  </div>
                </div>
                <button className="shrink-0 rounded-2xl bg-amber-500 px-5 py-3 font-extrabold text-slate transition hover:-translate-y-0.5 hover:bg-amber-400" type="button" onClick={planExpiringItems}>
                  Create a rescue recipe
                </button>
              </div>
            </section>
          ) : null}

          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
