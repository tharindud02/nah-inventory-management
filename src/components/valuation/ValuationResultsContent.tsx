"use client";

import { BarChart3, TrendingDown, Zap } from "lucide-react";
import { MMRSection } from "@/components/ui/MMRSection";
import { ValuationMetricCard } from "./ValuationMetricCard";
import { RetailValuationSection } from "./RetailValuationSection";
import { ConditionCard } from "./ConditionCard";
import { RecentSoldComparablesTable } from "./RecentSoldComparablesTable";
import { MarketPositionChart } from "./MarketPositionChart";
import type { ComparableRow } from "./RecentSoldComparablesTable";
import type { DataPoint } from "./MarketPositionChart";

export interface MMRData {
  base_mmr?: number;
  adjusted_mmr?: number;
  adjustments?: {
    odometer?: number;
    region?: number;
    cr_score?: number;
    color?: number;
  };
  typical_range?: { min?: number; max?: number };
  avg_odo?: number;
  avg_condition?: string;
  request_context?: {
    vin?: string;
    zip?: string;
    odometer?: number;
    region?: string;
    color?: string;
    grade?: number;
    build_options?: boolean;
  };
}

export interface ValuationResultsData {
  metrics: {
    daysOnMarket: number;
    avgMarketDom: number;
    activeLocal: number;
    sold90dLocal: number;
    marketDaysSupply: number;
    consumerInterest: string;
    consumerInterestPercentile?: string;
  };
  mmr: MMRData;
  retail: {
    currentAsking: string;
    marketAvg: string;
    belowMarket?: string;
    retailMargin: string;
    priceRank: string;
    competitivePositionPercent?: number;
  };
  condition: {
    score: number;
    bars: Array<{ label: string; value: number; max?: number; rating: string }>;
  };
  comparables: ComparableRow[];
  comparablesNumFound?: number;
  marketPosition: {
    sold: DataPoint[];
    subject?: DataPoint;
  };
}

export interface ValuationResultsContentProps {
  data: ValuationResultsData;
  onViewInspection?: () => void;
  onExportComparables?: () => void;
}

export function ValuationResultsContent({
  data,
  onViewInspection,
  onExportComparables,
}: ValuationResultsContentProps) {
  const { metrics, mmr, retail, condition, comparables, comparablesNumFound, marketPosition } =
    data;

  const m: ValuationResultsData["metrics"] = metrics ?? ({} as ValuationResultsData["metrics"]);
  const safeNum = (v: number | undefined | null) =>
    v === undefined || v === null ? 0 : v;
  const safeStr = (v: string | undefined | null) =>
    v === undefined || v === null || v === "" ? "N/A" : v;
  const hasData = (v: number | undefined | null) =>
    v !== undefined && v !== null && v >= 0;

  const dom = m.daysOnMarket ?? 0;
  const avgDom = m.avgMarketDom ?? 0;
  const domSublabel =
    hasData(dom) && dom > 0 ? `Listed ${dom}d ago` : "—";
  const avgDomDiff =
    hasData(dom) && hasData(avgDom) && avgDom > 0 ? avgDom - dom : null;
  const avgDomSublabel =
    avgDomDiff !== null
      ? avgDomDiff > 0
        ? `${avgDomDiff}d below avg`
        : avgDomDiff < 0
          ? `${Math.abs(avgDomDiff)}d above avg`
          : "At market avg"
      : "—";

  return (
    <div className="space-y-6">
      {/* Top metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <ValuationMetricCard
          label="Days on Market"
          value={safeNum(m.daysOnMarket)}
          unit="days"
          sublabel={domSublabel}
        />
        <ValuationMetricCard
          label="Avg Market DOM"
          value={safeNum(m.avgMarketDom)}
          unit="days"
          sublabel={avgDomSublabel}
          sublabelAccent={avgDomDiff != null && avgDomDiff > 0 ? "green" : "default"}
        />
        <ValuationMetricCard
          label="Active Local"
          value={safeNum(m.activeLocal)}
          unit="units"
          sublabel={hasData(m.activeLocal) ? "Within 50 mile radius" : "—"}
        />
        <ValuationMetricCard
          label="Sold 90D (Local)"
          value={safeNum(m.sold90dLocal)}
          unit="units"
          sublabel="—"
        />
        <ValuationMetricCard
          label="Market Days Supply"
          value={safeNum(m.marketDaysSupply)}
          unit="days"
          sublabel="—"
        />
        <ValuationMetricCard
          label="Consumer Interest"
          value={safeStr(m.consumerInterest)}
          sublabel={m.consumerInterestPercentile ?? "—"}
          icon={Zap}
        />
      </div>

      {/* MMR and Retail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <MMRSection mmrData={mmr} />
        <RetailValuationSection
          currentAsking={retail.currentAsking}
          marketAvg={retail.marketAvg}
          belowMarket={retail.belowMarket}
          retailMargin={retail.retailMargin}
          priceRank={retail.priceRank}
          competitivePositionPercent={retail.competitivePositionPercent}
        />
      </div>

      {/* Condition, Comparables, Market Position */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ConditionCard
          score={condition?.score}
          bars={condition?.bars}
          onViewReport={onViewInspection}
        />
        <RecentSoldComparablesTable
          rows={comparables}
          numFound={comparablesNumFound}
          onExport={onExportComparables}
        />
        <MarketPositionChart
          data={marketPosition.sold}
          subjectPoint={marketPosition.subject}
        />
      </div>
    </div>
  );
}
