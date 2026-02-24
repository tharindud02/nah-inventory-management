import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import type { ComparableRow } from "@/components/valuation/RecentSoldComparablesTable";
import type { DataPoint } from "@/components/valuation/MarketPositionChart";

interface GenerateReportData {
  vehicle_details?: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    engine?: string;
    transmission?: string;
    exterior_color?: string;
    interior_color?: string;
    mileage?: number;
    vin?: string;
  };
  valuation_summary?: {
    estimated_value?: number;
    mmr_average?: number;
    market_comps_average?: number;
  };
  market_insights?: {
    demand_score?: number;
    days_supply?: number;
  };
  data?: { vehicle_details?: GenerateReportData["vehicle_details"] };
  [key: string]: unknown;
}

interface ValuationApiData {
  marketcheck_price?: number;
  msrp?: number;
  [key: string]: unknown;
}

interface MarketCompsData {
  comparables?: Array<{
    mileage?: number;
    price?: number;
    days_on_market?: number;
    listing_date?: string;
    sale_date?: string;
  }>;
  listings?: Array<{
    miles?: number;
    price?: number;
    build?: { year?: number };
  }>;
  market_stats?: {
    average_price?: number;
    average_days_on_market?: number;
  };
  [key: string]: unknown;
}

interface SoldCompsData {
  sold_comparables?: Array<{
    mileage?: number;
    sale_price?: number;
    sale_date?: string;
  }>;
  listings?: Array<{
    miles?: number;
    price?: number;
    sold_at?: string;
  }>;
  market_stats?: {
    average_sale_price?: number;
    average_days_on_market?: number;
    total_sold?: number;
    price_range?: { min?: number; max?: number };
  };
  [key: string]: unknown;
}

interface MmrData {
  base_mmr?: number;
  adjusted_mmr?: number;
  avg_odo?: number;
  avg_condition?: string;
  mmr_values?: {
    auction?: { average?: number };
    retail?: { average?: number };
  };
  [key: string]: unknown;
}

function formatPrice(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `$${value.toLocaleString()}`;
}

function parseComparableRows(
  sold: SoldCompsData | null,
  active: MarketCompsData | null,
): ComparableRow[] {
  const rows: ComparableRow[] = [];

  const fromSold = sold?.sold_comparables ?? sold?.listings ?? [];
  for (const item of fromSold) {
    const miles =
      (item as { mileage?: number }).mileage ?? (item as { miles?: number }).miles ?? 0;
    const priceVal =
      (item as { sale_price?: number }).sale_price ??
      (item as { price?: number }).price ??
      0;
    const date =
      (item as { sale_date?: string }).sale_date ??
      (item as { sold_at?: string }).sold_at ??
      "";
    rows.push({
      date: date ? new Date(date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : "—",
      miles: Number(miles),
      price: formatPrice(priceVal),
    });
  }

  if (rows.length > 0) return rows.slice(0, 10);

  const fromActive = active?.comparables ?? active?.listings ?? [];
  for (const item of fromActive) {
    const miles =
      (item as { mileage?: number }).mileage ?? (item as { miles?: number }).miles ?? 0;
    const priceVal = (item as { price?: number }).price ?? 0;
    const date =
      (item as { listing_date?: string }).listing_date ??
      (item as { sale_date?: string }).sale_date ??
      "";
    rows.push({
      date: date ? new Date(date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : "—",
      miles: Number(miles),
      price: formatPrice(priceVal),
    });
  }

  return rows.slice(0, 10);
}

function parseMarketPosition(
  sold: SoldCompsData | null,
  active: MarketCompsData | null,
  subjectMileage?: number,
  subjectPrice?: number,
): { sold: DataPoint[]; subject?: DataPoint } {
  const soldItems = sold?.sold_comparables ?? sold?.listings ?? [];
  const activeItems = active?.comparables ?? active?.listings ?? [];
  const items = soldItems.length > 0 ? soldItems : activeItems;

  const points: DataPoint[] = items.slice(0, 12).map((item) => {
    const miles = (item as { mileage?: number }).mileage ?? (item as { miles?: number }).miles ?? 0;
    const price =
      (item as { sale_price?: number }).sale_price ??
      (item as { price?: number }).price ??
      0;
    return { mileage: Number(miles), price: Number(price) };
  });

  let subject: DataPoint | undefined;
  if (subjectMileage != null && subjectPrice != null) {
    subject = {
      mileage: subjectMileage,
      price: subjectPrice,
      isSubject: true,
    };
  }

  return { sold: points, subject };
}

export interface TransformVindataInput {
  vin: string;
  generateReport?: { data?: GenerateReportData } | null;
  valuation?: { data?: ValuationApiData } | null;
  marketComps?: { data?: MarketCompsData } | null;
  soldComps?: { data?: SoldCompsData } | null;
  mmr?: { data?: MmrData } | null;
  listingPrice?: number | null;
  listingMileage?: number | null;
  listingDate?: string | null;
}

export function transformVindataToValuationResults(
  input: TransformVindataInput,
): ValuationResultsData {
  const { vin, generateReport, valuation, marketComps, soldComps, mmr, listingPrice, listingMileage, listingDate } = input;

  const reportData = generateReport?.data as GenerateReportData | undefined;
  const vehicleDetails = reportData?.vehicle_details ?? {};
  const valuationData = valuation?.data;
  const soldData = soldComps?.data;
  const activeData = marketComps?.data;
  const mmrData = mmr?.data;

  const vSummary = reportData?.valuation_summary;
  const marketPrice =
    valuationData?.marketcheck_price ??
    (typeof vSummary?.market_comps_average === "number" ? vSummary.market_comps_average : 0) ??
    0;
  const mmrAvg =
    (typeof vSummary?.mmr_average === "number" ? vSummary.mmr_average : null) ??
    mmrData?.adjusted_mmr ??
    mmrData?.base_mmr ??
    (mmrData?.mmr_values as { auction?: { average?: number } } | undefined)?.auction?.average ??
    0;
  const avgPrice = activeData?.market_stats?.average_price ?? soldData?.market_stats?.average_sale_price ?? marketPrice;
  const subjectMiles = listingMileage ?? vehicleDetails?.mileage ?? 0;
  const subjectPrice = listingPrice ?? marketPrice;

  const comparables = parseComparableRows(soldData ?? null, activeData ?? null);
  const marketPosition = parseMarketPosition(
    soldData ?? null,
    activeData ?? null,
    subjectMiles ? Number(subjectMiles) : undefined,
    subjectPrice ? Number(subjectPrice) : undefined,
  );

  const mInsights = reportData?.market_insights;
  const daysSupply =
    (typeof mInsights?.days_supply === "number" ? mInsights.days_supply : null) ?? 0;
  const demandScore =
    (typeof mInsights?.demand_score === "number" ? mInsights.demand_score : null) ?? null;

  const daysOnMarket = (() => {
    if (listingDate) {
      const listingDateObj = new Date(listingDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - listingDateObj.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const activeComparables = activeData?.comparables ?? [];
    const domValues = activeComparables
      .map((c) => c.days_on_market)
      .filter((dom): dom is number => typeof dom === "number" && dom > 0);
    return domValues.length > 0
      ? Math.round(domValues.reduce((a, b) => a + b, 0) / domValues.length)
      : Math.round(
          Number(activeData?.market_stats?.average_days_on_market ?? 0),
        );
  })();

  const avgMarketDom =
    (typeof activeData?.market_stats?.average_days_on_market === "number"
      ? activeData.market_stats.average_days_on_market
      : null) ??
    (typeof soldData?.market_stats?.average_days_on_market === "number"
      ? soldData.market_stats.average_days_on_market
      : null) ??
    0;

  const activeLocal =
    activeData?.comparables?.length ?? activeData?.listings?.length ?? 0;
  const sold90dLocal =
    soldData?.sold_comparables?.length ??
    soldData?.listings?.length ??
    soldData?.market_stats?.total_sold ??
    0;
  const marketDaysSupply = Number.isFinite(daysSupply) ? Number(daysSupply) : 0;
  const consumerInterest =
    demandScore != null && !Number.isNaN(demandScore)
      ? demandScore >= 70
        ? "High"
        : demandScore >= 50
          ? "Moderate"
          : "Low"
      : "N/A";
  const consumerInterestPercentile =
    demandScore != null && !Number.isNaN(demandScore)
      ? `${Math.min(99, Math.round(demandScore))}th Percentile Ranking`
      : "N/A";

  return {
    metrics: {
      daysOnMarket,
      avgMarketDom,
      activeLocal,
      sold90dLocal,
      marketDaysSupply,
      consumerInterest,
      consumerInterestPercentile,
    },
    mmr: {
      base_mmr: mmrData?.base_mmr ?? Number(mmrAvg),
      adjusted_mmr: mmrData?.adjusted_mmr ?? mmrData?.base_mmr ?? Number(mmrAvg),
      adjustments: {
        odometer: 0,
        region: 0,
        cr_score: 0,
        color: 0,
      },
      typical_range: {
        min: Number(mmrAvg) * 0.95,
        max: Number(mmrAvg) * 1.05,
      },
      avg_odo: mmrData?.avg_odo ?? subjectMiles ? Number(subjectMiles) : 25000,
      avg_condition: mmrData?.avg_condition ?? "4.5",
    },
    retail: {
      currentAsking: formatPrice(listingPrice ?? subjectPrice),
      marketAvg: formatPrice(avgPrice || marketPrice),
      belowMarket:
        listingPrice != null && avgPrice > 0
          ? `$${Math.abs(avgPrice - listingPrice).toLocaleString()} ${listingPrice < avgPrice ? "below" : "above"} Market`
          : undefined,
      retailMargin:
        listingPrice != null && mmrAvg > 0
          ? formatPrice(listingPrice - Number(mmrAvg))
          : "N/A",
      priceRank: "—",
      competitivePositionPercent: avgPrice > 0 && listingPrice != null ? Math.round((listingPrice / avgPrice) * 100) : undefined,
    },
    condition: {
      score: 0,
      bars: [],
    },
    comparables: comparables.length > 0 ? comparables : [
      { date: "—", miles: subjectMiles ? Number(subjectMiles) : 0, price: formatPrice(subjectPrice) },
    ],
    marketPosition,
  };
}

export interface BuildSheetSummary {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
}

/** Normalizes MarketCheck basic decode response to the format expected by vin-analysis. */
export function normalizeMarketCheckDecodeResponse(
  raw: Record<string, unknown>,
  vin: string,
): Record<string, unknown> {
  const year = typeof raw.year === "number" ? raw.year : undefined;
  const make = typeof raw.make === "string" ? raw.make.trim() : undefined;
  const model = typeof raw.model === "string" ? raw.model.trim() : undefined;
  const trim = typeof raw.trim === "string" ? raw.trim.trim() : undefined;
  const engine = typeof raw.engine === "string" ? raw.engine.trim() : undefined;
  const transmission =
    typeof raw.transmission === "string" ? raw.transmission.trim() : undefined;
  const drivetrain =
    typeof raw.drivetrain === "string" ? raw.drivetrain.trim() : undefined;

  return {
    ...raw,
    summary: { make, model, year },
    make,
    model,
    year,
    trim,
    trimLevels: trim ? { Default: { General: { Trim: trim } } } : undefined,
    vehicle_details: {
      year,
      make,
      model,
      trim,
      vin,
      engine,
      transmission,
      drivetrain,
    },
  };
}

/** Normalizes AWS VIN lookup response to the format expected by vin-analysis and downstream APIs. */
export function normalizeVinLookupResponse(
  raw: unknown,
  vin: string,
): {
  summary?: { make?: string; model?: string; year?: number };
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  trimLevels?: { Default?: { General?: { Trim?: string } } };
  vehicle_details?: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    mileage?: number;
    vin?: string;
  };
  odometerInformation?: { reportedOdometer?: number }[];
  [key: string]: unknown;
} {
  const obj = (raw && typeof raw === "object" && "data" in raw
    ? (raw as { data?: unknown }).data
    : raw) as Record<string, unknown> | null;

  if (!obj || typeof obj !== "object") {
    return {
      summary: {},
      vehicle_details: { vin },
    };
  }

  const vd = (obj.vehicle_details ?? obj.vehicleDetails) as Record<string, unknown> | undefined;
  const summary = (obj.summary ?? obj.Summary) as Record<string, unknown> | undefined;
  const year = Number(obj.year ?? vd?.year ?? summary?.year) || undefined;
  const make = String(obj.make ?? vd?.make ?? summary?.make ?? "").trim() || undefined;
  const model = String(obj.model ?? vd?.model ?? summary?.model ?? "").trim() || undefined;
  const trim = String(obj.trim ?? vd?.trim ?? summary?.trim ?? "").trim() || undefined;
  const mileage = typeof vd?.mileage === "number" ? vd.mileage : typeof obj.mileage === "number" ? obj.mileage : undefined;
  const odometer = (obj.odometerInformation ?? obj.odometer_information) as { reportedOdometer?: number }[] | undefined;

  return {
    ...obj,
    summary: { make, model, year },
    make,
    model,
    year,
    trim,
    trimLevels: trim ? { Default: { General: { Trim: trim } } } : undefined,
    vehicle_details: {
      year,
      make,
      model,
      trim,
      mileage,
      vin,
    },
    odometerInformation: Array.isArray(odometer) ? odometer : undefined,
  };
}

export function extractBuildSheetSummary(
  generateReport: { data?: GenerateReportData } | null,
  vin: string,
): BuildSheetSummary {
  const vd = generateReport?.data?.vehicle_details ?? {};
  return {
    vin,
    year: vd.year,
    make: vd.make,
    model: vd.model,
    trim: vd.trim,
    engine: vd.engine,
    transmission: vd.transmission,
    exteriorColor: vd.exterior_color,
    interiorColor: vd.interior_color,
    mileage: vd.mileage,
  };
}
