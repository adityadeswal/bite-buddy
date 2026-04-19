"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { useAppStore, useCurrentCook, useFlatsOfCook } from "@/mock/store";

export default function CookSettingsPage() {
  const cook = useCurrentCook();
  const flats = useFlatsOfCook(cook?.id ?? null);
  const { state } = useAppStore();

  if (!cook) {
    return (
      <div className="px-8 py-12">
        <p className="text-on-surface-variant italic">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <header className="glass-header sticky top-0 z-30 px-8 py-6">
        <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
          Cook Settings
        </h2>
        <p className="text-secondary text-sm italic mt-1">
          Your profile, your flats, your rhythm.
        </p>
      </header>

      <div className="px-8 mt-8 max-w-4xl space-y-8">
        <section className="bg-surface-container-lowest rounded-xl shadow-soft p-6 flex items-center gap-5">
          <img
            src={cook.photo}
            alt={cook.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-serif text-2xl font-bold text-on-surface">
              {cook.name}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              {cook.yearsExperience} years of experience
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cook.cuisines.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl font-bold text-on-surface">
              Active Flats
              <span className="ml-3 text-sm font-normal text-on-surface-variant">
                {flats.length}
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {flats.map((flat) => {
              const flatmateCount = flat.flatmateIds.length;
              return (
                <Link
                  key={flat.id}
                  href={`/cook/flats/${flat.id}/plan`}
                  className="bg-surface-container-lowest rounded-xl shadow-soft p-5 flex items-center justify-between hover:shadow-soft-hover transition-all"
                >
                  <div>
                    <h4 className="font-serif text-lg font-bold text-on-surface">
                      {flat.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {flat.address}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold mt-2">
                      Invite · {flat.inviteCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-serif font-bold text-on-surface">
                        {flatmateCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {flatmateCount === 1 ? "Flatmate" : "Flatmates"}
                      </p>
                    </div>
                    <Icon name="chevron_right" className="text-on-surface-variant" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl shadow-soft p-6">
          <h3 className="font-serif text-lg font-bold text-on-surface mb-4">
            Kitchen Stats
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Recipes" value={state.recipes.length} />
            <Stat
              label="Flatmates served"
              value={flats.reduce((n, f) => n + f.flatmateIds.length, 0)}
            />
            <Stat label="Active flats" value={flats.length} />
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-serif text-3xl font-bold text-primary">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
        {label}
      </p>
    </div>
  );
}
