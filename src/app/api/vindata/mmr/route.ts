import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import { apiCache, CACHE_TTL } from "@/lib/api-cache";

const MANHEIM_API_KEY = process.env.MANHEIM_API_KEY;
const MANHEIM_BASE_URL =
  process.env.MANHEIM_BASE_URL ||
  "https://api.manheim.com/marketplace/valuations/v1/valuations";

export async function POST(request: NextRequest) {
  const demoResponse = handleDemoMode(request, "/api/vindata/mmr");
  if (demoResponse) {
    return demoResponse;
  }

  try {
    const body = await request.json();
    const {
      vin,
      year,
      make,
      model,
      trim,
      odometer,
      conditionGrade,
      region,
      lane,
      exteriorColor,
      interiorColor,
    } = body;

    if (!vin && !(year && make && model)) {
      return NextResponse.json(
        {
          success: false,
          error: "VIN or Year/Make/Model is required",
        },
        { status: 400 },
      );
    }

    if (!MANHEIM_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Manheim API key is not configured",
        },
        { status: 500 },
      );
    }

    const payload = {
      subject: vin
        ? {
            identifierType: "VIN",
            identifierValue: vin,
          }
        : {
            identifierType: "YMMT",
            identifierValue: `${year}|${make}|${model}|${trim || ""}`,
          },
      odometer: odometer ? { value: Number(odometer) } : undefined,
      conditionGrade,
      exteriorColor,
      interiorColor,
      lane,
      region,
    };

    const cacheKey = {
      ...payload,
      subject: payload.subject.identifierValue,
    };
    const cached = apiCache.get("manheim-mmr", cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    console.log("Calling Manheim MMR API", payload.subject);

    const response = await fetch(MANHEIM_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${MANHEIM_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Manheim API error", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Manheim request failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const raw = await response.json();

    const normalized = normalizeManheimResponse(raw);

    apiCache.set("manheim-mmr", cacheKey, normalized, CACHE_TTL.MARKET_VALUE);

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("Error in Manheim MMR route", error);
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

function normalizeManheimResponse(raw: any) {
  if (!raw) return null;

  const valuation = raw?.valuations?.[0] || raw;
  const wholesale = valuation?.valuationDetails || {};

  return {
    base_mmr: wholesale?.baseMMR ?? wholesale?.base?.value ?? null,
    adjusted_mmr: wholesale?.adjustedMMR ?? wholesale?.adjusted?.value ?? null,
    avg_odo:
      wholesale?.comparableStats?.averageOdometer ??
      wholesale?.adjustments?.odometer?.baseline ??
      null,
    avg_condition: wholesale?.comparableStats?.averageCondition ?? null,
    adjustments:
      wholesale?.adjustments?.valuationAdjustments?.map((adjustment: any) => ({
        label: adjustment?.type || adjustment?.name || "Adjustment",
        value: adjustment?.amount?.value ?? adjustment?.value ?? 0,
      })) || [],
    metadata: {
      currency: wholesale?.currency || "USD",
      sourceTimestamp: valuation?.valuationDate || raw?.generatedDate,
      vin: valuation?.subject?.vin || raw?.vin,
    },
    raw,
  };
}
