import { NextRequest, NextResponse } from "next/server";
import { apiCache, CACHE_TTL } from "@/lib/api-cache";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  try {
    const { vin } = await request.json();

    if (!vin) {
      return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    }

    if (typeof vin !== "string" || vin.length !== 17) {
      return NextResponse.json(
        { error: "Valid 17-digit VIN is required" },
        { status: 400 },
      );
    }

    // Check cache first
    const cacheKey = { vin };
    const cachedData = apiCache.get("vin-report", cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        reportId: cachedData.report_id || null,
        hasDirectData: !!cachedData.data || !!cachedData.summary,
        endpoint: "cache",
      });
    }

    const response = await fetch(
      `${MARKETCHECK_BASE_URL}/v2/vindata/generate-report/aamva/${vin}?api_key=${MARKETCHECK_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      // Try access-report as fallback
      const fallbackResponse = await fetch(
        `${MARKETCHECK_BASE_URL}/v2/vindata/access-report/aamva/${vin}?api_key=${MARKETCHECK_API_KEY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        console.error(
          "MarketCheck API error:",
          fallbackResponse.status,
          errorText,
        );

        let errorMessage = `Failed to generate VIN report: ${fallbackResponse.status}`;
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
            status: fallbackResponse.status,
          },
          { status: fallbackResponse.status },
        );
      }

      const data = await fallbackResponse.json();

      // Cache the successful fallback response
      apiCache.set("vin-report", cacheKey, data, CACHE_TTL.VIN_REPORT);

      return NextResponse.json({
        success: true,
        data: data,
        reportId: data.report_id || null,
        hasDirectData: !!data.data || !!data.summary,
        endpoint: "access-report (fallback)",
      });
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set("vin-report", cacheKey, data, CACHE_TTL.VIN_REPORT);

    // If the response contains a report_id, return it for separate access
    // If it contains data directly, return that data
    return NextResponse.json({
      success: true,
      data: data,
      reportId: data.report_id || null,
      hasDirectData: !!data.data || !!data.summary,
      endpoint: "generate-report",
    });
  } catch (error) {
    console.error("Error generating VIN report:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
