"use client";

import { useBackendStatus } from "@/mock/store";

export function BackendChip() {
  const status = useBackendStatus();

  const { dot, label, title } = (() => {
    switch (status.kind) {
      case "connecting":
        return {
          dot: "bg-amber-400 animate-pulse",
          label: "Connecting…",
          title: "Contacting backend",
        };
      case "connected":
        return {
          dot: "bg-emerald-500",
          label: `BE · ${status.counts.recipes} recipes`,
          title: `Backend live — ${status.counts.cooks} cooks, ${status.counts.flats} flats, ${status.counts.flatmates} flatmates, ${status.counts.recipes} recipes`,
        };
      case "offline":
        return {
          dot: "bg-rose-500",
          label: "BE offline",
          title: status.message,
        };
      case "idle":
      default:
        return {
          dot: "bg-neutral-400",
          label: "BE idle",
          title: "Backend not yet contacted",
        };
    }
  })();

  return (
    <div
      data-testid="backend-chip"
      data-status={status.kind}
      title={title}
      className="hidden sm:inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
    >
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </div>
  );
}
