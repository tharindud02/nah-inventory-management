"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AISuggestionCardProps {
  category: string;
  actionText: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function AISuggestionCard({
  category,
  actionText,
  description,
  icon: Icon,
  onClick,
  className,
}: AISuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/50",
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {category}
        </p>
        <p className="mb-1 font-semibold text-slate-900">{actionText}</p>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </button>
  );
}
