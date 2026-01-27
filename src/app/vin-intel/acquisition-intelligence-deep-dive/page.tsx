"use client";

import { useState } from "react";
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

export default function VINDeepDivePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

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
                  VIN: 1HGBH41JXMN109186
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        2022 PORSCHE 911
                        <br />
                        CARRERA
                      </h2>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          CARRERA S
                        </span>
                        <span>•</span>
                        <span>8,420 mi</span>
                        <span>•</span>
                        <span>GT Silver Metallic</span>
                        <span>•</span>
                        <span>Sport Chrono Package</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-4 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Estimated Market Value
                        </div>
                        <div className="text-4xl font-bold text-gray-900">
                          $138,450
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
                  <div className="text-2xl font-bold text-green-600">92%</div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Avg. Days to Sell
                  </div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Active Local
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Mkt Days Supply
                  </div>
                  <div className="text-2xl font-bold text-orange-600">38</div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Sold (90D)
                  </div>
                  <div className="text-2xl font-bold text-blue-600">7</div>
                </Card>
                <Card className="text-center p-3">
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    Consumer Interest
                  </div>
                  <div className="text-2xl font-bold text-green-600">9.8</div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
