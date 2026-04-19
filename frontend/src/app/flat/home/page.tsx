"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import {
  TOMORROW_ISO,
  isoDate,
  useAppStore,
  useCurrentFlatmate,
  useFlat,
  usePlanGrid,
} from "@/mock/store";
import type { MealTime, Recipe } from "@/mock/types";

const DAYS_TO_SHOW = 6;
const MEAL_ORDER: MealTime[] = ["dinner", "lunch", "breakfast"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayEntry = {
  date: string;
  offset: number;
  label: string;
  isToday: boolean;
  isPast: boolean;
  featured: { meal: MealTime; recipe: Recipe; published: boolean } | null;
};

function featuredForDay(
  grid: ReturnType<typeof usePlanGrid>,
  date: string,
  recipes: Recipe[],
): DayEntry["featured"] {
  const day = grid[date];
  if (!day) return null;
  // Prefer dinner → lunch → breakfast. Only show published.
  for (const meal of MEAL_ORDER) {
    const slot = day[meal];
    if (!slot?.recipeId) continue;
    if (slot.status !== "published") continue;
    const r = recipes.find((x) => x.id === slot.recipeId);
    if (r) return { meal, recipe: r, published: true };
  }
  return null;
}

export default function FlatHomePage() {
  const flatmate = useCurrentFlatmate();
  const flat = useFlat(flatmate?.flatId ?? null);
  const grid = usePlanGrid(flat?.id);
  const { state } = useAppStore();

  const days: DayEntry[] = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const offset = i - 1; // yesterday, today, tomorrow, …
    const date = isoDate(offset);
    const d = new Date(date);
    return {
      date,
      offset,
      label: DAY_LABELS[d.getDay()],
      isToday: offset === 0,
      isPast: offset < 0,
      featured: featuredForDay(grid, date, state.recipes),
    };
  });

  const weekRangeLabel = (() => {
    const start = new Date(days[0].date);
    const end = new Date(days[days.length - 1].date);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  return (
    <>
      <header className="glass-header sticky top-0 z-30 flex justify-between items-center w-full px-8 py-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
            The Weekly Table
          </h2>
          <p className="text-secondary text-sm italic mt-1">
            Nourishing the soul, one meal at a time.{" "}
            {flat && <span className="opacity-70">· {flat.name}</span>}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-on-surface-variant">
            <Icon name="calendar_today" className="text-primary !text-base" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {weekRangeLabel}
            </span>
          </div>
          {flatmate && (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
              <img
                src={flatmate.photo}
                alt={flatmate.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      <div className="px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {days.map((day, idx) => (
            <DayCard key={day.date} day={day} offsetClass={OFFSET[idx % OFFSET.length]} />
          ))}
        </div>

        <div className="mt-32 px-8 flex flex-col items-center text-center">
          <div className="w-px h-24 bg-outline-variant mb-8" />
          <h4 className="font-serif text-4xl text-secondary/40">
            Looking for more?
          </h4>
          <p className="text-secondary mt-4 max-w-md">
            Nothing else published yet. Send the cook a request —{" "}
            <span className="italic">har swaad ke liye kuch khaas.</span>
          </p>
        </div>
      </div>

      <Link
        href="/flat/suggestions?new=1"
        className="fixed bottom-8 right-8 flex items-center space-x-3 bg-primary text-on-primary px-8 py-5 rounded-full shadow-2xl hover:bg-primary-container hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Icon name="lightbulb" />
        <span className="uppercase tracking-widest text-xs font-bold">
          Suggest a dish
        </span>
      </Link>
    </>
  );
}

// Editorial offset pattern — mimics the mockup's bento rhythm.
const OFFSET = ["", "mt-6 lg:mt-0", "lg:translate-y-12", "md:translate-y-4", "", "lg:translate-y-8"];

function DayCard({ day, offsetClass }: { day: DayEntry; offsetClass: string }) {
  const [imgError, setImgError] = useState(false);
  const featured = day.featured;

  return (
    <div className={`relative group ${offsetClass}`}>
      {day.isToday && (
        <div className="absolute -top-6 left-0 flex items-center space-x-2 z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
            Today
          </span>
          <div className="h-px w-12 bg-primary" />
        </div>
      )}
      <div
        className={`flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-transform hover:-translate-y-1 ${
          day.isPast ? "opacity-70" : ""
        }`}
      >
        <div className="h-64 relative overflow-hidden bg-surface-container">
          {featured && !imgError ? (
            <img
              src={featured.recipe.photo}
              alt={featured.recipe.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6">
              <Icon name="hourglass_top" className="text-5xl text-outline-variant" />
              <p className="font-serif text-on-surface-variant text-center italic">
                Awaiting the cook&apos;s plan.
                <br />
                <span className="text-sm opacity-70">
                  Abhi tak koi plan nahi — let&apos;s see.
                </span>
              </p>
            </div>
          )}
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm ${
              day.isToday
                ? "bg-surface/90 text-primary"
                : "bg-surface-container-high/90 text-on-surface-variant"
            }`}
          >
            <span className="text-[10px] font-bold uppercase">{day.label}</span>
          </div>
        </div>
        <div className="p-6">
          {featured ? (
            <>
              <h3 className="font-serif text-2xl text-on-surface font-bold">
                {featured.recipe.name}
              </h3>
              <div className="mt-4 flex items-center justify-between text-secondary">
                <div className="flex items-center gap-2">
                  <Icon name="schedule" className="!text-sm" />
                  <span className="text-xs font-medium capitalize">
                    {featured.meal} · {featured.recipe.prepMinutes + featured.recipe.cookMinutes}m
                  </span>
                </div>
                <span className="text-xs italic">{featured.recipe.cuisine}</span>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-serif text-xl text-on-surface-variant font-bold">
                {day.isPast ? "Was a good day." : "To be revealed."}
              </h3>
              <p className="mt-2 text-xs text-on-surface-variant italic">
                {day.isPast
                  ? "Past days stay where they belong."
                  : "Cook will publish tomorrow's plan soon."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
