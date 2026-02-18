"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock data for the tables
const overSuggestedPriceData = [
  {
    id: 1,
    vin: "1N4AL3AP9JC123456",
    year: 2021,
    make: "Nissan",
    model: "Altima",
    trim: "SV",
    mileage: 45230,
    ourPrice: 18995,
    suggestedPrice: 16995,
    overPriceBy: 2000,
    daysInStock: 45,
    status: "active",
  },
  {
    id: 2,
    vin: "2T3BF4DV9KW123456",
    year: 2019,
    make: "Toyota",
    model: "RAV4",
    trim: "XLE",
    mileage: 62100,
    ourPrice: 24995,
    suggestedPrice: 22995,
    overPriceBy: 2000,
    daysInStock: 62,
    status: "active",
  },
  {
    id: 3,
    vin: "1G1YZ23J9NF123456",
    year: 2022,
    make: "Chevrolet",
    model: "Malibu",
    trim: "LT",
    mileage: 28500,
    ourPrice: 21995,
    suggestedPrice: 19995,
    overPriceBy: 2000,
    daysInStock: 28,
    status: "active",
  },
];

const marketUpdatesData = [
  {
    id: 1,
    vin: "1N4AL3AP9JC123456",
    year: 2021,
    make: "Nissan",
    model: "Altima",
    trim: "SV",
    mileage: 45230,
    currentPrice: 18995,
    newMarketPrice: 17995,
    priceChange: -1000,
    priceChangePercent: -5.3,
    lastUpdated: "2 hours ago",
    trend: "down",
  },
  {
    id: 2,
    vin: "2T3BF4DV9KW123456",
    year: 2019,
    make: "Toyota",
    model: "RAV4",
    trim: "XLE",
    mileage: 62100,
    currentPrice: 24995,
    newMarketPrice: 25995,
    priceChange: 1000,
    priceChangePercent: 4.0,
    lastUpdated: "4 hours ago",
    trend: "up",
  },
  {
    id: 3,
    vin: "1G1YZ23J9NF123456",
    year: 2022,
    make: "Chevrolet",
    model: "Malibu",
    trim: "LT",
    mileage: 28500,
    currentPrice: 21995,
    newMarketPrice: 21495,
    priceChange: -500,
    priceChangePercent: -2.3,
    lastUpdated: "1 hour ago",
    trend: "down",
  },
];

export default function InventoryAlertsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("all");
  const { user } = useAuth();

  const handleViewVehicle = (vin: string) => {
    toast.info(`Viewing vehicle details for VIN: ${vin}`);
  };

  const handleDismissAlert = (id: number) => {
    toast.success("Alert dismissed successfully");
  };

  const handleRefreshData = () => {
    toast.success("Data refreshed successfully");
  };

  const handleExportData = () => {
    toast.success("Data exported successfully");
  };

  const handleFilter = () => {
    toast.info("Filter options coming soon");
  };

  return (
    <ProtectedRoute>
      <Layout
        title="Inventory Alerts Management Center"
        showSearch={true}
        searchPlaceholder="Search by VIN, make, model..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb
            items={[{ label: "Inventory Alerts", isCurrent: true }]}
          />
        </div>

        {/* Critical Issues Summary */}
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Critical Issues Detected
                  </h3>
                  <p className="text-red-700">
                    3 vehicles priced above market value, 2 with significant
                    market price changes
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleRefreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTab("all")}
              >
                All Alerts (
                {overSuggestedPriceData.length + marketUpdatesData.length})
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "overpriced"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTab("overpriced")}
              >
                Over Suggested Price ({overSuggestedPriceData.length})
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "market"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTab("market")}
              >
                Market Updates ({marketUpdatesData.length})
              </button>
            </nav>
          </div>
        </div>

        {/* OVER SUGGESTED PRICE INVENTORY Section */}
        {(selectedTab === "all" || selectedTab === "overpriced") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                OVER SUGGESTED PRICE INVENTORY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        VIN
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Mileage
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Our Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Suggested Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Over By
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Days in Stock
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overSuggestedPriceData.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-gray-500">{vehicle.trim}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {vehicle.vin}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {vehicle.mileage.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          ${vehicle.ourPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          ${vehicle.suggestedPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ${vehicle.overPriceBy.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {vehicle.daysInStock}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewVehicle(vehicle.vin)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissAlert(vehicle.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NEW MARKET UPDATES ON PRICING Section */}
        {(selectedTab === "all" || selectedTab === "market") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                NEW MARKET UPDATES ON PRICING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        VIN
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Current Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        New Market Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Price Change
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Last Updated
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketUpdatesData.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-gray-500">{vehicle.trim}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {vehicle.vin}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          ${vehicle.currentPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          ${vehicle.newMarketPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            {vehicle.trend === "up" ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span
                              className={`font-medium ${
                                vehicle.trend === "up"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ${Math.abs(vehicle.priceChange).toLocaleString()}{" "}
                              ({vehicle.priceChangePercent}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {vehicle.lastUpdated}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewVehicle(vehicle.vin)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissAlert(vehicle.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">
              {selectedTab === "all" || selectedTab === "overpriced"
                ? overSuggestedPriceData.length
                : 0}
            </span>{" "}
            of{" "}
            <span className="font-medium">
              {selectedTab === "all"
                ? overSuggestedPriceData.length + marketUpdatesData.length
                : selectedTab === "overpriced"
                  ? overSuggestedPriceData.length
                  : marketUpdatesData.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
