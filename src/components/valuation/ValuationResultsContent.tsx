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
  const { metrics, mmr, retail, condition, comparables, marketPosition } =
    data;

  return (
    <div className="space-y-6">
      {/* Top metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <ValuationMetricCard
          label="Days on Market"
          value={metrics.daysOnMarket}
          unit="days"
          sublabel="Listed 2 weeks ago"
        />
        <ValuationMetricCard
          label="Avg Market DOM"
          value={metrics.avgMarketDom}
          unit="days"
          sublabel="18d below avg"
          sublabelAccent="green"
        />
        <ValuationMetricCard
          label="Active Local"
          value={metrics.activeLocal}
          unit="units"
          sublabel="Within 50 mile radius"
        />
        <ValuationMetricCard
          label="Sold 90D (Local)"
          value={metrics.sold90dLocal}
          unit="units"
          sublabel="High Turn Volume"
          sublabelAccent="green"
        />
        <ValuationMetricCard
          label="Market Days Supply"
          value={metrics.marketDaysSupply}
          unit="days"
          sublabel="Strong demand signals"
        />
        <ValuationMetricCard
          label="Consumer Interest"
          value={metrics.consumerInterest}
          sublabel={metrics.consumerInterestPercentile}
          icon={Zap}
        />
      </div>

      {/* MMR and Retail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          score={condition.score}
          bars={condition.bars}
          onViewReport={onViewInspection}
        />
        <RecentSoldComparablesTable
          rows={comparables}
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
