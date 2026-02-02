import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";

const NEXT_PUBLIC_MARKETCHECK_API_KEY =
  process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY ||
  "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const NEXT_PUBLIC_MARKETCHECK_BASE_URL =
  process.env.NEXT_PUBLIC_MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/vindata/access-report");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 },
      );
    }

    if (typeof reportId !== "string") {
      return NextResponse.json(
        { error: "Report ID must be a string" },
        { status: 400 },
      );
    }

    console.log(`Accessing VIN report with ID: ${reportId}`);

    const response = await fetch(
      `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/vindata/access-report/${reportId}?api_key=${NEXT_PUBLIC_MARKETCHECK_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MarketCheck API error:", response.status, errorText);

      let errorMessage = `Failed to access VIN report: ${response.status}`;
      let errorDetails = errorText;

      // Try to parse error as JSON for more detailed error messages
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

    console.log("VIN report accessed successfully:", {
      reportId,
      status: data.status,
      hasData: !!data.data,
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error accessing VIN report:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId");

  if (!reportId) {
    return NextResponse.json(
      { error: "Report ID is required as query parameter" },
      { status: 400 },
    );
  }

  try {
    if (typeof reportId !== "string") {
      return NextResponse.json(
        { error: "Report ID must be a string" },
        { status: 400 },
      );
    }

    console.log(`Accessing VIN report with ID: ${reportId}`);

    const response = await fetch(
      `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/vindata/access-report/${reportId}?api_key=${NEXT_PUBLIC_MARKETCHECK_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MarketCheck API error:", response.status, errorText);

      let errorMessage = `Failed to access VIN report: ${response.status}`;
      let errorDetails = errorText;

      // Try to parse error as JSON for more detailed error messages
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

    console.log("VIN report accessed successfully:", {
      reportId,
      status: data.status,
      hasData: !!data.data,
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error accessing VIN report:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
