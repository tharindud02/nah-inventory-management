"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Search, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { VinHistoryItem } from "@/lib/api/vin-history";
import { VinHistoryModal } from "@/components/vin-intel/VinHistoryModal";
import { normalizeMarketCheckDecodeResponse } from "@/lib/vindata-transform";

const RECENT_LIMIT = 5;

export default function VINIntelPage() {
  const [vinInput, setVinInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vinHistory, setVinHistory] = useState<VinHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [buildSheetModalOpen, setBuildSheetModalOpen] = useState(false);
  const router = useRouter();

  const persistDataAndNavigate = useCallback(
    (vin: string, vinData: Record<string, unknown>) => {
      sessionStorage.removeItem("carImage");
      sessionStorage.removeItem("carMedia");
      sessionStorage.removeItem("vehicleSpecs");
      sessionStorage.setItem("vinData", JSON.stringify(vinData));
      sessionStorage.setItem("vin", vin);
      router.push("/vin-intel/vin-analysis");
    },
    [router],
  );

  const fetchVINData = useCallback(
    async (vin: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/vindata/vin-decode?vin=${encodeURIComponent(vin)}`,
        );
        const text = await res.text();
        if (text.startsWith("<") || !text.trim().startsWith("{")) {
          throw new Error(
            "VIN lookup is not available. Please try again later.",
          );
        }
        let json: { success?: boolean; error?: string; data?: unknown };
        try {
          json = JSON.parse(text) as typeof json;
        } catch {
          throw new Error("Invalid response from server.");
        }

        if (!json.success) {
          throw new Error(json.error ?? "VIN decode failed");
        }

        const raw = (json.data ?? {}) as Record<string, unknown>;
        if (raw.is_valid === false) {
          toast.error("Invalid VIN or unable to decode.");
          return;
        }

        const vinData = normalizeMarketCheckDecodeResponse(raw, vin);
        persistDataAndNavigate(vin, vinData);
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

  useEffect(() => {
    setHistoryLoading(false);
  }, []);

  const handleAnalyzeVIN = () => {
    if (!vinInput.trim()) {
      toast.warning("Please enter a VIN number");
      return;
    }

    if (vinInput.length !== 17) {
      toast.error("Please enter a valid 17-digit VIN number");
      return;
    }

    fetchVINData(vinInput.trim());
  };

  const recentlyAnalyzedUnits = vinHistory.slice(0, RECENT_LIMIT);
  const recentBuildSheets = vinHistory.slice(0, RECENT_LIMIT);

  const handleViewFromHistory = useCallback(
    (item: VinHistoryItem) => {
      fetchVINData(item.vin);
    },
    [fetchVINData]
  );

  return (
    <ProtectedRoute>
      <Layout title="VIN Intel">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: "VIN Intel", isCurrent: true }]} />
        </div>

        {/* Hero Section */}
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

          {/* VIN Input Section */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-7 h-7" />
              <Input
                placeholder="Enter 17-digit VIN..."
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value)}
                style={{
                  border: "none !important",
                  borderWidth: "0 !important",
                  borderStyle: "none !important",
                  borderColor: "transparent !important",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important",
                  outline: "none !important",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  background: "white !important",
                  backgroundColor: "white !important",
                }}
                className="pl-16 pr-36 py-6 text-2xl bg-white shadow-lg border-0 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:border-0 w-full h-20"
              />
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white px-8 py-4 text-lg font-medium rounded-md flex items-center h-14 transition-colors duration-200 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#136dec" }}
                onClick={handleAnalyzeVIN}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze VIN
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Validates North American VINs</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Real-time Market Data</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Full Build Sheet Access</span>
              </div>
            </div>
          </div>

          {/* Recent Sections */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recently Analyzed Units */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    RECENTLY ANALYZED UNITS
                  </h3>
                  {vinHistory.length > 0 && (
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
                  {historyLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="h-5 w-5 mx-auto border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : recentlyAnalyzedUnits.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="text-sm text-gray-500">
                        No records found
                      </div>
                    </div>
                  ) : (
                    recentlyAnalyzedUnits.map((unit) => (
                      <div
                        key={unit.vin}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-800">
                            {unit.year} {unit.make} {unit.model}
                            {unit.trim ? ` ${unit.trim}` : ""}
                          </div>
                          <div className="text-xs text-gray-400">
                            VIN: {unit.vin}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {unit.searchDate}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recently Pulled Build Sheets */}
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
                    <div className="px-4 py-8 text-center">
                      <div className="text-sm text-gray-500">
                        No records found
                      </div>
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
            items={vinHistory}
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
