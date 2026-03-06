"use client";

import { cn } from "@/lib/utils";

export interface ChatTimestampSeparatorProps {
  label: string;
  className?: string;
}

export function ChatTimestampSeparator({
  label,
  className,
}: ChatTimestampSeparatorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-4",
        className,
      )}
    >
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}
