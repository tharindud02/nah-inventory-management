"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactInfoItemProps {
  icon: LucideIcon;
  value: string;
  label?: string;
  className?: string;
}

export function ContactInfoItem({
  icon: Icon,
  value,
  label,
  className,
}: ContactInfoItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-sm text-slate-700",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <div>
        {label && (
          <span className="block text-xs text-slate-500">{label}</span>
        )}
        <span>{value}</span>
      </div>
    </div>
  );
}
