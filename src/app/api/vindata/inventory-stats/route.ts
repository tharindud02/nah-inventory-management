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
  const demoResponse = handleDemoMode(request, "/api/vindata/inventory-stats");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const { vin, zip, radius, state } = await request.json();

    if (!vin) {
      return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    }

    const defaultZip = zip || "90210"; // Default to Beverly Hills
    const defaultRadius = radius || "50"; // Default to 50 miles
    const defaultState = state || "CA"; // Default to California

    // Check cache first
    const cacheKey = {
      vin,
      zip: defaultZip,
      radius: defaultRadius,
      state: defaultState,
    };
    const cachedData = apiCache.get("inventory-stats", cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
      });
    }

    // Get average days to sell
    const avgDaysResponse = await fetch(
      `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/search/car/recents?api_key=${NEXT_PUBLIC_MARKETCHECK_API_KEY}&vins=${vin}&match=year,make,model,trim&sold=true&stats=dom_active&rows=0&state=${defaultState}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Get sold count (90 days)
    const sold90Response = await fetch(
      `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/search/car/recents?api_key=${NEXT_PUBLIC_MARKETCHECK_API_KEY}&vins=${vin}&match=year,make,model,trim&sold=true&last_seen_days=90-*&rows=0&state=${defaultState}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Get active local inventory
    const activeLocalResponse = await fetch(
      `${NEXT_PUBLIC_MARKETCHECK_BASE_URL}/v2/search/car/active?api_key=${NEXT_PUBLIC_MARKETCHECK_API_KEY}&vins=${vin}&match=year,make,model,trim&zip=${defaultZip}&radius=${defaultRadius}&rows=0`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const results = {
      avg_days_to_sell: null,
      sold_90d: null,
      active_local: null,
      errors: [],
    };

    // Process average days to sell
    if (avgDaysResponse.ok) {
      const avgDaysData = await avgDaysResponse.json();
      results.avg_days_to_sell = avgDaysData.stats?.dom_active || null;
    } else {
      const errorText = await avgDaysResponse.text();
      results.errors.push({ type: "avg_days_to_sell", error: errorText });
    }

    // Process sold count (90 days)
    if (sold90Response.ok) {
      const sold90Data = await sold90Response.json();
      results.sold_90d = sold90Data.num_found || 0;
    } else {
      const errorText = await sold90Response.text();
      results.errors.push({ type: "sold_90d", error: errorText });
    }

    // Process active local inventory
    if (activeLocalResponse.ok) {
      const activeLocalData = await activeLocalResponse.json();
      results.active_local = activeLocalData.num_found || 0;
    } else {
      const errorText = await activeLocalResponse.text();
      results.errors.push({ type: "active_local", error: errorText });
    }

    // Cache the successful response
    apiCache.set(
      "inventory-stats",
      cacheKey,
      results,
      CACHE_TTL.INVENTORY_STATS,
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error getting inventory stats:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
