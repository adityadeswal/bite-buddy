"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  useAppStore,
  useCurrentCook,
  useSuggestionsForCook,
} from "@/mock/store";
import type { Suggestion } from "@/mock/types";

const TAG_TO_ICON: Record<Suggestion["tag"], { icon: string; accent: string }> = {
  healthy: { icon: "bolt", accent: "bg-tertiary text-on-tertiary" },
  spicy: {
    icon: "local_fire_department",
    accent: "bg-primary text-on-primary",
  },
  comfort: { icon: "restaurant", accent: "bg-secondary text-on-secondary" },
  surprise: { icon: "auto_awesome", accent: "bg-primary text-on-primary" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / (60 * 60 * 1000));
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default function SuggestionsInboxPage() {
  const cook = useCurrentCook();
  const all = useSuggestionsForCook(cook?.id ?? null);
  const pending = all.filter((s) => s.status === "pending");
  const { state, acceptSuggestion, declineSuggestion } = useAppStore();

  const grouped = useMemo(() => {
    const map = new Map<string, Suggestion[]>();
    for (const s of pending) {
      const list = map.get(s.flatId) ?? [];
      list.push(s);
      map.set(s.flatId, list);
    }
    return Array.from(map.entries()).map(([flatId, items]) => ({
      flatId,
      items,
      flatName: state.flats.find((f) => f.id === flatId)?.name ?? flatId,
    }));
  }, [pending, state.flats]);

  const [declineTarget, setDeclineTarget] = useState<Suggestion | null>(null);

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-on-surface tracking-tight">
          Suggestions Inbox
        </h1>
        <p className="text-on-surface-variant italic mt-1">
          See what your flatmates are craving.{" "}
          <span className="opacity-80">Kuch naya try karein?</span>
        </p>
      </div>

      {grouped.length === 0 && (
        <div className="bg-surface-container-low rounded-3xl p-16 flex flex-col items-center text-center">
          <Icon name="inbox" className="text-6xl text-secondary mb-6" />
          <h2 className="font-serif text-2xl font-bold text-on-surface mb-2">
            No pending requests
          </h2>
          <p className="text-on-surface-variant italic max-w-md">
            Inbox zero, boss. Flatmates haven&apos;t asked for anything.
          </p>
        </div>
      )}

      <div className="space-y-12">
        {grouped.map(({ flatId, flatName, items }) => (
          <section key={flatId}>
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold italic font-serif text-tertiary">
                {flatName}
              </h2>
              <span className="text-xs font-medium tracking-tighter text-on-surface-variant/70 uppercase">
                {items.length} new request{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-4">
              {items.map((s) => {
                const fromFlatmate = state.flatmates.find(
                  (f) => f.id === s.fromFlatmateId,
                );
                const recipe = s.recipeId
                  ? state.recipes.find((r) => r.id === s.recipeId)
                  : null;
                const tag = TAG_TO_ICON[s.tag];
                return (
                  <div
                    key={s.id}
                    className="group flex items-center justify-between gap-6 p-6 bg-surface-container-lowest rounded-xl shadow-soft hover:shadow-soft-hover transition-all border border-transparent hover:border-outline-variant/10"
                  >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        {recipe ? (
                          <img
                            src={recipe.photo}
                            alt={recipe.name}
                            className="h-full w-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="h-full w-full bg-surface-container-low rounded-xl flex items-center justify-center">
                            <Icon
                              name="restaurant_menu"
                              className="text-4xl text-outline-variant"
                            />
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-2 -right-2 ${tag.accent} p-1 rounded-full border-2 border-surface-container-lowest`}
                        >
                          <Icon name={tag.icon} className="!text-xs" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                            {fromFlatmate?.name ?? "A flatmate"}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/60">
                            · {timeAgo(s.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold font-serif mt-1 truncate">
                          {s.dishName}
                        </h3>
                        <p className="text-sm text-on-surface-variant italic truncate">
                          &ldquo;{s.note}&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => setDeclineTarget(s)}
                        className="px-6 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant text-sm font-medium hover:bg-error/5 hover:text-error hover:border-error transition-all"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => acceptSuggestion(s.id)}
                        className="px-8 py-2 rounded-full bg-tertiary text-on-tertiary text-sm font-bold shadow-lg shadow-tertiary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {s.tag === "surprise" ? "Pick for Me" : "Accept & Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Chef's Note FAB */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 items-end z-40">
        <div className="bg-surface-container-lowest/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-outline-variant/10 max-w-xs">
          <p className="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-1">
            Chef&apos;s Note
          </p>
          <p className="text-xs text-on-surface-variant italic leading-relaxed">
            Accepting a suggestion slots it into tomorrow&apos;s plan in one click.{" "}
            <span className="opacity-80">Efficiency, boss!</span>
          </p>
        </div>
      </div>

      {declineTarget && (
        <DeclineModal
          suggestion={declineTarget}
          onClose={() => setDeclineTarget(null)}
          onSubmit={(reason) => {
            declineSuggestion(declineTarget.id, reason);
            setDeclineTarget(null);
          }}
        />
      )}
    </>
  );
}

function DeclineModal({
  suggestion,
  onClose,
  onSubmit,
}: {
  suggestion: Suggestion;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl p-8 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-2xl font-serif font-bold mb-2">Why decline?</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Declining &ldquo;{suggestion.dishName}&rdquo;. Tell them why (optional).
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Too expensive? Ingredients not on hand? Let them know…"
          className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 mb-6 h-32 outline-none"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            className="px-8 py-2 rounded-full bg-error text-on-error text-sm font-bold"
          >
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
