import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const apiKey = headersList.get("x-marketcheck-api-key") || MARKETCHECK_API_KEY;

    const body = await request.json();
    const { vin } = body;

    if (!vin) {
      return NextResponse.json(
        { success: false, error: "VIN is required" },
        { status: 400 },
      );
    }

    const url = `${MARKETCHECK_BASE_URL}/v2/vindata/access-report/aamva/${encodeURIComponent(vin)}`;
    console.log(`Fetching AAMVA access report for VIN: ${vin}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: apiKey,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `AAMVA access report API error ${res.status}: ${errorText}`,
      );
      return NextResponse.json(
        {
          success: false,
          error: `AAMVA access report request failed: ${res.status}`,
          details: errorText,
        },
        { status: res.status },
      );
    }

    const data = await res.json();
    console.log("AAMVA access report fetched successfully");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in AAMVA access report route:", error);
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
