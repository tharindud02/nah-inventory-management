"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SourcingIntelCardProps {
  content: string;
  className?: string;
}

export function SourcingIntelCard({
  content,
  className,
}: SourcingIntelCardProps) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl bg-slate-800 p-5 text-white",
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700">
        <Search className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
          Sourcing Intel
        </h3>
        <p className="text-sm leading-relaxed text-slate-200">{content}</p>
      </div>
    </div>
  );
}
