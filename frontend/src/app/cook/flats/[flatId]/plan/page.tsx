"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  TOMORROW_ISO,
  useAppStore,
  useFlat,
  usePreferencesSummary,
} from "@/mock/store";
import type { MealTime, Recipe } from "@/mock/types";

const MEALS: MealTime[] = ["breakfast", "lunch", "dinner"];
const MEAL_LABEL: Record<MealTime, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export default function TomorrowPlanPage() {
  const { flatId } = useParams<{ flatId: string }>();
  const flat = useFlat(flatId);
  const summary = usePreferencesSummary(flatId);
  const { state, generateTomorrow, publishTomorrow, regenerateSlot, toggleFreezeSlot, setSlotRecipe } =
    useAppStore();

  const grid = state.plans[flatId]?.[TOMORROW_ISO];
  const canPublish = MEALS.every((m) => grid?.[m]?.recipeId);
  const allEmpty = MEALS.every((m) => !grid?.[m]?.recipeId);
  const alreadyPublished = MEALS.every((m) => grid?.[m]?.status === "published");

  const recipesByMeal = useMemo(() => {
    const map: Record<MealTime, Recipe[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };
    for (const r of state.recipes) map[r.mealTime].push(r);
    return map;
  }, [state.recipes]);

  const [overrideMeal, setOverrideMeal] = useState<MealTime | null>(null);

  const tomorrowDate = useMemo(() => new Date(TOMORROW_ISO), []);
  const formattedDate = tomorrowDate.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!flat) {
    return <p className="text-on-surface-variant">Flat not found.</p>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant/70 mb-2">
            {flat.name}
          </p>
          <h1 className="text-4xl font-serif font-bold text-on-surface tracking-tight">
            Tomorrow&apos;s Plan
          </h1>
          <p className="text-on-surface-variant mt-1">
            {formattedDate} · <span className="italic">Cook Mode</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {allEmpty ? (
            <button
              onClick={() => generateTomorrow(flatId)}
              className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2"
            >
              <Icon name="auto_awesome" />
              Generate tomorrow
            </button>
          ) : (
            <button
              onClick={() => generateTomorrow(flatId)}
              className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-semibold hover:bg-surface-container-highest transition-all flex items-center gap-2"
            >
              <Icon name="refresh" />
              Regenerate all
            </button>
          )}
          <button
            onClick={() => publishTomorrow(flatId)}
            disabled={!canPublish || alreadyPublished}
            className="px-8 py-3 bg-tertiary text-on-tertiary rounded-full font-bold shadow-lg shadow-tertiary/20 hover:bg-tertiary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {alreadyPublished ? "Published ✓" : "Publish to Flatmates"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Preferences Summary (sticky left) */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15">
              <h3 className="font-serif text-xl font-bold mb-6 text-on-surface">
                Preferences Summary
              </h3>
              {summary ? (
                <div className="space-y-5">
                  <SummaryRow
                    icon="groups"
                    accent="tertiary"
                    primary={`${summary.totalFlatmates} Flatmate${summary.totalFlatmates === 1 ? "" : "s"}`}
                    secondary="Active for tomorrow"
                  />
                  <SummaryRow
                    icon="eco"
                    accent="primary"
                    primary={`${summary.veg} Veg · ${summary.nonVeg} Non-Veg${summary.egg ? ` · ${summary.egg} Egg-itarian` : ""}`}
                    secondary="Prioritising green labels"
                  />
                  {summary.allergies.length > 0 && (
                    <SummaryRow
                      icon="warning"
                      accent="neutral"
                      primary={`Allergies: ${summary.allergies.join(", ")}`}
                      secondary="Strict restriction"
                    />
                  )}
                  {summary.dislikes.length > 0 && (
                    <SummaryRow
                      icon="block"
                      accent="neutral"
                      primary={`No: ${summary.dislikes.join(", ")}`}
                      secondary="Dislike list"
                    />
                  )}
                  <SummaryRow
                    icon="local_fire_department"
                    accent="primary"
                    primary={`Spice: ${summary.spiceLabel}`}
                    secondary="House average"
                  />
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">No flatmates yet.</p>
              )}
              <div className="mt-8 p-4 bg-tertiary/5 rounded-lg border-l-4 border-tertiary">
                <p className="text-xs italic text-tertiary font-bold uppercase tracking-widest">
                  Chef&apos;s Note
                </p>
                <p className="text-sm text-on-surface-variant mt-1 italic">
                  &ldquo;Keeping spice low for the mild palates.{" "}
                  <span className="opacity-70">Mirchi kam rakhna hai.</span>&rdquo;
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Meal cards */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
          {MEALS.map((meal) => {
            const slot = grid?.[meal];
            const recipe = slot?.recipeId
              ? state.recipes.find((r) => r.id === slot.recipeId)
              : null;
            return (
              <MealCard
                key={meal}
                meal={meal}
                recipe={recipe ?? null}
                frozen={slot?.isFrozen ?? false}
                published={slot?.status === "published"}
                onRegenerate={() => regenerateSlot(flatId, TOMORROW_ISO, meal)}
                onToggleFreeze={() => toggleFreezeSlot(flatId, TOMORROW_ISO, meal)}
                onOverride={() => setOverrideMeal(meal)}
              />
            );
          })}
        </div>
      </div>

      {/* Override picker */}
      {overrideMeal && (
        <OverridePicker
          meal={overrideMeal}
          recipes={recipesByMeal[overrideMeal]}
          onPick={(recipeId) => {
            setSlotRecipe(flatId, TOMORROW_ISO, overrideMeal, recipeId);
            setOverrideMeal(null);
          }}
          onClose={() => setOverrideMeal(null)}
        />
      )}
    </>
  );
}

function SummaryRow({
  icon,
  accent,
  primary,
  secondary,
}: {
  icon: string;
  accent: "primary" | "tertiary" | "neutral";
  primary: string;
  secondary: string;
}) {
  const bubble =
    accent === "primary"
      ? "bg-primary/10 text-primary"
      : accent === "tertiary"
      ? "bg-tertiary/10 text-tertiary"
      : "bg-surface-container-high text-on-surface-variant";
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bubble}`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface leading-tight">{primary}</p>
        <p className="text-xs text-on-surface-variant">{secondary}</p>
      </div>
    </div>
  );
}

function MealCard({
  meal,
  recipe,
  frozen,
  published,
  onRegenerate,
  onToggleFreeze,
  onOverride,
}: {
  meal: MealTime;
  recipe: Recipe | null;
  frozen: boolean;
  published: boolean;
  onRegenerate: () => void;
  onToggleFreeze: () => void;
  onOverride: () => void;
}) {
  return (
    <article className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-soft border border-outline-variant/10 flex h-80 transition-all duration-300 hover:translate-y-[-4px]">
      <div className="w-2/5 relative overflow-hidden bg-surface-container">
        {recipe ? (
          <img
            src={recipe.photo}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <Icon name="restaurant" className="text-5xl text-outline-variant" />
            <p className="font-serif text-on-surface-variant">
              Nothing cooking yet.
              <br />
              <span className="italic text-sm opacity-70">Kitchen bilkul khali hai.</span>
            </p>
          </div>
        )}
        <div className="absolute top-4 left-4 px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface shadow-sm flex items-center gap-1">
          {frozen && <Icon name="lock" className="!text-sm text-tertiary" />}
          {MEAL_LABEL[meal]}
        </div>
        {published && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-tertiary text-on-tertiary rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary" />
            Published
          </div>
        )}
      </div>
      <div className="w-3/5 p-8 flex flex-col justify-between">
        {recipe ? (
          <>
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-on-surface">
                    {recipe.name}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant/70 mt-1">
                    {recipe.cuisine}
                  </p>
                </div>
                <div className="flex gap-1">
                  <IconBtn
                    name="refresh"
                    onClick={onRegenerate}
                    hover="text-primary"
                    title="Regenerate"
                    disabled={frozen}
                  />
                  <IconBtn
                    name={frozen ? "lock" : "lock_open"}
                    onClick={onToggleFreeze}
                    hover="text-tertiary"
                    title={frozen ? "Unfreeze" : "Freeze"}
                    active={frozen}
                  />
                  <IconBtn
                    name="edit"
                    onClick={onOverride}
                    hover="text-on-surface"
                    title="Override"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={
                      tag.toLowerCase() === "veg"
                        ? "px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold rounded-full"
                        : "px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold rounded-full"
                    }
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-on-surface-variant italic leading-snug">
                {recipe.chefNote}
              </p>
            </div>
            <div className="flex justify-between items-end border-t border-outline-variant/15 pt-4">
              <div className="flex gap-4 text-sm text-on-surface-variant font-medium">
                <span className="flex items-center gap-1">
                  <Icon name="schedule" className="!text-base" />{" "}
                  {recipe.prepMinutes + recipe.cookMinutes} mins
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="local_fire_department" className="!text-base" />{" "}
                  {recipe.calories} cal
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full gap-5 text-center">
            <p className="text-on-surface-variant max-w-xs">
              Pick a {MEAL_LABEL[meal].toLowerCase()} based on the flatmates&apos; mood or regenerate.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-container transition-all"
              >
                <Icon name="auto_awesome" />
                Auto-Generate
              </button>
              <button
                onClick={onOverride}
                className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-semibold hover:bg-surface-container-highest transition-all"
              >
                <Icon name="edit" />
                Pick manually
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function IconBtn({
  name,
  onClick,
  hover,
  title,
  disabled,
  active,
}: {
  name: string;
  onClick: () => void;
  hover: string;
  title: string;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-tertiary/10 text-tertiary"
          : `text-on-surface-variant hover:bg-surface-container hover:${hover}`
      }`}
    >
      <Icon name={name} />
    </button>
  );
}

function OverridePicker({
  meal,
  recipes,
  onPick,
  onClose,
}: {
  meal: MealTime;
  recipes: Recipe[];
  onPick: (recipeId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    : recipes;

  return (
    <div
      className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-outline-variant/20">
          <h3 className="text-2xl font-serif font-bold">
            Override {MEAL_LABEL[meal]}
          </h3>
          <div className="mt-3 flex items-center bg-surface-container-low rounded-full px-4 py-2">
            <Icon name="search" className="text-on-surface-variant mr-2" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a dish name…"
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-on-surface-variant italic">
              No matches. Create a new recipe to add to the library.
            </p>
          ) : (
            <ul>
              {filtered.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => onPick(r.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors text-left"
                  >
                    <img
                      src={r.photo}
                      alt={r.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-serif font-bold text-on-surface">{r.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {r.cuisine} · {r.prepMinutes + r.cookMinutes} mins
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
