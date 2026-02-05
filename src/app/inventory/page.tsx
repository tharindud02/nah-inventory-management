"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Car,
  DollarSign,
  Package,
  BarChart3,
  Eye,
  Edit,
  MoreVertical,
  Filter,
  Loader2,
  MoreHorizontal,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  MarketcheckAPI,
  getEmptyInventoryData,
  getDemoInventoryData,
  type InventoryCar,
  type KPIData,
} from "@/lib/marketcheck-api";

export default function InventoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [inventoryCars, setInventoryCars] = useState<InventoryCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalFound, setTotalFound] = useState(0);
  const [pageSize] = useState(20);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setInventoryCars([]);
      }
      setError(null);

      // Check if we're in demo mode or if API keys are available
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
      const apiKey = process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY;
      const dealerId = process.env.NEXT_PUBLIC_DEALER_ID || "1035095"; // Use example dealership ID as fallback

      if (isDemoMode || !apiKey) {
        const emptyData = getEmptyInventoryData();
        setKpiData(emptyData.kpiData);
        setInventoryCars(emptyData.inventoryCars);
        setTotalFound(0);
        setHasMore(false);
      } else {
        const api = new MarketcheckAPI(apiKey, dealerId);
        const start = isLoadMore ? inventoryCars.length : 0;
        const data = await api.fetchInventoryData(start, pageSize);

        if (isLoadMore) {
          setInventoryCars((prev) => [...prev, ...data.inventoryCars]);
        } else {
          setInventoryCars(data.inventoryCars);
          setKpiData(data.kpiData);
        }

        setTotalFound(data.totalFound);
        setHasMore(start + data.inventoryCars.length < data.totalFound);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load inventory data",
      );

      // Fallback to empty state on error
      const emptyData = getEmptyInventoryData();
      setKpiData(emptyData.kpiData);
      setInventoryCars(emptyData.inventoryCars);
      setTotalFound(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const lastCarElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadInventoryData(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore],
  );

  const handleCarClick = (car: InventoryCar) => {
    // Store car data in sessionStorage for the VIN intelligence page
    sessionStorage.setItem("vinData", JSON.stringify(car));
    sessionStorage.setItem("vin", car.vin);
    sessionStorage.setItem("carImage", car.image);

    // Store media data separately for the slider
    if (car.media?.photo_links) {
      sessionStorage.setItem(
        "carMedia",
        JSON.stringify({
          photo_links: car.media.photo_links,
          photo_links_cached: [], // No cached photos from inventory page
        }),
      );
    }

    // Navigate to VIN intelligence page
    router.push("/vin-intel/acquisition-intelligence-deep-dive");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "attention":
        return "bg-yellow-100 text-yellow-800";
      case "overpriced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "HEALTHY";
      case "attention":
        return "ATTENTION REQUIRED";
      case "overpriced":
        return "OVERPRICED";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <ProtectedRoute>
      <Layout
        title="Inventory Management"
        showSearch={true}
        searchPlaceholder="Search VIN, Stock#, or Model..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showLastUpdated={true}
      >
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Inventory", isCurrent: true }]} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading inventory data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading data: {error}</p>
              <Button onClick={() => loadInventoryData()}>Retry</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">
                        TOTAL RETAIL VALUE
                      </p>
                      <p className="text-xl font-bold">
                        ${kpiData?.totalRetailValue.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        ↑1.2%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">
                        TOTAL WHOLESALE VALUE
                      </p>
                      <p className="text-xl font-bold">
                        ${kpiData?.totalWholesaleValue.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-red-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        ↓0.5%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">
                        TOTAL PROJECTED GROSS PROFIT
                      </p>
                      <p className="text-xl font-bold">
                        $
                        {((kpiData?.totalProjectedProfit || 0) / 1000).toFixed(
                          1,
                        )}
                        k
                      </p>
                      <p className="text-xs text-red-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        ↓3%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">ACTIVE INVENTORY</p>
                      <p className="text-xl font-bold">
                        {kpiData?.activeInventory || 0} units
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +4
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">AVG. DAYS ON LOT</p>
                      <p className="text-xl font-bold">
                        {kpiData?.avgDaysOnLot || 0} days
                      </p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Alert</h3>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Overpriced ({kpiData?.overpricedCount || 0})
                </Button>
                <Button
                  variant="outline"
                  className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Attention Required ({kpiData?.attentionRequiredCount || 0})
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <div className="flex space-x-4">
                  <select className="border rounded px-3 py-2 text-sm bg-white">
                    <option>Price</option>
                    <option>Low to High</option>
                    <option>High to Low</option>
                  </select>
                  <select className="border rounded px-3 py-2 text-sm bg-white">
                    <option>Days on Lot</option>
                    <option>0-30 days</option>
                    <option>31-60 days</option>
                    <option>60+ days</option>
                  </select>
                  <select className="border rounded px-3 py-2 text-sm bg-white">
                    <option>Make/Model</option>
                    <option>All Makes</option>
                    <option>BMW</option>
                    <option>Mercedes-Benz</option>
                    <option>Porsche</option>
                    <option>Audi</option>
                    <option>Lexus</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {totalFound || kpiData?.activeInventory || 0} TOTAL UNITS
              </div>
            </div>

            {/* Inventory Grid */}
            {inventoryCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Inventory Items
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  There are currently no vehicles in your inventory. Add
                  vehicles to see them displayed here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventoryCars.map((item, index) => (
                  <Card
                    key={`${item.vin}-${index}`}
                    ref={
                      index === inventoryCars.length - 1
                        ? lastCarElementRef
                        : undefined
                    }
                    className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 pt-0 pb-4 cursor-pointer"
                    onClick={() => handleCarClick(item)}
                  >
                    {/* Car Image */}
                    <div className="w-full h-48 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={`${item.year} ${item.make} ${item.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="absolute inset-0 items-center justify-center hidden bg-gray-100">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold text-white
                          ${
                            item.status === "attention"
                              ? "bg-red-500"
                              : item.status === "healthy"
                                ? "bg-green-500"
                                : item.status === "overpriced"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                          }
                        `}
                      >
                        {getStatusText(item.status)}
                      </div>
                    </div>

                    <CardContent className="px-4 py-0">
                      {/* Car Title and Menu */}
                      <div className="flex items-center justify-between mb-0">
                        <h3 className="text-lg font-bold truncate flex-1 pr-2">
                          {item.year} {item.make} {item.model}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>

                      {/* Car Subtitle */}
                      <p className="text-sm text-gray-500 mb-2">
                        {item.trim || ""}
                      </p>

                      {/* VIN and Mileage */}
                      <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-2">
                        <span className="text-xs font-mono text-gray-700">
                          {item.vin}
                        </span>
                        <span className="text-sm font-semibold">
                          {item.mileage?.toLocaleString() || "0"} mi
                        </span>
                      </div>

                      {/* Retail Price */}
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">
                          RETAIL PRICE
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold">
                            ${item.price?.toLocaleString() || "0"}
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              (item.marketPercentage ?? 0) > 100
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.marketPercentage ?? 0}% Mkt
                          </p>
                        </div>
                      </div>

                      {/* Days on Lot - Moved to bottom */}
                      <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{item.daysOnLot || 0} Days on Lot</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Loading more vehicles...
                  </span>
                </div>
              </div>
            )}

            {/* End of Results Indicator */}
            {!hasMore && inventoryCars.length > 0 && !loadingMore && (
              <div className="flex justify-center py-8">
                <p className="text-sm text-gray-500">
                  Showing all {inventoryCars.length} vehicles
                </p>
              </div>
            )}
          </>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
