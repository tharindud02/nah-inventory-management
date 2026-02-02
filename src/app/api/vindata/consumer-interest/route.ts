import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import { apiCache, CACHE_TTL } from "@/lib/api-cache";

const NEXT_PUBLIC_MARKETCHECK_API_KEY =
  process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY ||
  "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const NEXT_PUBLIC_MARKETCHECK_BASE_URL =
  process.env.NEXT_PUBLIC_MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(
    request,
    "/api/vindata/consumer-interest",
  );
  if (demoResponse) {
    return demoResponse;
  }
  // API temporarily disabled
  return NextResponse.json(
    {
      error: "Consumer Interest API is temporarily disabled",
      message: "This service is currently unavailable",
    },
    { status: 503 },
  );

  try {
    const { year, make, model } = await request.json();

    if (!year || !make || !model) {
      return NextResponse.json(
        { error: "Year, make, and model are required" },
        { status: 400 },
      );
    }

    // Check cache first
    const cacheKey = { year, make, model };
    const cachedData = apiCache.get("consumer-interest", cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
      });
    }

    const response = await fetch(
      `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/popular/cars?api_key=${NEXT_PUBLIC_MARKETCHECK_API_KEY}&year=${year}&make=${make}&model=${model}&car_type=used`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      let errorMessage = `Failed to get consumer interest: ${response.status}`;
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
      "consumer-interest",
      cacheKey,
      data,
      CACHE_TTL.CONSUMER_INTEREST,
    );

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
