"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED, TODAY_ISO, TOMORROW_ISO, isoDate } from "./seed";
import type {
  AppState,
  Cook,
  Flat,
  Flatmate,
  MealTime,
  Persona,
  PlanGrid,
  PlanSlot,
  Recipe,
  Suggestion,
  SuggestionStatus,
} from "./types";

const STORAGE_KEY = "bb:appstate:v1";

function loadInitial(): AppState {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as AppState;
    // Minimal integrity check — if seed shape drifts, reset.
    if (!parsed.cooks || !parsed.flats || !parsed.recipes) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

type MealSuggestionInput = {
  flatId: string;
  fromFlatmateId: string;
  recipeId: string | null;
  dishName: string;
  note: string;
  tag: Suggestion["tag"];
};

interface AppStore {
  state: AppState;
  reset: () => void;
  // Persona
  signIn: (persona: Persona) => void;
  signOut: () => void;
  // Flatmate updates
  upsertFlatmate: (fm: Flatmate) => void;
  updateFlatmate: (id: string, patch: Partial<Flatmate>) => void;
  // Cook updates
  upsertCook: (cook: Cook) => void;
  updateCook: (id: string, patch: Partial<Cook>) => void;
  // Flats
  joinFlatByInvite: (code: string, flatmateId: string) => Flat | null;
  createFlat: (flat: Omit<Flat, "inviteCode"> & { inviteCode?: string }) => Flat;
  leaveFlat: (flatmateId: string) => void;
  // Plan ops
  getTomorrowSlot: (flatId: string, meal: MealTime) => PlanSlot;
  setSlotRecipe: (flatId: string, date: string, meal: MealTime, recipeId: string) => void;
  regenerateSlot: (flatId: string, date: string, meal: MealTime) => void;
  toggleFreezeSlot: (flatId: string, date: string, meal: MealTime) => void;
  generateTomorrow: (flatId: string) => void;
  publishTomorrow: (flatId: string) => void;
  // Recipes
  addRecipe: (recipe: Recipe) => void;
  // Suggestions
  createSuggestion: (input: MealSuggestionInput) => Suggestion;
  acceptSuggestion: (id: string) => void;
  declineSuggestion: (id: string, reason?: string) => void;
}

const Ctx = createContext<AppStore | null>(null);

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function emptySlot(): PlanSlot {
  return { recipeId: null, isFrozen: false, status: "not_generated" };
}

function ensureDay(plan: PlanGrid, date: string): PlanGrid {
  if (plan[date]) return plan;
  return {
    ...plan,
    [date]: { breakfast: emptySlot(), lunch: emptySlot(), dinner: emptySlot() },
  };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(SEED);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setState(loadInitial());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(SEED);
  }, []);

  const signIn = useCallback((persona: Persona) => {
    setState((s) => ({ ...s, persona }));
  }, []);

  const signOut = useCallback(() => {
    setState((s) => ({ ...s, persona: null }));
  }, []);

  const upsertFlatmate = useCallback((fm: Flatmate) => {
    setState((s) => {
      const idx = s.flatmates.findIndex((x) => x.id === fm.id);
      const next = [...s.flatmates];
      if (idx >= 0) next[idx] = fm;
      else next.push(fm);
      return { ...s, flatmates: next };
    });
  }, []);

  const updateFlatmate = useCallback((id: string, patch: Partial<Flatmate>) => {
    setState((s) => ({
      ...s,
      flatmates: s.flatmates.map((fm) => (fm.id === id ? { ...fm, ...patch } : fm)),
    }));
  }, []);

  const upsertCook = useCallback((cook: Cook) => {
    setState((s) => {
      const idx = s.cooks.findIndex((x) => x.id === cook.id);
      const next = [...s.cooks];
      if (idx >= 0) next[idx] = cook;
      else next.push(cook);
      return { ...s, cooks: next };
    });
  }, []);

  const updateCook = useCallback((id: string, patch: Partial<Cook>) => {
    setState((s) => ({
      ...s,
      cooks: s.cooks.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const joinFlatByInvite = useCallback(
    (code: string, flatmateId: string): Flat | null => {
      let joined: Flat | null = null;
      setState((s) => {
        const flat = s.flats.find(
          (f) => f.inviteCode.toUpperCase() === code.trim().toUpperCase(),
        );
        if (!flat) return s;
        joined = flat;
        const flatmateIds = flat.flatmateIds.includes(flatmateId)
          ? flat.flatmateIds
          : [...flat.flatmateIds, flatmateId];
        return {
          ...s,
          flats: s.flats.map((f) =>
            f.id === flat.id ? { ...f, flatmateIds } : f,
          ),
          flatmates: s.flatmates.map((fm) =>
            fm.id === flatmateId ? { ...fm, flatId: flat.id } : fm,
          ),
        };
      });
      return joined;
    },
    [],
  );

  const createFlat = useCallback(
    (flat: Omit<Flat, "inviteCode"> & { inviteCode?: string }): Flat => {
      const code =
        flat.inviteCode ??
        `BB-${flat.name
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 4)
          .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newFlat: Flat = { ...flat, inviteCode: code };
      setState((s) => ({ ...s, flats: [...s.flats, newFlat] }));
      return newFlat;
    },
    [],
  );

  const leaveFlat = useCallback((flatmateId: string) => {
    setState((s) => ({
      ...s,
      flats: s.flats.map((f) => ({
        ...f,
        flatmateIds: f.flatmateIds.filter((id) => id !== flatmateId),
      })),
      flatmates: s.flatmates.map((fm) =>
        fm.id === flatmateId ? { ...fm, flatId: null } : fm,
      ),
    }));
  }, []);

  const getTomorrowSlot = useCallback(
    (flatId: string, meal: MealTime): PlanSlot => {
      const grid = state.plans[flatId] ?? {};
      return grid[TOMORROW_ISO]?.[meal] ?? emptySlot();
    },
    [state.plans],
  );

  const setSlotInGrid = (
    plans: AppState["plans"],
    flatId: string,
    date: string,
    meal: MealTime,
    slot: PlanSlot,
  ): AppState["plans"] => {
    const grid = ensureDay(plans[flatId] ?? {}, date);
    return {
      ...plans,
      [flatId]: {
        ...grid,
        [date]: { ...grid[date], [meal]: slot },
      },
    };
  };

  const setSlotRecipe = useCallback(
    (flatId: string, date: string, meal: MealTime, recipeId: string) => {
      setState((s) => ({
        ...s,
        plans: setSlotInGrid(s.plans, flatId, date, meal, {
          recipeId,
          isFrozen: s.plans[flatId]?.[date]?.[meal]?.isFrozen ?? false,
          status: "ready",
        }),
      }));
    },
    [],
  );

  const regenerateSlot = useCallback(
    (flatId: string, date: string, meal: MealTime) => {
      setState((s) => {
        const slot = s.plans[flatId]?.[date]?.[meal];
        if (slot?.isFrozen) return s; // frozen slots are immutable
        const pool = s.recipes.filter((r) => r.mealTime === meal);
        if (pool.length === 0) return s;
        const chosen = randomPick(pool);
        return {
          ...s,
          plans: setSlotInGrid(s.plans, flatId, date, meal, {
            recipeId: chosen.id,
            isFrozen: false,
            status: "ready",
          }),
        };
      });
    },
    [],
  );

  const toggleFreezeSlot = useCallback(
    (flatId: string, date: string, meal: MealTime) => {
      setState((s) => {
        const slot = s.plans[flatId]?.[date]?.[meal] ?? emptySlot();
        return {
          ...s,
          plans: setSlotInGrid(s.plans, flatId, date, meal, {
            ...slot,
            isFrozen: !slot.isFrozen,
          }),
        };
      });
    },
    [],
  );

  const generateTomorrow = useCallback((flatId: string) => {
    setState((s) => {
      const grid = ensureDay(s.plans[flatId] ?? {}, TOMORROW_ISO);
      const meals: MealTime[] = ["breakfast", "lunch", "dinner"];
      let next = grid;
      for (const meal of meals) {
        const current = next[TOMORROW_ISO][meal];
        if (current.isFrozen) continue;
        const pool = s.recipes.filter((r) => r.mealTime === meal);
        if (pool.length === 0) continue;
        const chosen = randomPick(pool);
        next = {
          ...next,
          [TOMORROW_ISO]: {
            ...next[TOMORROW_ISO],
            [meal]: { recipeId: chosen.id, isFrozen: false, status: "ready" },
          },
        };
      }
      return { ...s, plans: { ...s.plans, [flatId]: next } };
    });
  }, []);

  const publishTomorrow = useCallback((flatId: string) => {
    setState((s) => {
      const grid = s.plans[flatId]?.[TOMORROW_ISO];
      if (!grid) return s;
      const meals: MealTime[] = ["breakfast", "lunch", "dinner"];
      const allFilled = meals.every((m) => grid[m].recipeId);
      if (!allFilled) return s;
      const published: typeof grid = {
        breakfast: { ...grid.breakfast, status: "published" },
        lunch: { ...grid.lunch, status: "published" },
        dinner: { ...grid.dinner, status: "published" },
      };
      return {
        ...s,
        plans: {
          ...s.plans,
          [flatId]: { ...s.plans[flatId], [TOMORROW_ISO]: published },
        },
      };
    });
  }, []);

  const addRecipe = useCallback((recipe: Recipe) => {
    setState((s) => ({ ...s, recipes: [recipe, ...s.recipes] }));
  }, []);

  const createSuggestion = useCallback((input: MealSuggestionInput): Suggestion => {
    const sug: Suggestion = {
      id: `sug-${Date.now()}`,
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, suggestions: [sug, ...s.suggestions] }));
    return sug;
  }, []);

  const acceptSuggestion = useCallback((id: string) => {
    setState((s) => {
      const sug = s.suggestions.find((x) => x.id === id);
      if (!sug) return s;
      const recipe = sug.recipeId
        ? s.recipes.find((r) => r.id === sug.recipeId)
        : null;

      let plans = s.plans;
      if (recipe) {
        // Slot into tomorrow at the recipe's mealTime (if not frozen)
        const current =
          s.plans[sug.flatId]?.[TOMORROW_ISO]?.[recipe.mealTime] ?? emptySlot();
        if (!current.isFrozen) {
          plans = setSlotInGrid(s.plans, sug.flatId, TOMORROW_ISO, recipe.mealTime, {
            recipeId: recipe.id,
            isFrozen: false,
            status: "ready",
          });
        }
      }

      return {
        ...s,
        plans,
        suggestions: s.suggestions.map((x) =>
          x.id === id ? { ...x, status: "accepted" as SuggestionStatus } : x,
        ),
      };
    });
  }, []);

  const declineSuggestion = useCallback((id: string, reason?: string) => {
    setState((s) => ({
      ...s,
      suggestions: s.suggestions.map((x) =>
        x.id === id
          ? { ...x, status: "declined" as SuggestionStatus, declineReason: reason }
          : x,
      ),
    }));
  }, []);

  const api = useMemo<AppStore>(
    () => ({
      state,
      reset,
      signIn,
      signOut,
      upsertFlatmate,
      updateFlatmate,
      upsertCook,
      updateCook,
      joinFlatByInvite,
      createFlat,
      leaveFlat,
      getTomorrowSlot,
      setSlotRecipe,
      regenerateSlot,
      toggleFreezeSlot,
      generateTomorrow,
      publishTomorrow,
      addRecipe,
      createSuggestion,
      acceptSuggestion,
      declineSuggestion,
    }),
    [
      state,
      reset,
      signIn,
      signOut,
      upsertFlatmate,
      updateFlatmate,
      upsertCook,
      updateCook,
      joinFlatByInvite,
      createFlat,
      leaveFlat,
      getTomorrowSlot,
      setSlotRecipe,
      regenerateSlot,
      toggleFreezeSlot,
      generateTomorrow,
      publishTomorrow,
      addRecipe,
      createSuggestion,
      acceptSuggestion,
      declineSuggestion,
    ],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

// Convenience selector hooks --------------------------------------------------
export function usePersona(): Persona {
  return useAppStore().state.persona;
}

export function useCurrentFlatmate(): Flatmate | null {
  const { state } = useAppStore();
  const persona = state.persona;
  if (!persona || persona.type !== "flatmate") return null;
  return state.flatmates.find((f) => f.id === persona.flatmateId) ?? null;
}

export function useCurrentCook(): Cook | null {
  const { state } = useAppStore();
  const persona = state.persona;
  if (!persona || persona.type !== "cook") return null;
  return state.cooks.find((c) => c.id === persona.cookId) ?? null;
}

export function useFlat(flatId: string | null | undefined): Flat | null {
  const { state } = useAppStore();
  if (!flatId) return null;
  return state.flats.find((f) => f.id === flatId) ?? null;
}

export function useRecipe(recipeId: string | null | undefined): Recipe | null {
  const { state } = useAppStore();
  if (!recipeId) return null;
  return state.recipes.find((r) => r.id === recipeId) ?? null;
}

export function useFlatmatesOf(flatId: string | null | undefined): Flatmate[] {
  const { state } = useAppStore();
  if (!flatId) return [];
  return state.flatmates.filter((f) => f.flatId === flatId);
}

export function useFlatsOfCook(cookId: string | null | undefined): Flat[] {
  const { state } = useAppStore();
  if (!cookId) return [];
  return state.flats.filter((f) => f.cookId === cookId);
}

export function useSuggestionsForFlat(flatId: string | null): Suggestion[] {
  const { state } = useAppStore();
  if (!flatId) return [];
  return state.suggestions.filter((s) => s.flatId === flatId);
}

export function useSuggestionsForCook(cookId: string | null): Suggestion[] {
  const { state } = useAppStore();
  if (!cookId) return [];
  const cookFlatIds = state.flats.filter((f) => f.cookId === cookId).map((f) => f.id);
  return state.suggestions.filter((s) => cookFlatIds.includes(s.flatId));
}

export function useSuggestionsFrom(flatmateId: string | null): Suggestion[] {
  const { state } = useAppStore();
  if (!flatmateId) return [];
  return state.suggestions.filter((s) => s.fromFlatmateId === flatmateId);
}

export function usePlanGrid(flatId: string | null | undefined): PlanGrid {
  const { state } = useAppStore();
  if (!flatId) return {};
  return state.plans[flatId] ?? {};
}

// Preferences summary — used by cook Tomorrow's Plan sidebar.
export function usePreferencesSummary(flatId: string | null | undefined) {
  const flatmates = useFlatmatesOf(flatId);
  if (flatmates.length === 0) return null;
  const veg = flatmates.filter((f) => f.dietType === "veg").length;
  const nonVeg = flatmates.filter((f) => f.dietType === "non_veg").length;
  const egg = flatmates.filter((f) => f.dietType === "egg").length;
  const allergies = Array.from(new Set(flatmates.flatMap((f) => f.allergies)));
  const dislikes = Array.from(new Set(flatmates.flatMap((f) => f.dislikes)));
  const cuisines = Array.from(new Set(flatmates.flatMap((f) => f.cuisines)));
  const spiceMap: Record<string, number> = { mild: 1, medium: 2, spicy: 3, extra_spicy: 4 };
  const avgSpice =
    flatmates.reduce((acc, f) => acc + (spiceMap[f.spiceTolerance] ?? 2), 0) /
    flatmates.length;
  const spiceLabel =
    avgSpice < 1.5 ? "mild" : avgSpice < 2.5 ? "medium" : avgSpice < 3.5 ? "spicy" : "extra-spicy";
  return {
    totalFlatmates: flatmates.length,
    veg,
    nonVeg,
    egg,
    allergies,
    dislikes,
    cuisines,
    spiceLabel,
  };
}

export { TODAY_ISO, TOMORROW_ISO, isoDate };
