"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { VehicleDetailHeader } from "@/components/acquisition/VehicleDetailHeader";
import { VehicleDetailTabs } from "@/components/acquisition/VehicleDetailTabs";
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import { ValuationTabContent } from "@/components/valuation/ValuationTabContent";
import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import { DetailsTabContent } from "@/components/details/DetailsTabContent";
import type { ConfigItem } from "@/components/details/ConfigurationCard";
import { CostAnalysisTabContent } from "@/components/cost-analysis/CostAnalysisTabContent";
import {
  transformAwsVinLookupToValuationResults,
  type AwsVinLookupData,
} from "@/lib/vindata-transform";
import { toast } from "sonner";

interface VINData {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
}

interface RawVinReportData {
  summary?: { make?: string; model?: string; year?: number };
  make?: string;
  model?: string;
  year?: number;
  trimLevels?: { Default?: { General?: { Trim?: string } } };
  trim?: string;
  vehicle_details?: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    mileage?: number;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    exterior_color?: string;
    interior_color?: string;
    city_mpg?: number;
    highway_mpg?: number;
  };
}

function buildConfigurationFromAwsLookup(data: AwsVinLookupData): ConfigItem[] {
  const spec = data.spec ?? {};
  const empty = "—";
  const cityMpg = spec.city_mpg;
  const highwayMpg = spec.highway_mpg;
  return [
    { label: "Engine", value: spec.engine ?? empty },
    { label: "Transmission", value: spec.transmission ?? empty },
    { label: "Body Type", value: spec.body_type ?? empty },
    { label: "Drivetrain", value: spec.drivetrain ?? empty },
    {
      label: "Fuel Economy",
      value:
        cityMpg != null && highwayMpg != null
          ? `${cityMpg} City / ${highwayMpg} Hwy`
          : empty,
    },
  ];
}

function extractImagesFromAwsLookup(data: AwsVinLookupData, vin: string): string[] {
  const listings = data.activeLocal?.listings ?? [];
  const subject = listings.find((l) => l.vin?.toUpperCase() === vin.toUpperCase());
  const media = subject?.media;
  const links = media?.photo_links ?? media?.photo_links_cached;
  return Array.isArray(links) ? links : [];
}

function parsePrice(value: string | undefined): number {
  if (!value) return 0;
  return Number.parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
}

export default function VINAnalysisPage() {
  const router = useRouter();
  const [vinData, setVinData] = useState<VINData | null>(null);
  const [vin, setVin] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [valuationError, setValuationError] = useState<string | null>(null);
  const [valuationData, setValuationData] =
    useState<ValuationResultsData | null>(null);
  const [configuration, setConfiguration] = useState<ConfigItem[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("valuation");
  const [actualMileage, setActualMileage] = useState<number | null>(null);

  useEffect(() => {
    const storedVinData = sessionStorage.getItem("vinData");
    const storedVin = sessionStorage.getItem("vin");
    const storedLookupData = sessionStorage.getItem("vinLookupData");

    if (!storedVinData || !storedVin) {
      toast.error("No VIN data found. Please analyze a VIN first.");
      router.push("/vin-intel");
      setIsLoading(false);
      return;
    }

    if (!storedLookupData) {
      toast.error("Session expired. Please analyze the VIN again.");
      router.push("/vin-intel");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const rawData = JSON.parse(storedVinData) as RawVinReportData;
        const lookupData = JSON.parse(storedLookupData) as AwsVinLookupData;

        const transformedData: VINData = {
          vin: storedVin,
          make:
            rawData.summary?.make ??
            rawData.vehicle_details?.make ??
            rawData.make ??
            "N/A",
          model:
            rawData.summary?.model ??
            rawData.vehicle_details?.model ??
            rawData.model ??
            "N/A",
          year:
            rawData.summary?.year ??
            rawData.vehicle_details?.year ??
            rawData.year,
          trim:
            rawData.trimLevels?.Default?.General?.Trim ??
            rawData.vehicle_details?.trim ??
            rawData.trim ??
            "Base",
        };

        const subjectListing = lookupData.activeLocal?.listings?.find(
          (l) => l.vin?.toUpperCase() === storedVin.toUpperCase(),
        );
        const storedVinMiles = sessionStorage.getItem("vinMiles");
        const userMiles =
          storedVinMiles != null && storedVinMiles !== ""
            ? Number.parseInt(storedVinMiles.replace(/\D/g, ""), 10)
            : null;
        const listingMileage =
          userMiles != null && userMiles > 0
            ? userMiles
            : subjectListing?.miles ?? null;
        const listingPrice = subjectListing?.price ?? null;

        if (listingMileage != null && listingMileage > 0) {
          setActualMileage(listingMileage);
        }

        const valuation = transformAwsVinLookupToValuationResults(
          lookupData,
          storedVin,
          listingMileage,
          listingPrice,
        );

        const odometerParam =
          userMiles != null && userMiles > 0 ? String(userMiles) : "";
        const mmrRes = await fetch(
          `/api/mmr/${encodeURIComponent(storedVin)}?odometer=${odometerParam}&buildOptions=false`,
          { cache: "no-store" },
        );
        const mmrJson = (await mmrRes.json().catch(() => null)) as
          | { success?: boolean; data?: ValuationResultsData["mmr"] }
          | null;
        if (mmrJson?.success && mmrJson.data) {
          valuation.mmr = mmrJson.data;
        } else {
          valuation.mmr = {
            request_context: {
              vin: storedVin,
              odometer: userMiles ?? undefined,
              build_options: false,
            },
            base_mmr: 0,
            adjusted_mmr: 0,
            avg_odo: userMiles ?? 0,
            avg_condition: "N/A",
            typical_range: { min: 0, max: 0 },
            adjustments: { odometer: 0, region: 0, cr_score: 0, color: 0 },
          };
        }

        if (!cancelled) {
          setVinData(transformedData);
          setVin(storedVin);
          setValuationData(valuation);
          setConfiguration(buildConfigurationFromAwsLookup(lookupData));
          setImages(extractImagesFromAwsLookup(lookupData, storedVin));
          setValuationError(null);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Error loading vehicle data. Please try again.";
          console.error("Error processing VIN data:", error);
          setValuationError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const vehicleName = vinData
    ? `${vinData.year ?? ""} ${vinData.make ?? ""} ${vinData.model ?? ""}`.trim() ||
      "Vehicle"
    : "Loading...";

  const mileage =
    actualMileage != null && actualMileage > 0
      ? `${actualMileage.toLocaleString()} mi`
      : "—";

  const marketOverview = valuationData?.retail
    ? {
        currentPrice: valuationData.retail.currentAsking ?? "—",
        previousPrice: undefined,
        priceDrop: undefined,
        daysOnMarket: valuationData.metrics?.daysOnMarket
          ? `${valuationData.metrics.daysOnMarket} Days`
          : "—",
        marketCondition: "—",
        estRecon: "",
        mmrApi: "",
        mcApi: "",
      }
    : undefined;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="ml-64 flex min-h-screen flex-col">
          <VehicleDetailHeader
            vehicleName={vehicleName}
            status="IN DISCOVERY"
            statusVariant="default"
            vin={vin || undefined}
            trim={vinData?.trim && vinData.trim !== "Base" ? vinData.trim : undefined}
            mileage={mileage}
            targetOffer="—"
            backHref="/vin-intel"
          />

          <VehicleDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hiddenTabs={["details", "cost-analysis", "seller", "notes", "appointments"]}
          />

          <main className="flex-1 p-6">
            {activeTab === "details" && (
              <DetailsTabContent
                hasVin={!!vin}
                images={images}
                marketOverview={marketOverview}
                configuration={configuration}
                location="—"
                distance="—"
                sourcingIntel="VIN discovery — no listing yet. Add to acquisition to track."
              />
            )}
            {activeTab === "valuation" && (
              <>
                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : valuationData ? (
                  <ValuationTabContent
                    defaultVin={vin}
                    valuationData={valuationData}
                    hideRetailValuation
                    hideDaysOnMarket
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                    {valuationError ??
                      "Unable to load valuation data. Please try analyzing the VIN again."}
                  </div>
                )}
              </>
            )}
            {activeTab === "cost-analysis" && valuationData && (
              <div className="pb-24">
                <CostAnalysisTabContent
                  purchasePrice={valuationData.mmr?.adjusted_mmr ?? 0}
                  buyerFee={0}
                  shipping={0}
                  otherFees={0}
                  targetSalePrice={
                    (parsePrice(valuationData.retail?.marketAvg) ||
                      (valuationData.mmr?.adjusted_mmr ?? 0) * 1.1)
                  }
                  turnTime={valuationData.metrics?.marketDaysSupply ?? 0}
                  marketAverage={
                    (parsePrice(valuationData.retail?.marketAvg) ||
                      valuationData.mmr?.adjusted_mmr) ?? 0
                  }
                  marketHigh={
                    (parsePrice(valuationData.retail?.marketAvg) * 1.03 ||
                      (valuationData.mmr?.adjusted_mmr ?? 0) * 1.05)
                  }
                  marketLow={
                    (parsePrice(valuationData.retail?.marketAvg) * 0.97 ||
                      (valuationData.mmr?.adjusted_mmr ?? 0) * 0.95)
                  }
                  velocity={0}
                  projectedTurn={valuationData.metrics?.marketDaysSupply ?? 0}
                  sourcingIntel="VIN discovery — valuation from VIN lookup."
                />
              </div>
            )}
            {activeTab === "notes" && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                No notes for VIN discovery. Add to acquisition to track.
              </div>
            )}
            {activeTab === "appointments" && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                No appointments for VIN discovery. Add to acquisition to track.
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
