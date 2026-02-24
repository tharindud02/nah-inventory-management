"use client";

import { cn } from "@/lib/utils";

export interface SlotAvailability {
  label: string;
  available: number;
  total: number;
}

export interface AvailabilityOverviewProps {
  slots: SlotAvailability[];
  className?: string;
}

export function AvailabilityOverview({
  slots,
  className,
}: AvailabilityOverviewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4",
        className,
      )}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Availability Overview
      </h3>
      <div className="space-y-4">
        {slots.map((slot) => {
          const pct = slot.total > 0 ? (slot.available / slot.total) * 100 : 0;
          return (
            <div key={slot.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{slot.label}</span>
                <span className="font-semibold text-slate-900">
                  {slot.available} Available
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
