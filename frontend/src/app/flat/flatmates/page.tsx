"use client";

import { Icon } from "@/components/icon";
import {
  useCurrentFlatmate,
  useFlat,
  useFlatmatesOf,
  useAppStore,
} from "@/mock/store";

const DIET_LABEL: Record<string, string> = {
  veg: "Veg",
  non_veg: "Non-veg",
  egg: "Egg-itarian",
};

const SPICE_LABEL: Record<string, string> = {
  mild: "Mild",
  medium: "Medium",
  spicy: "Spicy",
  extra_spicy: "Extra Spicy",
};

export default function FlatmatesPage() {
  const me = useCurrentFlatmate();
  const flat = useFlat(me?.flatId ?? null);
  const flatmates = useFlatmatesOf(flat?.id ?? null);
  const { state } = useAppStore();
  const cook = flat ? state.cooks.find((c) => c.id === flat.cookId) : null;

  if (!flat) {
    return (
      <div className="px-8 py-12">
        <p className="text-on-surface-variant italic">Loading flatmates…</p>
      </div>
    );
  }

  return (
    <>
      <header className="glass-header sticky top-0 z-30 px-8 py-6">
        <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
          {flat.name}
        </h2>
        <p className="text-secondary text-sm italic mt-1">
          {flat.address}
        </p>
      </header>

      <div className="px-8 mt-8 max-w-4xl space-y-8">
        {cook && (
          <section className="bg-surface-container-lowest rounded-xl shadow-soft p-6 flex items-center gap-4">
            <img
              src={cook.photo}
              alt={cook.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold">
                Your Cook
              </p>
              <h3 className="font-serif text-xl font-bold text-on-surface mt-1">
                {cook.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {cook.yearsExperience} years · {cook.cuisines.join(" · ")}
              </p>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl font-bold text-on-surface">
              Flatmates
              <span className="ml-3 text-sm font-normal text-on-surface-variant">
                {flatmates.length} {flatmates.length === 1 ? "member" : "members"}
              </span>
            </h3>
            <button className="flex items-center gap-2 text-sm text-primary font-bold hover:opacity-80">
              <Icon name="link" className="!text-base" />
              Copy invite · {flat.inviteCode}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flatmates.map((fm) => {
              const isMe = fm.id === me?.id;
              return (
                <div
                  key={fm.id}
                  className="bg-surface-container-lowest rounded-xl shadow-soft p-5 flex items-start gap-4"
                >
                  <img
                    src={fm.photo}
                    alt={fm.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-on-surface truncate">
                        {fm.name}
                      </h4>
                      {isMe && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-container/40 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    {fm.role && (
                      <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold mt-1">
                        {fm.role}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Tag>{DIET_LABEL[fm.dietType]}</Tag>
                      <Tag>{SPICE_LABEL[fm.spiceTolerance]}</Tag>
                      {fm.allergies.map((a) => (
                        <Tag key={a} danger>
                          No {a}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function Tag({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <span
      className={
        danger
          ? "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-error-container/40 text-on-error-container"
          : "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant"
      }
    >
      {children}
    </span>
  );
}
