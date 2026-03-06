"use client";

import {
  BarChart2,
  Check,
  ChevronDown,
  ChevronUp,
  Droplet,
  Gauge,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MMRRequestContext {
  vin?: string;
  zip?: string;
  odometer?: number;
  region?: string;
  color?: string;
  grade?: number;
  build_options?: boolean;
}

interface MMRData {
  base_mmr?: number;
  adjusted_mmr?: number;
  adjustments?: {
    odometer?: number;
    region?: number;
    cr_score?: number;
    color?: number;
  };
  typical_range?: { min?: number; max?: number };
  avg_odo?: number;
  avg_condition?: string;
  request_context?: MMRRequestContext;
}

interface MMRSectionProps {
  mmrData: MMRData | null;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
}

interface LookupResponse {
  success?: boolean;
  data?: string[];
}

interface MmrResponse {
  success?: boolean;
  data?: MMRData;
  error?: string;
}

interface GaugeMeterProps {
  value: number;
  min: number;
  max: number;
}

interface MmrFetchParams {
  vin: string;
  include?: string;
  zip?: string;
  odometer?: number;
  region?: string;
  color?: string;
  grade?: number;
  buildOptions?: boolean;
}

type IndicatorKey = "odometer" | "region" | "cr_score" | "color" | "build_options";
type IndicatorValues = Record<IndicatorKey, number>;

const GRADE_OPTIONS = Array.from({ length: 41 }, (_, index) =>
  (1 + index / 10).toFixed(1),
);
const FALLBACK_REGION_OPTIONS = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Southwest",
  "West",
  "Northwest",
];
const FALLBACK_COLOR_OPTIONS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Gold",
  "Orange",
  "Yellow",
  "Purple",
];
const EMPTY_INDICATORS: IndicatorValues = {
  odometer: 0,
  region: 0,
  cr_score: 0,
  color: 0,
  build_options: 0,
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return formatCurrency(value);
};

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseOdometerInput(value: string): number | undefined {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined;
}

function formatOdometerInput(value: number | undefined): string {
  return value && value > 0 ? value.toLocaleString() : "";
}

function formatGradeForUi(
  grade: number | undefined,
  avgCondition: string | undefined,
): string {
  if (typeof grade === "number" && Number.isFinite(grade)) {
    const normalized = grade <= 5 ? grade : grade / 10;
    return normalized >= 1 && normalized <= 5 ? normalized.toFixed(1) : "";
  }

  const parsed = Number(avgCondition);
  if (Number.isFinite(parsed) && parsed >= 10 && parsed <= 50) {
    return (parsed / 10).toFixed(1);
  }

  return "";
}

function normalizeGradeForApi(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const grade = Math.round(parsed * 10);
  if (grade < 10 || grade > 50) return undefined;
  return grade;
}

function withCurrentOption(options: string[], current: string): string[] {
  if (!current) return options;
  return options.includes(current) ? options : [current, ...options];
}

function buildMmrQueryString(params: MmrFetchParams): string {
  const searchParams = new URLSearchParams({
    include: params.include ?? "ci,retail,forecast",
  });

  if (params.zip) {
    searchParams.set("zip", params.zip);
  }
  if (params.odometer !== undefined) {
    searchParams.set("odometer", String(params.odometer));
  }
  if (params.region) {
    searchParams.set("region", params.region);
  }
  if (params.color) {
    searchParams.set("color", params.color);
  }
  if (params.grade !== undefined) {
    searchParams.set("grade", String(params.grade));
  }
  if (typeof params.buildOptions === "boolean") {
    searchParams.set("buildOptions", String(params.buildOptions));
  }

  return searchParams.toString();
}

async function fetchAdjustedMmr(params: MmrFetchParams): Promise<MMRData | null> {
  const queryString = buildMmrQueryString(params);
  const response = await fetch(`/api/mmr/${params.vin}?${queryString}`, {
    method: "GET",
    cache: "no-store",
  });
  const json = (await response.json().catch(() => null)) as MmrResponse | null;
  if (!response.ok || !json?.success || !json.data) {
    return null;
  }
  return json.data;
}

function GaugeMeter({ value, min, max }: GaugeMeterProps) {
  const cx = 100;
  const cy = 94;
  const radius = 70;
  const strokeWidth = 18;
  const needleLength = 67;
  const startAngle = 210;
  const endAngle = -30;

  const clampedValue = Math.max(min, Math.min(max, value));
  const range = Math.max(max - min, 1);
  const valueRatio = (clampedValue - min) / range;
  const valueAngle = startAngle + (endAngle - startAngle) * valueRatio;

  const polarToCartesian = (angle: number, r: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(radians),
      y: cy - r * Math.sin(radians),
    };
  };

  const buildArcPath = (arcStart: number, arcEnd: number, segments = 40) => {
    const points = Array.from({ length: segments + 1 }, (_, index) => {
      const ratio = index / segments;
      const angle = arcStart + (arcEnd - arcStart) * ratio;
      return polarToCartesian(angle, radius);
    });

    return points
      .map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(" ");
  };

  const referenceArcPath = buildArcPath(startAngle, endAngle);
  const valueArcPath = buildArcPath(startAngle, valueAngle, 28);
  const needleTip = polarToCartesian(valueAngle, needleLength);

  return (
    <svg viewBox="0 0 200 130" className="w-full" aria-hidden="true">
      <path
        d={referenceArcPath}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      <path
        d={valueArcPath}
        fill="none"
        stroke="#1f73d2"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      <line
        x1={cx}
        y1={cy}
        x2={needleTip.x.toFixed(2)}
        y2={needleTip.y.toFixed(2)}
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill="#1e293b" />
    </svg>
  );
}

function IndicatorCell({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const textColor = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-orange-600"
      : "text-slate-400";
  const barColor = isPositive
    ? "bg-emerald-600"
    : isNegative
      ? "bg-orange-600"
      : "bg-slate-300";

  return (
    <div className="relative flex h-full min-h-[42px] w-[112px] items-center justify-between overflow-hidden rounded-md bg-slate-50 px-3 py-2">
      <div className={cn("flex items-center gap-1 text-sm font-semibold", textColor)}>
        <span>{value === 0 ? "--" : `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`}</span>
        {isPositive ? <ChevronUp className="h-4 w-4" /> : null}
        {isNegative ? <ChevronDown className="h-4 w-4" /> : null}
      </div>
      <div className={cn("absolute inset-y-0 right-0 w-2", barColor)} />
    </div>
  );
}

function BuildOptionsToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-10 w-[88px] items-center rounded-full transition-colors",
        checked ? "bg-emerald-100" : "bg-slate-200",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute h-8 w-8 rounded-full border border-slate-300 bg-white shadow-sm transition-transform",
          checked ? "translate-x-[48px]" : "translate-x-1",
        )}
      />
      <span className={cn("absolute right-3 text-sm font-semibold", checked ? "text-emerald-700" : "text-slate-600")}>
        {checked ? "YES" : "NO"}
      </span>
    </button>
  );
}

export function MMRSection({
  mmrData,
  isLoading = false,
  compact = false,
  className,
}: MMRSectionProps) {
  const [liveMmrData, setLiveMmrData] = useState<MMRData | null>(null);
  const [regionOptions, setRegionOptions] = useState<string[]>(FALLBACK_REGION_OPTIONS);
  const [colorOptions, setColorOptions] = useState<string[]>(FALLBACK_COLOR_OPTIONS);
  const [odometerInput, setOdometerInput] = useState("");
  const [regionSelect, setRegionSelect] = useState("");
  const [gradeSelect, setGradeSelect] = useState("");
  const [colorSelect, setColorSelect] = useState("");
  const [buildOptionsEnabled, setBuildOptionsEnabled] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [indicatorValues, setIndicatorValues] = useState<IndicatorValues>(EMPTY_INDICATORS);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        const [colorsRes, regionsRes] = await Promise.all([
          fetch("/api/mmr/colors", { cache: "no-store" }),
          fetch("/api/mmr/regions", { cache: "no-store" }),
        ]);
        const [colorsJson, regionsJson] = (await Promise.all([
          colorsRes.json().catch(() => null),
          regionsRes.json().catch(() => null),
        ])) as [LookupResponse | null, LookupResponse | null];

        if (cancelled) return;

        if (colorsRes.ok && colorsJson?.data) {
          setColorOptions(colorsJson.data);
        }
        if (regionsRes.ok && regionsJson?.data) {
          setRegionOptions(regionsJson.data);
        }
      } catch {
        if (!cancelled) {
          setColorOptions(FALLBACK_COLOR_OPTIONS);
          setRegionOptions(FALLBACK_REGION_OPTIONS);
        }
      }
    };

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mmrData) {
      setLiveMmrData(null);
      setOdometerInput("");
      setRegionSelect("");
      setGradeSelect("");
      setColorSelect("");
      setBuildOptionsEnabled(true);
      setHasInteracted(false);
      setRefreshError(null);
      setIndicatorValues(EMPTY_INDICATORS);
      return;
    }

    const requestContext = mmrData.request_context;
    const defaultOdometer = requestContext?.odometer ?? mmrData.avg_odo;
    setLiveMmrData(null);
    setOdometerInput(formatOdometerInput(defaultOdometer));
    setRegionSelect(requestContext?.region ?? "");
    setGradeSelect(formatGradeForUi(requestContext?.grade, mmrData.avg_condition));
    setColorSelect(requestContext?.color ?? "");
    setBuildOptionsEnabled(requestContext?.build_options ?? true);
    setHasInteracted(false);
    setRefreshError(null);
    setIndicatorValues(EMPTY_INDICATORS);
  }, [mmrData]);

  const displayMmr = liveMmrData ?? mmrData;
  const toNum = (value?: number | null, fallback = 0) =>
    typeof value === "number" && !Number.isNaN(value) ? value : fallback;

  useEffect(() => {
    if (!mmrData || !hasInteracted) {
      return;
    }

    const vin = mmrData.request_context?.vin?.trim().toUpperCase();
    if (!vin) {
      return;
    }

    const odometer = parseOdometerInput(odometerInput);
    const grade = normalizeGradeForApi(gradeSelect);
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsRefreshing(true);
        setRefreshError(null);
        const data = await fetchAdjustedMmr({
          vin,
          zip: mmrData.request_context?.zip,
          odometer,
          region: regionSelect || undefined,
          color: colorSelect || undefined,
          grade,
          buildOptions: buildOptionsEnabled,
        });
        if (!cancelled && data) {
          setLiveMmrData(data);
        }
        if (!cancelled && !data) {
          setRefreshError("Failed to refresh adjusted MMR");
        }
      } catch (error) {
        if (!cancelled) {
          setRefreshError(
            error instanceof Error ? error.message : "Failed to refresh adjusted MMR",
          );
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [buildOptionsEnabled, colorSelect, gradeSelect, hasInteracted, mmrData, odometerInput, regionSelect]);

  useEffect(() => {
    if (!mmrData) {
      return;
    }

    const vin = mmrData.request_context?.vin?.trim().toUpperCase();
    if (!vin) {
      setIndicatorValues(EMPTY_INDICATORS);
      return;
    }

    const baseMmr = toNum(mmrData.base_mmr);
    const odometer = parseOdometerInput(odometerInput);
    const grade = normalizeGradeForApi(gradeSelect);
    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const requests: Array<Promise<number>> = [
        odometer !== undefined
          ? fetchAdjustedMmr({
              vin,
              zip: mmrData.request_context?.zip,
              odometer,
              buildOptions: false,
            }).then((data) => toNum(data?.adjusted_mmr, baseMmr) - baseMmr)
          : Promise.resolve(0),
        regionSelect
          ? fetchAdjustedMmr({
              vin,
              zip: mmrData.request_context?.zip,
              region: regionSelect,
              buildOptions: false,
            }).then((data) => toNum(data?.adjusted_mmr, baseMmr) - baseMmr)
          : Promise.resolve(0),
        grade !== undefined
          ? fetchAdjustedMmr({
              vin,
              zip: mmrData.request_context?.zip,
              grade,
              buildOptions: false,
            }).then((data) => toNum(data?.adjusted_mmr, baseMmr) - baseMmr)
          : Promise.resolve(0),
        colorSelect
          ? fetchAdjustedMmr({
              vin,
              zip: mmrData.request_context?.zip,
              color: colorSelect,
              buildOptions: false,
            }).then((data) => toNum(data?.adjusted_mmr, baseMmr) - baseMmr)
          : Promise.resolve(0),
        buildOptionsEnabled
          ? fetchAdjustedMmr({
              vin,
              zip: mmrData.request_context?.zip,
              buildOptions: true,
            }).then((data) => toNum(data?.adjusted_mmr, baseMmr) - baseMmr)
          : Promise.resolve(0),
      ];

      const [odometerDelta, regionDelta, gradeDelta, colorDelta, buildDelta] =
        await Promise.all(requests);

      if (!cancelled) {
        setIndicatorValues({
          odometer: odometerDelta,
          region: regionDelta,
          cr_score: gradeDelta,
          color: colorDelta,
          build_options: buildDelta,
        });
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [buildOptionsEnabled, colorSelect, gradeSelect, mmrData, odometerInput, regionSelect]);

  const handleClear = () => {
    if (!mmrData) return;
    const requestContext = mmrData.request_context;
    const defaultOdometer = requestContext?.odometer ?? mmrData.avg_odo;
    setOdometerInput(formatOdometerInput(defaultOdometer));
    setRegionSelect(requestContext?.region ?? "");
    setGradeSelect(formatGradeForUi(requestContext?.grade, mmrData.avg_condition));
    setColorSelect(requestContext?.color ?? "");
    setBuildOptionsEnabled(requestContext?.build_options ?? true);
    setHasInteracted(true);
  };

  if (isLoading || !displayMmr) {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
          <BarChart2 className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            MMR
          </h3>
        </div>
        <div className="space-y-3 p-5 animate-pulse">
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  const baseMmr = toNum(displayMmr.base_mmr);
  const adjustedMmr = toNum(displayMmr.adjusted_mmr, baseMmr);
  const avgOdo = toNum(displayMmr.avg_odo);
  const avgCondition = displayMmr.avg_condition ?? "N/A";
  const rangeMin = toNum(displayMmr.typical_range?.min, baseMmr);
  const rangeMax = toNum(displayMmr.typical_range?.max, baseMmr);
  const gaugeMax = rangeMax > rangeMin ? rangeMax : rangeMin + 1;
  const needleValue = adjustedMmr > 0 ? adjustedMmr : baseMmr;
  const mergedRegionOptions = withCurrentOption(regionOptions, regionSelect);
  const mergedColorOptions = withCurrentOption(colorOptions, colorSelect);
  const isFormDisabled = !displayMmr.request_context?.vin;
  const inputRowCls =
    "flex flex-1 min-w-0 items-center gap-2 rounded-md border px-2.5 py-2";
  const iconCls = "flex h-5 w-5 shrink-0 items-center justify-center rounded";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
        <BarChart2 className="h-4 w-4 text-blue-500" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          MMR
        </h3>
      </div>

      <div className="flex divide-x divide-slate-200">
        <div className="w-[180px] shrink-0 px-5 py-4">
          <div className="divide-y divide-slate-200">
            <div className="pb-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Base MMR
              </p>
              <p className={cn("font-bold leading-none text-amber-500", compact ? "text-xl" : "text-[26px]")}>
                {formatCurrency(baseMmr)}
              </p>
            </div>
            <div className="py-4">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Avg ODO (MI)
              </p>
              <p className="text-base font-bold leading-none text-slate-900">
                {avgOdo > 0 ? avgOdo.toLocaleString() : "—"}
              </p>
            </div>
            <div className="py-4">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Avg Grade
              </p>
              <p className="text-base font-bold leading-none text-slate-900">{avgCondition}</p>
            </div>
            <div className="pt-4">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Typical Range
              </p>
              <p className="text-sm font-semibold leading-snug text-slate-800">
                {formatCurrency(rangeMin)} – {formatCurrency(gaugeMax)}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-[1] px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              MMR Adjustments
            </p>
            <div className="flex items-center gap-2">
              {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : null}
              <button
                type="button"
                onClick={handleClear}
                disabled={isFormDisabled}
                className="text-[11px] font-semibold uppercase text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className={cn(inputRowCls, "border-blue-300 bg-white ring-1 ring-blue-100 shadow-sm")}>
                <div className={cn(iconCls, "bg-blue-600 text-white")}>
                  <Gauge className="h-3 w-3" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={odometerInput}
                  onChange={(event) => {
                    setHasInteracted(true);
                    setOdometerInput(event.target.value.replace(/[^0-9,]/g, ""));
                  }}
                  placeholder="Odometer"
                  disabled={isFormDisabled}
                  className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                />
                <Check className="h-4 w-4 text-blue-600" />
              </div>
              <IndicatorCell value={indicatorValues.odometer} />
            </div>

            <div className="flex items-center gap-2">
              <div className={cn(inputRowCls, "border-slate-200 bg-slate-50")}>
                <div className={cn(iconCls, "border border-slate-200 bg-white text-slate-400")}>
                  <MapPin className="h-3 w-3" />
                </div>
                <select
                  value={regionSelect}
                  onChange={(event) => {
                    setHasInteracted(true);
                    setRegionSelect(event.target.value);
                  }}
                  disabled={isFormDisabled}
                  className="min-w-0 flex-1 appearance-none bg-transparent text-xs font-semibold text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <option value="">Region</option>
                  {mergedRegionOptions.map((option) => (
                    <option key={option} value={option}>
                      {toTitleCase(option)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none h-3 w-3 shrink-0 text-blue-600" />
              </div>
              <IndicatorCell value={indicatorValues.region} />
            </div>

            <div className="flex items-center gap-2">
              <div className={cn(inputRowCls, "border-slate-200 bg-slate-50")}>
                <div className={cn(iconCls, "border border-slate-200 bg-white text-slate-500")}>
                  <span className="text-[9px] font-bold leading-none">CR</span>
                </div>
                <select
                  value={gradeSelect}
                  onChange={(event) => {
                    setHasInteracted(true);
                    setGradeSelect(event.target.value);
                  }}
                  disabled={isFormDisabled}
                  className="min-w-0 flex-1 appearance-none bg-transparent text-xs font-semibold text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <option value="">CR Score</option>
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none h-3 w-3 shrink-0 text-blue-600" />
              </div>
              <IndicatorCell value={indicatorValues.cr_score} />
            </div>

            <div className="flex items-center gap-2">
              <div className={cn(inputRowCls, "border-slate-200 bg-slate-50")}>
                <div className={cn(iconCls, "border border-slate-200 bg-white text-slate-400")}>
                  <Droplet className="h-3 w-3" />
                </div>
                <select
                  value={colorSelect}
                  onChange={(event) => {
                    setHasInteracted(true);
                    setColorSelect(event.target.value);
                  }}
                  disabled={isFormDisabled}
                  className="min-w-0 flex-1 appearance-none bg-transparent text-xs font-semibold text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <option value="">Color</option>
                  {mergedColorOptions.map((option) => (
                    <option key={option} value={option}>
                      {toTitleCase(option)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none h-3 w-3 shrink-0 text-blue-600" />
              </div>
              <IndicatorCell value={indicatorValues.color} />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex min-h-[42px] flex-1 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold text-slate-500">Build Options?</span>
                <BuildOptionsToggle
                  checked={buildOptionsEnabled}
                  onChange={(checked) => {
                    setHasInteracted(true);
                    setBuildOptionsEnabled(checked);
                  }}
                  disabled={isFormDisabled}
                />
              </div>
              <IndicatorCell value={indicatorValues.build_options} />
            </div>
          </div>

          {refreshError ? (
            <p className="mt-2 text-[11px] font-medium text-rose-600">{refreshError}</p>
          ) : null}
        </div>

        <div className="w-[185px] shrink-0 px-4 py-4">
          <div className="mb-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Adjusted MMR
            </p>
            <div className="flex items-center gap-1.5">
              <p className={cn("font-bold leading-none text-amber-500", compact ? "text-xl" : "text-[26px]")}>
                {formatCurrency(adjustedMmr > 0 ? adjustedMmr : baseMmr)}
              </p>
              {adjustedMmr > baseMmr ? (
                <div className="h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-emerald-500" />
              ) : null}
              {adjustedMmr > 0 && adjustedMmr < baseMmr ? (
                <div className="h-0 w-0 border-x-[5px] border-t-[8px] border-x-transparent border-t-orange-600" />
              ) : null}
            </div>
          </div>

          <div className="mt-3">
            <GaugeMeter value={needleValue} min={rangeMin} max={gaugeMax} />
            <div className="-mt-1 flex justify-between px-0.5 text-[10px] font-semibold text-slate-600">
              <span>{formatCompact(rangeMin)}</span>
              <span>{formatCompact(gaugeMax)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
