"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Search, ArrowRight, CheckCircle, Gauge } from "lucide-react";
import { toast } from "sonner";
import type { VinHistoryItem } from "@/lib/api/vin-history";
import { VinHistoryModal } from "@/components/vin-intel/VinHistoryModal";
import {
  normalizeAwsVinLookupToVinData,
  type AwsVinLookupData,
} from "@/lib/vindata-transform";

const VIN_LOOKUP_BASE =
  process.env.NEXT_PUBLIC_VIN_LOOKUP_API_URL ??
  "https://i3hjth9ogf.execute-api.ap-south-1.amazonaws.com";
const RECENT_LIMIT = 5;

interface RecentVinAnalysis {
  id: string;
  vinNumber: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  spec?: {
    make?: string;
    year?: number;
    model?: string;
    trim?: string;
    body_type?: string;
    vehicle_type?: string;
  };
  activeLocal?: {
    listings?: Array<{ miles?: number }>;
  };
  recentSolds?: {
    listings?: Array<{ miles?: number }>;
  };
  numberOfSolds?: {
    miles_stats?: { mean?: number };
  };
  createdAt: string;
}

export default function VINIntelPage() {
  const [vinInput, setVinInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vinHistory, setVinHistory] = useState<VinHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [buildSheetModalOpen, setBuildSheetModalOpen] = useState(false);
  const [miles, setMiles] = useState("");
  const [recentAnalyses, setRecentAnalyses] = useState<RecentVinAnalysis[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const router = useRouter();

  const persistDataAndNavigate = useCallback(
    (vin: string, vinData: Record<string, unknown>, awsLookup: AwsVinLookupData, milesValue: string) => {
      sessionStorage.removeItem("carImage");
      sessionStorage.removeItem("carMedia");
      sessionStorage.removeItem("vehicleSpecs");
      sessionStorage.setItem("vinData", JSON.stringify(vinData));
      sessionStorage.setItem("vin", vin);
      sessionStorage.setItem("vinLookupData", JSON.stringify(awsLookup));
      sessionStorage.setItem("vinMiles", milesValue);
      router.push("/vin-intel/vin-analysis");
    },
    [router],
  );

  const fetchVINData = useCallback(
    async (vin: string, mileageValue: string) => {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          toast.error("Please sign in to analyze a VIN.");
          return;
        }

        const mileage = mileageValue.trim().replace(/\D/g, "");
        if (!mileage || Number.parseInt(mileage, 10) <= 0) {
          toast.error("Please enter a valid mileage.");
          return;
        }

        const url = `${VIN_LOOKUP_BASE}/vin/lookup?vin=${encodeURIComponent(vin)}&mileage=${encodeURIComponent(mileage)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const text = await res.text();
        if (!text.trim().startsWith("{")) {
          throw new Error("VIN lookup is not available. Please try again later.");
        }

        const json = JSON.parse(text) as {
          data?: AwsVinLookupData;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(json.error ?? `Request failed: ${res.status}`);
        }

        const rawData = json.data;
        if (!rawData) {
          throw new Error("No data returned from VIN lookup.");
        }

        const spec = rawData.spec;
        if (spec?.is_valid === false) {
          toast.error("Invalid VIN or unable to decode.");
          return;
        }

        const vinData = normalizeAwsVinLookupToVinData({ data: rawData }, vin);
        persistDataAndNavigate(vin, vinData, rawData, mileage);
      } catch (error) {
        console.error("Error fetching VIN data:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to decode VIN. Please check the VIN and try again.";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [persistDataAndNavigate],
  );

  const handleAnalyzeVIN = () => {
    if (!vinInput.trim()) {
      toast.warning("Please enter a VIN number");
      return;
    }

    if (vinInput.length !== 17) {
      toast.error("Please enter a valid 17-digit VIN number");
      return;
    }

    const mileageTrimmed = miles.trim().replace(/\D/g, "");
    if (!mileageTrimmed || Number.parseInt(mileageTrimmed, 10) <= 0) {
      toast.error("Please enter mileage.");
      return;
    }

    fetchVINData(vinInput.trim(), mileageTrimmed);
  };

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      setRecentLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const res = await fetch(`${VIN_LOOKUP_BASE}/vin`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch recent VIN analyses");
          return;
        }

        const json = await res.json() as { data?: RecentVinAnalysis[] };
        if (json.data) {
          setRecentAnalyses(json.data);
        }
      } catch (error) {
        console.error("Error fetching recent analyses:", error);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecentAnalyses();
  }, []);

  const recentlyAnalyzedUnits = recentAnalyses.slice(0, RECENT_LIMIT);
  const recentBuildSheets = vinHistory.slice(0, RECENT_LIMIT);

  const recentAnalysesAsHistoryItems: VinHistoryItem[] = useMemo(() => {
    return recentAnalyses.map((item) => {
      const miles = item.activeLocal?.listings?.[0]?.miles ?? 
                    item.recentSolds?.listings?.[0]?.miles ?? 
                    item.numberOfSolds?.miles_stats?.mean;
      
      return {
        vin: item.vinNumber,
        year: item.spec?.year ?? item.year,
        make: item.spec?.make ?? item.make,
        model: item.spec?.model ?? item.model,
        trim: item.spec?.trim ?? item.trim,
        searchDate: new Date(item.createdAt).toLocaleDateString(),
        createdAt: item.createdAt,
        miles: miles ? Math.round(miles) : undefined,
      };
    });
  }, [recentAnalyses]);

  const handleViewFromHistory = useCallback(
    (item: VinHistoryItem) => {
      const mileage = item.miles?.toString() || miles.trim().replace(/\D/g, "");
      if (!mileage || Number.parseInt(mileage, 10) <= 0) {
        toast.error("Please enter mileage before viewing.");
        return;
      }
      fetchVINData(item.vin, mileage);
    },
    [fetchVINData, miles],
  );

  return (
    <ProtectedRoute>
      <Layout title="VIN Intel">
        <div className="mb-6">
          <Breadcrumb items={[{ label: "VIN Intel", isCurrent: true }]} />
        </div>

        <div className="text-center w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Let's see what this car has to offer..
            </h2>
          </div>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Enter a Vehicle Identification Number to retrieve high-fidelity
            equipment data, recall history, and market valuation.
          </p>

          <div className="max-w-3xl mx-auto mb-8">
            {/* VIN Input Card with Miles */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              {/* VIN Input Row */}
              <div className="relative flex items-center px-5 py-4">
                <Search className="text-gray-400 w-6 h-6 shrink-0 mr-4" />
                <Input
                  placeholder="Enter 17-digit VIN..."
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value)}
                  className="flex-1 text-xl bg-transparent border-0 shadow-none focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:border-0 h-12 px-0"
                />
                <button
                  className="text-white px-6 py-2.5 text-base font-medium rounded-lg flex items-center transition-colors duration-200 hover:opacity-90 disabled:opacity-50 shrink-0 ml-4"
                  style={{ backgroundColor: "#136dec" }}
                  onClick={handleAnalyzeVIN}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze VIN
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Miles Row */}
              <div className="flex items-center px-5 py-3">
                <Gauge className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                <Input
                  placeholder="Miles (required)"
                  type="text"
                  inputMode="numeric"
                  value={miles}
                  onChange={(e) => setMiles(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 h-9 bg-transparent border-0 shadow-none focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:border-0 px-0 text-base"
                />
              </div>
            </div>

            {/* Features */}
            <div className="flex justify-center flex-wrap gap-x-8 gap-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                <span>Validates North American VINs</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                <span>Real-time Market Data</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                <span>Full Build Sheet Access</span>
              </div>
            </div>
          </div>

          {/* Recent Sections */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    RECENTLY ANALYZED UNITS
                  </h3>
                  {recentAnalyses.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/90"
                      onClick={() => setAnalysisModalOpen(true)}
                    >
                      View more
                    </Button>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {recentLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="h-5 w-5 mx-auto border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : recentlyAnalyzedUnits.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No records found
                    </div>
                  ) : (
                    recentlyAnalyzedUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-800">
                            {unit.spec?.year ?? unit.year} {unit.spec?.make ?? unit.make} {unit.spec?.model ?? unit.model}
                            {unit.spec?.trim || unit.trim ? ` ${unit.spec?.trim ?? unit.trim}` : ""}
                          </div>
                          <div className="text-xs text-gray-400">
                            VIN: {unit.vinNumber}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(unit.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    RECENTLY PULLED BUILD SHEETS
                  </h3>
                  {vinHistory.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/90"
                      onClick={() => setBuildSheetModalOpen(true)}
                    >
                      View more
                    </Button>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {historyLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="h-5 w-5 mx-auto border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : recentBuildSheets.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No records found
                    </div>
                  ) : (
                    recentBuildSheets.map((sheet) => (
                      <div
                        key={sheet.vin}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-800">
                            {sheet.year} {sheet.make} {sheet.model}
                            {sheet.trim ? ` ${sheet.trim}` : ""}
                          </div>
                          <div className="text-xs text-gray-400">
                            VIN: {sheet.vin}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {sheet.searchDate}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <VinHistoryModal
            open={analysisModalOpen}
            onOpenChange={setAnalysisModalOpen}
            items={recentAnalysesAsHistoryItems}
            variant="analysis"
            onViewItem={handleViewFromHistory}
          />
          <VinHistoryModal
            open={buildSheetModalOpen}
            onOpenChange={setBuildSheetModalOpen}
            items={vinHistory}
            variant="buildSheet"
            onViewItem={handleViewFromHistory}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
