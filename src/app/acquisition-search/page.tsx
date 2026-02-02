"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Lightbulb,
  Download,
  Search,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Car,
} from "lucide-react";

// Empty state for production without demo data
const getEmptySearchCriteria = () => [];

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
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, index) =>
    (currentYear - index).toString(),
  );

  // Check if we're in demo mode or if API keys are available
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const searchCriteria = isDemoMode
    ? mockSearchCriteria
    : getEmptySearchCriteria();

  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [make, setMake] = useState("Any Make");
  const [model, setModel] = useState("");
  const [maxMileage, setMaxMileage] = useState(45);
  const [accidentPreference, setAccidentPreference] = useState("NONE");
  const [suggestedModalOpen, setSuggestedModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"summary" | "fast-moving">(
    "summary",
  );

  const opportunityHighlights = [
    {
      title: "2020 Honda CR-V",
      badge: "Fast Seller",
      daysOnMarket: 14,
    },
    {
      title: "2021 Jeep Grand Cherokee",
      badge: "Fast Seller",
      daysOnMarket: 18,
    },
    {
      title: "2019 Toyota RAV4",
      badge: "Fast Seller",
      daysOnMarket: 16,
    },
  ];

  const volumeAlerts = [
    {
      title: "2018-2022 Chevrolet Silverado 1500",
      volume: "842 Available",
      spread: "$4,200 Gap",
      trend: "High Volume",
    },
    {
      title: "2019-2023 Ford Explorer",
      volume: "1,120 Available",
      spread: "+$3,850 Gap",
      trend: "High Volume",
    },
  ];

  const seasonalTrend = {
    focus: "Convertible Season & Performance Prep",
    demand: "Expected in 30-45 Days",
  };

  const fastMovingTable = [
    {
      vehicle: "2020 Honda CR-V",
      daysOnMarket: 14,
      demand: "Very High",
      inventory: "12 units",
      tone: "text-emerald-600",
    },
    {
      vehicle: "2021 Jeep Grand Cherokee",
      daysOnMarket: 18,
      demand: "High",
      inventory: "8 units",
      tone: "text-green-600",
    },
    {
      vehicle: "2019 Toyota RAV4",
      daysOnMarket: 16,
      demand: "Very High",
      inventory: "15 units",
      tone: "text-emerald-600",
    },
    {
      vehicle: "2022 Ford Explorer",
      daysOnMarket: 21,
      demand: "Above Avg",
      inventory: "24 units",
      tone: "text-blue-600",
    },
    {
      vehicle: "2020 Chevrolet Tahoe",
      daysOnMarket: 19,
      demand: "High",
      inventory: "6 units",
      tone: "text-green-600",
    },
    {
      vehicle: "2018 Toyota Highlander",
      daysOnMarket: 22,
      demand: "Above Avg",
      inventory: "31 units",
      tone: "text-blue-600",
    },
  ];

  const handleCreateSearch = () => {
    // Handle creating new search
    // TODO: Implement search creation logic
  };

  const renderYearSelect = (
    label: "MIN" | "MAX",
    value: string,
    onChange: (val: string) => void,
  ) => (
    <div className="relative flex-1">
      <span className="absolute left-3 top-2 text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-12 rounded-xl border border-slate-200 bg-white px-3 pt-4 pb-1 text-sm font-medium text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none",
          !value && "text-slate-400",
        )}
      >
        <option value="" disabled>
          Select Year
        </option>
        {yearOptions.map((year) => (
          <option key={`${label}-${year}`} value={year}>
            {year}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout
        title="Acquisition Search Management"
        showSearch={true}
        searchPlaceholder="Search criteria..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      >
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb
            items={[{ label: "Acquisition Search", isCurrent: true }]}
          />
        </div>

        {/* Add New Acquisition Search Section */}
        <Card className="bg-white p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                ADD NEW ACQUISITION SEARCH
              </h2>
              <p className="text-sm text-gray-600">
                Define real-time market monitoring parameters for automated
                sourcing.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full md:w-auto border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                setModalView("summary");
                setSuggestedModalOpen(true);
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Suggested Search Criteria
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            {/* Year Range */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
                Year Range
              </label>
              <div className="flex space-x-3">
                {renderYearSelect("MIN", yearMin, setYearMin)}
                {renderYearSelect("MAX", yearMax, setYearMax)}
              </div>
            </div>

            {/* Vehicle Make */}
            <div>
              <label className="block text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
                Vehicle Make
              </label>
              <div className="relative">
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
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
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
                Model
              </label>
              <Input
                placeholder="e.g. Tacoma"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-200"
              />
            </div>

            {/* Max Mileage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase">
                  Max Mileage
                </label>
                <span className="text-xs font-semibold text-blue-600">
                  {maxMileage} MI
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={maxMileage}
                  onChange={(e) => setMaxMileage(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-100 rounded-full appearance-none [--thumb-size:16px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0"
                />
              </div>
            </div>
          </div>

          {/* History Preference & Action */}
          <div className="mb-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="w-full">
                <label className="block text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
                  History Preference (Accidents)
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="inline-flex w-full max-w-md items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1">
                    {["NONE", "MINOR", "MODERATE"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAccidentPreference(option)}
                        className={cn(
                          "flex-1 rounded-2xl px-4 py-2 text-sm font-semibold tracking-wide uppercase transition",
                          accidentPreference === option
                            ? "bg-white text-blue-600 shadow"
                            : "text-slate-500",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCreateSearch}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_18px_35px_rgba(19,109,236,0.35)] transition hover:bg-blue-700 self-start md:self-auto"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40 text-white">
                  <Plus className="h-3.5 w-3.5" />
                </span>
                Create Search
              </Button>
            </div>
          </div>
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
                  ACTIVE{" "}
                  <span className="font-bold text-blue-600">
                    {searchCriteria.length}
                  </span>
                </span>
                <span className="text-gray-600">
                  MATCHES <span className="font-bold text-green-600">0</span>
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Real-time matching for your saved sourcing parameters.
            </p>
          </div>

          <div className="overflow-x-auto">
            {searchCriteria.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Search Criteria
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  No active search criteria found. Create search criteria above
                  to start monitoring the market for acquisition opportunities.
                </p>
              </div>
            ) : (
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
                  {searchCriteria.map((criteria) => (
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
            )}
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

        <Dialog
          open={suggestedModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setTimeout(() => setModalView("summary"), 200);
            }
            setSuggestedModalOpen(open);
          }}
        >
          <DialogContent
            className="w-[90vw] max-w-5xl sm:max-w-[1200px] p-0 overflow-hidden flex flex-col"
            style={{ maxHeight: "85vh" }}
          >
            <DialogHeader className="border-b border-slate-200 px-8 py-6 text-left shrink-0">
              {modalView === "summary" ? (
                <>
                  <DialogTitle className="text-2xl font-bold text-slate-900">
                    Advanced Suggested Search Criteria
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    Real-time market insights and data-driven acquisition
                    opportunities.
                  </DialogDescription>
                </>
              ) : (
                <>
                  <button
                    className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600"
                    onClick={() => setModalView("summary")}
                  >
                    <span>&larr;</span> Back to Suggestions
                  </button>
                  <DialogTitle className="text-2xl font-bold text-slate-900">
                    Fast-Moving Market Opportunities
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    Live market updates with high correlation within your local
                    zip codes.
                  </DialogDescription>
                </>
              )}
            </DialogHeader>
            <div className="px-8 py-6 space-y-8 overflow-y-auto">
              {modalView === "summary" ? (
                <>
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Opportunity: Fast-Moving in your Market
                        </p>
                      </div>
                      <button
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        onClick={() => setModalView("fast-moving")}
                      >
                        Show More
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {opportunityHighlights.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-lg font-semibold text-slate-900">
                              {item.title}
                            </p>
                            <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase text-green-600">
                              {item.badge}
                            </span>
                          </div>
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Avg. Days on Market
                          </div>
                          <div className="text-3xl font-bold text-slate-900 mb-4">
                            {item.daysOnMarket} Days
                          </div>
                          <Button className="w-full rounded-xl bg-blue-600 py-5 text-base font-semibold hover:bg-blue-700">
                            + Add to Search
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Volume & Spread Alerts
                      </p>
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Show More
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {volumeAlerts.map((alert) => (
                        <div
                          key={alert.title}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            {alert.title}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <div>
                              <p className="font-semibold text-slate-900">
                                High Volume
                              </p>
                              <p>{alert.volume}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                Avg. Spread
                              </p>
                              <p className="text-green-600 font-semibold">
                                {alert.spread}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="mt-4 rounded-xl text-blue-600 border-blue-200"
                          >
                            Add Search
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                      Predictive Seasonal Trends
                    </p>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500">
                        Upcoming Focus
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900 mt-2">
                        {seasonalTrend.focus}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-amber-600">
                        Market Demand Spike — {seasonalTrend.demand}
                      </p>
                    </div>
                  </section>
                </>
              ) : (
                <section className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-[2fr_repeat(3,1fr)_auto] bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <span>Vehicle</span>
                      <span className="text-center">Avg. Days on Market</span>
                      <span className="text-center">Demand Score</span>
                      <span className="text-center">Local Inventory</span>
                      <span></span>
                    </div>
                    {fastMovingTable.map((row) => (
                      <div
                        key={row.vehicle}
                        className="grid grid-cols-[2fr_repeat(3,1fr)_auto] items-center border-t border-slate-100 px-6 py-4 text-sm text-slate-800"
                      >
                        <div className="font-semibold">{row.vehicle}</div>
                        <div className="text-center text-blue-600 font-semibold">
                          {row.daysOnMarket} Days
                        </div>
                        <div className="text-center">
                          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase text-green-600">
                            {row.demand}
                          </span>
                        </div>
                        <div className="text-center text-slate-500">
                          {row.inventory}
                        </div>
                        <div className="flex justify-end">
                          <Button className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold">
                            + Add to Search
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 text-center">
                    Live market updates • High correlation with local zip codes
                  </p>
                </section>
              )}
            </div>
            <div className="border-t border-slate-200 px-8 py-4 text-right shrink-0">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setSuggestedModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
}
