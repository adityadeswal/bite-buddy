import type { ReactNode } from "react";
import { FlatShell } from "@/components/chrome/flat-shell";

export default function FlatLayout({ children }: { children: ReactNode }) {
  return <FlatShell>{children}</FlatShell>;
}
