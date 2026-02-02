import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";

const NEXT_PUBLIC_MARKETCHECK_API_KEY =
  process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY ||
  "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const NEXT_PUBLIC_MARKETCHECK_BASE_URL =
  process.env.NEXT_PUBLIC_MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/demand-score");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const apiKey =
      request.headers.get("x-marketcheck-api-key") ||
      NEXT_PUBLIC_MARKETCHECK_API_KEY;

    const body = await request.json();
    const { vin, year, make, model } = body;

    if (!vin && (!year || !make || !model)) {
      return NextResponse.json(
        { success: false, error: "VIN or year/make/model is required" },
        { status: 400 },
      );
    }

    // MarketCheck Market Days Supply API for demand signal
    const query = vin
      ? `vin:${vin}`
      : `year:${year} make:${make} model:${model}`;

    // MarketCheck Demand Score API - updated to v2 with correct endpoint (MDS = Market Days Supply)
    const url = `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/mds/car?api_key=${apiKey}&vin=${encodeURIComponent(vin)}&exact=true`;

    console.log(`Fetching market days supply for: ${query}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Demand score API error ${res.status}: ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: `Demand score request failed: ${res.status}`,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    console.log("Demand score fetched successfully");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in demand score route:", error);
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
