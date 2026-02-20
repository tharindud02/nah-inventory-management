"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConditionBar {
  label: string;
  value: number;
  max?: number;
  rating: string;
}

export interface ConditionCardProps {
  score: number;
  bars: ConditionBar[];
  onViewReport?: () => void;
  className?: string;
}

export function ConditionCard({
  score,
  bars,
  onViewReport,
  className,
}: ConditionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-600" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Condition
        </h3>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Condition Score
        </p>
        <p className="text-3xl font-bold text-slate-900">{score}</p>
      </div>

      <div className="space-y-3">
        {bars.map((bar) => {
          const pct = bar.max ? (bar.value / bar.max) * 100 : bar.value * 20;
          return (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{bar.label}</span>
                <span className="font-semibold text-emerald-600">
                  {bar.rating}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={onViewReport}
      >
        Full Inspection Report
      </Button>
    </div>
  );
}
