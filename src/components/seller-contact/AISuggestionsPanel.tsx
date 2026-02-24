"use client";

import { Zap, CheckCircle, Calendar, Tag } from "lucide-react";
import { AISuggestionCard } from "./AISuggestionCard";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AISuggestion {
  id: string;
  category: string;
  actionText: string;
  description: string;
  icon: LucideIcon;
}

const ICON_MAP = {
  zap: Zap,
  check: CheckCircle,
  calendar: Calendar,
  tag: Tag,
} as const;

export interface AISuggestionsPanelProps {
  suggestions: Array<{
    id: string;
    category: string;
    actionText: string;
    description: string;
    icon?: keyof typeof ICON_MAP;
  }>;
  onSuggestionClick?: (suggestionId: string) => void;
  className?: string;
}

export function AISuggestionsPanel({
  suggestions,
  onSuggestionClick,
  className,
}: AISuggestionsPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-slate-200 bg-white",
        className,
      )}
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            AI Suggested Responses
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        </div>
        <p className="mt-0.5 text-xs text-slate-500">Based on last message</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {suggestions.map((s) => (
          <AISuggestionCard
            key={s.id}
            category={s.category}
            actionText={s.actionText}
            description={s.description}
            icon={ICON_MAP[s.icon ?? "zap"]}
            onClick={() => onSuggestionClick?.(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
