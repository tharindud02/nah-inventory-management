import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import { apiCache, CACHE_TTL } from "@/lib/api-cache";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/market-days-supply");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const { vin } = await request.json();

    if (!vin) {
      return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = { vin };
    const cachedData = apiCache.get("market-days-supply", cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
      });
    }

    const response = await fetch(
      `${MARKETCHECK_BASE_URL}/v2/mds/car?api_key=${MARKETCHECK_API_KEY}&vin=${vin}&exact=true&debug=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MarketCheck MDS API error:", response.status, errorText);

      let errorMessage = `Failed to get market days supply: ${response.status}`;
      let errorDetails = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
        if (errorJson.details) {
          errorDetails = errorJson.details;
        }
      } catch (parseError) {
        // If parsing fails, use the raw error text
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set(
      "market-days-supply",
      cacheKey,
      data,
      CACHE_TTL.MARKET_DAYS_SUPPLY,
    );

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error getting market days supply:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
