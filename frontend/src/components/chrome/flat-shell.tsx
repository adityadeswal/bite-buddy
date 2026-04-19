"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { useAppStore, useCurrentFlatmate } from "@/mock/store";

const NAV: { href: string; label: string; icon: string }[] = [
  { href: "/flat/home", label: "The Table", icon: "menu_book" },
  { href: "/flat/suggestions", label: "Suggestions", icon: "auto_awesome" },
  { href: "/flat/preferences", label: "Preferences", icon: "tune" },
  { href: "/flat/flatmates", label: "Flatmates", icon: "groups" },
];

export function FlatShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const flatmate = useCurrentFlatmate();
  const { state, signOut } = useAppStore();

  // Redirect if persona isn't a flatmate. We only fire after mount so
  // localStorage hydration has a chance.
  useEffect(() => {
    if (state.persona === null) return; // still booting
    if (state.persona.type !== "flatmate") {
      router.replace("/");
    }
  }, [state.persona, router]);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-surface-container-low p-6 space-y-8 z-40">
          <div className="flex flex-col space-y-1">
            <h1 className="font-serif text-xl text-primary font-bold italic">
              BiteBuddy
            </h1>
            <p className="uppercase tracking-widest text-[10px] font-bold text-on-surface-variant">
              The Modern Kitchen
            </p>
          </div>
          <nav className="flex-1 space-y-2">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href) ?? false;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "flex items-center space-x-3 px-4 py-3 bg-surface-container-lowest text-primary rounded-full shadow-sm font-semibold"
                      : "flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:translate-x-1 transition-transform"
                  }
                >
                  <Icon name={item.icon} className="!text-xl" />
                  <span className="uppercase tracking-widest text-xs font-bold">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          {flatmate && (
            <div className="flex items-center gap-3 pt-6 border-t border-outline-variant/20">
              <img
                src={flatmate.photo}
                alt={flatmate.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{flatmate.name}</p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {flatmate.dietType === "veg"
                    ? "Vegetarian"
                    : flatmate.dietType === "egg"
                    ? "Egg-itarian"
                    : "Non-vegetarian"}
                </p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                title="Sign out"
                className="p-1 text-on-surface-variant hover:text-primary"
              >
                <Icon name="logout" className="!text-base" />
              </button>
            </div>
          )}
        </aside>

        <main className="flex-1 md:ml-64 min-h-screen pb-24">{children}</main>
      </div>
    </div>
  );
}
