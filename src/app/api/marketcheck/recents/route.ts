import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";

/**
 * Proxies to MarketCheck Past Inventory Search API.
 * Returns sold listings for similar vehicles (past 90 days).
 * Requires at least one of: zip, state.
 */
export async function GET(request: NextRequest) {
  const config = getMarketcheckConfig();
  if (!config) {
    return NextResponse.json(
      { error: "MarketCheck API not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");
  const zip = searchParams.get("zip");
  const state = searchParams.get("state");
  const radius = searchParams.get("radius") ?? "50";
  const rows = searchParams.get("rows") ?? "5";
  const start = searchParams.get("start") ?? "0";

  if (!vin?.trim()) {
    return NextResponse.json(
      { error: "vin parameter required" },
      { status: 400 },
    );
  }

  if (!zip?.trim() && !state?.trim()) {
    return NextResponse.json(
      { error: "zip or state parameter required for Past Inventory Search" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    api_key: config.apiKey,
    vins: vin.trim(),
    match: "year,make,model,trim",
    sold: "true",
    rows,
    start,
  });

  if (zip?.trim()) {
    params.set("zip", zip.trim());
    params.set("radius", radius);
  }
  if (state?.trim()) {
    params.set("state", state.trim());
  }

  const url = `${config.baseUrl}/v2/search/car/recents?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || `MarketCheck error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch past inventory";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
