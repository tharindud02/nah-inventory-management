import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";

const MARKETCHECK_API_BASE = "https://api.marketcheck.com/v2";

/** Returns raw MarketCheck API response for debugging. */
export async function GET(request: NextRequest) {
  const config = getMarketcheckConfig();
  if (!config) {
    return NextResponse.json(
      { error: "MarketCheck API not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const start = Number(searchParams.get("start") ?? 0);
  const rows = Number(searchParams.get("rows") ?? 20);

  const url = `${MARKETCHECK_API_BASE}/dealerships/inventory?api_key=${config.apiKey}&dealer_id=${config.dealerId}`;

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
    const msg = err instanceof Error ? err.message : "Failed to fetch inventory";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
