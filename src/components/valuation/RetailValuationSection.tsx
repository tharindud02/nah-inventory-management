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
  const barFillPercent = 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Store className="h-5 w-5 text-blue-500" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Retail Valuation
        </h3>
      </div>

      <div className="space-y-5">
        {/* Current Asking + Market Avg side by side */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current Asking
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {currentAsking}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Market Avg
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{marketAvg}</p>
          </div>
        </div>

        {/* Competitive Positioning */}
        {(belowMarket != null && belowMarket !== "" && belowMarket !== "—") ? (
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Competitive Positioning
              </span>
              <span className="text-sm font-semibold text-emerald-600">
                {belowMarket}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${barFillPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-slate-500">
              <span>Great Price</span>
              <span>High Price</span>
            </div>
          </div>
        ) : null}

        {/* Retail Margin + Price Rank as embedded sub-cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Retail Margin
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {retailMargin}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Price Rank
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{priceRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
