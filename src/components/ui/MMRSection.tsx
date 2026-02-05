"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Droplet, Gauge, MapPin } from "lucide-react";

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
  const needleLength = 65;
  const needleStart = 20;

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
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={x2} cy={y2} r="3" fill="#dc2626" />
      <circle cx={100} cy={95} r="2.5" fill="#6b7280" />
    </g>
  );
};

export function MMRSection({
  mmrData,
  isLoading = false,
  compact = false,
}: MMRSectionProps) {
  const initialTextAdjustments = {
    odometer: "",
    region: "",
    cr_score: "",
    color: "",
  };

  const [adjustments, setAdjustments] = useState(initialTextAdjustments);

  const [adjustmentValues, setAdjustmentValues] = useState(() => ({
    odometer: mmrData?.adjustments?.odometer ?? 0,
    region: mmrData?.adjustments?.region ?? 0,
    cr_score: mmrData?.adjustments?.cr_score ?? 0,
    color: mmrData?.adjustments?.color ?? 0,
  }));

  useEffect(() => {
    if (!mmrData) {
      setAdjustmentValues({ odometer: 0, region: 0, cr_score: 0, color: 0 });
      return;
    }

    setAdjustmentValues({
      odometer: mmrData.adjustments?.odometer ?? 0,
      region: mmrData.adjustments?.region ?? 0,
      cr_score: mmrData.adjustments?.cr_score ?? 0,
      color: mmrData.adjustments?.color ?? 0,
    });
  }, [mmrData]);

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

  const toNumber = (value?: number | null, fallback = 0) =>
    typeof value === "number" && !Number.isNaN(value) ? value : fallback;

  const baseMmr = toNumber(mmrData.base_mmr, 0);
  const adjustedMmr = toNumber(mmrData.adjusted_mmr, baseMmr);
  const avgOdo = toNumber(mmrData.avg_odo, 0);
  const avgCondition = mmrData.avg_condition ?? "N/A";

  const hasRangeBounds =
    typeof mmrData.typical_range?.min === "number" &&
    typeof mmrData.typical_range?.max === "number";

  const displayRangeMin = hasRangeBounds
    ? toNumber(mmrData.typical_range?.min, 0)
    : 0;
  const displayRangeMax = hasRangeBounds
    ? toNumber(mmrData.typical_range?.max, 0)
    : 0;

  const rawGaugeMin = toNumber(mmrData.typical_range?.min, 0);
  const rawGaugeMax = toNumber(
    mmrData.typical_range?.max,
    rawGaugeMin > 0 ? rawGaugeMin + 1 : 1,
  );
  const gaugeMin = rawGaugeMin;
  const gaugeMax = rawGaugeMax > rawGaugeMin ? rawGaugeMax : rawGaugeMin + 1;
  const gaugeSpan = gaugeMax - gaugeMin;
  const adjustedOffset = Math.max(
    0,
    Math.min(adjustedMmr - gaugeMin, gaugeSpan),
  );

  const gaugeData = [
    {
      name: "value",
      value: adjustedOffset,
    },
    {
      name: "remaining",
      value: gaugeSpan - adjustedOffset,
    },
  ];

  const handleClearAdjustments = () => {
    setAdjustments(initialTextAdjustments);
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

  const adjustmentFieldMeta: {
    key: keyof typeof adjustments;
    icon: "odometer" | "region" | "cr" | "color";
    highlight?: boolean;
  }[] = [
    { key: "odometer", icon: "odometer", highlight: true },
    { key: "region", icon: "region" },
    { key: "cr_score", icon: "cr" },
    { key: "color", icon: "color" },
  ];

  const renderIcon = (type: "odometer" | "region" | "cr" | "color") => {
    if (type === "odometer") {
      return <Gauge className="w-4 h-4" />;
    }
    if (type === "region") {
      return <MapPin className="w-4 h-4" />;
    }
    if (type === "cr") {
      return (
        <span className="text-[10px] font-semibold text-slate-600">CR</span>
      );
    }
    return <Droplet className="w-4 h-4" />;
  };

  return (
    <Card className={`flex flex-col ${compact ? "mx-0" : "mx-4"}`}>
      <CardHeader
        className={`${compact ? "pb-2" : "border-b border-gray-200"}`}
      >
        <CardTitle
          className={`${compact ? "text-base" : "text-lg"} font-bold text-gray-900`}
        >
          MMR
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`flex-1 flex flex-col ${compact ? "py-3 px-6" : "py-6 px-8"}`}
      >
        <div
          className={`grid ${compact ? "grid-cols-[1fr_1.4fr_1fr] gap-4" : "grid-cols-[1.2fr_1.8fr_1.3fr] gap-8"} flex-1 items-start`}
        >
          {/* BASE MMR Section */}
          <div className="flex flex-col">
            <div className={`${compact ? "mb-1" : "mb-3"}`}>
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

            <div className={`${compact ? "space-y-1" : "space-y-2"}`}>
              <div>
                <p
                  className={`font-bold uppercase text-gray-700 ${compact ? "text-[9px]" : "text-xs"}`}
                >
                  AVG ODO (MI)
                </p>
                <p
                  className={`${compact ? "text-xs" : "text-lg"} font-semibold text-gray-900 leading-tight`}
                >
                  {avgOdo.toLocaleString() ?? "N/A"}
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

            <div className={`mt-auto ${compact ? "pt-2" : "pt-4"}`}>
              <div
                className={`border-t border-gray-300 ${compact ? "pt-1" : "pt-2"}`}
              >
                <p
                  className={`font-bold uppercase text-gray-700 ${compact ? "text-[9px]" : "text-xs"} ${compact ? "mb-0.5" : "mb-1"}`}
                >
                  TYPICAL RANGE
                </p>
                <p
                  className={`${compact ? "text-[10px]" : "text-sm"} font-semibold text-gray-900 leading-tight`}
                >
                  {formatCurrency(displayRangeMin)} -{" "}
                  {formatCurrency(displayRangeMax)}
                </p>
              </div>
            </div>
          </div>

          {/* MMR ADJUSTMENTS Section */}
          <div className="flex flex-col">
            <div
              className={`flex items-center justify-between ${compact ? "mb-1" : "mb-2"}`}
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

            <div className={`${compact ? "space-y-1.5" : "space-y-3"} flex-1`}>
              {adjustmentFieldMeta.map((field) => {
                const numericValue = adjustmentValues[field.key];
                const indicatorColor =
                  numericValue > 0
                    ? "text-emerald-600"
                    : numericValue < 0
                      ? "text-rose-600"
                      : "text-slate-500";
                const barColor =
                  numericValue > 0
                    ? "bg-emerald-500"
                    : numericValue < 0
                      ? "bg-rose-500"
                      : "bg-slate-300";
                const formattedValue = `${
                  numericValue > 0 ? "+" : numericValue < 0 ? "-" : ""
                } ${formatCurrency(Math.abs(numericValue))}`;

                const iconStyles = field.highlight
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-500";

                return (
                  <div key={field.key} className="flex items-stretch gap-2">
                    <div
                      className={`flex flex-1 min-w-0 items-center gap-1.5 rounded-md border ${compact ? "px-1.5 py-0.5" : "px-2 py-1"} ${field.highlight ? "bg-white border-blue-200 ring-2 ring-blue-100 shadow-sm" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-sm flex items-center justify-center shrink-0 ${iconStyles}`}
                      >
                        {renderIcon(field.icon)}
                      </div>
                      <input
                        type="text"
                        value={adjustments[field.key]}
                        onChange={(e) =>
                          updateAdjustment(field.key, e.target.value)
                        }
                        placeholder="N/A"
                        className={`flex-1 min-w-0 bg-transparent ${compact ? "text-xxs" : "text-xs"} font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none`}
                      />
                      {field.key === "odometer" ? (
                        <div
                          className={`w-5 h-5 rounded-sm bg-blue-700 text-white flex items-center justify-center ${compact ? "text-xxs" : "text-xs"} font-semibold shrink-0`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-sm border border-slate-200 bg-white text-slate-500 flex items-center justify-center shrink-0`}
                        >
                          <ChevronDown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 justify-end flex-shrink-0 ${compact ? "min-w-[60px]" : "min-w-[90px]"}`}
                    >
                      <span
                        className={`font-semibold ${compact ? "text-xs" : "text-sm"} ${indicatorColor}`}
                      >
                        {numericValue === 0 ? "$0" : formattedValue}
                      </span>
                      <div
                        className={`${compact ? "h-5 w-1" : "h-6 w-1.5"} rounded-full ${barColor}`}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {!compact && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs italic text-gray-500">
                    Numbers may not add exactly due to rounding
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ADJUSTED MMR Section */}
          <div className="flex flex-col">
            <div className={`${compact ? "mb-1" : "mb-3"} text-center`}>
              <p
                className={`font-bold uppercase tracking-wide text-gray-700 ${compact ? "text-[9px]" : "text-xs"} ${compact ? "mb-1" : "mb-2"}`}
              >
                ADJUSTED MMR
              </p>
              <div className="flex items-center justify-center gap-2">
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
                className={`relative w-full ${compact ? "h-32" : "h-48"} flex items-end justify-center`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      startAngle={180}
                      endAngle={0}
                      innerRadius="65%"
                      outerRadius="85%"
                      cx="50%"
                      cy="80%"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill="#2563eb" />
                      <Cell fill="#e0e7ff" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <svg
                  viewBox="0 0 200 120"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: "rotate(0deg)" }}
                >
                  {renderNeedle(adjustedMmr - gaugeMin, 0, gaugeMax - gaugeMin)}
                </svg>
                <div className="absolute bottom-2 left-2 text-xs text-gray-600 font-medium">
                  {formatCurrency(displayRangeMin)}
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-gray-600 font-medium">
                  {formatCurrency(displayRangeMax)}
                </div>
                <div
                  className={`absolute ${compact ? "bottom-8" : "bottom-10"} left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-gray-200`}
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
