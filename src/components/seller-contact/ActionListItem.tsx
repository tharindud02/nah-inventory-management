"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionListItemProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export function ActionListItem({
  label,
  onClick,
  className,
}: ActionListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50",
        className,
      )}
    >
      {label}
      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
    </button>
  );
}
