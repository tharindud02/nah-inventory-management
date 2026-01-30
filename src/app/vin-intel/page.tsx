"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import {
  Search,
  ArrowRight,
  CheckCircle,
  Package,
  Car,
  DollarSign,
  LogOut,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast, Toaster } from "sonner";
import { Tooltip } from "react-tooltip";

export default function VINIntelPage() {
  const [vinInput, setVinInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const fetchVehicleSpecs = async (vin: string) => {
    try {
      const response = await fetch("/api/cars/vehicle-specs/neovin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vin }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          (errorData && (errorData.error || errorData.details)) ||
            `Failed to fetch vehicle specs: ${response.status}`,
        );
      }

      const result = await response.json();
      if (result?.success && result.data) {
        return result.data;
      }

      throw new Error("Vehicle specs response missing data");
    } catch (error) {
      console.error("Error fetching vehicle specs:", error);
      toast.warning(
        error instanceof Error
          ? error.message
          : "Unable to fetch build sheet data for this VIN.",
      );
      return null;
    }
  };

  const persistDataAndNavigate = async (
    vin: string,
    vinData: any,
    extras?: { reportId?: string },
  ) => {
    sessionStorage.setItem("vinData", JSON.stringify(vinData));
    sessionStorage.setItem("vin", vin);

    if (extras?.reportId) {
      sessionStorage.setItem("reportId", extras.reportId);
    }

    const vehicleSpecs = await fetchVehicleSpecs(vin);
    if (vehicleSpecs) {
      sessionStorage.setItem("vehicleSpecs", JSON.stringify(vehicleSpecs));
    } else {
      sessionStorage.removeItem("vehicleSpecs");
    }

    router.push("/vin-intel/acquisition-intelligence-deep-dive");
  };

  const fetchVINData = async (vin: string) => {
    setIsLoading(true);

    try {
      // Step 1: Generate the VIN report
      const generateResponse = await fetch("/api/vindata/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vin }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(
          errorData.error ||
            `Failed to generate report: ${generateResponse.status}`,
        );
      }

      const generateResult = await generateResponse.json();

      if (!generateResult.success) {
        throw new Error("Failed to generate VIN report");
      }

      // Check if we got direct data or need to access via report ID
      if (generateResult.hasDirectData && generateResult.data) {
        // We got the data directly, no need for separate access call
        const vinData = generateResult.data;
        await persistDataAndNavigate(vin, vinData);
        return;
      }

      // If we have a report ID, access the report separately
      if (generateResult.reportId) {
        const reportId = generateResult.reportId;

        // Step 2: Access the generated report
        const accessResponse = await fetch("/api/vindata/access-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reportId }),
        });

        if (!accessResponse.ok) {
          const errorData = await accessResponse.json();
          throw new Error(
            errorData.error ||
              `Failed to access report: ${accessResponse.status}`,
          );
        }

        const accessResult = await accessResponse.json();

        if (!accessResult.success) {
          throw new Error("Failed to retrieve VIN data");
        }

        const vinData = accessResult.data;

        await persistDataAndNavigate(vin, vinData, { reportId });
      } else {
        throw new Error("No report ID received from generate endpoint");
      }
    } catch (error) {
      console.error("Error fetching VIN data:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch VIN data. Please check the VIN and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const recentlyAnalyzedUnits = [];

  const recentBuildSheets = [];

  return (
    <ProtectedRoute>
      <Layout title="VIN Intel">
        {/* Hero Section */}
        <div className="text-center w-full max-w-6xl">
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
              <div className="bg-white rounded-lg">
                <div className="px-4 py-3">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    RECENTLY ANALYZED UNITS
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentlyAnalyzedUnits.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="text-sm text-gray-500">
                        No records found
                      </div>
                    </div>
                  ) : (
                    recentlyAnalyzedUnits.map((unit: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-800">
                            {unit.year} {unit.make} {unit.model}
                          </div>
                          <div className="text-xs text-gray-400">
                            VIN: {unit.vin}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {unit.analyzedAt}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recently Pulled Build Sheets */}
              <div className="bg-white rounded-lg">
                <div className="px-4 py-3">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    RECENTLY PULLED BUILD SHEETS
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentBuildSheets.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="text-sm text-gray-500">
                        No records found
                      </div>
                    </div>
                  ) : (
                    recentBuildSheets.map((sheet: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-800">
                            {sheet.year} {sheet.make} {sheet.model}
                          </div>
                          <div className="text-xs text-gray-400">
                            VIN: {sheet.vin}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {sheet.pulledAt}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
