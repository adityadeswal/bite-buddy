"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  useAppStore,
  useCurrentFlatmate,
  useSuggestionsFrom,
} from "@/mock/store";
import type { Recipe, Suggestion } from "@/mock/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / (60 * 60 * 1000));
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default function MySuggestionsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <MySuggestionsView />
    </Suspense>
  );
}

function MySuggestionsView() {
  const flatmate = useCurrentFlatmate();
  const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(params.get("new") === "1");
  const suggestions = useSuggestionsFrom(flatmate?.id ?? null);

  useEffect(() => {
    if (params.get("new") === "1") setSheetOpen(true);
  }, [params]);

  const pending = suggestions.filter((s) => s.status === "pending");
  const accepted = suggestions.filter((s) => s.status === "accepted");
  const declined = suggestions.filter((s) => s.status === "declined");

  return (
    <>
      <div className="p-8 md:p-12 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-on-surface mb-2 tracking-tight">
            Your Kitchen Board
          </h1>
          <p className="text-secondary font-medium tracking-tight">
            Track your recent meal requests. What&apos;s the flatmate consensus?
          </p>
        </header>

        <div className="space-y-16">
          <Section
            title="Pending Approval"
            count={pending.length}
            pillClass="text-primary bg-primary/10"
          >
            {pending.length === 0 ? (
              <EmptyHint text="Nothing pending. Send a new suggestion." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {pending.map((s) => (
                  <PendingCard key={s.id} suggestion={s} />
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Accepted"
            count={accepted.length}
            pillClass="text-tertiary bg-tertiary-fixed"
            pillLabel="Scheduled"
          >
            {accepted.length === 0 ? (
              <EmptyHint text="No accepted suggestions yet." />
            ) : (
              <div className="space-y-6">
                {accepted.map((s) => (
                  <AcceptedCard key={s.id} suggestion={s} />
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Declined"
            count={declined.length}
            pillClass="text-on-surface-variant bg-surface-container-high"
            pillLabel="Archive"
          >
            {declined.length === 0 ? (
              <EmptyHint text="Nothing declined. 🎉" />
            ) : (
              <div className="space-y-4">
                {declined.map((s) => (
                  <DeclinedRow key={s.id} suggestion={s} />
                ))}
              </div>
            )}
          </Section>

          <section className="py-20 border-t border-dashed border-outline-variant/30 text-center">
            <Icon name="flatware" className="!text-7xl text-secondary/30 mb-6" />
            <h2 className="text-3xl font-serif font-bold mb-3 italic">
              No more secrets?
            </h2>
            <p className="text-secondary max-w-md mx-auto">
              Suggest a new experimental dish to see what the chef thinks.{" "}
              <span className="italic opacity-70">
                Kitchen bilkul khali hai without your ideas.
              </span>
            </p>
          </section>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-10 right-10 bg-primary text-on-primary w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Icon name="add" className="!text-3xl" />
      </button>

      {sheetOpen && (
        <SuggestSheet onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}

function Section({
  title,
  count,
  pillClass,
  pillLabel,
  children,
}: {
  title: string;
  count: number;
  pillClass: string;
  pillLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-6">
        <h2 className="text-3xl font-serif font-bold">{title}</h2>
        <span
          className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${pillClass}`}
        >
          {pillLabel ?? `${count} request${count === 1 ? "" : "s"}`}
        </span>
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="px-6 py-10 rounded-xl bg-surface-container-low/60 text-center text-sm italic text-on-surface-variant">
      {text}
    </div>
  );
}

function PendingCard({ suggestion }: { suggestion: Suggestion }) {
  const { state } = useAppStore();
  const recipe = suggestion.recipeId
    ? state.recipes.find((r) => r.id === suggestion.recipeId) ?? null
    : null;

  return (
    <div className="flex flex-col md:flex-row bg-surface-container-low rounded-xl overflow-hidden group hover:bg-surface-container transition-colors duration-300">
      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-surface-container">
        {recipe ? (
          <img
            src={recipe.photo}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="restaurant_menu" className="text-5xl text-outline-variant" />
          </div>
        )}
      </div>
      <div className="p-6 md:w-2/3 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold mb-2">
            {suggestion.dishName}
          </h3>
          {recipe && (
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-secondary mb-4">
              <span className="flex items-center gap-1">
                <Icon name="schedule" className="!text-sm" />{" "}
                {recipe.prepMinutes + recipe.cookMinutes}m
              </span>
              <span className="flex items-center gap-1">
                <Icon name="restaurant" className="!text-sm" /> {recipe.cuisine}
              </span>
            </div>
          )}
          <p className="text-sm text-on-surface-variant italic line-clamp-2">
            &ldquo;{suggestion.note}&rdquo;
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-on-surface-variant italic">
            Requested by you · {timeAgo(suggestion.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function AcceptedCard({ suggestion }: { suggestion: Suggestion }) {
  const { state } = useAppStore();
  const recipe = suggestion.recipeId
    ? state.recipes.find((r) => r.id === suggestion.recipeId) ?? null
    : null;
  return (
    <div className="bg-surface-container-lowest border-l-4 border-tertiary rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
      <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-surface-container">
        {recipe ? (
          <img
            src={recipe.photo}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="auto_awesome" className="text-3xl text-tertiary" />
          </div>
        )}
      </div>
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <h3 className="text-2xl font-serif font-bold">{suggestion.dishName}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary text-on-tertiary w-fit mx-auto md:mx-0">
            On tomorrow&apos;s plan
          </span>
        </div>
        <p className="text-on-surface-variant max-w-xl italic">
          &ldquo;Adding a tadka to this recipe was a genius move.&rdquo; — Chef Kabir
        </p>
      </div>
    </div>
  );
}

function DeclinedRow({ suggestion }: { suggestion: Suggestion }) {
  const { state } = useAppStore();
  const recipe = suggestion.recipeId
    ? state.recipes.find((r) => r.id === suggestion.recipeId) ?? null
    : null;
  return (
    <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-colors group">
      <div className="w-16 h-16 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all bg-surface-container">
        {recipe ? (
          <img
            src={recipe.photo}
            alt={recipe.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="block" className="text-2xl text-outline-variant" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-serif font-bold text-on-surface-variant truncate">
          {suggestion.dishName}
        </h3>
        {suggestion.declineReason ? (
          <div className="flex items-start gap-2 mt-1">
            <Icon name="chat_bubble" className="!text-sm text-error mt-0.5" />
            <p className="text-sm text-on-surface-variant leading-tight">
              <span className="font-bold text-error">Note from Cook:</span>{" "}
              {suggestion.declineReason}
            </p>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant italic">
            Declined · no reason given.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suggest-a-dish sheet
// ---------------------------------------------------------------------------
function SuggestSheet({ onClose }: { onClose: () => void }) {
  const flatmate = useCurrentFlatmate();
  const { state, createSuggestion } = useAppStore();
  const recipes = state.recipes;

  const [tab, setTab] = useState<"library" | "free">("library");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Recipe | null>(null);
  const [note, setNote] = useState("");
  const [freeName, setFreeName] = useState("");
  const [tag, setTag] = useState<Suggestion["tag"]>("comfort");

  const filtered = useMemo(
    () =>
      query
        ? recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
        : recipes.slice(0, 10),
    [query, recipes],
  );

  if (!flatmate?.flatId) {
    return null;
  }

  const submit = () => {
    if (tab === "library") {
      if (!picked) return;
      createSuggestion({
        flatId: flatmate.flatId!,
        fromFlatmateId: flatmate.id,
        recipeId: picked.id,
        dishName: picked.name,
        note: note || "Requested by flatmate",
        tag,
      });
    } else {
      if (!freeName.trim()) return;
      createSuggestion({
        flatId: flatmate.flatId!,
        fromFlatmateId: flatmate.id,
        recipeId: null,
        dishName: freeName.trim(),
        note: note || "Cook's call!",
        tag,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-t-3xl md:rounded-xl w-full md:max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-outline-variant/20 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-serif font-bold">Suggest a dish</h3>
            <p className="text-sm text-on-surface-variant italic mt-1">
              Tell the cook what you&apos;re craving.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container-low rounded-full text-on-surface-variant"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex border-b border-outline-variant/20">
          <TabBtn active={tab === "library"} onClick={() => setTab("library")}>
            From library
          </TabBtn>
          <TabBtn active={tab === "free"} onClick={() => setTab("free")}>
            Surprise me / free-text
          </TabBtn>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "library" ? (
            <>
              <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 mb-4">
                <Icon name="search" className="text-on-surface-variant mr-2" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by dish name…"
                  className="bg-transparent border-none outline-none w-full text-sm"
                />
              </div>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {filtered.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setPicked(r)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        picked?.id === r.id
                          ? "bg-primary/10 ring-1 ring-primary"
                          : "hover:bg-surface-container-low"
                      }`}
                    >
                      <img
                        src={r.photo}
                        alt={r.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-serif font-bold text-on-surface">
                          {r.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {r.cuisine} · {r.mealTime}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                  Dish name
                </span>
                <input
                  autoFocus
                  value={freeName}
                  onChange={(e) => setFreeName(e.target.value)}
                  placeholder="e.g. Surprise Me! / Paneer something"
                  className="w-full mt-2 bg-surface-container-low rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Your note (optional)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bhai, need something light after gym…"
                className="w-full mt-2 bg-surface-container-low rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/30 h-20 text-sm"
              />
            </label>
            <div>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Vibe
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["healthy", "spicy", "comfort", "surprise"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                      tag === t
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-low"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={tab === "library" ? !picked : !freeName.trim()}
            className="px-8 py-2 rounded-full bg-primary text-on-primary text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to cook
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "text-primary border-b-2 border-primary"
          : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}
