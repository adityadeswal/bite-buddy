"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { useAppStore } from "@/mock/store";

type Role = "flatmate" | "cook" | null;

const DEMO_FLATMATE_ID = "fm-aman";
const DEMO_COOK_ID = "cook-kabir";

export default function WelcomePage() {
  const router = useRouter();
  const { state, signIn } = useAppStore();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(null);

  // If already signed in, skip the welcome screen.
  useEffect(() => {
    if (state.persona?.type === "cook") router.replace("/cook/home");
    if (state.persona?.type === "flatmate") router.replace("/flat/home");
  }, [state.persona, router]);

  const canSubmit = phone.replace(/\D/g, "").length >= 4 && role !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    if (role === "cook") {
      signIn({ type: "cook", cookId: DEMO_COOK_ID });
      router.push("/cook/home");
    } else {
      signIn({ type: "flatmate", flatmateId: DEMO_FLATMATE_ID });
      router.push("/flat/home");
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-surface text-on-surface">
      {/* Left: editorial hero (desktop only) */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          alt="A vibrant Indian spread"
          className="absolute inset-0 h-full w-full object-cover object-center"
          src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=80"
        />
        <div className="absolute inset-0 editorial-overlay mix-blend-multiply opacity-60" />
        <div className="absolute bottom-16 left-16 z-10 max-w-md">
          <p className="font-serif text-on-primary italic text-3xl leading-relaxed tracking-tight drop-shadow-md">
            &ldquo;Cooking is an act of love made visible.&rdquo;
          </p>
          <div className="mt-4 h-1 w-24 bg-primary-fixed" />
        </div>
      </section>

      {/* Right: sign-in panel */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-surface">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-12">
          <header className="space-y-4">
            <h1 className="font-serif text-5xl font-bold tracking-tight text-primary">
              BiteBuddy
            </h1>
            <p className="font-serif italic text-2xl text-on-surface-variant leading-snug">
              &lsquo;Kya khana hai?&rsquo; is a thing of the past.
            </p>
          </header>

          <div className="space-y-8">
            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Enter Phone Number
              </label>
              <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-4 focus-within:bg-surface-container-highest transition-all duration-300">
                <span className="text-on-surface-variant mr-3 font-medium">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="00000 00000"
                  className="bg-transparent border-none outline-none w-full text-lg font-medium placeholder:text-outline-variant"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">
                We&apos;ll send a 6-digit OTP via SMS
              </p>
            </div>

            {/* Role */}
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Choose Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <RoleCard
                  selected={role === "flatmate"}
                  onClick={() => setRole("flatmate")}
                  icon="groups"
                  label="I'm a Flatmate"
                  sublabel="Joining a shared kitchen"
                  accent="primary"
                />
                <RoleCard
                  selected={role === "cook"}
                  onClick={() => setRole("cook")}
                  icon="restaurant_menu"
                  label="I'm a Cook"
                  sublabel="Managing meals & recipes"
                  accent="tertiary"
                />
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-primary text-on-primary font-semibold py-5 px-10 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Started
              <Icon
                name="arrow_forward"
                className="text-xl transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          <footer className="pt-12 text-center">
            <p className="text-xs text-on-surface-variant">
              By continuing, you agree to our{" "}
              <a className="underline hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="underline hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
              .
            </p>
          </footer>
        </form>
      </section>
    </main>
  );
}

function RoleCard({
  selected,
  onClick,
  icon,
  label,
  sublabel,
  accent,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  sublabel: string;
  accent: "primary" | "tertiary";
}) {
  const dot =
    accent === "primary"
      ? "bg-primary/10 text-primary"
      : "bg-tertiary/10 text-tertiary";
  const hover =
    accent === "primary" ? "hover:bg-primary/5" : "hover:bg-tertiary/5";
  const ring = selected
    ? accent === "primary"
      ? "ring-2 ring-primary"
      : "ring-2 ring-tertiary"
    : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-start p-6 rounded-2xl bg-surface-container transition-all duration-300 ${hover} text-left active:scale-[0.98] ${ring}`}
    >
      <div
        className={`mb-4 ${dot} p-3 rounded-full group-hover:scale-110 transition-transform`}
      >
        <Icon name={icon} />
      </div>
      <span className="text-sm font-bold text-on-surface">{label}</span>
      <span className="text-[10px] text-on-surface-variant mt-1 leading-tight">
        {sublabel}
      </span>
    </button>
  );
}
