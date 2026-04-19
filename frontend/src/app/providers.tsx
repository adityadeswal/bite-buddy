"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "@/lib/queryClient";
import { AppStoreProvider } from "@/mock/store";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={client}>
      <AppStoreProvider>{children}</AppStoreProvider>
    </QueryClientProvider>
  );
}
