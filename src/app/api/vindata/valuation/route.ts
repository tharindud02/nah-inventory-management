import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";
import { handleDemoMode } from "@/lib/demo-mode";

interface ValuationBody {
  vin?: string;
  miles?: number;
  zip?: string;
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

const FETCH_TIMEOUT_MS = 25_000;

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim().startsWith("{")) return null;
    return JSON.parse(text) as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

function getListingsCount(data: Record<string, unknown> | null): number {
  const listings = data?.listings;
  return Array.isArray(listings) ? listings.length : 0;
}

export async function POST(request: NextRequest) {
  const demoResponse = handleDemoMode(request, "/api/vindata/valuation");
  if (demoResponse) {
    return demoResponse;
  }

  const config = getMarketcheckConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, error: "MarketCheck API not configured" },
      { status: 503 },
    );
  }

  let body: ValuationBody = {};
  try {
    body = (await request.json()) as ValuationBody;
  } catch {
    // no-op
  }

  const vin = body.vin?.trim().toUpperCase();
  if (!vin || !VIN_PATTERN.test(vin)) {
    return NextResponse.json(
      { success: false, error: "Invalid VIN (must be 17 characters)" },
      { status: 400 },
    );
  }

  const miles = Number.isFinite(body.miles) ? Number(body.miles) : 15000;
  const zip = body.zip?.trim() || "90210";
  const state = "CA";

  const valuationUrl = new URL(
    `${config.baseUrl}/v2/predict/car/us/marketcheck_price`,
  );
  valuationUrl.searchParams.set("api_key", config.apiKey);
  valuationUrl.searchParams.set("vin", vin);
  valuationUrl.searchParams.set("miles", String(miles));
  valuationUrl.searchParams.set("zip", zip);
  valuationUrl.searchParams.set("dealer_type", "franchise");

  const neovinUrl = new URL(`${config.baseUrl}/v2/decode/car/neovin/${vin}/specs`);
  neovinUrl.searchParams.set("api_key", config.apiKey);
  neovinUrl.searchParams.set("include_generic", "true");

  const salesUrl = new URL(`${config.baseUrl}/v2/sales/car`);
  salesUrl.searchParams.set("api_key", config.apiKey);
  salesUrl.searchParams.set("vin", vin);
  salesUrl.searchParams.set("car_type", "used");

  const mdsUrl = new URL(`${config.baseUrl}/v2/mds/car`);
  mdsUrl.searchParams.set("api_key", config.apiKey);
  mdsUrl.searchParams.set("vin", vin);
  mdsUrl.searchParams.set("car_type", "used");
  mdsUrl.searchParams.set("zip", zip);
  mdsUrl.searchParams.set("radius", "100");

  const marketCompsUrl = new URL(`${config.baseUrl}/v2/search/car/active`);
  marketCompsUrl.searchParams.set("api_key", config.apiKey);
  marketCompsUrl.searchParams.set("vins", vin);
  marketCompsUrl.searchParams.set("match", "year,make,model,trim");
  marketCompsUrl.searchParams.set("rows", "25");
  marketCompsUrl.searchParams.set("zip", zip);
  marketCompsUrl.searchParams.set("radius", "100");

  const soldCompsUrl = new URL(`${config.baseUrl}/v2/search/car/recents`);
  soldCompsUrl.searchParams.set("api_key", config.apiKey);
  soldCompsUrl.searchParams.set("vins", vin);
  soldCompsUrl.searchParams.set("match", "year,make,model,trim");
  soldCompsUrl.searchParams.set("sold", "true");
  soldCompsUrl.searchParams.set("rows", "25");
  soldCompsUrl.searchParams.set("state", state);

  try {
    const [valuation, neovin, sales, mds, marketCompsPrimary, soldCompsPrimary] = await Promise.all([
      fetchJson(valuationUrl.toString()),
      fetchJson(neovinUrl.toString()),
      fetchJson(salesUrl.toString()),
      fetchJson(mdsUrl.toString()),
      fetchJson(marketCompsUrl.toString()),
      fetchJson(soldCompsUrl.toString()),
    ]);

    if (!valuation) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch valuation" },
        { status: 502 },
      );
    }

    let marketComps = marketCompsPrimary;
    let soldComps = soldCompsPrimary;

    const year = neovin?.year;
    const make = typeof neovin?.make === "string" ? neovin.make : undefined;
    const model = typeof neovin?.model === "string" ? neovin.model : undefined;
    const trim = typeof neovin?.trim === "string" ? neovin.trim : undefined;

    const canFallbackByTaxonomy =
      typeof year === "number" && Boolean(make) && Boolean(model);

    if (canFallbackByTaxonomy && getListingsCount(marketComps) === 0) {
      const fallbackActive = new URL(`${config.baseUrl}/v2/search/car/active`);
      fallbackActive.searchParams.set("api_key", config.apiKey);
      fallbackActive.searchParams.set("year", String(year));
      fallbackActive.searchParams.set("make", String(make));
      fallbackActive.searchParams.set("model", String(model));
      if (trim) fallbackActive.searchParams.set("trim", trim);
      fallbackActive.searchParams.set("rows", "25");
      fallbackActive.searchParams.set("zip", zip);
      fallbackActive.searchParams.set("radius", "100");
      marketComps = await fetchJson(fallbackActive.toString());
    }

    if (canFallbackByTaxonomy && getListingsCount(soldComps) === 0) {
      const fallbackRecents = new URL(`${config.baseUrl}/v2/search/car/recents`);
      fallbackRecents.searchParams.set("api_key", config.apiKey);
      fallbackRecents.searchParams.set("year", String(year));
      fallbackRecents.searchParams.set("make", String(make));
      fallbackRecents.searchParams.set("model", String(model));
      if (trim) fallbackRecents.searchParams.set("trim", trim);
      fallbackRecents.searchParams.set("sold", "true");
      fallbackRecents.searchParams.set("rows", "25");
      fallbackRecents.searchParams.set("state", state);
      soldComps = await fetchJson(fallbackRecents.toString());
    }

    const salesDom =
      typeof sales?.dom_stats === "object" && sales.dom_stats
        ? (sales.dom_stats as { median?: number }).median
        : undefined;
    const salesPrice =
      typeof sales?.price_stats === "object" && sales.price_stats
        ? (sales.price_stats as { median?: number }).median
        : undefined;
    const salesCount = typeof sales?.count === "number" ? sales.count : undefined;

    const marketStats = {
      average_price: typeof salesPrice === "number" ? salesPrice : undefined,
      average_days_on_market: typeof salesDom === "number" ? salesDom : undefined,
    };
    const soldMarketStats = {
      average_sale_price: typeof salesPrice === "number" ? salesPrice : undefined,
      average_days_on_market: typeof salesDom === "number" ? salesDom : undefined,
      total_sold: typeof salesCount === "number" ? salesCount : undefined,
    };

    return NextResponse.json({
      success: true,
      data: {
        valuation,
        marketComps: { ...(marketComps ?? {}), market_stats: marketStats },
        soldComps: { ...(soldComps ?? {}), market_stats: soldMarketStats },
        sales: sales ?? {},
        mds: mds ?? {},
        neovin: neovin ?? {},
      },
    });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const msg = isAbort
      ? "Valuation request timed out. Please try again."
      : err instanceof Error
        ? err.message
        : "Failed to fetch valuation";
    return NextResponse.json(
      { success: false, error: msg },
      { status: isAbort ? 504 : 500 },
    );
  }
}
