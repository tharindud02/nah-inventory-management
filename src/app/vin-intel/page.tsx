"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Search,
  ArrowRight,
  CheckCircle,
  Package,
  Car,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function VINIntelPage() {
  const [vinInput, setVinInput] = useState("");
  const { user, signOut } = useAuth();
  const router = useRouter();

  const recentlyAnalyzedUnits = [
    {
      vin: "1HGBH41JXMN109186",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      analyzedAt: "2 hours ago",
    },
    {
      vin: "2HGBH41JXMN109187",
      make: "Honda",
      model: "Accord",
      year: 2023,
      analyzedAt: "5 hours ago",
    },
    {
      vin: "3HGBH41JXMN109188",
      make: "Ford",
      model: "Mustang",
      year: 2024,
      analyzedAt: "1 day ago",
    },
  ];

  const recentBuildSheets = [
    {
      vin: "4HGBH41JXMN109189",
      make: "Chevrolet",
      model: "Malibu",
      year: 2023,
      pulledAt: "3 hours ago",
    },
    {
      vin: "5HGBH41JXMN109190",
      make: "BMW",
      model: "3 Series",
      year: 2024,
      pulledAt: "6 hours ago",
    },
    {
      vin: "6HGBH41JXMN109191",
      make: "Mercedes",
      model: "C-Class",
      year: 2024,
      pulledAt: "2 days ago",
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
          <main
            className="flex-1 ml-64 flex items-start justify-center p-6 pt-32"
            style={{ minHeight: "100vh" }}
          >
            {/* Hero Section */}
            <div className="text-center w-full max-w-6xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Let's see what this car has to offer..
              </h2>
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white px-8 py-4 text-lg font-medium rounded-md flex items-center h-14 transition-colors duration-200 hover:opacity-90"
                    style={{ backgroundColor: "#136dec" }}
                    onClick={() =>
                      router.push(
                        "/vin-intel/acquisition-intelligence-deep-dive",
                      )
                    }
                  >
                    Analyze VIN
                    <ArrowRight className="w-5 h-5 ml-2" />
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
                      {recentlyAnalyzedUnits.map((unit, index) => (
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
                      ))}
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
                      {recentBuildSheets.map((sheet, index) => (
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
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
