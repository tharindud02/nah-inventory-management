"use client";

import { cn } from "@/lib/utils";

export interface MarketOverviewCardProps {
  currentPrice: string;
  previousPrice?: string;
  priceDrop?: string;
  daysOnMarket: string;
  marketCondition: string;
  estRecon: string;
  mmrApi: string;
  mcApi: string;
  className?: string;
}

export function MarketOverviewCard({
  currentPrice,
  previousPrice,
  priceDrop,
  daysOnMarket,
  marketCondition,
  estRecon,
  mmrApi,
  mcApi,
  className,
}: MarketOverviewCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Market Overview
        </h3>
        {priceDrop && (
          <span className="text-sm font-semibold text-emerald-600">
            {priceDrop}
          </span>
        )}
      </div>

      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{currentPrice}</span>
        {previousPrice && (
          <span className="text-sm text-slate-400 line-through">
            {previousPrice}
          </span>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Days on Market
          </p>
          <p className="font-semibold text-slate-900">{daysOnMarket}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Market Condition
          </p>
          <p className="font-semibold text-emerald-600">{marketCondition}</p>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">EST. RECON</span>
          <span className="font-semibold text-slate-900">{estRecon}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">MMR API</span>
          <span className="font-semibold text-slate-900">{mmrApi}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">MC API</span>
          <span className="font-semibold text-slate-900">{mcApi}</span>
        </div>
      </div>
    </div>
  );
}
