"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MMRSection } from "@/components/ui/MMRSection";
import {
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface VINData {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
}

interface MMRData {
  base_mmr?: number;
  adjusted_mmr?: number;
  adjustments?: {
    odometer?: number;
    region?: number;
    cr_score?: number;
    color?: number;
  };
  typical_range?: {
    min?: number;
    max?: number;
  };
}

interface CompetitiveListing {
  id: string;
  vehicle: string;
  miles: number;
  price: number;
  distance: number;
}

interface ValuationData {
  marketcheck_price?: number;
  msrp?: number;
}

interface RawVinReportData {
  summary?: { make?: string; model?: string; year?: number };
  make?: string;
  model?: string;
  year?: number;
  trimLevels?: { Default?: { General?: { Trim?: string } } };
  trim?: string;
  odometerInformation?: { reportedOdometer?: number }[];
}

function extractLatestOdometer(raw: RawVinReportData): number | null {
  const readings = raw?.odometerInformation;
  if (!readings?.length) return null;
  const sorted = [...readings].sort(
    (a, b) => (b.reportedOdometer ?? 0) - (a.reportedOdometer ?? 0),
  );
  return sorted[0]?.reportedOdometer ?? null;
}

function deriveRecommendation(
  marketPrice: number | null,
  msrp: number | null,
  mmrAdjusted: number | null,
): { label: string; accent: "green" | "yellow" | "red"; reasoning: string } {
  if (!marketPrice || !mmrAdjusted) {
    return {
      label: "NEEDS REVIEW",
      accent: "yellow",
      reasoning:
        "Insufficient data to generate a recommendation. Manual review required.",
    };
  }

  const spread = marketPrice - mmrAdjusted;
  const spreadPct = mmrAdjusted > 0 ? (spread / mmrAdjusted) * 100 : 0;

  if (spreadPct > 10) {
    return {
      label: "STRONG BUY",
      accent: "green",
      reasoning: `Market price is ${spreadPct.toFixed(0)}% above wholesale MMR, indicating strong retail demand and healthy margin potential.`,
    };
  }
  if (spreadPct > 0) {
    return {
      label: "HOLD / PRICE TO MARKET",
      accent: "yellow",
      reasoning: `Market price is ${spreadPct.toFixed(0)}% above wholesale MMR. Moderate margin — price competitively to accelerate turn.`,
    };
  }
  return {
    label: "LIQUIDATE ASAP",
    accent: "red",
    reasoning: `Market price is at or below wholesale MMR by ${Math.abs(spreadPct).toFixed(0)}%. High depreciation risk — consider wholesale exit.`,
  };
}

export default function VINAnalysisPage() {
  const router = useRouter();
  const [vinData, setVinData] = useState<VINData | null>(null);
  const [vin, setVin] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [mmrData, setMmrData] = useState<MMRData | null>(null);
  const [valuation, setValuation] = useState<ValuationData | null>(null);
  const [competitiveListings, setCompetitiveListings] = useState<
    CompetitiveListing[]
  >([]);
  const [compsLoading, setCompsLoading] = useState(false);
  const [valuationLoading, setValuationLoading] = useState(false);
  const [odometer, setOdometer] = useState<number | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  const fetchMmr = useCallback(async (vinParam: string, miles?: number) => {
    try {
      const response = await fetch("/api/vindata/mmr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: vinParam, miles }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && (errorData.error || errorData.details)) ||
            `Failed to fetch MMR: ${response.status}`,
        );
      }

      const result = await response.json();
      if (result?.success && result.data) {
        setMmrData(result.data);
        sessionStorage.setItem("mmr", JSON.stringify(result.data));
        return result.data;
      }

      throw new Error("MMR response missing data");
    } catch (error) {
      console.error("Error fetching MMR:", error);
      return null;
    }
  }, []);

  const fetchValuation = useCallback(async (vinParam: string, miles?: number) => {
    setValuationLoading(true);
    try {
      const response = await fetch("/api/vindata/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: vinParam, miles }),
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result?.success && result.data) {
        setValuation(result.data);
      }
    } catch (error) {
      console.error("Error fetching valuation:", error);
    } finally {
      setValuationLoading(false);
    }
  }, []);

  const fetchMarketComps = useCallback(
    async (params: { vin: string; year?: number; make?: string; model?: string }) => {
      setCompsLoading(true);
      try {
        const response = await fetch("/api/vindata/market-comps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!response.ok) return;

        const result = await response.json();
        if (result?.success && result.data?.listings) {
          const mapped: CompetitiveListing[] = result.data.listings
            .slice(0, 10)
            .map((listing: Record<string, unknown>, idx: number) => ({
              id: (listing.id as string) || String(idx),
              vehicle: (listing.heading as string) ||
                `${listing.year ?? ""} ${listing.make ?? ""} ${listing.model ?? ""}`.trim(),
              miles: (listing.miles as number) ?? 0,
              price: (listing.price as number) ?? 0,
              distance: (listing.dom_active as number) ?? 0,
            }));
          setCompetitiveListings(mapped);
        }
      } catch (error) {
        console.error("Error fetching market comps:", error);
      } finally {
        setCompsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const storedVinData = sessionStorage.getItem("vinData");
    const storedVin = sessionStorage.getItem("vin");
    const storedMmr = sessionStorage.getItem("mmr");

    if (!storedVinData || !storedVin) {
      setIsLoading(false);
      return;
    }

    try {
      const rawData: RawVinReportData = JSON.parse(storedVinData);
      const transformedData: VINData = {
        vin: storedVin,
        make: rawData.summary?.make || rawData.make || "N/A",
        model: rawData.summary?.model || rawData.model || "N/A",
        year: rawData.summary?.year || rawData.year || undefined,
        trim:
          rawData.trimLevels?.Default?.General?.Trim ||
          rawData.trim ||
          "Base",
      };
      setVinData(transformedData);
      setVin(storedVin);

      const latestOdo = extractLatestOdometer(rawData);
      if (latestOdo !== null) setOdometer(latestOdo);

      if (storedMmr) {
        try {
          setMmrData(JSON.parse(storedMmr));
        } catch (e) {
          console.error("Error parsing MMR data:", e);
        }
      }

      if (!storedMmr) {
        fetchMmr(storedVin, latestOdo ?? undefined);
      }

      fetchValuation(storedVin, latestOdo ?? undefined);
      fetchMarketComps({
        vin: storedVin,
        year: transformedData.year,
        make: transformedData.make,
        model: transformedData.model,
      });
    } catch (error) {
      console.error("Error processing VIN data:", error);
      toast.error("Error loading vehicle data. Please try again.");
    }

    setIsLoading(false);
  }, [fetchMmr, fetchValuation, fetchMarketComps]);

  const marketPrice = valuation?.marketcheck_price ?? null;
  const msrp = valuation?.msrp ?? null;
  const adjustedMmr = mmrData?.adjusted_mmr ?? mmrData?.base_mmr ?? null;

  const priceDiff =
    marketPrice !== null && adjustedMmr !== null
      ? marketPrice - adjustedMmr
      : null;

  const recommendation = deriveRecommendation(marketPrice, msrp, adjustedMmr);

  const recommendationAccentMap = {
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  } as const;

  const recommendationCardBg = {
    green: "bg-emerald-900",
    yellow: "bg-gray-900",
    red: "bg-gray-900",
  } as const;

  const formatPrice = (value: number | null): string => {
    if (value === null) return "—";
    return `$${value.toLocaleString()}`;
  };

  return (
    <ProtectedRoute>
      <Layout title="VIN Analysis">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "VIN Intel", href: "/vin-intel" },
              { label: "VIN Analysis", isCurrent: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200"></div>

          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {vinData
                    ? `${vinData.year ?? ""} ${vinData.make ?? ""} ${vinData.model ?? ""}`.trim()
                    : "Loading..."}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  VIN: {vin || "—"}
                  {vinData?.trim && vinData.trim !== "Base" && (
                    <span className="ml-3 text-gray-400">
                      Trim: {vinData.trim}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* VIN Analysis Card */}
        <Card className="mb-6">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                VIN Analysis
              </CardTitle>
              <span
                className={`ml-auto px-2 py-1 text-xs font-semibold rounded ${recommendationAccentMap[recommendation.accent]}`}
              >
                {recommendation.label}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {valuationLoading ? (
              <div className="animate-pulse grid grid-cols-3 gap-6">
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    MARKET VALUE
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatPrice(marketPrice)}
                  </p>
                  {msrp !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      MSRP: {formatPrice(msrp)}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    MARKET vs WHOLESALE
                  </p>
                  <p
                    className={`text-4xl font-bold ${priceDiff !== null && priceDiff >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {priceDiff !== null
                      ? `${priceDiff >= 0 ? "+" : "-"}$${Math.abs(priceDiff).toLocaleString()}`
                      : "—"}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    WHOLESALE MMR
                  </p>
                  <p className="text-4xl font-bold text-amber-600">
                    {formatPrice(adjustedMmr)}
                  </p>
                  {mmrData?.base_mmr !== undefined &&
                    mmrData.base_mmr !== mmrData.adjusted_mmr && (
                      <p className="text-xs text-gray-500 mt-1">
                        Base: {formatPrice(mmrData.base_mmr)}
                      </p>
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            <MMRSection
              mmrData={mmrData}
              isLoading={isLoading}
              compact={true}
            />

            {/* Competitive Listings */}
            <Card>
              <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    YOUR COMPETITION: ACTIVE LISTINGS
                  </CardTitle>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    {compsLoading
                      ? "Loading..."
                      : `${competitiveListings.length} Matches Found`}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {compsLoading ? (
                  <div className="p-6 animate-pulse space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : competitiveListings.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No competitive listings found for this vehicle.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            VEHICLE
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            MILES
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            PRICE
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            DAYS ACTIVE
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {competitiveListings.map((listing) => (
                          <tr key={listing.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {listing.vehicle}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {listing.miles.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ${listing.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {listing.distance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recommendation Card */}
            <Card className={`${recommendationCardBg[recommendation.accent]} text-white`}>
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-2">
                  NEO&apos;S STRATEGIC RECOMMENDATION
                </p>
                <h3 className="text-3xl font-bold italic mb-6">
                  {recommendation.label}
                </h3>
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <p className="text-sm leading-relaxed opacity-95">
                    &ldquo;{recommendation.reasoning}&rdquo;
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-xs uppercase tracking-wide mb-1 opacity-75">
                      MARKET PRICE
                    </p>
                    <p className="text-lg font-bold">
                      {formatPrice(marketPrice)}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-xs uppercase tracking-wide mb-1 opacity-75">
                      WHOLESALE MMR
                    </p>
                    <p className="text-lg font-bold">
                      {formatPrice(adjustedMmr)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowRecommendationModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
                >
                  ACCEPT STRATEGY
                </Button>
              </CardContent>
            </Card>

            {/* Summary Metrics Card */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      ODOMETER
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {odometer !== null
                        ? `${odometer.toLocaleString()} mi`
                        : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      MARKET COMPS
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {competitiveListings.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      TRIM
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {vinData?.trim ?? "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendation Modal */}
        {showRecommendationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Accept Strategy
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to accept the &ldquo;
                  {recommendation.label}&rdquo; strategy for this vehicle?
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRecommendationModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      toast.success("Strategy accepted!");
                      setShowRecommendationModal(false);
                    }}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
