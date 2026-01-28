import { NextRequest, NextResponse } from "next/server";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    if (!vin) {
      return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    }

    if (typeof vin !== "string" || vin.length !== 17) {
      return NextResponse.json(
        { error: "Valid 17-digit VIN is required" },
        { status: 400 },
      );
    }

    console.log(`Accessing AAMVA report for VIN: ${vin}`);

    // Try the access-report endpoint first
    let response = await fetch(
      `${MARKETCHECK_BASE_URL}/v2/vindata/access-report/aamva/${vin}?api_key=${MARKETCHECK_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    let isFallback = false;
    
    // If access-report fails, try generate-report as fallback
    if (!response.ok) {
      console.log(`Access-report failed, trying generate-report fallback for VIN: ${vin}`);
      isFallback = true;
      
      response = await fetch(
        `${MARKETCHECK_BASE_URL}/v2/vindata/generate-report/aamva/${vin}?api_key=${MARKETCHECK_API_KEY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MarketCheck API error:", response.status, errorText);

      let errorMessage = `Failed to access AAMVA report: ${response.status}`;
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

    console.log(`AAMVA report accessed successfully:`, {
      vin,
      endpoint: isFallback ? "generate-report (fallback)" : "access-report",
      hasReportId: !!data.report_id,
      hasData: !!data.data || !!data.summary,
    });

    return NextResponse.json({
      success: true,
      data: data,
      reportId: data.report_id || null,
      hasDirectData: !!data.data || !!data.summary,
      endpoint: isFallback ? "generate-report" : "access-report",
    });
  } catch (error) {
    console.error("Error accessing AAMVA report:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
