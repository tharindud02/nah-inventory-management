"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const inventoryItems = [
    {
      id: 1,
      year: 2022,
      make: "BMW",
      model: "M4 Competition xDrive Coupe",
      vin: "WBS83AYBXNCH38102",
      stock: "BM1234",
      mileage: 12450,
      price: 78900,
      marketPercentage: 104,
      daysOnLot: 74,
      status: "attention",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      year: 2023,
      make: "Mercedes-Benz",
      model: "C 300 Sedan",
      vin: "W1KDB3HB5PR123456",
      stock: "MB5678",
      mileage: 8900,
      price: 52500,
      marketPercentage: 98,
      daysOnLot: 21,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      year: 2024,
      make: "Porsche",
      model: "911 Carrera S",
      vin: "WP0AB2A99RS123456",
      stock: "PC9012",
      mileage: 3200,
      price: 145000,
      marketPercentage: 112,
      daysOnLot: 45,
      status: "overpriced",
      image: "/api/placeholder/300/200",
    },
    {
      id: 4,
      year: 2023,
      make: "Audi",
      model: "RS5 Sportback",
      vin: "WAUZZZF7XPA123456",
      stock: "AU3456",
      mileage: 15600,
      price: 87500,
      marketPercentage: 101,
      daysOnLot: 18,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: 5,
      year: 2022,
      make: "Lexus",
      model: "LC 500",
      vin: "JTHGB5C21NA123456",
      stock: "LX7890",
      mileage: 9800,
      price: 98500,
      marketPercentage: 96,
      daysOnLot: 92,
      status: "attention",
      image: "/api/placeholder/300/200",
    },
    {
      id: 6,
      year: 2023,
      make: "BMW",
      model: "M3 Competition",
      vin: "WBS83CR30PCH12345",
      stock: "BM2468",
      mileage: 6700,
      price: 82500,
      marketPercentage: 108,
      daysOnLot: 12,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
  ];

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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">TOTAL RETAIL VALUE</p>
                  <p className="text-xl font-bold">$4.2M</p>
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
                  <p className="text-xs text-gray-600">TOTAL WHOLESALE VALUE</p>
                  <p className="text-xl font-bold">$3.1M</p>
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
                  <p className="text-xl font-bold">$210k</p>
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
                  <p className="text-xl font-bold">142 units</p>
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
                  <p className="text-xl font-bold">42 days</p>
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
              Overpriced (12)
            </Button>
            <Button
              variant="outline"
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Attention Required (8)
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
            142 TOTAL UNITS
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {inventoryItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
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
                <p className="text-xs text-gray-600 mb-3">
                  {item.vin} | {item.stock}
                </p>
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
                    <p className="text-sm font-semibold">{item.daysOnLot}</p>
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
      </Layout>
    </ProtectedRoute>
  );
}
