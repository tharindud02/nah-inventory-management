"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
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
} from "lucide-react";
import {
  MarketcheckAPI,
  getDemoInventoryData,
  type InventoryCar,
  type KPIData,
} from "@/lib/marketcheck-api";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [inventoryCars, setInventoryCars] = useState<InventoryCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in demo mode or if API keys are available
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
      const apiKey = process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY;
      const dealerId = process.env.NEXT_PUBLIC_DEALER_ID;

      if (isDemoMode || !apiKey || !dealerId) {
        console.log("Using demo data");
        const demoData = getDemoInventoryData();
        setKpiData(demoData.kpiData);
        setInventoryCars(demoData.inventoryCars);
      } else {
        console.log("Using Marketcheck API");
        const api = new MarketcheckAPI(apiKey, dealerId);
        const data = await api.fetchInventoryData(50);
        setKpiData(data.kpiData);
        setInventoryCars(data.inventoryCars);
      }
    } catch (err) {
      console.error("Error loading inventory data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load inventory data",
      );

      // Fallback to demo data on error
      const demoData = getDemoInventoryData();
      setKpiData(demoData.kpiData);
      setInventoryCars(demoData.inventoryCars);
    } finally {
      setLoading(false);
    }
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
              <Button onClick={loadInventoryData}>Retry</Button>
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
                {kpiData?.activeInventory || 0} TOTAL UNITS
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventoryCars.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 relative">
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
                    <div className="absolute inset-0 items-center justify-center hidden">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {getStatusText(item.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-1">
                      {item.year} {item.make} {item.model}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">{item.vin}</p>
                    <p className="text-xs text-gray-600 mb-3">
                      {item.mileage.toLocaleString()} mi
                    </p>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xl font-bold">
                          ${item.price.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            item.marketPercentage > 100
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.marketPercentage > 100 ? "↑" : "↓"}{" "}
                          {Math.abs(item.marketPercentage)}% Mkt
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Days on Lot</p>
                        <p className="text-sm font-semibold">
                          {item.daysOnLot}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <Button variant="ghost" size="sm" className="p-1 h-8">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="p-1 h-8">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 h-8">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
