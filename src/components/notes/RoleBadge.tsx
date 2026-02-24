"use client";

import { cn } from "@/lib/utils";

export type RoleVariant = "acquisition" | "service" | "manager";

const VARIANT_STYLES: Record<RoleVariant, string> = {
  acquisition: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  service: "bg-blue-50 text-blue-600 border border-blue-200",
  manager: "bg-amber-50 text-amber-600 border border-amber-200",
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
