import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "./lib/api";
import { useAuth } from "./providers/AuthProvider";
import plannerHero from "./assets/ai-meal-planner-hero.png";

const tabs = ["dashboard", "inventory", "planner", "budget", "nutrition", "profile"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const pantryLocations = ["Home", "Dorm", "Shared Household", "Freezer"];
const applianceOptions = ["Stovetop", "Oven", "Air Fryer", "Instant Pot", "Microwave"];

const emptyForm = {
  name: "",
  quantity: 1,
  unit: "pcs",
  category: "Produce",
  location: "Home",
  days_left: 5,
  price: 3.5,
};

function SectionCard({ children, className = "" }) {
  const baseBg = className.includes("bg-") ? "" : "bg-white";
  return <section className={`overflow-hidden rounded-3xl border border-stone-200 p-6 shadow-card ${baseBg} ${className}`}>{children}</section>;
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [saveState, setSaveState] = useState("All changes saved");
  const [editingItemId, setEditingItemId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showItemForm, setShowItemForm] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [recipeForm, setRecipeForm] = useState({ preferences: "", allergies: "", servings: 2, budget: 20, max_prep_minutes: 30, appliances: [] });
  const [selectedPlanDay, setSelectedPlanDay] = useState("Monday");
  const [nutritionSearchQuery, setNutritionSearchQuery] = useState("");
  const [nutritionLookupSource, setNutritionLookupSource] = useState("");
  const [inviteForm, setInviteForm] = useState({ member_name: "", member_email: "", role: "Editor" });
  const [notifyForm, setNotifyForm] = useState({ notify_email_enabled: true, notify_push_enabled: false, notify_days_threshold: 3, notification_email: "" });
  const [notifyStatusMsg, setNotifyStatusMsg] = useState("");
  const [cartForm, setCartForm] = useState({ name: "", quantity: 1, price: 2.5 });
  const [weeklyBudget, setWeeklyBudget] = useState(() => {
    const saved = window.localStorage.getItem("grocify_weekly_budget");
    return saved ? Number(saved) || 75 : 75;
  });
  const [budgetInput, setBudgetInput] = useState(() => {
    const saved = window.localStorage.getItem("grocify_weekly_budget");
    return saved ? Number(saved) || 75 : 75;
  });
  const [calorieTargetInput, setCalorieTargetInput] = useState(2000);
  const [nutritionForm, setNutritionForm] = useState({ item_name: "", servings: 1, calories: 250, protein: 12, carbs: 30, fat: 8, fiber: 4 });
  const [customIngredientInput, setCustomIngredientInput] = useState("");
  const [cuisineInput, setCuisineInput] = useState("");
  const [dietInput, setDietInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [householdForm, setHouseholdForm] = useState({
    household_size: 2,
    cooking_skill: "Intermediate",
    max_prep_minutes: 30,
  });
  const [showPhotoScanner, setShowPhotoScanner] = useState(false);
  const [showFridgeSim, setShowFridgeSim] = useState(false);
  const [fridgeDoorOpen, setFridgeDoorOpen] = useState(false);
  const [fridgeSnapshot, setFridgeSnapshot] = useState("produce");
  const [customFridgeFrame, setCustomFridgeFrame] = useState("");
  const [fridgeEventLog, setFridgeEventLog] = useState([]);
  const fridgeFileInputRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [scanSummary, setScanSummary] = useState("");
  const [scannedItems, setScannedItems] = useState([]);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const savedRecipesQuery = useQuery({
    queryKey: ["saved-recipes"],
    queryFn: () => apiRequest("/recommendations/saved", { token }),
    enabled: Boolean(token),
  });

  const householdMembersQuery = useQuery({
    queryKey: ["household-members"],
    queryFn: () => apiRequest("/profile/household-members", { token }),
    enabled: Boolean(token),
  });

  const pantryItems = pantryQuery.data?.pantry ?? [];
  const cartItems = cartQuery.data?.cart_items ?? [];
  const nutrition = nutritionQuery.data ?? { calorie_target: 2000, calorie_entries: [] };
  const profile = profileQuery.data ?? {
    active_tab: "dashboard",
    focused_mode: false,
    custom_recipe_name_value: "",
    custom_ingredients: [],
    calorie_target: 2000,
    household_size: 2,
    preferred_cuisines: [],
    dietary_preferences: [],
    allergies: [],
    cooking_skill: "Intermediate",
    max_prep_minutes: 30,
    notify_email_enabled: true,
    notify_push_enabled: false,
    notify_days_threshold: 3,
    notification_email: "",
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

  const cookMealMutation = useMutation({
    mutationFn: (day) => apiRequest(`/meal-plan/${day}/cook`, { method: "POST", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });

  const generateWeekMutation = useMutation({
    mutationFn: () => apiRequest("/meal-plan/generate-week", { method: "POST", token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plan"] }),
  });

  const saveRecipeMutation = useMutation({
    mutationFn: (payload) => apiRequest("/recommendations/saved", { method: "POST", body: payload, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-recipes"] }),
  });

  const rateRecipeMutation = useMutation({
    mutationFn: ({ id, rating }) => apiRequest(`/recommendations/saved/${id}/rate`, { method: "PATCH", body: { rating }, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-recipes"] }),
  });

  const deleteSavedRecipeMutation = useMutation({
    mutationFn: (id) => apiRequest(`/recommendations/saved/${id}`, { method: "DELETE", token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-recipes"] }),
  });

  const barcodeMutation = useMutation({
    mutationFn: (code) => apiRequest(`/pantry/barcode/${encodeURIComponent(code)}`, { token }),
  });

  const fridgeDoorMutation = useMutation({
    mutationFn: (payload) => apiRequest("/pantry/fridge-door-event", { method: "POST", body: payload, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setFridgeEventLog((current) => [data, ...current].slice(0, 5));
    },
  });

  const priceCompareMutation = useMutation({
    mutationFn: () => apiRequest("/cart/price-compare", { method: "POST", token }),
  });

  const nutritionLookupMutation = useMutation({
    mutationFn: (q) => apiRequest(`/nutrition/lookup?q=${encodeURIComponent(q)}`, { token }),
    onSuccess: (data) => {
      setNutritionForm({
        item_name: data.item_name,
        servings: data.servings || 1,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
      });
      setNutritionLookupSource(data.source || "");
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (payload) => apiRequest("/profile/household-members", { method: "POST", body: payload, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members"] });
      setInviteForm({ member_name: "", member_email: "", role: "Editor" });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ id, role }) => apiRequest(`/profile/household-members/${id}`, { method: "PATCH", body: { role }, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["household-members"] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id) => apiRequest(`/profile/household-members/${id}`, { method: "DELETE", token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["household-members"] }),
  });

  const testNotifyMutation = useMutation({
    mutationFn: () => apiRequest("/profile/test-notification", { method: "POST", token }),
    onSuccess: (data) => {
      setNotifyStatusMsg(`${data.channels.join(" + ")}: ${data.message}`);
      if (notifyForm.notify_push_enabled && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Grocify Expiry Alert", { body: data.message });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") new Notification("Grocify Expiry Alert", { body: data.message });
          });
        }
      }
    },
  });

  const scanPhotoMutation = useMutation({
    mutationFn: (image_data_url) => apiRequest("/pantry/scan-photo", {
      method: "POST",
      body: { image_data_url, scan_type: "auto" },
      token,
    }),
    onSuccess: (data) => {
      setScanSummary(data?.summary || "");
      setScannedItems(data?.items ?? []);
    },
  });

  const inventoryValue = useMemo(
    () => pantryItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [pantryItems]
  );

  useEffect(() => {
    if (nutrition.calorie_target) {
      setCalorieTargetInput(nutrition.calorie_target);
    }
  }, [nutrition.calorie_target]);

  useEffect(() => {
    if (profileQuery.data) {
      setHouseholdForm({
        household_size: profileQuery.data.household_size ?? 2,
        cooking_skill: profileQuery.data.cooking_skill || "Intermediate",
        max_prep_minutes: profileQuery.data.max_prep_minutes ?? 30,
      });
      setNotifyForm({
        notify_email_enabled: Boolean(profileQuery.data.notify_email_enabled),
        notify_push_enabled: Boolean(profileQuery.data.notify_push_enabled),
        notify_days_threshold: profileQuery.data.notify_days_threshold ?? 3,
        notification_email: profileQuery.data.notification_email || "",
      });
      setRecipeForm((current) => ({
        ...current,
        servings: current.servings || profileQuery.data.household_size || 2,
        preferences: current.preferences || (profileQuery.data.preferred_cuisines || []).join(", "),
        allergies: current.allergies || (profileQuery.data.allergies || []).join(", "),
        max_prep_minutes: profileQuery.data.max_prep_minutes ?? current.max_prep_minutes ?? 30,
      }));
    }
  }, [profileQuery.data]);

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
      location: item.location || "Home",
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

  function stopCamera() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  }

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser. Use Upload photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      cameraStreamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setCameraError("Could not access camera. Check browser permissions or use Upload photo.");
    }
  }

  function resizeSourceToDataUrl(source, width, height) {
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  function captureCameraPhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const dataUrl = resizeSourceToDataUrl(video, video.videoWidth, video.videoHeight);
    setPhotoPreview(dataUrl);
    setScannedItems([]);
    scanPhotoMutation.reset();
    stopCamera();
  }

  function handlePhotoFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCameraError("");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const dataUrl = resizeSourceToDataUrl(img, img.width, img.height);
        setPhotoPreview(dataUrl);
        setScannedItems([]);
        scanPhotoMutation.reset();
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function addScannedItemsToPantry() {
    if (!scannedItems.length) return;
    const baseId = Date.now();
    const mapped = scannedItems.map((item, index) => ({
      id: baseId + index,
      name: item.name,
      quantity: Math.max(1, Number(item.quantity) || 1),
      unit: item.unit || "pcs",
      category: item.category || "Pantry",
      days_left: Math.max(0, Number(item.days_left) || 5),
      price: Math.max(0, Number(item.price) || 0),
      nutrition: item.nutrition || { calories: 120, protein: 4, carbs: 12, fat: 3, fiber: 1 },
    }));
    pantryMutation.mutate([...mapped, ...pantryItems]);
    setScannedItems([]);
    setPhotoPreview("");
    setShowPhotoScanner(false);
    scanPhotoMutation.reset();
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

  function saveProfilePatch(patch) {
    profileMutation.mutate({
      active_tab: patch.active_tab ?? profile.active_tab ?? activeTab,
      focused_mode: patch.focused_mode ?? profile.focused_mode,
      custom_recipe_name_value: patch.custom_recipe_name_value ?? profile.custom_recipe_name_value,
      custom_ingredients: patch.custom_ingredients ?? profile.custom_ingredients,
      household_size: patch.household_size ?? profile.household_size ?? 2,
      preferred_cuisines: patch.preferred_cuisines ?? profile.preferred_cuisines ?? [],
      dietary_preferences: patch.dietary_preferences ?? profile.dietary_preferences ?? [],
      allergies: patch.allergies ?? profile.allergies ?? [],
      cooking_skill: patch.cooking_skill ?? profile.cooking_skill ?? "Intermediate",
      max_prep_minutes: patch.max_prep_minutes ?? profile.max_prep_minutes ?? 30,
      notify_email_enabled: patch.notify_email_enabled ?? profile.notify_email_enabled ?? true,
      notify_push_enabled: patch.notify_push_enabled ?? profile.notify_push_enabled ?? false,
      notify_days_threshold: patch.notify_days_threshold ?? profile.notify_days_threshold ?? 3,
      notification_email: patch.notification_email ?? profile.notification_email ?? "",
    });
  }

  function updateActiveTab(nextTab) {
    setActiveTab(nextTab);
    saveProfilePatch({ active_tab: nextTab });
  }

  function generateAiRecipe(event) {
    if (event) event.preventDefault();
    recipeMutation.mutate({
      preferences: recipeForm.preferences,
      allergies: recipeForm.allergies.split(",").map((entry) => entry.trim()).filter(Boolean),
      servings: Number(recipeForm.servings),
      budget: Number(recipeForm.budget),
      max_prep_minutes: Number(recipeForm.max_prep_minutes) || 30,
      appliances: recipeForm.appliances || [],
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
    const expiringSoon = pantryItems.filter((item) => Number(item.days_left) <= 3).length;
    const categories = ["All", ...new Set(pantryItems.map((item) => item.category).filter(Boolean))];
    const locations = ["All", ...new Set([...pantryLocations, ...pantryItems.map((item) => item.location || "Home")])];
    const visibleItems = pantryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesLocation = activeLocation === "All" || (item.location || "Home") === activeLocation;
      return matchesSearch && matchesCategory && matchesLocation;
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
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-2xl border border-slate/20 bg-slate px-4 py-3 font-extrabold text-white transition hover:opacity-90"
                type="button"
                onClick={() => setShowFridgeSim((current) => !current)}
              >
                {showFridgeSim ? "Close fridge simulator" : "Fridge camera simulator"}
              </button>
              <button
                className="rounded-2xl border border-moss/30 bg-fern px-4 py-3 font-extrabold text-moss transition hover:bg-stone-100"
                type="button"
                onClick={() => {
                  if (showPhotoScanner) stopCamera();
                  setShowPhotoScanner((current) => !current);
                }}
              >
                {showPhotoScanner ? "Close scanner" : "Scan photo / receipt"}
              </button>
              <button className="rounded-2xl bg-moss px-5 py-3 font-extrabold text-white shadow-lg shadow-moss/20 transition hover:-translate-y-0.5 hover:bg-[#255a32]" type="button" onClick={() => setShowItemForm((current) => !current)}>
                {showItemForm ? "Close quick add" : "Add pantry item"}
              </button>
            </div>
          </div>
          {showFridgeSim ? (
            <div className={`mt-6 space-y-4 rounded-3xl border p-5 transition-all ${fridgeDoorOpen ? "border-amber-300 bg-[#fffbeb] shadow-lg shadow-amber-200/40" : "border-stone-200 bg-stone-50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${fridgeDoorOpen ? "animate-pulse bg-amber-400" : "bg-stone-400"}`} />
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">
                      {fridgeDoorOpen ? "Fridge Light ON • Camera Active" : "IoT Fridge Door Sensor • Standby"}
                    </p>
                  </div>
                  <h4 className="mt-1 text-lg font-extrabold text-slate">Smart Fridge Door Camera Simulator</h4>
                  <p className="text-xs text-stone-500">Opening the fridge door turns on the internal light, captures a shelf frame, and automatically logs/updates items &amp; expiry dates.</p>
                </div>
                <button
                  className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition ${fridgeDoorOpen ? "bg-amber-500 text-slate" : "bg-moss text-white hover:bg-[#255a32]"} disabled:opacity-60`}
                  type="button"
                  disabled={fridgeDoorMutation.isPending}
                  onClick={() => {
                    setFridgeDoorOpen(true);
                    fridgeDoorMutation.mutate(
                      {
                        scenario: fridgeSnapshot,
                        image_data_url: fridgeSnapshot === "custom" && customFridgeFrame ? customFridgeFrame : null,
                      },
                      { onSettled: () => setTimeout(() => setFridgeDoorOpen(false), 2200) }
                    );
                  }}
                >
                  {fridgeDoorMutation.isPending ? "Light ON • Scanning shelves..." : fridgeDoorOpen ? "Door Open • Syncing..." : "Simulate Door Open"}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "produce", label: "Fresh Produce Shelf" },
                  { id: "indian", label: "Indian Prep Shelf" },
                  { id: "mealprep", label: "Meal-Prep & Leftovers" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFridgeSnapshot(opt.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${fridgeSnapshot === opt.id ? "bg-moss text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fridgeFileInputRef.current?.click()}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${fridgeSnapshot === "custom" ? "bg-slate text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`}
                >
                  Upload custom picture
                </button>
                <input
                  ref={fridgeFileInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const img = new Image();
                      img.onload = () => {
                        const dataUrl = resizeSourceToDataUrl(img, img.width, img.height);
                        setCustomFridgeFrame(dataUrl);
                        setFridgeSnapshot("custom");
                      };
                      img.src = String(reader.result || "");
                    };
                    reader.readAsDataURL(file);
                    event.target.value = "";
                  }}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-slate">
                  <img
                    src={
                      fridgeSnapshot === "custom" && customFridgeFrame
                        ? customFridgeFrame
                        : fridgeSnapshot === "indian"
                        ? "/sample-fridge-indian.jpg"
                        : fridgeSnapshot === "mealprep"
                        ? "/sample-fridge-leftovers.jpg"
                        : "/sample-fridge.jpg"
                    }
                    alt="Simulated main shelf fridge camera"
                    className={`h-44 w-full object-cover transition-all duration-300 ${fridgeDoorOpen ? "brightness-110 contrast-105" : "brightness-50 grayscale"}`}
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">
                    {fridgeDoorOpen ? "Cam 1: Main Shelf • Scanning" : "Cam 1: Main Shelf"}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-slate">
                  <img
                    src="/sample-fridge-door-sauces.jpg"
                    alt="Simulated side door rack sauces camera"
                    className={`h-44 w-full object-cover transition-all duration-300 ${fridgeDoorOpen ? "brightness-110 contrast-105" : "brightness-50 grayscale"}`}
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">
                    {fridgeDoorOpen ? "Cam 2: Side Door Sauces • Scanning" : "Cam 2: Side Door Sauces"}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-slate">
                  <img
                    src="/sample-fridge-freezer.jpg"
                    alt="Simulated deep freezer camera"
                    className={`h-44 w-full object-cover transition-all duration-300 ${fridgeDoorOpen ? "brightness-110 contrast-105" : "brightness-50 grayscale"}`}
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">
                    {fridgeDoorOpen ? "Cam 3: Deep Freezer • Scanning" : "Cam 3: Deep Freezer"}
                  </div>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">Auto-Sync Event Log (3 Cameras)</p>
                {fridgeEventLog.length ? (
                  <div className="grid max-h-36 gap-2 overflow-y-auto pr-1">
                    {fridgeEventLog.map((ev) => (
                      <div key={ev.event_id} className="rounded-xl bg-fern px-3 py-2 text-xs">
                        <p className="font-bold text-slate">{ev.trigger}</p>
                        <p className="mt-0.5 text-stone-600">
                          Added: {ev.added_items.length ? ev.added_items.join(", ") : "None"} • Updated: {ev.updated_items.length ? ev.updated_items.join(", ") : "None"}
                        </p>
                        {ev.door_sauces_detected?.length ? (
                          <p className="mt-0.5 font-semibold text-moss">
                            Side-door sauces: {ev.door_sauces_detected.join(", ")}
                          </p>
                        ) : null}
                        {ev.freezer_items_detected?.length ? (
                          <p className="mt-0.5 font-semibold text-slate">
                            Deep freezer: {ev.freezer_items_detected.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">Click &ldquo;Simulate Door Open&rdquo; to trigger Main Shelf, Side-Door Sauces, and Deep Freezer cameras simultaneously.</p>
                )}
              </div>
            </div>
          ) : null}
          {showPhotoScanner ? (
            <div className="mt-6 space-y-4 rounded-3xl border border-moss/20 bg-fern p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-moss">Smart scan</p>
                  <h4 className="mt-1 text-lg font-extrabold text-slate">Snap or upload a fridge photo, receipt, or order screenshot</h4>
                  <p className="text-xs text-stone-500">Automatically detects items and calculates expiry dates—no mode selection needed.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-2xl bg-slate px-4 py-2.5 text-sm font-bold text-white" type="button" onClick={cameraActive ? stopCamera : startCamera}>
                    {cameraActive ? "Stop camera" : "Take photo (Camera)"}
                  </button>
                  <button className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-slate" type="button" onClick={() => fileInputRef.current?.click()}>
                    Upload photo / screenshot
                  </button>
                  <input ref={fileInputRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={handlePhotoFileChange} />
                </div>
              </div>
              {cameraError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{cameraError}</p> : null}
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">Barcode lookup (OpenFoodFacts)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    className="min-w-44 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-moss"
                    placeholder="Enter UPC/EAN barcode (e.g. 011110416605)"
                    value={barcodeInput}
                    onChange={(event) => setBarcodeInput(event.target.value)}
                  />
                  <button
                    className="rounded-2xl bg-moss px-4 py-2 text-xs font-extrabold text-white"
                    type="button"
                    disabled={barcodeMutation.isPending || !barcodeInput.trim()}
                    onClick={() => barcodeMutation.mutate(barcodeInput.trim())}
                  >
                    {barcodeMutation.isPending ? "Looking up..." : "Lookup barcode"}
                  </button>
                  {[
                    { code: "011110416605", label: "Sample: Milk" },
                    { code: "041303001028", label: "Sample: Oats" },
                    { code: "0737628064502", label: "Sample: Basmati" },
                  ].map((s) => (
                    <button key={s.code} className="rounded-xl bg-fern px-3 py-1.5 text-xs font-bold text-moss" type="button" onClick={() => { setBarcodeInput(s.code); barcodeMutation.mutate(s.code); }}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {barcodeMutation.isError ? <p className="mt-2 text-xs font-medium text-red-600">{barcodeMutation.error.message}</p> : null}
                {barcodeMutation.data ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-fern px-3 py-2 text-sm">
                    <span>
                      <strong className="text-slate">{barcodeMutation.data.name}</strong>{" "}
                      <span className="text-xs text-stone-500">• {barcodeMutation.data.category} • {barcodeMutation.data.days_left}d left • ${Number(barcodeMutation.data.price).toFixed(2)} ({barcodeMutation.data.source})</span>
                    </span>
                    <button
                      className="rounded-xl bg-moss px-3 py-1.5 text-xs font-extrabold text-white"
                      type="button"
                      onClick={() => {
                        pantryMutation.mutate([{ id: Date.now(), ...barcodeMutation.data }, ...pantryItems]);
                        barcodeMutation.reset();
                        setBarcodeInput("");
                      }}
                    >
                      + Add to pantry
                    </button>
                  </div>
                ) : null}
              </div>
              {cameraActive ? (
                <div className="space-y-3">
                  <video ref={videoRef} autoPlay playsInline className="max-h-72 w-full rounded-2xl bg-black object-cover" />
                  <button className="rounded-2xl bg-moss px-5 py-2.5 text-sm font-extrabold text-white" type="button" onClick={captureCameraPhoto}>
                    Capture photo
                  </button>
                </div>
              ) : null}
              {photoPreview ? (
                <div className="grid gap-4 md:grid-cols-[0.45fr_0.55fr]">
                  <img src={photoPreview} alt="Pantry or fridge preview" className="max-h-60 w-full rounded-2xl border border-stone-200 object-cover" />
                  <div className="flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate">Photo ready for analysis</p>
                      <p className="mt-1 text-xs text-stone-500">Click analyze to extract food items with OpenAI Vision, then review before adding.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-2xl bg-moss px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
                        type="button"
                        disabled={scanPhotoMutation.isPending}
                        onClick={() => scanPhotoMutation.mutate(photoPreview)}
                      >
                        {scanPhotoMutation.isPending ? "Calculating expiry dates..." : "Scan & calculate expiry"}
                      </button>
                      <button
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600"
                        type="button"
                        onClick={() => {
                          setPhotoPreview("");
                          setScanSummary("");
                          setScannedItems([]);
                          scanPhotoMutation.reset();
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {scanPhotoMutation.isError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{scanPhotoMutation.error.message}</p> : null}
              {scannedItems.length ? (
                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
                  {scanSummary ? <p className="rounded-xl bg-fern px-3 py-2 text-xs font-semibold text-moss">{scanSummary}</p> : null}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-slate">Detected items ({scannedItems.length})</p>
                    <button className="rounded-2xl bg-moss px-4 py-2 text-xs font-extrabold text-white" type="button" onClick={addScannedItemsToPantry}>
                      Add all to pantry
                    </button>
                  </div>
                  <div className="grid max-h-60 gap-2 overflow-y-auto pr-1">
                    {scannedItems.map((item, idx) => (
                      <div key={`${item.name}-${idx}`} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm">
                        <div>
                          <span className="font-bold text-slate">{item.name}</span>
                          <span className="ml-2 text-xs text-stone-500">
                            {item.quantity} {item.unit} • {item.category} • Expires {item.expiry_date} ({item.days_left}d left) • ${Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        <button
                          className="text-xs font-bold text-red-600"
                          type="button"
                          onClick={() => setScannedItems((current) => current.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {showItemForm ? (
            <form className="mt-6 grid gap-3 rounded-3xl border border-moss/15 bg-fern p-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handlePantrySubmit}>
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Item name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" type="number" min="1" step="0.5" aria-label="Quantity" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Unit (for example, pcs)" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} required />
              <input className="rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required />
              <select className="rounded-2xl border border-stone-200 bg-white px-4 py-3" aria-label="Pantry location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}>
                {pantryLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">Location:</span>
            {locations.map((loc) => (
              <button key={loc} type="button" onClick={() => setActiveLocation(loc)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition ${activeLocation === loc ? "bg-moss text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
                {loc}
              </button>
            ))}
          </div>

          <div className="mt-5 grid max-h-[34rem] gap-3 overflow-y-auto pr-2">
            {pantryQuery.isLoading ? <p className="text-sm text-stone-500">Loading pantry...</p> : null}
            {visibleItems.map((item) => (
              <div key={item.id} className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 transition hover:-translate-y-0.5 hover:border-moss/30 hover:bg-white hover:shadow-card">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-extrabold text-slate">{item.name}</h4>
                    <span className="rounded-full bg-fern px-2.5 py-1 text-xs font-bold text-moss">{item.location || "Home"}</span>
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
        </div>
      </div>
    );
  }

  function renderBudgetPanel() {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const remainingBudget = weeklyBudget - cartTotal;
    const budgetProgress = Math.min(100, Math.round((cartTotal / Math.max(1, weeklyBudget)) * 100));
    const isOverBudget = remainingBudget < 0;
    const suggestions = recommendationsQuery.data?.shopping_suggestions ?? [];

    const categorySpend = Object.entries(
      pantryItems.reduce((acc, item) => {
        const cat = item.category || "Pantry";
        if (!acc[cat]) acc[cat] = { count: 0, total: 0 };
        acc[cat].count += 1;
        acc[cat].total += Number(item.price || 0);
        return acc;
      }, {})
    ).sort((a, b) => b[1].total - a[1].total);

    function handleBudgetSave(event) {
      event.preventDefault();
      const next = Math.max(1, Number(budgetInput) || 75);
      setWeeklyBudget(next);
      window.localStorage.setItem("grocify_weekly_budget", String(next));
    }

    function handleAddCartItem(event) {
      event.preventDefault();
      if (!cartForm.name.trim()) return;
      const existing = cartItems.find((entry) => entry.name.toLowerCase() === cartForm.name.trim().toLowerCase());
      const nextCart = existing
        ? cartItems.map((entry) => (entry.id === existing.id ? { ...entry, quantity: entry.quantity + Number(cartForm.quantity) } : entry))
        : [{ id: Date.now(), name: cartForm.name.trim(), quantity: Number(cartForm.quantity), price: Number(cartForm.price) }, ...cartItems];
      cartMutation.mutate(nextCart);
      setCartForm({ name: "", quantity: 1, price: 2.5 });
    }

    function adjustCartQuantity(itemId, delta) {
      const nextCart = cartItems
        .map((entry) => (entry.id === itemId ? { ...entry, quantity: Math.max(0, Number(entry.quantity) + delta) } : entry))
        .filter((entry) => entry.quantity > 0);
      cartMutation.mutate(nextCart);
    }

    function checkoutCartToPantry() {
      if (!cartItems.length) return;
      const baseId = Date.now();
      const restockedItems = cartItems.map((item, idx) => ({
        id: baseId + idx,
        name: item.name,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit: "pcs",
        category: "Pantry",
        days_left: 7,
        price: Number(item.price) || 0,
        nutrition: { calories: 120, protein: 4, carbs: 14, fat: 3, fiber: 2 },
      }));
      pantryMutation.mutate([...restockedItems, ...pantryItems]);
      cartMutation.mutate([]);
    }

    const urgentValue = urgentPantryItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return (
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SectionCard className="bg-slate text-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/70">Budget planner</p>
                <h3 className="mt-2 text-4xl font-extrabold">${cartTotal.toFixed(2)} <span className="text-lg font-bold text-white/60">/ ${weeklyBudget.toFixed(2)}</span></h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${isOverBudget ? "bg-red-500/20 text-red-200" : "bg-lime-300/20 text-lime-200"}`}>
                {isOverBudget ? `Over by $${Math.abs(remainingBudget).toFixed(2)}` : `$${remainingBudget.toFixed(2)} left`}
              </span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div className={`h-full rounded-full transition-all ${isOverBudget ? "bg-red-400" : "bg-lime-300"}`} style={{ width: `${budgetProgress}%` }} />
            </div>
            <p className="mt-3 text-sm text-white/75">
              {cartItems.length} item(s) in cart • Current pantry value: ${inventoryValue.toFixed(2)}
            </p>
            <form className="mt-4 flex gap-2" onSubmit={handleBudgetSave}>
              <input
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white placeholder-white/50 outline-none focus:border-lime-200"
                type="number"
                min="1"
                step="0.01"
                aria-label="Weekly grocery budget"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
                required
              />
              <button className="shrink-0 rounded-2xl bg-lime-200 px-4 py-2.5 text-sm font-extrabold text-slate transition hover:bg-white" type="submit">
                Set budget
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Pantry spend breakdown</p>
            <h3 className="mt-2 text-xl font-extrabold text-slate">Value by category</h3>
            <div className="mt-4 grid gap-2.5">
              {categorySpend.length ? categorySpend.map(([category, info]) => (
                <div key={category} className="flex items-center justify-between rounded-2xl bg-fern px-4 py-3 text-sm">
                  <span className="font-bold text-slate">{category} <span className="font-normal text-stone-500">({info.count} items)</span></span>
                  <span className="font-extrabold text-moss">${info.total.toFixed(2)}</span>
                </div>
              )) : <p className="text-sm text-stone-500">Add pantry items to see category spend.</p>}
            </div>
          </SectionCard>

          {urgentPantryItems.length ? (
            <SectionCard className="border-amber-200 bg-[#fff7e7]">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-amber-800">Potential food waste</p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate">${urgentValue.toFixed(2)} at risk</h3>
              <p className="mt-1 text-sm text-stone-600">{urgentPantryItems.length} item(s) expire within 3 days. Cook them first to protect your grocery budget.</p>
              <button className="mt-4 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-slate transition hover:bg-amber-400" type="button" onClick={planExpiringItems}>
                Rescue expiring items
              </button>
            </SectionCard>
          ) : null}

          {suggestions.length ? (
            <SectionCard className="bg-sand">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Smart suggestions</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate">Recommended next buys</h3>
              <div className="mt-4 grid gap-2.5">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/85 px-4 py-3">
                    <div>
                      <p className="font-bold text-slate">{suggestion.name}</p>
                      <p className="text-xs text-stone-500">{suggestion.reason}</p>
                    </div>
                    <button
                      className="shrink-0 rounded-xl bg-moss px-3 py-1.5 text-xs font-extrabold text-white"
                      type="button"
                      onClick={() => cartMutation.mutate([{ id: Date.now(), name: suggestion.name, quantity: 1, price: 3.5 }, ...cartItems])}
                    >
                      + Cart
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Quick add</p>
            <h3 className="mt-2 text-xl font-extrabold text-slate">Add item to shopping cart</h3>
            <form className="mt-4 grid gap-3" onSubmit={handleAddCartItem}>
              <input className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-moss" placeholder="Item name (e.g. Olive Oil)" value={cartForm.name} onChange={(event) => setCartForm((current) => ({ ...current, name: event.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <input className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-moss" type="number" min="0.5" step="0.5" aria-label="Cart item quantity" value={cartForm.quantity} onChange={(event) => setCartForm((current) => ({ ...current, quantity: event.target.value }))} required />
                <input className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-moss" type="number" min="0" step="0.01" aria-label="Cart item price" value={cartForm.price} onChange={(event) => setCartForm((current) => ({ ...current, price: event.target.value }))} required />
              </div>
              <button className="rounded-2xl bg-moss px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#255a32]" type="submit">Add to cart</button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Cart</p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate">Shopping list</h3>
              </div>
              {cartItems.length ? (
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-xl bg-moss px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#255a32]" type="button" onClick={checkoutCartToPantry}>
                    Checkout &amp; restock pantry
                  </button>
                  <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600" type="button" onClick={() => cartMutation.mutate([])}>
                    Clear cart
                  </button>
                </div>
              ) : null}
            </div>
            <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto pr-2">
              {cartItems.length ? cartItems.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-fern px-4 py-3">
                  <div>
                    <p className="font-bold text-slate">{item.name}</p>
                    <p className="text-sm text-stone-500">{item.quantity} × ${Number(item.price).toFixed(2)} = <span className="font-bold text-slate">${(item.quantity * item.price).toFixed(2)}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate" type="button" onClick={() => adjustCartQuantity(item.id, -1)}>-</button>
                    <button className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate" type="button" onClick={() => adjustCartQuantity(item.id, 1)}>+</button>
                    <button className="rounded-2xl bg-white px-3 py-1.5 text-xs font-semibold text-red-600" type="button" onClick={() => removeCartItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              )) : <p className="text-sm text-stone-500">Your cart is empty.</p>}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Store price comparison</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate">Compare cart across local grocers</h3>
              </div>
              <button
                className="rounded-2xl bg-slate px-4 py-2 text-xs font-extrabold text-white"
                type="button"
                disabled={priceCompareMutation.isPending}
                onClick={() => priceCompareMutation.mutate()}
              >
                {priceCompareMutation.isPending ? "Comparing..." : "Compare stores"}
              </button>
            </div>
            {priceCompareMutation.data ? (
              <div className="mt-4 space-y-2.5">
                <p className="rounded-xl bg-fern px-3 py-2 text-xs font-bold text-moss">
                  Best value: {priceCompareMutation.data.best_store} (save up to ${Number(priceCompareMutation.data.potential_savings).toFixed(2)})
                </p>
                {priceCompareMutation.data.stores.map((s) => (
                  <div key={s.store} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-2.5 text-sm">
                    <div>
                      <p className="font-bold text-slate">{s.store}</p>
                      <p className="text-xs text-stone-500">{s.note}</p>
                    </div>
                    <span className="font-extrabold text-moss">${Number(s.estimated_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-xs text-stone-500">Click Compare stores to see estimated totals across regional grocers.</p>}
          </SectionCard>
        </div>
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
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm font-bold text-stone-600">
                  Servings
                  <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" type="number" min="1" max="12" value={recipeForm.servings} onChange={(event) => setRecipeForm((current) => ({ ...current, servings: event.target.value }))} required />
                </label>
                <label className="text-sm font-bold text-stone-600">
                  Budget ($)
                  <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" type="number" min="1" step="0.5" value={recipeForm.budget} onChange={(event) => setRecipeForm((current) => ({ ...current, budget: event.target.value }))} required />
                </label>
                <label className="text-sm font-bold text-stone-600">
                  Max prep (m)
                  <input className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-moss" type="number" min="5" max="240" step="5" value={recipeForm.max_prep_minutes} onChange={(event) => setRecipeForm((current) => ({ ...current, max_prep_minutes: event.target.value }))} required />
                </label>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-600">Available appliances</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {applianceOptions.map((appName) => {
                    const selected = (recipeForm.appliances || []).includes(appName);
                    return (
                      <button
                        key={appName}
                        type="button"
                        onClick={() => setRecipeForm((current) => ({
                          ...current,
                          appliances: selected
                            ? current.appliances.filter((a) => a !== appName)
                            : [...(current.appliances || []), appName],
                        }))}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${selected ? "bg-moss text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`}
                      >
                        {appName}
                      </button>
                    );
                  })}
                </div>
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
                  <button
                    className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/25"
                    type="button"
                    disabled={saveRecipeMutation.isPending}
                    onClick={() => saveRecipeMutation.mutate({ ...recipeMutation.data, cuisine: recipeForm.preferences })}
                  >
                    {saveRecipeMutation.isPending ? "Saving..." : "Save recipe"}
                  </button>
                  <button
                    className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/25"
                    type="button"
                    disabled={recipeMutation.isPending}
                    onClick={() => generateAiRecipe()}
                  >
                    Regenerate
                  </button>
                </div>
                {saveRecipeMutation.isSuccess ? <p className="mt-2 text-xs font-bold text-moss">Recipe saved to your collection below!</p> : null}
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
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-2xl bg-moss px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#255a32] disabled:opacity-60"
                type="button"
                disabled={generateWeekMutation.isPending}
                onClick={() => generateWeekMutation.mutate()}
              >
                {generateWeekMutation.isPending ? "Generating 7-day menu..." : "Auto-generate full week"}
              </button>
              <p className="text-sm text-stone-500">{mealPlanQuery.data?.week_start ? `Week of ${new Date(`${mealPlanQuery.data.week_start}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "Loading your week..."}</p>
            </div>
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
                        <button className="rounded-xl bg-moss px-3 py-2 text-xs font-extrabold text-white" type="button" disabled={cookMealMutation.isPending} onClick={() => cookMealMutation.mutate(day)}>Mark cooked</button>
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
          {cookMealMutation.isSuccess ? (
            <p className="mt-4 text-sm font-bold text-moss">
              Marked {cookMealMutation.data.day}&apos;s meal cooked! Logged {cookMealMutation.data.logged_calories} kcal to Nutrition and updated {cookMealMutation.data.deducted_items.length} pantry item(s).
            </p>
          ) : null}
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

        <SectionCard className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Recipe library</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate">Saved &amp; rated recipes</h3>
            </div>
            <span className="text-xs font-bold text-stone-500">{(savedRecipesQuery.data?.recipes ?? []).length} saved</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(savedRecipesQuery.data?.recipes ?? []).length ? (savedRecipesQuery.data?.recipes ?? []).map((saved) => (
              <article key={saved.id} className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate">{saved.title}</h4>
                    <span className="rounded-full bg-fern px-2.5 py-1 text-xs font-bold text-moss">~{saved.estimated_calories_per_serving} cal</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{saved.summary}</p>
                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => rateRecipeMutation.mutate({ id: saved.id, rating: star })}
                        className={`text-lg leading-none ${(saved.rating ?? 0) >= star ? "text-amber-500" : "text-stone-300"}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-stone-500">{saved.rating ? `${saved.rating}/5` : "Rate"}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl bg-moss px-3 py-1.5 text-xs font-bold text-white"
                    type="button"
                    onClick={() => scheduleMealMutation.mutate({ day: selectedPlanDay, recipe: saved })}
                  >
                    Add to {selectedPlanDay.slice(0, 3)}
                  </button>
                  <button
                    className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                    type="button"
                    onClick={() => deleteSavedRecipeMutation.mutate(saved.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            )) : <p className="text-sm text-stone-500">Generate a recipe and click Save recipe to revisit and rate it here.</p>}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderNutritionPanel() {
    const consumedCalories = nutrition.calorie_entries.reduce((sum, entry) => sum + Number(entry.calories || 0), 0);
    const totalProtein = nutrition.calorie_entries.reduce((sum, entry) => sum + Number(entry.protein || 0), 0);
    const totalCarbs = nutrition.calorie_entries.reduce((sum, entry) => sum + Number(entry.carbs || 0), 0);
    const totalFat = nutrition.calorie_entries.reduce((sum, entry) => sum + Number(entry.fat || 0), 0);
    const progressPct = Math.min(100, Math.round((consumedCalories / Math.max(1, nutrition.calorie_target)) * 100));

    function handleTargetSubmit(event) {
      event.preventDefault();
      nutritionMutation.mutate({
        calorie_target: Math.max(1200, Number(calorieTargetInput) || 2000),
        calorie_entries: nutrition.calorie_entries,
      });
    }

    function handleLogMeal(event) {
      event.preventDefault();
      if (!nutritionForm.item_name.trim()) return;
      const nextEntry = {
        id: Date.now(),
        item_name: nutritionForm.item_name.trim(),
        servings: Number(nutritionForm.servings),
        calories: Number(nutritionForm.calories),
        protein: Number(nutritionForm.protein),
        carbs: Number(nutritionForm.carbs),
        fat: Number(nutritionForm.fat),
        fiber: Number(nutritionForm.fiber),
      };
      nutritionMutation.mutate({
        calorie_target: nutrition.calorie_target,
        calorie_entries: [nextEntry, ...nutrition.calorie_entries],
      });
      setNutritionForm({ item_name: "", servings: 1, calories: 250, protein: 12, carbs: 30, fat: 8, fiber: 4 });
    }

    function removeNutritionEntry(entryId) {
      nutritionMutation.mutate({
        calorie_target: nutrition.calorie_target,
        calorie_entries: nutrition.calorie_entries.filter((entry) => entry.id !== entryId),
      });
    }

    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Nutrition</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">Daily target</h3>
            <p className="mt-3 text-3xl font-extrabold text-slate">{Math.round(consumedCalories)} <span className="text-lg font-bold text-stone-400">/ {nutrition.calorie_target} kcal</span></p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-fern">
              <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-3 text-sm text-stone-500">Protein {Math.round(totalProtein)}g • Carbs {Math.round(totalCarbs)}g • Fat {Math.round(totalFat)}g</p>
            <form className="mt-4 flex gap-2" onSubmit={handleTargetSubmit}>
              <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-moss" type="number" min="1200" step="50" value={calorieTargetInput} onChange={(event) => setCalorieTargetInput(event.target.value)} required />
              <button className="shrink-0 rounded-2xl bg-slate px-4 py-2.5 text-sm font-bold text-white" type="submit">Update goal</button>
            </form>
          </SectionCard>
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Log meal</p>
            <h3 className="mt-2 text-xl font-extrabold text-slate">Add nutrition entry</h3>
            <div className="mt-3 flex gap-2">
              <input
                className="w-full rounded-2xl border border-stone-200 bg-fern px-3 py-2 text-xs outline-none focus:border-moss"
                placeholder="Lookup verified food (e.g. Paneer, Spinach, Toor Dal)"
                value={nutritionSearchQuery}
                onChange={(event) => setNutritionSearchQuery(event.target.value)}
              />
              <button
                className="shrink-0 rounded-2xl bg-slate px-3 py-2 text-xs font-bold text-white"
                type="button"
                disabled={nutritionLookupMutation.isPending || !nutritionSearchQuery.trim()}
                onClick={() => nutritionLookupMutation.mutate(nutritionSearchQuery.trim())}
              >
                {nutritionLookupMutation.isPending ? "..." : "USDA Lookup"}
              </button>
            </div>
            {nutritionLookupSource ? <p className="mt-1.5 text-xs font-semibold text-moss">Auto-filled from {nutritionLookupSource}</p> : null}
            <form className="mt-3 grid gap-3" onSubmit={handleLogMeal}>
              <input className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-moss" placeholder="Meal name" value={nutritionForm.item_name} onChange={(event) => setNutritionForm((current) => ({ ...current, item_name: event.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-stone-500">Calories<input className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate" type="number" min="0" value={nutritionForm.calories} onChange={(event) => setNutritionForm((current) => ({ ...current, calories: event.target.value }))} required /></label>
                <label className="text-xs font-bold text-stone-500">Protein (g)<input className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate" type="number" min="0" value={nutritionForm.protein} onChange={(event) => setNutritionForm((current) => ({ ...current, protein: event.target.value }))} required /></label>
                <label className="text-xs font-bold text-stone-500">Carbs (g)<input className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate" type="number" min="0" value={nutritionForm.carbs} onChange={(event) => setNutritionForm((current) => ({ ...current, carbs: event.target.value }))} required /></label>
                <label className="text-xs font-bold text-stone-500">Fat (g)<input className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate" type="number" min="0" value={nutritionForm.fat} onChange={(event) => setNutritionForm((current) => ({ ...current, fat: event.target.value }))} required /></label>
              </div>
              <button className="rounded-2xl bg-moss px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#255a32]" type="submit">Log entry</button>
            </form>
          </SectionCard>
        </div>
        <SectionCard>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Meal log</p>
          <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-2">
            {nutrition.calorie_entries.length ? nutrition.calorie_entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <div>
                  <p className="font-bold text-slate">{entry.item_name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {entry.servings} serving(s) • {entry.calories} cal • P {entry.protein}g • C {entry.carbs}g • F {entry.fat}g • Fiber {entry.fiber}g
                  </p>
                </div>
                <button className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-red-600" type="button" onClick={() => removeNutritionEntry(entry.id)}>Remove</button>
              </div>
            )) : <p className="text-sm text-stone-500">Log meals here or from Inventory to see them.</p>}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderProfilePanel() {
    function toggleFocusedMode() {
      saveProfilePatch({ active_tab: activeTab, focused_mode: !profile.focused_mode });
    }

    function handleHouseholdSave(event) {
      event.preventDefault();
      saveProfilePatch({
        active_tab: activeTab,
        household_size: Math.max(1, Number(householdForm.household_size) || 2),
        cooking_skill: householdForm.cooking_skill,
        max_prep_minutes: Math.max(5, Number(householdForm.max_prep_minutes) || 30),
      });
    }

    function addProfileTag(field, value, setter) {
      const trimmed = value.trim();
      const current = profile[field] ?? [];
      if (!trimmed || current.includes(trimmed)) return;
      saveProfilePatch({ active_tab: activeTab, [field]: [...current, trimmed] });
      setter("");
    }

    function removeProfileTag(field, value) {
      const current = profile[field] ?? [];
      saveProfilePatch({ active_tab: activeTab, [field]: current.filter((item) => item !== value) });
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Household profile</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">People &amp; cooking setup</h3>
            <p className="mt-1 text-sm text-stone-500">Used to tailor AI recipes, serving sizes, and weekly meal planning.</p>
            <form className="mt-5 grid gap-4" onSubmit={handleHouseholdSave}>
              <label className="text-sm font-bold text-stone-600">
                Number of people in household
                <input
                  className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-normal text-slate outline-none focus:border-moss"
                  type="number"
                  min="1"
                  max="20"
                  value={householdForm.household_size}
                  onChange={(event) => setHouseholdForm((current) => ({ ...current, household_size: event.target.value }))}
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-bold text-stone-600">
                  Cooking level
                  <select
                    className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-normal text-slate outline-none focus:border-moss"
                    value={householdForm.cooking_skill}
                    onChange={(event) => setHouseholdForm((current) => ({ ...current, cooking_skill: event.target.value }))}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-stone-600">
                  Max prep time (min)
                  <input
                    className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-normal text-slate outline-none focus:border-moss"
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={householdForm.max_prep_minutes}
                    onChange={(event) => setHouseholdForm((current) => ({ ...current, max_prep_minutes: event.target.value }))}
                    required
                  />
                </label>
              </div>
              <button className="rounded-2xl bg-moss px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#255a32]" type="submit">
                Save household settings
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Tastes &amp; preferences</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">Cuisines, likes &amp; allergies</h3>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Preferred cuisines</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(profile.preferred_cuisines ?? []).map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-fern px-3 py-1.5 text-sm font-semibold text-slate">
                      {item}
                      <button className="text-xs font-extrabold text-red-600" type="button" onClick={() => removeProfileTag("preferred_cuisines", item)}>×</button>
                    </span>
                  ))}
                </div>
                <form className="mt-2.5 flex gap-2" onSubmit={(e) => { e.preventDefault(); addProfileTag("preferred_cuisines", cuisineInput, setCuisineInput); }}>
                  <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-moss" placeholder="Add cuisine (e.g. South Indian, Thai)" value={cuisineInput} onChange={(e) => setCuisineInput(e.target.value)} />
                  <button className="shrink-0 rounded-2xl bg-slate px-4 py-2 text-xs font-bold text-white" type="submit">Add</button>
                </form>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Dietary likes &amp; goals</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(profile.dietary_preferences ?? []).map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-sm font-semibold text-slate">
                      {item}
                      <button className="text-xs font-extrabold text-red-600" type="button" onClick={() => removeProfileTag("dietary_preferences", item)}>×</button>
                    </span>
                  ))}
                </div>
                <form className="mt-2.5 flex gap-2" onSubmit={(e) => { e.preventDefault(); addProfileTag("dietary_preferences", dietInput, setDietInput); }}>
                  <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-moss" placeholder="Add preference (e.g. Vegetarian, High-Protein)" value={dietInput} onChange={(e) => setDietInput(e.target.value)} />
                  <button className="shrink-0 rounded-2xl bg-slate px-4 py-2 text-xs font-bold text-white" type="submit">Add</button>
                </form>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Allergies &amp; items to avoid</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(profile.allergies ?? []).map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
                      {item}
                      <button className="text-xs font-extrabold text-red-700" type="button" onClick={() => removeProfileTag("allergies", item)}>×</button>
                    </span>
                  ))}
                </div>
                <form className="mt-2.5 flex gap-2" onSubmit={(e) => { e.preventDefault(); addProfileTag("allergies", allergyInput, setAllergyInput); }}>
                  <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-moss" placeholder="Add allergy or dislike (e.g. Peanuts, Shellfish)" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} />
                  <button className="shrink-0 rounded-2xl bg-slate px-4 py-2 text-xs font-bold text-white" type="submit">Add</button>
                </form>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Workspace</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">Display &amp; expiry notifications</h3>
            <p className="mt-2 text-sm text-stone-500">Focus mode: {profile.focused_mode ? "On" : "Off"}.</p>
            <button className="mt-3 rounded-2xl bg-fern px-4 py-2 text-xs font-extrabold text-moss transition hover:bg-stone-100" type="button" onClick={toggleFocusedMode}>
              {profile.focused_mode ? "Disable focus mode" : "Enable focus mode"}
            </button>

            <form
              className="mt-5 space-y-3 border-t border-stone-100 pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveProfilePatch({
                  active_tab: activeTab,
                  notify_email_enabled: notifyForm.notify_email_enabled,
                  notify_push_enabled: notifyForm.notify_push_enabled,
                  notify_days_threshold: Math.max(1, Number(notifyForm.notify_days_threshold) || 3),
                  notification_email: notifyForm.notification_email,
                });
              }}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Expiry alert notifications</p>
              <label className="flex items-center gap-2 text-sm font-medium text-slate">
                <input type="checkbox" checked={notifyForm.notify_email_enabled} onChange={(e) => setNotifyForm((c) => ({ ...c, notify_email_enabled: e.target.checked }))} />
                Email digest for expiring items
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate">
                <input type="checkbox" checked={notifyForm.notify_push_enabled} onChange={(e) => setNotifyForm((c) => ({ ...c, notify_push_enabled: e.target.checked }))} />
                Browser push notifications
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs" placeholder="Alert email" value={notifyForm.notification_email} onChange={(e) => setNotifyForm((c) => ({ ...c, notification_email: e.target.value }))} />
                <input className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs" type="number" min="1" max="14" aria-label="Notify days threshold" value={notifyForm.notify_days_threshold} onChange={(e) => setNotifyForm((c) => ({ ...c, notify_days_threshold: e.target.value }))} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-2xl bg-moss px-4 py-2 text-xs font-bold text-white" type="submit">Save alerts</button>
                <button className="rounded-2xl bg-slate px-4 py-2 text-xs font-bold text-white" type="button" onClick={() => testNotifyMutation.mutate()}>Send test alert</button>
              </div>
              {notifyStatusMsg ? <p className="rounded-xl bg-fern px-3 py-2 text-xs font-semibold text-moss">{notifyStatusMsg}</p> : null}
            </form>
          </SectionCard>
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Account &amp; sharing</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">{user?.name || "Grocify user"}</h3>
            <p className="mt-1 text-sm text-stone-500">{user?.email}</p>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Household sharing (RBAC)</p>
              <div className="mt-2 grid gap-2">
                {(householdMembersQuery.data?.members ?? []).map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-fern px-3 py-2 text-xs">
                    <div>
                      <p className="font-bold text-slate">{m.member_name}</p>
                      <p className="text-stone-500">{m.member_email} • {m.status}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        className="rounded-xl border border-stone-200 bg-white px-2 py-1 text-xs font-bold"
                        value={m.role}
                        onChange={(e) => updateMemberRoleMutation.mutate({ id: m.id, role: e.target.value })}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                      <button className="rounded-xl bg-white px-2 py-1 font-bold text-red-600" type="button" onClick={() => removeMemberMutation.mutate(m.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
              <form
                className="mt-3 grid grid-cols-3 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  inviteMemberMutation.mutate(inviteForm);
                }}
              >
                <input className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs" placeholder="Name" value={inviteForm.member_name} onChange={(e) => setInviteForm((c) => ({ ...c, member_name: e.target.value }))} required />
                <input className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs" type="email" placeholder="Email" value={inviteForm.member_email} onChange={(e) => setInviteForm((c) => ({ ...c, member_email: e.target.value }))} required />
                <button className="rounded-2xl bg-moss px-3 py-2 text-xs font-bold text-white" type="submit">Invite</button>
              </form>
            </div>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">Pantry staples / custom ingredients</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.custom_ingredients.length ? profile.custom_ingredients.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full bg-fern px-3 py-1.5 text-sm font-semibold text-slate">
                    {item}
                    <button className="text-xs font-extrabold text-red-600" type="button" onClick={() => removeProfileTag("custom_ingredients", item)}>×</button>
                  </span>
                )) : <p className="text-sm text-stone-500">None yet.</p>}
              </div>
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addProfileTag("custom_ingredients", customIngredientInput, setCustomIngredientInput); }}>
                <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-moss" placeholder="Add staple (e.g. Ginger)" value={customIngredientInput} onChange={(event) => setCustomIngredientInput(event.target.value)} />
                <button className="shrink-0 rounded-2xl bg-moss px-4 py-2 text-sm font-bold text-white" type="submit">Add</button>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  function renderDashboardPanel() {
    const consumedCalories = nutrition.calorie_entries.reduce((sum, entry) => sum + Number(entry.calories || 0), 0);
    const scheduledMeals = mealPlanQuery.data?.meals ?? [];
    const topMealIdea = recommendationsQuery.data?.meal_ideas?.[0];

    return (
      <div className="space-y-6">
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
              <p className="mt-1 text-sm text-stone-500">{cartItems.length} item(s) in your shopping cart.</p>
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

        <div className="grid gap-6 md:grid-cols-3">
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Meal recommender</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">{topMealIdea ? topMealIdea.title : "Freshness-first ideas"}</h3>
            <p className="mt-2 text-sm text-stone-500">
              {topMealIdea ? `${topMealIdea.description} (~${topMealIdea.estimated_calories} cal)` : "Add pantry items for automatic meal recommendations."}
            </p>
            <button className="mt-5 rounded-2xl bg-fern px-4 py-2.5 text-sm font-extrabold text-moss transition hover:bg-stone-100" type="button" onClick={() => updateActiveTab("planner")}>
              See all ideas
            </button>
          </SectionCard>
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Weekly planner</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">{scheduledMeals.length} meals scheduled</h3>
            <p className="mt-2 text-sm text-stone-500">
              {scheduledMeals.length ? `Next up: ${scheduledMeals[0].day} — ${scheduledMeals[0].title}.` : "No meals scheduled for this week yet."}
            </p>
            <button className="mt-5 rounded-2xl bg-fern px-4 py-2.5 text-sm font-extrabold text-moss transition hover:bg-stone-100" type="button" onClick={() => updateActiveTab("planner")}>
              Open planner
            </button>
          </SectionCard>
          <SectionCard>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Daily nutrition</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate">{Math.round(consumedCalories)} / {nutrition.calorie_target} kcal</h3>
            <p className="mt-2 text-sm text-stone-500">{nutrition.calorie_entries.length} meal(s) logged today.</p>
            <button className="mt-5 rounded-2xl bg-fern px-4 py-2.5 text-sm font-extrabold text-moss transition hover:bg-stone-100" type="button" onClick={() => updateActiveTab("nutrition")}>
              View nutrition log
            </button>
          </SectionCard>
        </div>
      </div>
    );
  }

  function renderActivePanel() {
    if (activeTab === "dashboard") {
      return renderDashboardPanel();
    }
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
                {tab === "dashboard" ? "Home Dashboard" : tab}
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
          {activeTab !== "dashboard" ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/90 bg-white/90 px-6 py-5 shadow-card backdrop-blur sm:px-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-moss">Grocify</p>
                <h2 className="mt-1 text-2xl font-extrabold capitalize tracking-tight text-slate sm:text-3xl">{activeTab}</h2>
              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-bold ${saveState.includes("saved") ? "bg-emerald-50 text-emerald-700" : saveState.includes("Saving") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
                {saveState}
              </div>
            </div>
          ) : null}

          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
