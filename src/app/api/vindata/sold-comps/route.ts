import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/sold-comps");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const apiKey =
      request.headers.get("x-marketcheck-api-key") || MARKETCHECK_API_KEY;

    const body = await request.json();
    const { vin, year, make, model, zip, state, city } = body;

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

    // MarketCheck Sold Comps API - updated to v2 with correct endpoint
    // Add location parameter (required by API)
    const baseUrl = `${MARKETCHECK_BASE_URL}/v2/search/car/recents?api_key=${apiKey}&sold=true&rows=20`;

    let url;
    if (vin) {
      url = `${baseUrl}&vin=${encodeURIComponent(vin)}`;
      // Add location parameter for VIN-based searches
      if (zip) url += `&zip=${zip}`;
      else if (state) url += `&state=${state}`;
      else if (city) url += `&city=${city}`;
      else url += `&state=CA`; // Default to California
    } else {
      url = `${baseUrl}&year=${year}&make=${make}&model=${model}`;
      if (zip) url += `&zip=${zip}`;
      else if (state) url += `&state=${state}`;
      else if (city) url += `&city=${city}`;
      else url += `&state=CA`; // Default to California
    }

    console.log(`Fetching sold comps for: ${query}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Sold comps API error ${res.status}: ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: `Sold comps request failed: ${res.status}`,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    console.log("Sold comps fetched successfully");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in sold comps route:", error);
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
