import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/valuation");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const apiKey =
      request.headers.get("x-marketcheck-api-key") || MARKETCHECK_API_KEY;

    const body = await request.json();
    const { vin, miles, zip } = body;

    if (!vin) {
      return NextResponse.json(
        { success: false, error: "VIN is required" },
        { status: 400 },
      );
    }

    // MarketCheck Valuation API (updated to v2) - requires additional parameters
    const valuationUrl = `${MARKETCHECK_BASE_URL}/v2/predict/car/us/marketcheck_price?api_key=${apiKey}&vin=${encodeURIComponent(vin)}${miles ? `&miles=${miles}` : "&miles=15000"}${zip ? `&zip=${zip}` : "&zip=90210"}&dealer_type=franchise`;

    const res = await fetch(valuationUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `Valuation request failed: ${res.status}`,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
