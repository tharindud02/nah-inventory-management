"use client";

import { TrendingDown } from "lucide-react";
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
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.05em] text-slate-700">
          Market Overview
        </h3>
        {priceDrop && (
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <TrendingDown className="h-4 w-4" aria-hidden />
            {priceDrop}
          </span>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {currentPrice}
        </span>
        {previousPrice && (
          <span className="text-base text-slate-400 line-through">
            {previousPrice}
          </span>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-100/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Days on Market
          </p>
          <p className="mt-1.5 text-xl font-bold text-slate-900">{daysOnMarket}</p>
        </div>
        <div className="rounded-lg bg-slate-100/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Market Condition
          </p>
          <p className="mt-1.5 text-xl font-bold text-slate-900">{marketCondition}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-4">
        <div className="px-3 py-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Est. Recon
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              estRecon ? "text-amber-600" : "text-slate-400",
            )}
          >
            {estRecon || "—"}
          </p>
        </div>
        <div className="px-3 py-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            MMR API
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              mmrApi ? "text-emerald-600" : "text-slate-400",
            )}
          >
            {mmrApi || "—"}
          </p>
        </div>
        <div className="px-3 py-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            MC API
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              mcApi ? "text-blue-600" : "text-slate-400",
            )}
          >
            {mcApi || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
