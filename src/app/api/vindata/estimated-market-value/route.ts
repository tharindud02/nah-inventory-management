import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import { apiCache, CACHE_TTL } from "@/lib/api-cache";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/estimated-market-value");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const { vin, miles, zip } = await request.json();

    if (!vin) {
      return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    }

    const odometer = miles || 50000; // Default to 50000 if not provided
    const defaultZip = zip || "90210"; // Default to Beverly Hills

    // Check cache first
    const cacheKey = { vin, miles: odometer, zip: defaultZip };
    const cachedData = apiCache.get("market-value", cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
      });
    }

    const response = await fetch(
      `${MARKETCHECK_BASE_URL}/v2/predict/car/us/marketcheck_price?api_key=${MARKETCHECK_API_KEY}&vin=${vin}&miles=${odometer}&zip=${defaultZip}&dealer_type=franchise`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MarketCheck Price API error:", response.status, errorText);

      let errorMessage = `Failed to get estimated market value: ${response.status}`;
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
    apiCache.set("market-value", cacheKey, data, CACHE_TTL.MARKET_VALUE);

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error getting estimated market value:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
