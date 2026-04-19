"use client";

import { Icon } from "@/components/icon";
import { useCurrentFlatmate } from "@/mock/store";

const DIET_LABELS: Record<string, string> = {
  veg: "Vegetarian",
  non_veg: "Non-vegetarian",
  egg: "Egg-itarian",
};

const SPICE_LABELS: Record<string, string> = {
  mild: "Mild",
  medium: "Medium",
  spicy: "Spicy",
  extra_spicy: "Extra Spicy",
};

export default function FlatPreferencesPage() {
  const flatmate = useCurrentFlatmate();

  if (!flatmate) {
    return (
      <div className="px-8 py-12">
        <p className="text-on-surface-variant italic">Loading preferences…</p>
      </div>
    );
  }

  return (
    <>
      <header className="glass-header sticky top-0 z-30 px-8 py-6 flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary tracking-tight">
            My Preferences
          </h2>
          <p className="text-secondary text-sm italic mt-1">
            Tell the kitchen what you love — aur kya nahi.
          </p>
        </div>
      </header>

      <div className="px-8 mt-10 max-w-3xl space-y-8">
        <Section title="Profile" icon="person">
          <Row label="Name" value={flatmate.name} />
          <Row label="Phone" value={flatmate.phone} />
          {flatmate.role && <Row label="Role" value={flatmate.role} />}
        </Section>

        <Section title="Food Profile" icon="restaurant">
          <Row label="Diet" value={DIET_LABELS[flatmate.dietType]} />
          <Row label="Spice tolerance" value={SPICE_LABELS[flatmate.spiceTolerance]} />
          <Row
            label="Favourite cuisines"
            value={flatmate.cuisines.join(" · ") || "—"}
          />
        </Section>

        <Section title="Restrictions" icon="block">
          <Row
            label="Allergies"
            value={flatmate.allergies.length ? flatmate.allergies.join(", ") : "None"}
          />
          <Row
            label="Dislikes"
            value={flatmate.dislikes.length ? flatmate.dislikes.join(", ") : "None"}
          />
          <Row
            label="Likes"
            value={flatmate.likes.length ? flatmate.likes.join(", ") : "—"}
          />
        </Section>

        <p className="text-xs italic text-on-surface-variant">
          Editing is coming soon. For now, nudge the cook via a suggestion.
        </p>
      </div>
    </>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-soft p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name={icon} className="text-primary" />
        <h3 className="font-serif text-xl font-bold text-on-surface">{title}</h3>
      </div>
      <dl className="divide-y divide-outline-variant/30">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-xs uppercase tracking-widest text-on-surface-variant">
        {label}
      </dt>
      <dd className="text-sm font-medium text-on-surface text-right">{value}</dd>
    </div>
  );
}
