"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { useAppStore } from "@/mock/store";
import type { MealTime } from "@/mock/types";

const MEAL_FILTERS: (MealTime | "all")[] = ["all", "breakfast", "lunch", "dinner"];

export default function CookRecipesPage() {
  const { state } = useAppStore();
  const [query, setQuery] = useState("");
  const [meal, setMeal] = useState<MealTime | "all">("all");

  const filtered = state.recipes.filter((r) => {
    if (meal !== "all" && r.mealTime !== meal) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <header className="glass-header sticky top-0 z-30 px-8 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
            Recipe Manuscript
          </h2>
          <p className="text-secondary text-sm italic mt-1">
            Your private library of tried-and-true dishes.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary rounded-full px-5 py-2.5 font-bold text-sm hover:bg-primary-container transition-all">
          <Icon name="add" className="!text-base" />
          Add New Tadka
        </button>
      </header>

      <div className="px-8 mt-8 max-w-6xl">
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="flex-1 min-w-[240px] relative">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant !text-base"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by dish, cuisine, or tag…"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex gap-2">
            {MEAL_FILTERS.map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className={
                  meal === m
                    ? "px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-widest"
                    : "px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-primary"
                }
              >
                {m === "all" ? "All" : m}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-soft p-12 text-center">
            <Icon
              name="menu_book"
              className="!text-5xl text-outline-variant mb-3"
            />
            <p className="font-serif text-xl text-on-surface-variant">
              No dishes match that filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <article
                key={r.id}
                className="bg-surface-container-lowest rounded-xl shadow-soft overflow-hidden hover:shadow-soft-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="h-44 bg-surface-container overflow-hidden">
                  <img
                    src={r.photo}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-on-surface">
                      {r.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                      {r.cookCount}× cooked
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant italic mt-1">
                    {r.cuisine} · {r.mealTime}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Icon name="schedule" className="!text-sm" />
                      {r.prepMinutes + r.cookMinutes}m
                    </span>
                    <span>{r.calories} cal</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
