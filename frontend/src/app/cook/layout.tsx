import type { ReactNode } from "react";
import { CookShell } from "@/components/chrome/cook-shell";

export default function CookLayout({ children }: { children: ReactNode }) {
  return <CookShell>{children}</CookShell>;
}
