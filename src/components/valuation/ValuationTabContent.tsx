"use client";

import { useEffect, useRef, useState } from "react";
import { VINRequiredCard } from "./VINRequiredCard";
import { ValuationResultsContent } from "./ValuationResultsContent";
import type { ValuationResultsData } from "./ValuationResultsContent";

const VIN_LENGTH = 17;

export interface ValuationTabContentProps {
  defaultVin?: string;
  valuationData?: ValuationResultsData | null;
  onFetchValuation?: (vin: string) => Promise<void>;
  onSettingsClick?: () => void;
  onViewInspection?: () => void;
  onExportComparables?: () => void;
  hideConditionAndComparables?: boolean;
  marketAvgOnly?: boolean;
  hideTypicalRange?: boolean;
}

export function ValuationTabContent({
  defaultVin,
  valuationData,
  onFetchValuation,
  onSettingsClick,
  onViewInspection,
  onExportComparables,
  hideConditionAndComparables = false,
  marketAvgOnly = false,
  hideTypicalRange = false,
}: ValuationTabContentProps) {
  const hasAutoFetched = useRef(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  useEffect(() => {
    const trimmed = defaultVin?.replace(/\s/g, "") ?? "";
    if (
      trimmed.length === VIN_LENGTH &&
      !valuationData &&
      onFetchValuation &&
      !hasAutoFetched.current
    ) {
      hasAutoFetched.current = true;
      setIsAutoFetching(true);
      onFetchValuation(trimmed)
        .catch(() => {
          hasAutoFetched.current = false;
        })
        .finally(() => {
          setIsAutoFetching(false);
        });
    }
  }, [defaultVin, valuationData, onFetchValuation]);

  if (valuationData) {
    return (
      <ValuationResultsContent
        data={valuationData}
        onViewInspection={onViewInspection}
        onExportComparables={onExportComparables}
        hideConditionAndComparables={hideConditionAndComparables}
        marketAvgOnly={marketAvgOnly}
        hideTypicalRange={hideTypicalRange}
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
