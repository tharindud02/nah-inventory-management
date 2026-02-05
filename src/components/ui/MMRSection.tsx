"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { ChevronUp, ChevronDown, Check, X } from "lucide-react";

interface MMRData {
  base_mmr?: number;
  adjusted_mmr?: number;
  adjustments?: {
    odometer?: number;
    region?: number;
    cr_score?: number;
    color?: number;
  };
  typical_range?: {
    min?: number;
    max?: number;
  };
  avg_odo?: number;
  avg_condition?: string;
}

interface MMRSectionProps {
  mmrData: MMRData | null;
  isLoading?: boolean;
  compact?: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const renderNeedle = (value: number, min: number, max: number) => {
  // Calculate percentage (0 to 1)
  const percentage = Math.max(0, Math.min(1, value / (max - min)));
  // Convert to angle (180 degrees to 0 degrees, going clockwise)
  const angle = 180 - percentage * 180;
  const radians = (angle * Math.PI) / 180;

  // Needle dimensions
  const needleLength = 70;
  const needleStart = 15;

  // Calculate needle coordinates
  const x1 = 100 + needleStart * Math.cos(radians);
  const y1 = 95 - needleStart * Math.sin(radians);
  const x2 = 100 + needleLength * Math.cos(radians);
  const y2 = 95 - needleLength * Math.sin(radians);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#1f2937"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={x2} cy={y2} r="4" fill="#1f2937" />
      <circle cx={100} cy={95} r="3" fill="#6b7280" />
    </g>
  );
};

export function MMRSection({
  mmrData,
  isLoading = false,
  compact = false,
}: MMRSectionProps) {
  const [adjustments, setAdjustments] = useState({
    odometer: "12,450",
    region: "Southeast Region",
    cr_score: "4.3",
    color: "Isle of Man Green",
  });

  const [adjustmentValues, setAdjustmentValues] = useState({
    odometer: 620,
    region: 0,
    cr_score: -510,
    color: -60,
  });

  if (isLoading || !mmrData) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            MMR
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const baseMmr = mmrData.base_mmr || 74800;
  const adjustedMmr = mmrData.adjusted_mmr || 74830;
  const avgOdo = mmrData.avg_odo || 12688;
  const avgCondition = mmrData.avg_condition || "4.6";

  const gaugeMin = mmrData.typical_range?.min || 72100;
  const gaugeMax = mmrData.typical_range?.max || 76900;

  const gaugeData = [
    {
      name: "value",
      value: adjustedMmr - gaugeMin,
    },
    {
      name: "remaining",
      value: gaugeMax - adjustedMmr,
    },
  ];

  const handleClearAdjustments = () => {
    setAdjustments({
      odometer: "12,688",
      region: "Southeast Region",
      cr_score: "4.6",
      color: "Isle of Man Green",
    });
    setAdjustmentValues({
      odometer: 0,
      region: 0,
      cr_score: 0,
      color: 0,
    });
  };

  const updateAdjustment = (field: keyof typeof adjustments, value: string) => {
    setAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  const updateAdjustmentValue = (
    field: keyof typeof adjustmentValues,
    delta: number,
  ) => {
    setAdjustmentValues((prev) => ({ ...prev, [field]: prev[field] + delta }));
  };

  return (
    <Card className={`${compact ? "" : "h-full"} flex flex-col`}>
      <CardHeader
        className={`${compact ? "pb-2" : "border-b border-gray-200"}`}
      >
        <CardTitle
          className={`${compact ? "text-base" : "text-lg"} font-bold text-gray-900`}
        >
          MMR
        </CardTitle>
        <div className="h-1 bg-blue-600 w-full mt-2"></div>
      </CardHeader>
      <CardContent
        className={`flex-1 flex flex-col ${compact ? "p-3" : "p-6"}`}
      >
        <div
          className={`grid ${compact ? "grid-cols-3 gap-2" : "grid-cols-3 gap-6"} flex-1`}
        >
          {/* BASE MMR Section */}
          <div className="flex flex-col">
            <div className={`${compact ? "mb-1" : "mb-4"}`}>
              <p
                className={`font-bold uppercase tracking-wide text-gray-700 ${compact ? "text-[9px]" : "text-xs"} ${compact ? "mb-1" : "mb-2"}`}
              >
                BASE MMR
              </p>
              <p
                className={`${compact ? "text-xl" : "text-3xl"} font-bold text-amber-600 leading-tight`}
              >
                {formatCurrency(baseMmr)}
              </p>
            </div>

            <div
              className={`space-y-${compact ? "1" : "3"} ${compact ? "mb-1" : "mb-4"}`}
            >
              <div>
                <p
                  className={`font-bold uppercase text-gray-700 ${compact ? "text-[9px]" : "text-xs"}`}
                >
                  AVG ODO (MI)
                </p>
                <p
                  className={`${compact ? "text-xs" : "text-lg"} font-semibold text-gray-900 leading-tight`}
                >
                  {avgOdo.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                  className={`font-bold uppercase text-gray-700 ${compact ? "text-[9px]" : "text-xs"}`}
                >
                  AVG COND
                </p>
                <p
                  className={`${compact ? "text-xs" : "text-lg"} font-semibold text-gray-900 leading-tight`}
                >
                  {avgCondition}
                </p>
              </div>
            </div>

            <div
              className={`mt-auto ${compact ? "pt-1" : "pt-4"} border-t border-gray-200`}
            >
              <p
                className={`font-bold uppercase text-gray-700 ${compact ? "text-[9px]" : "text-xs"} ${compact ? "mb-0" : "mb-1"}`}
              >
                TYPICAL RANGE
              </p>
              <p
                className={`${compact ? "text-[10px]" : "text-sm"} font-semibold text-gray-900 leading-tight`}
              >
                {formatCurrency(gaugeMin)} - {formatCurrency(gaugeMax)}
              </p>
            </div>
          </div>

          {/* MMR ADJUSTMENTS Section */}
          <div className="flex flex-col">
            <div
              className={`flex items-center justify-between ${compact ? "mb-1" : "mb-4"}`}
            >
              <p
                className={`font-bold uppercase tracking-wide text-gray-700 ${compact ? "text-[9px]" : "text-xs"}`}
              >
                MMR ADJUSTMENTS
              </p>
              <button
                onClick={handleClearAdjustments}
                className={`font-semibold text-blue-600 hover:text-blue-700 ${compact ? "text-[9px]" : "text-xs"}`}
              >
                CLEAR
              </button>
            </div>

            <div className={`space-y-${compact ? "1" : "3"} flex-1`}>
              {/* Odometer Adjustment */}
              <div className="flex items-center gap-1">
                <div
                  className={`bg-gray-200 rounded flex items-center justify-center ${compact ? "w-3 h-3" : "w-6 h-6"}`}
                >
                  <div
                    className={`bg-gray-400 rounded-full ${compact ? "w-1.5 h-1.5" : "w-3 h-3"}`}
                  ></div>
                </div>
                <input
                  type="text"
                  value={adjustments.odometer}
                  onChange={(e) => updateAdjustment("odometer", e.target.value)}
                  className={`flex-1 px-1 py-0.5 border border-gray-300 rounded ${compact ? "text-[10px]" : "text-sm"}`}
                />
                <button
                  onClick={() => updateAdjustmentValue("odometer", 10)}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <ChevronUp
                    className={`text-gray-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <button
                  onClick={() => updateAdjustmentValue("odometer", -10)}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <ChevronDown
                    className={`text-gray-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <button className="p-0.5 hover:bg-gray-100 rounded">
                  <Check
                    className={`text-green-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-1 ${compact ? "h-2" : "h-4"} ${adjustmentValues.odometer >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`font-semibold ${adjustmentValues.odometer >= 0 ? "text-green-600" : "text-red-600"} ${compact ? "text-[9px]" : "text-sm"} whitespace-nowrap`}
                  >
                    {adjustmentValues.odometer >= 0 ? "+" : ""}
                    {formatCurrency(adjustmentValues.odometer)}
                  </span>
                </div>
              </div>

              {/* Region Adjustment */}
              <div className="flex items-center gap-1">
                <div
                  className={`bg-gray-200 rounded flex items-center justify-center ${compact ? "w-3 h-3" : "w-6 h-6"}`}
                >
                  <div
                    className={`bg-gray-400 rounded-full ${compact ? "w-1 h-1" : "w-2 h-2"}`}
                  ></div>
                </div>
                <input
                  type="text"
                  value={adjustments.region}
                  onChange={(e) => updateAdjustment("region", e.target.value)}
                  className={`flex-1 px-1 py-0.5 border border-gray-300 rounded ${compact ? "text-[10px]" : "text-sm"}`}
                />
                <button className="p-0.5 hover:bg-gray-100 rounded">
                  <ChevronDown
                    className={`text-gray-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-1 ${compact ? "h-2" : "h-4"} ${adjustmentValues.region >= 0 ? "bg-green-500" : adjustmentValues.region === 0 ? "bg-gray-400" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`font-semibold ${adjustmentValues.region >= 0 ? "text-green-600" : adjustmentValues.region === 0 ? "text-gray-600" : "text-red-600"} ${compact ? "text-[9px]" : "text-sm"} whitespace-nowrap`}
                  >
                    {adjustmentValues.region >= 0 ? "+" : ""}
                    {formatCurrency(adjustmentValues.region)}
                  </span>
                </div>
              </div>

              {/* CR Score Adjustment */}
              <div className="flex items-center gap-1">
                <div
                  className={`bg-gray-200 rounded flex items-center justify-center ${compact ? "w-3 h-3" : "w-6 h-6"}`}
                >
                  <span
                    className={`font-bold text-gray-600 ${compact ? "text-[7px]" : "text-xs"}`}
                  >
                    CR
                  </span>
                </div>
                <input
                  type="text"
                  value={adjustments.cr_score}
                  onChange={(e) => updateAdjustment("cr_score", e.target.value)}
                  className={`flex-1 px-1 py-0.5 border border-gray-300 rounded ${compact ? "text-[10px]" : "text-sm"}`}
                />
                <button
                  onClick={() => updateAdjustmentValue("cr_score", 0.1)}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <ChevronUp
                    className={`text-gray-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <button
                  onClick={() => updateAdjustmentValue("cr_score", -0.1)}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <ChevronDown
                    className={`text-gray-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-1 ${compact ? "h-2" : "h-4"} ${adjustmentValues.cr_score >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`font-semibold ${adjustmentValues.cr_score >= 0 ? "text-green-600" : "text-red-600"} ${compact ? "text-[9px]" : "text-sm"} whitespace-nowrap`}
                  >
                    {adjustmentValues.cr_score >= 0 ? "+" : ""}
                    {formatCurrency(adjustmentValues.cr_score)}
                  </span>
                </div>
              </div>

              {/* Color Adjustment */}
              <div className="flex items-center gap-1">
                <div
                  className={`bg-gray-200 rounded flex items-center justify-center ${compact ? "w-3 h-3" : "w-6 h-6"}`}
                >
                  <div
                    className={`bg-gray-400 rounded ${compact ? "w-1.5 h-1.5" : "w-3 h-3"}`}
                  ></div>
                </div>
                <input
                  type="text"
                  value={adjustments.color}
                  onChange={(e) => updateAdjustment("color", e.target.value)}
                  className={`flex-1 px-1 py-0.5 border border-gray-300 rounded ${compact ? "text-[10px]" : "text-sm"}`}
                />
                <button className="p-0.5 hover:bg-gray-100 rounded">
                  <ChevronDown
                    className={`text-gray-600 ${compact ? "w-2 h-2" : "w-3 h-3"}`}
                  />
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-1 ${compact ? "h-2" : "h-4"} ${adjustmentValues.color >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`font-semibold ${adjustmentValues.color >= 0 ? "text-green-600" : "text-red-600"} ${compact ? "text-[9px]" : "text-sm"} whitespace-nowrap`}
                  >
                    {adjustmentValues.color >= 0 ? "+" : ""}
                    {formatCurrency(adjustmentValues.color)}
                  </span>
                </div>
              </div>
            </div>

            {!compact && (
              <div className="mt-4 pt-2 border-t border-gray-200">
                <p className="text-xs italic text-gray-500">
                  Numbers may not add exactly due to rounding
                </p>
              </div>
            )}
          </div>

          {/* ADJUSTED MMR Section */}
          <div className="flex flex-col">
            <div className={`${compact ? "mb-1" : "mb-4"}`}>
              <p
                className={`font-bold uppercase tracking-wide text-gray-700 ${compact ? "text-[9px]" : "text-xs"} ${compact ? "mb-1" : "mb-2"}`}
              >
                ADJUSTED MMR
              </p>
              <div className="flex items-center gap-2">
                <p
                  className={`${compact ? "text-xl" : "text-3xl"} font-bold text-amber-600 leading-tight`}
                >
                  {formatCurrency(adjustedMmr)}
                </p>
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-green-600"></div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div
                className={`relative w-full ${compact ? "h-28" : "h-44"} flex items-end justify-center`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      startAngle={180}
                      endAngle={0}
                      innerRadius="70%"
                      outerRadius="90%"
                      cx="50%"
                      cy="85%"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#2563eb" />
                      <Cell fill="#dbeafe" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <svg
                  viewBox="0 0 200 110"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: "rotate(0deg)" }}
                >
                  {renderNeedle(adjustedMmr - gaugeMin, 0, gaugeMax - gaugeMin)}
                </svg>
                <div
                  className="absolute bottom-0 left-0 text-xs text-gray-500"
                  style={{ transform: "translateX(-4px)" }}
                >
                  {formatCurrency(gaugeMin)}
                </div>
                <div
                  className="absolute bottom-0 right-0 text-xs text-gray-500"
                  style={{ transform: "translateX(4px)" }}
                >
                  {formatCurrency(gaugeMax)}
                </div>
                <div
                  className={`absolute bottom-${compact ? "2" : "6"} left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-semibold`}
                >
                  {formatCurrency(baseMmr)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
