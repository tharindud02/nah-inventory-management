"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Lightbulb, Download, Search } from "lucide-react";

// Mock data for active search criteria
const mockSearchCriteria = [
  {
    id: 1,
    yearRange: "2018-2022",
    make: "Toyota",
    model: "Tacoma",
    maxMiles: "0 - 45,000 mi",
    accidents: "No Accidents",
    demand: "HIGH DEMAND",
    demandColor: "text-red-600",
    borderColor: "border-l-blue-500",
  },
  {
    id: 2,
    yearRange: "2019-2023",
    make: "Ford",
    model: "F-150",
    maxMiles: "0 - 60,000 mi",
    accidents: "Minor Accidents",
    demand: "MEDIUM DEMAND",
    demandColor: "text-orange-600",
    borderColor: "border-l-green-500",
  },
  {
    id: 3,
    yearRange: "2017-2021",
    make: "Honda",
    model: "Civic",
    maxMiles: "0 - 80,000 mi",
    accidents: "Moderate Accidents",
    demand: "LOW DEMAND",
    demandColor: "text-gray-600",
    borderColor: "border-l-orange-500",
  },
];

export default function AcquisitionSearchPage() {
  const [searchValue, setSearchValue] = useState("");
  const [yearMin, setYearMin] = useState("20");
  const [yearMax, setYearMax] = useState("20");
  const [make, setMake] = useState("Any Make");
  const [model, setModel] = useState("");
  const [maxMileage, setMaxMileage] = useState(45);
  const [accidentPreference, setAccidentPreference] = useState("NONE");

  const handleCreateSearch = () => {
    // Handle creating new search
    console.log("Creating search with:", {
      yearMin,
      yearMax,
      make,
      model,
      maxMileage,
      accidentPreference,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Header
          title="Acquisition Search Management"
          showSearch={true}
          searchPlaceholder="Search criteria..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <main className="ml-64 p-6">
          {/* Add New Acquisition Search Section */}
          <Card className="bg-white p-6 mb-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                ADD NEW ACQUISITION SEARCH
              </h2>
              <p className="text-sm text-gray-600">
                Define real-time market monitoring parameters for automated
                sourcing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Year Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Range
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      MIN
                    </label>
                    <select
                      value={yearMin}
                      onChange={(e) => setYearMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="20">20</option>
                      <option value="2015">2015</option>
                      <option value="2016">2016</option>
                      <option value="2017">2017</option>
                      <option value="2018">2018</option>
                      <option value="2019">2019</option>
                      <option value="2020">2020</option>
                      <option value="2021">2021</option>
                      <option value="2022">2022</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      MAX
                    </label>
                    <select
                      value={yearMax}
                      onChange={(e) => setYearMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="20">20</option>
                      <option value="2015">2015</option>
                      <option value="2016">2016</option>
                      <option value="2017">2017</option>
                      <option value="2018">2018</option>
                      <option value="2019">2019</option>
                      <option value="2020">2020</option>
                      <option value="2021">2021</option>
                      <option value="2022">2022</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle Make */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Make
                </label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Any Make">Any Make</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Ford">Ford</option>
                  <option value="Honda">Honda</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Nissan">Nissan</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Lexus">Lexus</option>
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <Input
                  placeholder="e.g. Tacoma"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Max Mileage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Mileage
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={maxMileage}
                    onChange={(e) => setMaxMileage(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 text-center">
                    {maxMileage}K MI
                  </div>
                </div>
              </div>
            </div>

            {/* History Preference */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                History Preference (Accidents)
              </label>
              <div className="flex space-x-2">
                {["NONE", "MINOR", "MODERATE"].map((option) => (
                  <Button
                    key={option}
                    variant={
                      accidentPreference === option ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setAccidentPreference(option)}
                    className={
                      accidentPreference === option
                        ? "bg-blue-600 text-white"
                        : "border-gray-300"
                    }
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Search
            </Button>
          </Card>

          {/* Active Search Criteria Section */}
          <Card className="bg-white p-6 mb-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Active Search Criteria
                </h2>
                <div className="flex space-x-4 text-sm">
                  <span className="text-gray-600">
                    ACTIVE <span className="font-bold text-blue-600">12</span>
                  </span>
                  <span className="text-gray-600">
                    MATCHES{" "}
                    <span className="font-bold text-green-600">248</span>
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Real-time matching for your saved sourcing parameters.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      YEAR RANGE
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      MAKE
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      MODEL
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      MAX MILES
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      ACCIDENTS
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      DEMAND
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockSearchCriteria.map((criteria) => (
                    <tr
                      key={criteria.id}
                      className={`border-b border-gray-100 ${criteria.borderColor}`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {criteria.yearRange}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {criteria.make}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {criteria.model}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {criteria.maxMiles}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {criteria.accidents}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        <span className={criteria.demandColor}>
                          {criteria.demand}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            VIEW ANALYTICS
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Smart Search Tip Section */}
          <Card className="bg-blue-50 border border-blue-200 p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Smart Search Tip
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Prioritizing high-demand units helps turn inventory faster.
                  Consider pairing tighter mileage filters with clean history to
                  secure premium units that move within 15 days.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Market Report
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
