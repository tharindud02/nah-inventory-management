"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ValuationMetricCardProps {
  label: string;
  value?: string | number | null;
  unit?: string;
  sublabel?: string | null;
  sublabelAccent?: "green" | "default";
  icon?: LucideIcon;
  className?: string;
}

export function ValuationMetricCard({
  label,
  value,
  unit,
  sublabel,
  sublabelAccent = "default",
  icon: Icon,
  className,
}: ValuationMetricCardProps) {
  const displayValue =
    value === undefined || value === null ? "—" : value;
  const displaySublabel =
    sublabel === undefined || sublabel === null ? "—" : sublabel;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{displayValue}</span>
        {unit && (
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        )}
        {Icon && (
          <Icon className="h-5 w-5 text-blue-500 shrink-0" aria-hidden />
        )}
      </div>
      <p
        className={cn(
          "mt-1 text-xs",
          sublabelAccent === "green"
            ? "font-medium text-emerald-600"
            : "text-slate-500",
        )}
      >
        {displaySublabel}
      </p>
    </div>
  );
}
