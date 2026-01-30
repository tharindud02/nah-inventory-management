import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/mmr");
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

    // MarketCheck MMR (wholesale) API - updated to v2 with correct endpoint
    const url = `${MARKETCHECK_BASE_URL}/v2/predict/car/us/marketcheck_price?api_key=${apiKey}&vin=${encodeURIComponent(vin)}${miles ? `&miles=${miles}` : "&miles=15000"}${zip ? `&zip=${zip}` : "&zip=90210"}&dealer_type=independent&is_certified=false`;

    console.log(`Fetching MMR for VIN: ${vin}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`MMR API error ${res.status}: ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: `MMR request failed: ${res.status}`,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    console.log("MMR fetched successfully");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in MMR route:", error);
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
