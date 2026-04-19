"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { HealthResponse } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api<HealthResponse>("/health"),
  });

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            🍳 Bite-Buddy
          </CardTitle>
          <CardDescription>
            Scaffold online. Verifying the wire to FastAPI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusRow label="Frontend" state="ok" detail="Next.js + Tailwind + shadcn" />
          <StatusRow
            label="Backend /health"
            state={
              health.isPending ? "pending" : health.isError ? "error" : "ok"
            }
            detail={
              health.isPending
                ? "checking…"
                : health.isError
                ? formatError(health.error)
                : health.data?.status ?? "unknown"
            }
          />
          <p className="pt-2 text-xs text-muted-foreground">
            Abhi tak koi plan nahi hai — but the plumbing works. Screens come next.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function StatusRow({
  label,
  state,
  detail,
}: {
  label: string;
  state: "ok" | "pending" | "error";
  detail: string;
}) {
  const dot =
    state === "ok"
      ? "bg-primary"
      : state === "pending"
      ? "bg-muted-foreground animate-pulse"
      : "bg-destructive";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block size-2 rounded-full ${dot}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground truncate max-w-[60%]">
        {detail}
      </span>
    </div>
  );
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) return `${err.status} ${err.statusText}`;
  if (err instanceof Error) return err.message;
  return "unknown error";
}
