import type { ConfigItem } from "@/components/details/ConfigurationCard";
import type {
  ValuationResultsData,
  MMRData,
} from "@/components/valuation/ValuationResultsContent";
import type { ComparableRow } from "@/components/valuation/RecentSoldComparablesTable";
import type { DataPoint } from "@/components/valuation/MarketPositionChart";

/** NeoVIN Decoder API response (subset). @see https://docs.marketcheck.com/docs/api/cars/vehicle-specs/neovin */
export interface NeoVINResponse {
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  transmission?: string;
  transmission_description?: string;
  engine?: string;
  fuel_type?: string;
  city_mpg?: number;
  highway_mpg?: number;
  exterior_color?: { name?: string; code?: string };
  interior_color?: { name?: string; code?: string };
  body_type?: string;
  drivetrain?: string;
  powertrain_type?: string;
}

/** MarketCheck Car Listing Details API response (subset we use). */
export interface MarketCheckCarListing {
  id?: string;
  vin?: string;
  heading?: string;
  price?: number;
  msrp?: number;
  miles?: number;
  dom?: number;
  dom_active?: number;
  media?: { photo_links?: string[] };
  exterior_color?: string;
  interior_color?: string;
  base_ext_color?: string;
  base_int_color?: string;
  dealer?: { zip?: string; state?: string };
  build?: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    engine?: string;
    transmission?: string;
    city_mpg?: number;
    highway_mpg?: number;
    powertrain_type?: string;
    fuel_type?: string;
  };
  extra?: {
    options?: string[];
  };
}

const EMPTY = "—";

function isMissingConfigValue(value: string): boolean {
  return !value || value.trim() === "" || value.trim() === EMPTY;
}

/** Derive engine string from build.engine, options, or fallbacks. */
function findEngine(listing: MarketCheckCarListing): string {
  if (listing.build?.engine) return listing.build.engine;

  const opts = listing.extra?.options ?? [];
  const engineOpt = opts.find(
    (o) =>
      o &&
      (/\d+\.?\d*L\s*(V\d|I\d|Inline)?/i.test(o) ||
        /engine.*\d+\.?\d*L/i.test(o) ||
        /\d+\s*cylinder/i.test(o)),
  );
  if (engineOpt) return engineOpt;

  const pt = listing.build?.powertrain_type;
  if (pt) return pt;

  const ft = listing.build?.fuel_type;
  if (ft) return ft;

  return EMPTY;
}

/** Format fuel economy as "18 City / 23 Hwy". */
function formatFuelEconomy(listing: MarketCheckCarListing): string {
  const city = listing.build?.city_mpg;
  const hwy = listing.build?.highway_mpg;
  if (city != null && hwy != null) {
    return `${city} City / ${hwy} Hwy`;
  }
  if (city != null) return `${city} City`;
  if (hwy != null) return `${hwy} Hwy`;
  return EMPTY;
}

/**
 * Builds config items for the Configuration card from MarketCheck Car Listing Details.
 * Per [MarketCheck docs](https://docs.marketcheck.com/docs/api/cars/vehicle-listing/car-listing).
 */
export function buildConfigurationFromMarketCheck(
  listing: MarketCheckCarListing,
): ConfigItem[] {
  const items: ConfigItem[] = [];
  if (!listing) return items;

  const engine = findEngine(listing);
  const transmission = listing.build?.transmission ?? EMPTY;
  const exteriorColor =
    listing.exterior_color ?? listing.base_ext_color ?? EMPTY;
  const interiorColor =
    listing.interior_color ?? listing.base_int_color ?? EMPTY;
  const fuelEconomy = formatFuelEconomy(listing);

  items.push({ label: "Engine", value: engine });
  items.push({ label: "Transmission", value: transmission });
  items.push({ label: "Exterior Color", value: exteriorColor });
  items.push({ label: "Interior Color", value: interiorColor });
  items.push({ label: "Fuel Economy", value: fuelEconomy });

  return items;
}

export interface VinDataFromListing {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  daysOnLot: number;
  media?: { photo_links?: string[] };
}

/** Builds VinDataFromListing from MarketCheck listing (for inventory detail when sessionStorage is empty). */
export function buildVinDataFromListing(
  listingId: string,
  listing: MarketCheckCarListing | null,
): VinDataFromListing | null {
  if (!listing) return null;
  const build = listing.build ?? {};
  const year = build.year ?? 0;
  const make = build.make ?? "Unknown";
  const model = build.model ?? "Vehicle";

  return {
    id: listingId,
    vin: listing.vin ?? "",
    year,
    make,
    model,
    trim: build.trim,
    price: listing.price ?? 0,
    mileage: listing.miles ?? 0,
    daysOnLot: listing.dom_active ?? listing.dom ?? 0,
    media: { photo_links: listing.media?.photo_links ?? [] },
  };
}

/** Builds VinDataFromListing from NeoVIN response. Use when listing API fails but VIN is available. */
export function buildVinDataFromNeoVIN(
  listingId: string,
  neovin: NeoVINResponse | null,
  override?: { price?: number; mileage?: number; daysOnLot?: number; photo_links?: string[] },
): VinDataFromListing | null {
  if (!neovin) return null;
  const year = neovin.year ?? 0;
  const make = neovin.make ?? "Unknown";
  const model = neovin.model ?? "Vehicle";

  return {
    id: listingId,
    vin: neovin.vin ?? "",
    year,
    make,
    model,
    trim: neovin.trim,
    price: override?.price ?? 0,
    mileage: override?.mileage ?? 0,
    daysOnLot: override?.daysOnLot ?? 0,
    media: { photo_links: override?.photo_links ?? [] },
  };
}

/** Builds config items from NeoVIN response. Use when listing API fails but VIN is available. */
export function buildConfigurationFromNeoVIN(
  neovin: NeoVINResponse | null,
): ConfigItem[] {
  if (!neovin) return [];
  const engine = neovin.engine ?? neovin.powertrain_type ?? EMPTY;
  const transmission = neovin.transmission ?? neovin.transmission_description ?? EMPTY;
  const exteriorColor =
    (typeof neovin.exterior_color === "object"
      ? neovin.exterior_color?.name
      : neovin.exterior_color) ?? EMPTY;
  const interiorColor =
    (typeof neovin.interior_color === "object"
      ? neovin.interior_color?.name
      : neovin.interior_color) ?? EMPTY;
  const city = neovin.city_mpg;
  const hwy = neovin.highway_mpg;
  const fuelEconomy =
    city != null && hwy != null
      ? `${city} City / ${hwy} Hwy`
      : city != null
        ? `${city} City`
        : hwy != null
          ? `${hwy} Hwy`
          : EMPTY;

  return [
    { label: "Engine", value: engine },
    { label: "Transmission", value: transmission },
    { label: "Exterior Color", value: exteriorColor },
    { label: "Interior Color", value: interiorColor },
    { label: "Fuel Economy", value: fuelEconomy },
  ];
}

/** Fills missing primary config values with NeoVIN fallback values by label. */
export function mergeConfigurationWithFallback(
  primary: ConfigItem[],
  fallback: ConfigItem[],
): ConfigItem[] {
  if (!primary.length) return fallback;
  if (!fallback.length) return primary;

  const fallbackByLabel = new Map(fallback.map((item) => [item.label, item.value]));
  return primary.map((item) => {
    if (!isMissingConfigValue(item.value)) return item;
    const replacement = fallbackByLabel.get(item.label);
    return replacement && !isMissingConfigValue(replacement)
      ? { ...item, value: replacement }
      : item;
  });
}

export interface MarketOverviewData {
  currentPrice: string;
  previousPrice?: string;
  priceDrop?: string;
  daysOnMarket: string;
  marketCondition: string;
  estRecon: string;
  mmrApi: string;
  mcApi: string;
}

/** Builds market overview from MarketCheck Car Listing Details. */
export function buildMarketOverviewFromMarketCheck(
  listing: MarketCheckCarListing,
): MarketOverviewData | null {
  if (!listing) return null;
  const price = listing.price ?? 0;
  const msrp = listing.msrp;
  const domActive = listing.dom_active ?? 0;

  let previousPrice: string | undefined;
  let priceDrop: string | undefined;
  if (msrp != null && msrp > price && msrp > 0) {
    previousPrice = `$${msrp.toLocaleString()}`;
    priceDrop = `-$${(msrp - price).toLocaleString()} Price Drop`;
  }

  return {
    currentPrice: price > 0 ? `$${price.toLocaleString()}` : "—",
    previousPrice,
    priceDrop,
    daysOnMarket: `${domActive} Days`,
    marketCondition: "—",
    estRecon: "",
    mmrApi: "",
    mcApi: "",
  };
}

/** Inferred Sales Stats API response (subset). */
export interface MarketCheckSalesResponse {
  count?: number;
  dom_stats?: { median?: number };
  price_stats?: { median?: number };
}

/** Inventory Search API response (subset). */
export interface MarketCheckSearchResponse {
  num_found?: number;
}

/** Market Days Supply API response (subset). */
export interface MarketCheckMdsResponse {
  mds?: number | null;
}

/** Past Inventory Search listing (subset). */
export interface MarketCheckRecentsListing {
  price?: number;
  miles?: number;
  last_seen_at?: number;
  last_seen_at_date?: string;
}

/** Past Inventory Search API response (subset). */
export interface MarketCheckRecentsResponse {
  num_found?: number;
  listings?: MarketCheckRecentsListing[];
}

function formatSoldDate(value: string | number | undefined): string {
  if (value == null) return "—";
  if (typeof value === "number") {
    const d = new Date(value * 1000);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Builds DataPoints for Market Position chart from recents listings. */
export function buildSoldPointsFromRecents(
  recents: MarketCheckRecentsResponse | null,
): DataPoint[] {
  return (recents?.listings ?? [])
    .filter((l) => (l.price ?? 0) > 0)
    .map((l) => ({ mileage: l.miles ?? 0, price: l.price ?? 0 }));
}

export function buildComparablesFromRecents(
  recents: MarketCheckRecentsResponse | null,
): ComparableRow[] {
  const listings = recents?.listings ?? [];
  return listings.map((l) => ({
    date: formatSoldDate(l.last_seen_at_date ?? l.last_seen_at),
    miles: l.miles ?? 0,
    price: l.price != null && l.price > 0 ? `$${l.price.toLocaleString()}` : "—",
  }));
}

/**
 * Builds ValuationResultsData from MarketCheck APIs.
 * Uses listing (dom_active, price), sales (count, dom_stats.median, price_stats.median),
 * search (num_found), mds (mds), recents (listings for sold comparables).
 */
export function buildValuationFromMarketCheck(
  listing: MarketCheckCarListing | null,
  sales: MarketCheckSalesResponse | null,
  search: MarketCheckSearchResponse | null,
  mds: MarketCheckMdsResponse | null,
  recents: MarketCheckRecentsResponse | null = null,
): ValuationResultsData {
  const domActive = listing?.dom_active ?? 0;
  const avgMarketDom = sales?.dom_stats?.median ?? 0;
  const activeLocal = search?.num_found ?? 0;
  const sold90dLocal = sales?.count ?? 0;
  const marketDaysSupply = mds?.mds ?? 0;

  const price = listing?.price ?? 0;
  const marketMedian = sales?.price_stats?.median;
  const currentAsking = price > 0 ? `$${price.toLocaleString()}` : "—";
  const marketAvg =
    marketMedian != null && marketMedian > 0
      ? `$${marketMedian.toLocaleString()}`
      : "—";

  let belowMarket: string | undefined;
  let competitivePositionPercent: number | undefined;
  if (
    price > 0 &&
    marketMedian != null &&
    marketMedian > 0 &&
    price !== marketMedian
  ) {
    const diff = Math.abs(price - marketMedian);
    belowMarket =
      price < marketMedian
        ? `-$${diff.toLocaleString()} below Market`
        : `+$${diff.toLocaleString()} above Market`;
    const pctFromMedian = ((price - marketMedian) / marketMedian) * 50 + 50;
    competitivePositionPercent = Math.max(0, Math.min(100, pctFromMedian));
  }

  const mmr: MMRData = {};
  const retail = {
    currentAsking,
    marketAvg,
    belowMarket,
    retailMargin: "—",
    priceRank: "—",
    competitivePositionPercent,
  };
  const condition = {
    score: 0,
    bars: [] as ValuationResultsData["condition"]["bars"],
  };
  const comparables = buildComparablesFromRecents(recents);
  const comparablesNumFound = recents?.num_found ?? 0;

  const soldPoints = buildSoldPointsFromRecents(recents);

  const subjectPoint: DataPoint | undefined =
    price > 0
      ? {
          mileage: listing?.miles ?? 0,
          price,
        }
      : undefined;

  const marketPosition: ValuationResultsData["marketPosition"] = {
    sold: soldPoints,
    subject: subjectPoint,
  };

  return {
    metrics: {
      daysOnMarket: domActive,
      avgMarketDom,
      activeLocal,
      sold90dLocal,
      marketDaysSupply,
      consumerInterest: "—",
      consumerInterestPercentile: "—",
    },
    mmr,
    retail,
    condition,
    comparables,
    comparablesNumFound,
    marketPosition,
  };
}
