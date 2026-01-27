"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bell,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Car,
  DollarSign,
  Users,
  Package,
} from "lucide-react";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const inventoryItems = [
    {
      id: 1,
      make: "Toyota",
      model: "Camry",
      year: 2023,
      vin: "1HGBH41JXMN109186",
      price: 28950,
      mileage: 15420,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      make: "Honda",
      model: "Accord",
      year: 2023,
      vin: "2HGBH41JXMN109187",
      price: 27800,
      mileage: 8230,
      status: "attention",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      make: "Ford",
      model: "Mustang",
      year: 2024,
      vin: "3HGBH41JXMN109188",
      price: 45900,
      mileage: 3200,
      status: "overpriced",
      image: "/api/placeholder/300/200",
    },
    {
      id: 4,
      make: "Chevrolet",
      model: "Malibu",
      year: 2023,
      vin: "4HGBH41JXMN109189",
      price: 26500,
      mileage: 12100,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: 5,
      make: "BMW",
      model: "3 Series",
      year: 2024,
      vin: "5HGBH41JXMN109190",
      price: 52500,
      mileage: 5100,
      status: "healthy",
      image: "/api/placeholder/300/200",
    },
    {
      id: 6,
      make: "Mercedes",
      model: "C-Class",
      year: 2024,
      vin: "6HGBH41JXMN109191",
      price: 48900,
      mileage: 7800,
      status: "attention",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <TrendingUp className="w-3 h-3" />;
      case "attention":
        return <AlertCircle className="w-3 h-3" />;
      case "overpriced":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Inventory Management
              </h1>
              <div className="text-sm text-gray-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                LAST UPDATED: 2 MINS AGO
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Joe Manager</div>
                  <div className="text-xs text-gray-500">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            <Button variant="default" className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Car className="w-4 h-4 mr-2" />
              Inventory
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Analysis
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Search className="w-4 h-4 mr-2" />
              VIN Intel
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Acquisition
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">TOTAL RETAIL VALUE</p>
                    <p className="text-2xl font-bold">$2.4M</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12.5%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      TOTAL WHOLESALE VALUE
                    </p>
                    <p className="text-2xl font-bold">$1.8M</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8.3%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      TOTAL PROJECTED GROSS PROFIT
                    </p>
                    <p className="text-2xl font-bold">$600K</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15.2%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ACTIVE INVENTORY</p>
                    <p className="text-2xl font-bold">142</p>
                    <p className="text-sm text-red-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      -3.2%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant="outline"
              className="bg-red-50 border-red-200 text-red-700"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Overpriced (12)
            </Button>
            <Button
              variant="outline"
              className="bg-yellow-50 border-yellow-200 text-yellow-700"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Attention Required (8)
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex space-x-4">
              <select className="border rounded px-3 py-2 text-sm">
                <option>Price Range</option>
                <option>$0 - $25,000</option>
                <option>$25,000 - $50,000</option>
                <option>$50,000+</option>
              </select>
              <select className="border rounded px-3 py-2 text-sm">
                <option>Days on Lot</option>
                <option>0-30 days</option>
                <option>31-60 days</option>
                <option>60+ days</option>
              </select>
              <select className="border rounded px-3 py-2 text-sm">
                <option>Make/Model</option>
                <option>All Makes</option>
                <option>Toyota</option>
                <option>Honda</option>
                <option>Ford</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              <strong>142 TOTAL UNITS</strong>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-12 h-12 text-gray-400" />
                  </div>
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                    <span className="uppercase">{item.status}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">
                    {item.year} {item.make} {item.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">VIN: {item.vin}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {item.mileage.toLocaleString()} miles
                      </p>
                      <p className="text-xl font-bold">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Market</p>
                      <p className="text-sm font-medium text-green-600">
                        +2.3%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
