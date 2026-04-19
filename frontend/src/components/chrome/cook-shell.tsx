"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { useAppStore, useCurrentCook } from "@/mock/store";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: string;
  matches: string[];
}[] = [
  {
    href: "/cook/home",
    label: "My Flats",
    icon: "dashboard",
    matches: ["/cook/home", "/cook/flats"],
  },
  {
    href: "/cook/recipes",
    label: "Recipe Manuscript",
    icon: "menu_book",
    matches: ["/cook/recipes"],
  },
  {
    href: "/cook/suggestions",
    label: "Suggestions Inbox",
    icon: "all_inbox",
    matches: ["/cook/suggestions"],
  },
  {
    href: "/cook/settings",
    label: "Cook Settings",
    icon: "settings",
    matches: ["/cook/settings"],
  },
];

function isActive(pathname: string | null, matches: string[]): boolean {
  if (!pathname) return false;
  return matches.some((m) => pathname.startsWith(m));
}

export function CookShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const cook = useCurrentCook();
  const { state, signOut } = useAppStore();

  useEffect(() => {
    if (state.persona === null) return;
    if (state.persona.type !== "cook") {
      router.replace("/");
    }
  }, [state.persona, router]);

  return (
    <div data-persona="cook" className="min-h-screen bg-background text-on-background">
      {/* TopAppBar */}
      <header className="glass-header sticky top-0 z-40 shadow-soft">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-serif text-2xl font-bold tracking-tight text-on-surface">
              BiteBuddy
            </span>
            <nav className="hidden md:flex gap-6">
              {NAV_ITEMS.slice(0, 3).map((item) => {
                const active = isActive(pathname, item.matches);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "text-primary font-bold border-b-2 border-primary pb-1"
                        : "text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-all">
              <Icon name="notifications" />
            </button>
            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="p-2 text-on-surface-variant hover:text-primary transition-all"
              title="Sign out"
            >
              <Icon name="logout" />
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
              {cook ? (
                <img
                  src={cook.photo}
                  alt={cook.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  <Icon name="person" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* SideNav */}
        <aside className="h-[calc(100vh-73px)] w-64 sticky top-[73px] hidden lg:flex flex-col bg-surface-container-low z-30">
          <div className="p-8">
            <h2 className="font-serif italic text-xl text-on-surface">BiteBuddy</h2>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant/70 mt-1">
              The Kitchen Office
            </p>
          </div>
          <nav className="flex-1 flex flex-col pt-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.matches);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "bg-surface-container-high text-on-surface rounded-r-full font-bold px-6 py-3 mr-4 flex items-center gap-3"
                      : "text-on-surface-variant px-6 py-3 hover:translate-x-1 transition-transform flex items-center gap-3 hover:bg-surface-container/50 rounded-r-full mr-4"
                  }
                >
                  <Icon name={item.icon} />
                  <span className="text-xs uppercase tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-6 flex flex-col gap-2">
            <Link
              href="/cook/recipes?new=1"
              className="bg-primary text-on-primary rounded-full px-6 py-3 font-bold text-sm tracking-tight flex items-center justify-center gap-2 mb-4 hover:bg-primary-container transition-all"
            >
              <Icon name="add" />
              Add New Tadka
            </Link>
            {cook && (
              <div className="px-6 py-2 flex items-center gap-3">
                <img
                  src={cook.photo}
                  alt={cook.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">{cook.name}</span>
                  <span className="text-[10px] text-on-surface-variant">Premium Plan</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 lg:pl-0 p-8 md:p-12">{children}</main>
      </div>
    </div>
  );
}
