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
  marketAvgOnly?: boolean;
}

export function RetailValuationSection({
  currentAsking,
  marketAvg,
  belowMarket,
  retailMargin,
  priceRank,
  competitivePositionPercent = 25,
  className,
  marketAvgOnly = false,
}: RetailValuationSectionProps) {
  const barFillPercent = Math.max(0, Math.min(100, competitivePositionPercent));
  const hasPositioning = belowMarket != null && belowMarket !== "" && belowMarket !== "—";

  if (marketAvgOnly) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-lg transition-shadow p-6",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Market Average Price
            </p>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900 leading-tight">
                {marketAvg}
              </p>
              <p className="text-xs text-slate-400 font-medium">Competitive Market Rate</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
              <Store className="h-6 w-6 text-blue-600" aria-hidden />
            </div>
          </div>
        </div>
        
        {/* Decorative accent line */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Current Market</span>
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200">
        <Store className="h-4 w-4 text-blue-500" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Retail Valuation
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Current Asking + Market Avg */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
              Current Asking
            </p>
            <p className="text-[26px] font-bold text-slate-900 leading-none">
              {currentAsking}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
              Market Avg
            </p>
            <p className="text-xl font-bold text-slate-700 leading-none mt-1">
              {marketAvg}
            </p>
          </div>
        </div>

        {/* Competitive Positioning */}
        {hasPositioning && (
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-600 italic">
                Competitive Positioning
              </span>
              <span className="text-sm font-semibold text-emerald-600">
                {belowMarket}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${barFillPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
              <span>Great Price</span>
              <span>High Price</span>
            </div>
          </div>
        )}

        {/* Retail Margin + Price Rank */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
              Retail Margin
            </p>
            <p className="text-xl font-bold text-slate-900">{retailMargin}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
              Price Rank
            </p>
            <p className="text-xl font-bold text-slate-900">{priceRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
