import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";

/** Proxies to MarketCheck Inferred Sales Stats API. */
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
  const state = searchParams.get("state");
  const carType = searchParams.get("car_type") ?? "used";

  if (!vin?.trim()) {
    return NextResponse.json(
      { error: "vin parameter required" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    api_key: config.apiKey,
    vin: vin.trim(),
    car_type: carType,
  });
  if (state) params.set("state", state);

  const url = `${config.baseUrl}/v2/sales/car?${params.toString()}`;

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
    const msg = err instanceof Error ? err.message : "Failed to fetch sales stats";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
