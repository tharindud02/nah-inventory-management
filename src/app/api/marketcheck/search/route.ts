import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";

/** Proxies to MarketCheck Inventory Search API. Returns num_found for similar vehicles. */
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
  const radius = searchParams.get("radius") ?? "50";

  if (!vin?.trim()) {
    return NextResponse.json(
      { error: "vin parameter required" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    api_key: config.apiKey,
    vins: vin.trim(),
    match: "year,make,model,trim",
    rows: "0",
  });
  if (zip) {
    params.set("zip", zip);
    params.set("radius", radius);
  }

  const url = `${config.baseUrl}/v2/search/car/active?${params.toString()}`;

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
    const msg = err instanceof Error ? err.message : "Failed to fetch search";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
