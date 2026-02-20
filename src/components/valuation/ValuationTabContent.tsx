"use client";

import { VINRequiredCard } from "./VINRequiredCard";
import { ValuationResultsContent } from "./ValuationResultsContent";
import type { ValuationResultsData } from "./ValuationResultsContent";

export interface ValuationTabContentProps {
  defaultVin?: string;
  valuationData?: ValuationResultsData | null;
  onFetchValuation?: (vin: string) => Promise<void>;
  onSettingsClick?: () => void;
  onViewInspection?: () => void;
  onExportComparables?: () => void;
}

export function ValuationTabContent({
  defaultVin,
  valuationData,
  onFetchValuation,
  onSettingsClick,
  onViewInspection,
  onExportComparables,
}: ValuationTabContentProps) {
  if (valuationData) {
    return (
      <ValuationResultsContent
        data={valuationData}
        onViewInspection={onViewInspection}
        onExportComparables={onExportComparables}
      />
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <VINRequiredCard
          defaultVin={defaultVin ?? ""}
          onFetch={onFetchValuation}
          onSettingsClick={onSettingsClick}
        />
      </div>
    </div>
  );
}
