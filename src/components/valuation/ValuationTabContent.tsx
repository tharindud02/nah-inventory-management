"use client";

import { useEffect, useRef, useState } from "react";
import { VINRequiredCard } from "./VINRequiredCard";
import { ValuationResultsContent } from "./ValuationResultsContent";
import type { ValuationResultsData } from "./ValuationResultsContent";

const VIN_LENGTH = 17;
const DEDUPE_MS = 3000;

const recentFetches = new Map<string, number>();

export interface ValuationTabContentProps {
  defaultVin?: string;
  valuationData?: ValuationResultsData | null;
  onFetchValuation?: (vin: string) => Promise<void>;
  onSettingsClick?: () => void;
  onViewInspection?: () => void;
  onExportComparables?: () => void;
  hideRetailValuation?: boolean;
  hideDaysOnMarket?: boolean;
}

export function ValuationTabContent({
  defaultVin,
  valuationData,
  onFetchValuation,
  onSettingsClick,
  onViewInspection,
  onExportComparables,
  hideRetailValuation,
  hideDaysOnMarket,
}: ValuationTabContentProps) {
  const hasAutoFetched = useRef(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  const onFetchRef = useRef(onFetchValuation);
  onFetchRef.current = onFetchValuation;

  useEffect(() => {
    const trimmed = defaultVin?.replace(/\s/g, "") ?? "";
    if (
      trimmed.length !== VIN_LENGTH ||
      valuationData ||
      !onFetchRef.current ||
      hasAutoFetched.current
    ) {
      return;
    }

    const now = Date.now();
    const last = recentFetches.get(trimmed);
    if (last != null && now - last < DEDUPE_MS) return;
    recentFetches.set(trimmed, now);

    hasAutoFetched.current = true;
    setIsAutoFetching(true);

    onFetchRef
      .current!(trimmed)
      .catch(() => {
        hasAutoFetched.current = false;
      })
      .finally(() => {
        setIsAutoFetching(false);
      });
  }, [defaultVin, valuationData]);

  if (valuationData) {
    return (
      <ValuationResultsContent
        data={valuationData}
        onViewInspection={onViewInspection}
        onExportComparables={onExportComparables}
        hideRetailValuation={hideRetailValuation}
        hideDaysOnMarket={hideDaysOnMarket}
      />
    );
  }

  if (isAutoFetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-600">Fetching valuation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <VINRequiredCard
          key={defaultVin ?? "empty"}
          defaultVin={defaultVin ?? ""}
          onFetch={onFetchValuation}
          onSettingsClick={onSettingsClick}
        />
      </div>
    </div>
  );
}
