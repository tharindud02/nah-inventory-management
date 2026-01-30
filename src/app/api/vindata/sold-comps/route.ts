import { NextRequest, NextResponse } from "next/server";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-marketcheck-api-key") || MARKETCHECK_API_KEY;

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

    const url = `${MARKETCHECK_BASE_URL}/v1/sold_inventory?api_key=${apiKey}&car_type=used&sort_by=price&sort_order=desc&rows=30&${new URLSearchParams({
      q: query,
    })}`;

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
