import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";
import { handleDemoMode } from "@/lib/demo-mode";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export async function GET(request: NextRequest) {
  const demoResponse = handleDemoMode(request, "/api/vindata/vin-decode");
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

  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin")?.trim().toUpperCase();

  if (!vin || !VIN_PATTERN.test(vin)) {
    return NextResponse.json(
      { success: false, error: "Invalid VIN (must be 17 characters)" },
      { status: 400 },
    );
  }

  const url = new URL(`${config.baseUrl}/v2/decode/car/neovin/${vin}/specs`);
  url.searchParams.set("api_key", config.apiKey);
  url.searchParams.set("include_generic", "true");
  url.searchParams.set("include_available_options", "true");

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    const text = await res.text();
    const json = text.trim().startsWith("{")
      ? (JSON.parse(text) as Record<string, unknown>)
      : null;

    if (!res.ok || !json) {
      return NextResponse.json(
        {
          success: false,
          error: (json?.error as string) || text || `NeoVIN error: ${res.status}`,
        },
        { status: res.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...json, is_valid: true },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to decode VIN";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
