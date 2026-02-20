"use client";

import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RetailValuationSectionProps {
  currentAsking: string;
  marketAvg: string;
  belowMarket?: string;
  retailMargin: string;
  priceRank: string;
  competitivePositionPercent?: number;
  className?: string;
}

export function RetailValuationSection({
  currentAsking,
  marketAvg,
  belowMarket,
  retailMargin,
  priceRank,
  competitivePositionPercent = 25,
  className,
}: RetailValuationSectionProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Store className="h-5 w-5 text-slate-500" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Retail Valuation
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current Asking
          </p>
          <p className="text-2xl font-bold text-slate-900">{currentAsking}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Market Avg
          </p>
          <p className="text-lg font-semibold text-slate-700">{marketAvg}</p>
        </div>

        {belowMarket && (
          <div>
            <p className="mb-2 text-sm font-semibold text-blue-600">
              {belowMarket}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${competitivePositionPercent}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Great Price</span>
              <span>High Price</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Retail Margin
            </p>
            <p className="font-semibold text-slate-900">{retailMargin}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Price Rank
            </p>
            <p className="font-semibold text-slate-900">{priceRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
