"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import {
  TODAY_ISO,
  TOMORROW_ISO,
  useAppStore,
  useCurrentCook,
  useFlatsOfCook,
} from "@/mock/store";
import type { Flat, PlanSlot } from "@/mock/types";

const FLAT_COVER_IMAGES: Record<string, string> = {
  "flat-green-park":
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "flat-bachelor-pad":
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "flat-gulmohar":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
};

type FlatStatus =
  | { kind: "published"; label: string }
  | { kind: "ready"; label: string }
  | { kind: "not_generated"; label: string };

function statusForFlat(plan: Record<string, Record<string, PlanSlot>> | undefined): FlatStatus {
  const tomorrow = plan?.[TOMORROW_ISO];
  if (!tomorrow) return { kind: "not_generated", label: "Tomorrow: not yet generated" };
  const slots = [tomorrow.breakfast, tomorrow.lunch, tomorrow.dinner];
  const allPublished = slots.every((s) => s?.status === "published");
  const allReady = slots.every((s) => s?.recipeId);
  if (allPublished) return { kind: "published", label: "Published" };
  if (allReady) return { kind: "ready", label: "Ready to publish" };
  return { kind: "not_generated", label: "Tomorrow: not yet generated" };
}

export default function CookHomePage() {
  const cook = useCurrentCook();
  const flats = useFlatsOfCook(cook?.id ?? null);

  return (
    <>
      <div className="mb-12">
        <h1 className="font-serif text-5xl font-bold text-on-surface mb-2">
          My Active Flats
        </h1>
        <p className="text-secondary font-medium italic">
          Managing service for {flats.length} residence{flats.length === 1 ? "" : "s"} today.{" "}
          <span className="opacity-70">Sab kuch set hai.</span>
        </p>
      </div>

      {flats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {flats.map((flat) => (
            <FlatCard key={flat.id} flat={flat} />
          ))}
        </div>
      ) : (
        <EmptyFlatsState />
      )}

      <div className="mt-16 bg-surface-container-low rounded-3xl p-12 flex flex-col items-center text-center border-2 border-dashed border-outline-variant/30">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <Icon name="lunch_dining" className="text-4xl text-secondary" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">
          Expanding your circle?
        </h2>
        <p className="text-secondary mb-8 max-w-md">
          Onboard a new household to the BiteBuddy experience.{" "}
          <span className="italic opacity-80">Zaroorat pade toh naya flat add karo.</span>
        </p>
        <button className="bg-tertiary text-on-tertiary px-8 py-3 rounded-full font-bold transition-all hover:bg-tertiary-container shadow-sm flex items-center gap-2">
          <Icon name="add_home" />
          Setup New Household
        </button>
      </div>
    </>
  );
}

function FlatCard({ flat }: { flat: Flat }) {
  const { state } = useAppStore();
  const plan = state.plans[flat.id];
  const status = statusForFlat(plan);
  const todayGrid = plan?.[TODAY_ISO];
  const mealRecipes = (["breakfast", "lunch", "dinner"] as const).map((m) => {
    const recipeId = todayGrid?.[m]?.recipeId;
    return recipeId ? state.recipes.find((r) => r.id === recipeId) ?? null : null;
  });

  const badgeClass =
    status.kind === "published"
      ? "bg-tertiary-container/10 text-tertiary"
      : status.kind === "ready"
      ? "bg-primary-container/10 text-primary"
      : "bg-surface-container text-on-surface-variant";
  const dotClass =
    status.kind === "published"
      ? "bg-tertiary animate-pulse"
      : status.kind === "ready"
      ? "bg-primary animate-pulse"
      : "bg-outline-variant";

  return (
    <Link
      href={`/cook/flats/${flat.id}/plan`}
      className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-soft hover:shadow-soft-hover group transition-all hover:scale-[1.01] flex flex-col"
    >
      <div className="relative h-48 w-full">
        <img
          src={FLAT_COVER_IMAGES[flat.id] ?? FLAT_COVER_IMAGES["flat-green-park"]}
          alt={flat.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <Icon name="group" className="text-sm text-secondary" />
          <span className="text-xs font-bold text-secondary">
            {flat.flatmateIds.length} Flatmate{flat.flatmateIds.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-2xl font-bold mb-4">{flat.name}</h3>
        <div className="space-y-4 mb-8">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
            Today&apos;s Menu
          </p>
          <div className="grid grid-cols-3 gap-3">
            {mealRecipes.map((recipe, i) =>
              recipe ? (
                <div key={i} className="relative group/thumb">
                  <img
                    src={recipe.photo}
                    alt={recipe.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold uppercase">
                      {(["Breakfast", "Lunch", "Dinner"] as const)[i]}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="bg-surface-container rounded-lg aspect-square flex items-center justify-center"
                >
                  <Icon name="restaurant" className="text-outline-variant" />
                </div>
              ),
            )}
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {status.label}
          </span>
          <Icon
            name="chevron_right"
            className="text-outline-variant group-hover:text-primary transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}

function EmptyFlatsState() {
  return (
    <div className="bg-surface-container-low rounded-3xl p-16 flex flex-col items-center text-center">
      <Icon name="kitchen" className="text-6xl text-secondary mb-6" />
      <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">
        No flats yet
      </h2>
      <p className="text-secondary max-w-md italic">
        Wait for a flatmate to invite you — or set up a household yourself.
      </p>
    </div>
  );
}
