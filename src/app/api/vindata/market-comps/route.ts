import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import { headers } from "next/headers";

const NEXT_PUBLIC_MARKETCHECK_API_KEY =
  process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY ||
  "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const NEXT_PUBLIC_MARKETCHECK_BASE_URL =
  process.env.NEXT_PUBLIC_MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/market-comps");
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

    // Build query: prefer VIN, otherwise year/make/model
    const query = vin
      ? `vin:${vin}`
      : `year:${year} make:${make} model:${model}`;

    const url = `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/search/car/active?api_key=${apiKey}&car_type=used&sort_by=price&sort_order=desc&rows=20&${new URLSearchParams(
      {
        q: query,
      },
    )}`;

    console.log(`Fetching market comps for: ${query}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Market comps API error ${res.status}: ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: `Market comps request failed: ${res.status}`,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    console.log("Market comps fetched successfully");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in market comps route:", error);
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
