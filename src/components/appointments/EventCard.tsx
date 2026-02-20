"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  title: string;
  relativeLabel: string;
  date: string;
  timeRange: string;
  attendee?: string;
  className?: string;
}

export function EventCard({
  title,
  relativeLabel,
  date,
  timeRange,
  attendee,
  className,
}: EventCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {relativeLabel}
        </span>
      </div>
      <p className="text-sm text-slate-600">{date}</p>
      <p className="text-sm text-slate-600">{timeRange}</p>
      {attendee && (
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <User className="h-4 w-4 shrink-0" aria-hidden />
          {attendee}
        </div>
      )}
    </div>
  );
}
