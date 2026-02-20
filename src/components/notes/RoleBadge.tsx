"use client";

import { cn } from "@/lib/utils";

export type RoleVariant = "acquisition" | "service" | "manager";

const VARIANT_STYLES: Record<RoleVariant, string> = {
  acquisition: "bg-emerald-100 text-emerald-800",
  service: "bg-lime-100 text-lime-800",
  manager: "bg-amber-100 text-amber-800",
};

export interface RoleBadgeProps {
  role: string;
  variant?: RoleVariant;
  className?: string;
}

export function RoleBadge({
  role,
  variant = "acquisition",
  className,
}: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {role}
    </span>
  );
}
