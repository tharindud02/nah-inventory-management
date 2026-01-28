"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Search,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Car,
  DollarSign,
  Users,
  Package,
  LogOut,
  Activity,
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VINData {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  body?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  odometer?: number;
  exterior_color?: string;
  interior_color?: string;
  options?: string[];
  market_data?: {
    estimated_market_value?: number;
    retail_turn_rate?: number;
    avg_days_to_sell?: number;
    market_days_supply?: number;
    active_local?: number;
    consumer_interest?: number;
    sold_90d?: number;
  };
}

export default function VINDeepDivePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [vinData, setVinData] = useState<VINData | null>(null);
  const [vin, setVin] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const marketDataFetchedRef = useRef(false);

  useEffect(() => {
    // Retrieve VIN data from sessionStorage
    const storedVinData = sessionStorage.getItem("vinData");
    const storedVin = sessionStorage.getItem("vin");

    if (storedVinData && storedVin) {
      try {
        const rawData = JSON.parse(storedVinData);
        // Transform MarketCheck API data to expected format
        const transformedData = transformVinData(rawData, storedVin);
        setVinData(transformedData);
        setVin(storedVin);

        // Fetch additional market data only if not already fetched
        if (!marketDataFetchedRef.current) {
          fetchMarketData(storedVin, transformedData);
          marketDataFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error parsing VIN data:", error);
        toast.error("Error loading vehicle data. Please try again.");
      }
    } else {
      toast.info("No vehicle data found. Please analyze a VIN first.");
    }
    setIsLoading(false);
  }, []);

  // Fetch market data from various MarketCheck APIs
  const fetchMarketData = async (vin: string, currentData: VINData) => {
    // Prevent multiple simultaneous calls
    if (marketDataFetchedRef.current) return;

    try {
      // Show loading toast with ID so we can dismiss it properly
      const loadingToastId = toast.loading(
        "Analyzing vehicle and fetching market data...",
      );

      const requests = [
        // Market Days Supply
        fetch("/api/vindata/market-days-supply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin }),
        }),

        // Estimated Market Value
        fetch("/api/vindata/estimated-market-value", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vin,
            miles: currentData.odometer,
            zip: "90210",
          }),
        }),

        // Inventory Stats (avg days to sell, sold 90d, active local)
        fetch("/api/vindata/inventory-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin }),
        }),

        // Consumer Interest
        fetch("/api/vindata/consumer-interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: currentData.year,
            make: currentData.make,
            model: currentData.model,
          }),
        }),
      ];

      const responses = await Promise.allSettled(requests);

      const marketDataUpdates: Partial<VINData["market_data"]> = {};

      // Process Market Days Supply
      if (responses[0].status === "fulfilled") {
        const result = await responses[0].value.json();
        if (result.success && result.data) {
          // Extract the actual market days supply value - check for mds field first
          const mdsData =
            result.data.mds || result.data.market_days_supply || result.data;
          if (typeof mdsData === "object" && mdsData !== null) {
            marketDataUpdates.market_days_supply =
              mdsData.mean || mdsData.median || mdsData.value || null;
          } else if (typeof mdsData === "number") {
            marketDataUpdates.market_days_supply = mdsData;
          }
        }
      }

      // Process Estimated Market Value
      if (responses[1].status === "fulfilled") {
        const result = await responses[1].value.json();
        if (result.success && result.data) {
          // Extract the marketcheck_price value
          const priceData =
            result.data.marketcheck_price ||
            result.data.predicted_price ||
            result.data.price;
          if (typeof priceData === "number") {
            marketDataUpdates.estimated_market_value = priceData;
          } else if (typeof priceData === "object" && priceData !== null) {
            marketDataUpdates.estimated_market_value =
              priceData.mean || priceData.median || priceData.value || null;
          }
        }
      }

      // Process Inventory Stats
      if (responses[2].status === "fulfilled") {
        const result = await responses[2].value.json();
        if (result.success && result.data) {
          const stats = result.data;

          // Extract avg days to sell from stats object
          if (stats.avg_days_to_sell) {
            if (
              typeof stats.avg_days_to_sell === "object" &&
              stats.avg_days_to_sell !== null
            ) {
              marketDataUpdates.avg_days_to_sell =
                stats.avg_days_to_sell.mean ||
                stats.avg_days_to_sell.median ||
                null;
            } else if (typeof stats.avg_days_to_sell === "number") {
              marketDataUpdates.avg_days_to_sell = stats.avg_days_to_sell;
            }
          }

          // Sold count and active local should be simple numbers
          marketDataUpdates.sold_90d =
            typeof stats.sold_90d === "number" ? stats.sold_90d : null;
          marketDataUpdates.active_local =
            typeof stats.active_local === "number" ? stats.active_local : null;
        }
      }

      // Process Consumer Interest
      if (responses[3].status === "fulfilled") {
        const result = await responses[3].value.json();
        if (result.success && result.data) {
          // Consumer interest is derived from popular cars data - look for sales volume or ranking
          const interestData =
            result.data.sales_volume ||
            result.data.volume ||
            result.data.rank ||
            result.data.popularity_score;
          if (typeof interestData === "object" && interestData !== null) {
            marketDataUpdates.consumer_interest =
              interestData.mean ||
              interestData.median ||
              interestData.value ||
              null;
          } else if (typeof interestData === "number") {
            marketDataUpdates.consumer_interest = interestData;
          } else if (Array.isArray(result.data) && result.data.length > 0) {
            // If data is an array of popular cars, use the first item's ranking or volume
            const firstItem = result.data[0];
            marketDataUpdates.consumer_interest =
              firstItem.sales_volume ||
              firstItem.rank ||
              firstItem.volume ||
              null;
          }
        }
      }

      // Derive Retail Turn Rate from Market Days Supply
      // Retail Turn Rate = 1 / Market Days Supply * 100 (approximate monthly turn rate)
      if (
        marketDataUpdates.market_days_supply &&
        typeof marketDataUpdates.market_days_supply === "number"
      ) {
        // Convert to monthly turn rate (30 days)
        marketDataUpdates.retail_turn_rate =
          Math.round((30 / marketDataUpdates.market_days_supply) * 100) / 100;
      }

      // Update VIN data with market information
      setVinData((prev) =>
        prev
          ? {
              ...prev,
              market_data: {
                ...prev.market_data,
                ...marketDataUpdates,
              },
            }
          : null,
      );

      toast.dismiss(loadingToastId);
      toast.success("VIN analysis complete!");
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast.dismiss(loadingToastId);
      toast.error("Some market data could not be loaded");
    }
  };

  // Helper function to safely format market data values
  const formatMarketValue = (value: any): string => {
    if (value === null || value === undefined || typeof value === "object") {
      return "N/A";
    }
    if (typeof value === "number") {
      return `$${value.toLocaleString()}`;
    }
    return "N/A";
  };

  const formatPercentage = (value: any): string => {
    if (value === null || value === undefined || typeof value === "object") {
      return "N/A";
    }
    if (typeof value === "number") {
      return `${value}%`;
    }
    return "N/A";
  };

  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || typeof value === "object") {
      return "N/A";
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return "N/A";
  };

  // Transform MarketCheck API response to frontend format
  const transformVinData = (rawData: any, vin: string): VINData => {
    try {
      const summary = rawData.summary || {};
      const trimLevels = rawData.trimLevels || {};
      const defaultTrim = trimLevels.Default || {};
      const general = defaultTrim.General || {};
      const engine = defaultTrim.Engine || {};
      const mechanical = defaultTrim.Mechanical || {};
      const exterior = defaultTrim.Exterior || {};
      const interior = defaultTrim.Interior || {};

      // Get odometer from title information
      const odometerInfo = rawData.odometerInformation?.[0];
      const odometer = odometerInfo?.reportedOdometer || null;

      return {
        vin: vin,
        make: summary.make || general.make || "N/A",
        model: summary.model || general.model || "N/A",
        year: summary.year || general["Model Year"] || null,
        trim: general.Trim || "Base",
        body: general["Body Class"] || "N/A",
        engine:
          `${engine["Engine Number of Cylinders"]}-Cylinder ${engine["Fuel Type - Primary"] || ""}`.trim() ||
          "N/A",
        transmission:
          `${mechanical["Transmission Speeds"]}-Speed ${mechanical["Transmission Style"]}` ||
          "N/A",
        drivetrain: mechanical["Drive Type"] || "N/A",
        fuel_type: engine["Fuel Type - Primary"] || "N/A",
        odometer: odometer,
        exterior_color: "N/A", // Not provided by MarketCheck API
        interior_color: "N/A", // Not provided by MarketCheck API
        options: [], // Could be extracted from trim levels if needed
        market_data: {
          // MarketCheck API doesn't provide market data, so these remain undefined
          estimated_market_value: undefined,
          retail_turn_rate: undefined,
          avg_days_to_sell: undefined,
          market_days_supply: undefined,
          active_local: undefined,
          consumer_interest: undefined,
          sold_90d: undefined,
        },
      };
    } catch (error) {
      console.error("Error transforming VIN data:", error);
      // Return minimal data if transformation fails
      return {
        vin: vin,
        make: "N/A",
        model: "N/A",
        year: undefined,
        market_data: {},
      };
    }
  };

  const soldComparables = [
    {
      year: 2022,
      make: "Porsche",
      model: "911 Carrera S",
      miles: 8420,
      price: "$139,900",
      soldDate: "2 days ago",
    },
    {
      year: 2022,
      make: "Porsche",
      model: "911 Carrera S",
      miles: 12150,
      price: "$137,500",
      soldDate: "5 days ago",
    },
    {
      year: 2021,
      make: "Porsche",
      model: "911 Carrera S",
      miles: 15420,
      price: "$135,800",
      soldDate: "1 week ago",
    },
  ];

  const activeListings = [
    {
      year: 2022,
      make: "Porsche",
      model: "911 Carrera S",
      miles: 7850,
      price: "$141,200",
      distance: "12 mi",
      dom: "15 days",
    },
    {
      year: 2022,
      make: "Porsche",
      model: "911 Carrera S",
      miles: 9200,
      price: "$138,900",
      distance: "8 mi",
      dom: "22 days",
    },
    {
      year: 2022,
      make: "Porsche",
      model: "911 Carrera S",
      miles: 11200,
      price: "$136,500",
      distance: "25 mi",
      dom: "38 days",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm fixed left-0 top-0 h-screen flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Inventory Hub
              </h2>
            </div>
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/dashboard")}
              >
                <Package className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                className="w-full justify-start text-white"
                style={{ backgroundColor: "#136dec" }}
              >
                <Search className="w-4 h-4 mr-2" />
                VIN Intel
              </Button>
            </nav>

            {/* Sign Out Button at Bottom */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-64 p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/vin-intel")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to VIN Intel
                </Button>
                <div className="text-lg font-medium text-gray-700">
                  VIN: {vin || "Loading..."}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">
                  Loading vehicle data...
                </span>
              </div>
            )}

            {/* Vehicle Information */}
            {!isLoading && vinData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {vinData.year} {vinData.make?.toUpperCase()}{" "}
                          {vinData.model?.toUpperCase()}
                          {vinData.trim && (
                            <>
                              <br />
                              {vinData.trim.toUpperCase()}
                            </>
                          )}
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                          {vinData.trim && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {vinData.trim}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {vinData.odometer?.toLocaleString() || "N/A"} mi
                          </span>
                          {vinData.exterior_color && (
                            <>
                              <span>•</span>
                              <span>{vinData.exterior_color}</span>
                            </>
                          )}
                          {vinData.engine && (
                            <>
                              <span>•</span>
                              <span>{vinData.engine}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-4 ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Estimated Market Value
                          </div>
                          <div className="text-4xl font-bold text-gray-900">
                            {formatMarketValue(
                              vinData.market_data?.estimated_market_value,
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="flex items-center whitespace-nowrap"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Pull Build Sheet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="text-center p-3">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      Retail Turn Rate
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(vinData.market_data?.retail_turn_rate)}
                    </div>
                  </Card>
                  <Card className="text-center p-3">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      Avg. Days to Sell
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(vinData.market_data?.avg_days_to_sell)}
                    </div>
                  </Card>
                  <Card className="text-center p-3">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      Active Local
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(vinData.market_data?.active_local)}
                    </div>
                  </Card>
                  <Card className="text-center p-3">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      Mkt Days Supply
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatNumber(vinData.market_data?.market_days_supply)}
                    </div>
                  </Card>
                  <Card className="text-center p-3">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      Sold (90D)
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(vinData.market_data?.sold_90d)}
                    </div>
                  </Card>
                  <Card className="text-center p-3">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      Consumer Interest
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(vinData.market_data?.consumer_interest)}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Error State */}
            {!isLoading && !vinData && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Vehicle Data Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Unable to retrieve vehicle information. Please try again.
                </p>
                <Button onClick={() => router.push("/vin-intel")}>
                  Back to VIN Intel
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
