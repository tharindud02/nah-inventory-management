"use client";

import { useState, useEffect, useCallback } from "react";
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
import { transformVindataToValuationResults } from "@/lib/vindata-transform";
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
  odometerInformation?: { reportedOdometer?: number }[];
}

interface ActiveListingSnapshot {
  vin?: string;
  price?: number;
  miles?: number;
  dom?: number;
  dom_active?: number;
  media?: { photo_links?: string[] };
}

function extractLatestOdometer(raw: RawVinReportData): number | null {
  const readings = raw?.odometerInformation;
  if (!readings?.length) return null;
  const sorted = [...readings].sort(
    (a, b) => (b.reportedOdometer ?? 0) - (a.reportedOdometer ?? 0),
  );
  return sorted[0]?.reportedOdometer ?? null;
}

function buildConfiguration(raw: RawVinReportData): ConfigItem[] {
  const vd = raw?.vehicle_details;
  const empty = "—";
  return [
    { label: "Engine", value: vd?.engine ?? empty },
    { label: "Transmission", value: vd?.transmission ?? empty },
    { label: "Exterior Color", value: vd?.exterior_color ?? empty },
    { label: "Interior Color", value: vd?.interior_color ?? empty },
    {
      label: "Fuel Economy",
      value: vd?.city_mpg != null && vd?.highway_mpg != null
        ? `${vd.city_mpg} City / ${vd.highway_mpg} Hwy`
        : empty,
    },
  ];
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

  const loadAndTransform = useCallback(
    async (storedVin: string, signal?: AbortSignal) => {
      const storedVinData = sessionStorage.getItem("vinData");
      if (!storedVinData) return;

      const rawData = JSON.parse(storedVinData) as RawVinReportData;
      const miles =
        extractLatestOdometer(rawData) ??
        rawData?.vehicle_details?.mileage ??
        undefined;

      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        try {
          const valuationRes = await fetch("/api/vindata/valuation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vin: storedVin, miles, zip: "" }),
            signal,
          });
          const valuationJson = await valuationRes.json().catch(() => null);
          if (!valuationRes.ok || !valuationJson?.success) {
            const err = valuationJson?.error ?? "Failed to fetch valuation";
            const isRetryable =
              valuationRes.status === 502 || valuationRes.status === 504;
            if (isRetryable && attempt < maxRetries) {
              lastError = new Error(err);
              await new Promise((r) =>
                setTimeout(r, 800 * (attempt + 1)),
              );
              continue;
            }
            throw new Error(err);
          }

          const mdsValue = valuationJson?.data?.mds?.mds;
          const enrichedRawData: RawVinReportData & {
            market_insights?: { days_supply?: number };
          } = {
            ...rawData,
            market_insights:
              typeof mdsValue === "number" ? { days_supply: mdsValue } : undefined,
          };

          const listings = (valuationJson?.data?.marketComps?.listings ??
            []) as ActiveListingSnapshot[];
          const exactListing = listings.find(
            (listing) =>
              typeof listing.vin === "string" &&
              listing.vin.toUpperCase() === storedVin.toUpperCase(),
          );

          const photoLinks = Array.isArray(exactListing?.media?.photo_links)
            ? exactListing.media.photo_links
            : [];
          setImages(photoLinks);

          const listingMileage =
            typeof exactListing?.miles === "number" ? exactListing.miles : miles;
          const listingPrice =
            typeof exactListing?.price === "number" ? exactListing.price : undefined;
          const listingDaysOnMarket =
            typeof exactListing?.dom_active === "number"
              ? exactListing.dom_active
              : typeof exactListing?.dom === "number"
                ? exactListing.dom
                : undefined;

          if (typeof listingMileage === "number" && listingMileage > 0) {
            setActualMileage(listingMileage);
          }

          const genJson = { success: true, data: enrichedRawData };
          const result = transformVindataToValuationResults({
            vin: storedVin,
            generateReport: genJson,
            valuation: { data: valuationJson?.data?.valuation },
            marketComps: { data: valuationJson?.data?.marketComps },
            soldComps: { data: valuationJson?.data?.soldComps },
            listingPrice,
            listingMileage,
            listingDaysOnMarket,
          });
          setValuationData(result);
          setConfiguration(buildConfiguration(rawData));
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            throw err;
          }
          lastError =
            err instanceof Error ? err : new Error(String(err));
          const msg = lastError.message.toLowerCase();
          const isRetryable =
            msg.includes("fetch") ||
            msg.includes("timeout") ||
            msg.includes("network") ||
            msg.includes("aborted");
          if (isRetryable && attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          throw lastError;
        }
      }
      throw lastError ?? new Error("Failed to fetch valuation");
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const run = async () => {
      const storedVinData = sessionStorage.getItem("vinData");
      const storedVin = sessionStorage.getItem("vin");

      if (!storedVinData || !storedVin) {
        toast.error("No VIN data found. Please analyze a VIN first.");
        router.push("/vin-intel");
        if (active) setIsLoading(false);
        return;
      }

      try {
        const rawData = JSON.parse(storedVinData) as RawVinReportData;
        const miles =
          extractLatestOdometer(rawData) ??
          rawData?.vehicle_details?.mileage ??
          null;
        if (active) {
          setActualMileage(miles != null && miles > 0 ? miles : null);
        }

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
        if (active) {
          setVinData(transformedData);
          setVin(storedVin);
          setValuationError(null);
        }
        await loadAndTransform(storedVin, controller.signal);
      } catch (error) {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        const message =
          error instanceof Error
            ? error.message
            : "Error loading vehicle data. Please try again.";
        console.error("Error processing VIN data:", error);
        setValuationError(message);
        toast.error(message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadAndTransform, router]);

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
            {activeTab === "seller" && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                No seller contact for VIN discovery. Add to acquisition to track.
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
