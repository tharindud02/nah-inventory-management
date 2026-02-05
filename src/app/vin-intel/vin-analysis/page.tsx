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
  ArrowLeft,
  Shield,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Users,
  Calendar,
  Eye,
  MapPin,
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

export default function LossPreventionAnalysisPage() {
  const router = useRouter();
  const [vinData, setVinData] = useState<VINData | null>(null);
  const [vin, setVin] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [mmrData, setMmrData] = useState<MMRData | null>(null);
  const [currentAsk, setCurrentAsk] = useState<number>(142500);
  const [projectedLiquidation, setProjectedLiquidation] =
    useState<number>(135200);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [competitiveListings, setCompetitiveListings] = useState<
    CompetitiveListing[]
  >([
    {
      id: "1",
      vehicle: "2024 RS e-tron GT",
      miles: 850,
      price: 134900,
      distance: 4,
    },
    {
      id: "2",
      vehicle: "2024 RS e-tron GT",
      miles: 2100,
      price: 135500,
      distance: 12,
    },
    {
      id: "3",
      vehicle: "2024 RS e-tron GT",
      miles: 1420,
      price: 133200,
      distance: 15,
    },
    {
      id: "4",
      vehicle: "2024 RS e-tron GT",
      miles: 540,
      price: 138000,
      distance: 22,
    },
    {
      id: "5",
      vehicle: "2024 RS e-tron GT",
      miles: 3400,
      price: 132999,
      distance: 45,
    },
  ]);

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

  useEffect(() => {
    const storedVinData = sessionStorage.getItem("vinData");
    const storedVin = sessionStorage.getItem("vin");
    const storedMmr = sessionStorage.getItem("mmr");

    if (storedVinData && storedVin) {
      try {
        const rawData = JSON.parse(storedVinData);
        const transformedData: VINData = {
          vin: storedVin,
          make: rawData.summary?.make || rawData.make || "N/A",
          model: rawData.summary?.model || rawData.model || "N/A",
          year: rawData.summary?.year || rawData.year || null,
          trim:
            rawData.trimLevels?.Default?.General?.Trim ||
            rawData.trim ||
            "Base",
        };
        setVinData(transformedData);
        setVin(storedVin);
      } catch (error) {
        console.error("Error processing VIN data:", error);
        toast.error("Error loading vehicle data. Please try again.");
      }
    }

    if (storedMmr) {
      try {
        setMmrData(JSON.parse(storedMmr));
      } catch (e) {
        console.error("Error parsing MMR data:", e);
      }
    }

    // Fetch MMR if we have VIN but no stored data
    if (storedVin && !storedMmr) {
      fetchMmr(storedVin);
    }

    setIsLoading(false);
  }, [fetchMmr]);

  const handleBackToAlerts = () => {
    router.push("/vin-intel");
  };

  const suggestedPriceDiff = currentAsk - projectedLiquidation;
  const velocityDaysAt142k = 115;
  const velocityDaysAt135k = 12;
  const daysOnLot = 45;
  const vdpViews = 12;
  const marketSupply = 142;
  const odometer = 1240;

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
                  {vinData?.year} {vinData?.make} {vinData?.model}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  VIN: {vin || "WAU2ZZF8BAA21948"}
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
              <span className="ml-auto px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded">
                ACTION REQUIRED: IMMEDIATE
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Current Ask */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  CURRENT ASK
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  ${currentAsk.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  98th Percentile of Local Market
                </p>
              </div>

              {/* Suggested Price Difference */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  SUGGESTED PRICE DIFFERENCE
                </p>
                <p className="text-4xl font-bold text-red-600">
                  -${suggestedPriceDiff.toLocaleString()}
                </p>
              </div>

              {/* Projected Liquidation Price */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  PROJECTED LIQUIDATION PRICE
                </p>
                <p className="text-4xl font-bold text-green-600">
                  ${projectedLiquidation.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target price for &lt; 45 day turn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* MMR Section */}
            <MMRSection
              mmrData={mmrData}
              isLoading={isLoading}
              compact={true}
            />

            {/* Your Competition: Active Listings */}
            <Card>
              <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    YOUR COMPETITION: ACTIVE LISTINGS
                  </CardTitle>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    5 Matches Found
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
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
                          DIST.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {competitiveListings.map((listing, index) => (
                        <tr
                          key={listing.id}
                          className={`hover:bg-gray-50 ${index === 2 ? "bg-red-50" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-500" />
                              </div>
                              <span
                                className={`text-sm font-medium ${index === 2 ? "text-red-700" : "text-gray-900"}`}
                              >
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
                            {listing.distance} mi
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Velocity Projections Card */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  VELOCITY PROJECTIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">
                          {velocityDaysAt142k}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      VELOCITY GAP
                    </p>
                    <p className="text-sm text-gray-600">
                      EST. DAYS AT ${(currentAsk / 1000).toFixed(1)}K
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 mb-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {velocityDaysAt135k}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"></p>
                    <p className="text-sm text-gray-600">
                      EST. DAYS AT ${(projectedLiquidation / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liquidation Recommendation Card */}
            <Card className="bg-gray-900 text-white">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-2">
                  NEO'S STRATEGIC RECOMMENDATION
                </p>
                <h3 className="text-3xl font-bold italic mb-6">
                  LIQUIDATE ASAP
                </h3>
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-sm leading-relaxed opacity-95">
                    "Current market saturation is increasing rapidly. The local
                    supply for performance EVs has surged 300% in 45 days.
                    Holding this unit beyond 60 days will result in an
                    additional $4,500 depreciation loss based on wholesale
                    trends."
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-700/30 rounded-lg p-3 border border-red-600">
                    <p className="text-xs uppercase tracking-wide mb-1 opacity-75 text-red-300">
                      RISK EXPOSURE
                    </p>
                    <p className="text-lg font-bold">-$2,100 next 30d</p>
                  </div>
                  <div className="bg-green-700/30 rounded-lg p-3 border border-green-600">
                    <p className="text-xs uppercase tracking-wide mb-1 opacity-75 text-green-300">
                      OPPORTUNITY COST
                    </p>
                    <p className="text-lg font-bold">2.4x Re-investment</p>
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
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      DAYS ON LOT
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {daysOnLot} Days
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      VDP VIEWS
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {vdpViews}{" "}
                      <span className="text-red-600 text-sm">(-45%)</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      MARKET SUPPLY
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {marketSupply} Days
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      ODOMETER
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {odometer.toLocaleString()} mi
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
                  Are you sure you want to accept this liquidation strategy and
                  update the asking price to $
                  {projectedLiquidation.toLocaleString()}?
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
                      toast.success("Strategy accepted! Asking price updated.");
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
