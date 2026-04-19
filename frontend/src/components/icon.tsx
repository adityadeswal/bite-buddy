import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export interface IconProps extends ComponentPropsWithoutRef<"span"> {
  name: string;
}

/**
 * Material Symbols Outlined wrapper.
 * Stylesheet is loaded globally in app/layout.tsx.
 */
export function Icon({ name, className, ...rest }: IconProps) {
  return (
    <span
      aria-hidden
      data-icon={name}
      className={cn("material-symbols-outlined", className)}
      {...rest}
    >
      {name}
    </span>
  );
}
