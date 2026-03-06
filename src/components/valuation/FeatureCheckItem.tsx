"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureCheckItemProps {
  label: string;
  className?: string;
}

export function FeatureCheckItem({ label, className }: FeatureCheckItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-sm font-medium text-slate-700",
        className,
      )}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200">
        <Check className="h-3 w-3 text-slate-600" aria-hidden />
      </div>
      {label}
    </div>
  );
}
