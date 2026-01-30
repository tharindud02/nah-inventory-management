import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import { apiCache, CACHE_TTL } from "@/lib/api-cache";
import type {
  VehicleSpecs,
  VehicleOption,
  VehicleSpecsSections,
  VehicleFeature,
  SafetyRating,
  WarrantyInfo,
  VehicleDimensions,
  VehicleColor,
  VehicleEquipmentItem,
} from "@/types/vehicle-specs";

const MARKETCHECK_API_KEY =
  process.env.MARKETCHECK_API_KEY || "zeAJMagqPVoNjv9iHBdj51d2Rzr6MMhs";
const MARKETCHECK_BASE_URL =
  process.env.MARKETCHECK_BASE_URL || "https://api.marketcheck.com";

// Extract color string from NeoVIN color object
const extractColorName = (colorData: unknown): string => {
  if (!colorData) return "";
  if (typeof colorData === "string") return colorData;
  if (typeof colorData === "object" && colorData !== null) {
    const c = colorData as Record<string, unknown>;
    return String(c.name || c.base || c.code || "");
  }
  return "";
};

// Extract color details object
const extractColorDetails = (colorData: unknown): VehicleColor | undefined => {
  if (!colorData || typeof colorData !== "object") return undefined;
  const c = colorData as Record<string, unknown>;
  return {
    code: c.code as string | undefined,
    name: c.name as string | undefined,
    base: c.base as string | undefined,
    msrp: c.msrp as string | number | undefined,
  };
};

// Extract features by category from NeoVIN features object
const extractFeaturesByCategory = (
  features: Record<string, VehicleFeature[]> | undefined,
  categories: string[],
): string[] => {
  if (!features) return [];
  const results: string[] = [];

  Object.values(features).forEach((featureList) => {
    if (Array.isArray(featureList)) {
      featureList.forEach((f) => {
        if (
          categories.some((cat) =>
            f.category?.toLowerCase().includes(cat.toLowerCase()),
          )
        ) {
          if (f.description) results.push(f.description);
        }
      });
    }
  });

  return [...new Set(results)];
};

// Build sections from NeoVIN features object
const buildSectionsFromFeatures = (
  payload: any,
  specs: Partial<VehicleSpecs>,
): VehicleSpecsSections => {
  const features = payload?.features as
    | Record<string, VehicleFeature[]>
    | undefined;

  const mechanical = extractFeaturesByCategory(features, [
    "Engine",
    "Transmission",
    "Suspension",
  ]);
  const interior = extractFeaturesByCategory(features, [
    "Interior",
    "Comfort & Convenience",
  ]);
  const exterior = extractFeaturesByCategory(features, ["Exterior"]);
  const safety = extractFeaturesByCategory(features, [
    "Safety & Driver Assist",
  ]);
  const entertainment = extractFeaturesByCategory(features, ["Infotainment"]);

  // Add fallback values if sections are empty
  return {
    mechanical: mechanical.length
      ? mechanical.slice(0, 10)
      : ([specs.engine, specs.transmission, specs.drivetrain].filter(
          Boolean,
        ) as string[]),
    interior: interior.length
      ? interior.slice(0, 10)
      : specs.interiorColor
        ? [`Interior: ${specs.interiorColor}`]
        : [],
    exterior: exterior.length
      ? exterior.slice(0, 10)
      : ([
          specs.exteriorColor ? `Exterior: ${specs.exteriorColor}` : "",
          specs.bodyType,
        ].filter(Boolean) as string[]),
    safety: safety.slice(0, 10),
    entertainment: entertainment.slice(0, 10),
  };
};

// Normalize installed options from NeoVIN installed_options_details
const normalizeInstalledOptions = (optionsData: any): VehicleOption[] => {
  if (!optionsData || !Array.isArray(optionsData)) return [];

  return optionsData.map((opt) => ({
    code: opt?.code || "",
    name: opt?.name || opt?.description || "",
    description: opt?.description,
    category: opt?.category,
    price: opt?.msrp
      ? typeof opt.msrp === "number"
        ? opt.msrp
        : Number(opt.msrp) || null
      : null,
    msrp: opt?.msrp,
    type: opt?.type,
    confidence: opt?.confidence,
  }));
};

const normalizeInstalledEquipment = (
  equipmentData: any,
): Record<string, VehicleEquipmentItem[]> | undefined => {
  if (!equipmentData || typeof equipmentData !== "object") return undefined;

  const normalizedEntries = Object.entries(equipmentData).reduce(
    (acc, [packageCode, entries]) => {
      if (Array.isArray(entries)) {
        acc[packageCode] = entries.map((item) => ({
          category: item?.category,
          item: item?.item,
          attribute: item?.attribute,
          location: item?.location,
          value: item?.value,
        }));
      }
      return acc;
    },
    {} as Record<string, VehicleEquipmentItem[]>,
  );

  return Object.keys(normalizedEntries).length ? normalizedEntries : undefined;
};

// Extract safety rating from NeoVIN rating object
const extractSafetyRating = (rating: any): SafetyRating | undefined => {
  if (!rating) return undefined;
  return {
    front: rating?.safety?.front,
    side: rating?.safety?.side,
    overall: rating?.safety?.overall,
    rollover: rating?.rollover,
    roofStrength: rating?.roof_strength,
  };
};

// Extract warranty from NeoVIN warranty object
const extractWarranty = (warranty: any): WarrantyInfo | undefined => {
  if (!warranty) return undefined;
  return {
    total: warranty?.total,
    powertrain: warranty?.powertrain,
    antiCorrosion: warranty?.anti_corrosion,
    roadsideAssistance: warranty?.roadside_assistance,
  };
};

// Build VehicleSpecs from NeoVIN API response
const buildVehicleSpecs = (payload: any, vin?: string): VehicleSpecs => {
  const exteriorColorName = extractColorName(payload?.exterior_color);
  const interiorColorName = extractColorName(payload?.interior_color);

  const installedOptionsDetails = normalizeInstalledOptions(
    payload?.installed_options_details,
  );

  const normalized: Partial<VehicleSpecs> = {
    vin: vin || payload?.vin,
    year: payload?.year ?? null,
    make: payload?.make || "",
    model: payload?.model || "",
    trim: payload?.trim || "",
    version: payload?.version || "",
    subTrim: payload?.sub_trim || "",
    engine: payload?.engine || "",
    transmission: payload?.transmission || "",
    transmissionDescription: payload?.transmission_description || "",
    drivetrain: payload?.drivetrain || "",
    powertrainType: payload?.powertrain_type || "",
    fuelType: payload?.fuel_type || "",
    bodyType: payload?.body_type || "",
    bodySubtype: payload?.body_subtype || "",
    vehicleType: payload?.vehicle_type || "",
    exteriorColor: exteriorColorName,
    interiorColor: interiorColorName,
    exteriorColorDetails: extractColorDetails(payload?.exterior_color),
    interiorColorDetails: extractColorDetails(payload?.interior_color),
    mpg: {
      city: payload?.city_mpg ?? null,
      highway: payload?.highway_mpg ?? null,
      combined: payload?.combined_mpg ?? null,
    },
    msrp: payload?.msrp ?? null,
    installedOptionsMsrp: payload?.installed_options_msrp ?? null,
    installedOptionsDetails,
    installedOptions: installedOptionsDetails,
    installedEquipment: normalizeInstalledEquipment(
      payload?.installed_equipment,
    ),
    destinationCharge: payload?.delivery_charges ?? null,
    totalMsrp: payload?.combined_msrp ?? payload?.msrp ?? null,
    features: payload?.features,
    highValueFeatures: payload?.high_value_features,
    rating: extractSafetyRating(payload?.rating),
    warranty: extractWarranty(payload?.warranty),
    dimensions: {
      weight: payload?.weight,
      width: payload?.width,
      height: payload?.height,
      length: payload?.length,
      doors: payload?.doors,
      seatingCapacity: payload?.seating_capacity,
    },
    manufacturerCode: payload?.manufacturer_code,
    packageCode: payload?.package_code,
  };

  const sections = buildSectionsFromFeatures(payload, normalized);

  return {
    ...normalized,
    sections,
    installedOptions: normalized.installedOptions ?? [],
    source: payload?.source || "marketcheck",
  } as VehicleSpecs;
};

const buildVehicleSpecsFromListing = (
  listing: any,
  vin?: string,
): VehicleSpecs => {
  const payload = {
    vin: vin ?? listing?.vin,
    year: listing?.year,
    make: listing?.make,
    model: listing?.model,
    trim: listing?.trim || listing?.series,
    sub_trim: listing?.sub_trim || listing?.sub_series,
    engine: listing?.engine || listing?.engine_description,
    transmission: listing?.transmission || listing?.transmission_description,
    drivetrain: listing?.drivetrain || listing?.drive_type,
    body_type: listing?.body_type || listing?.body_style,
    exterior_color: listing?.exterior_color || listing?.color,
    interior_color: listing?.interior_color || listing?.interior,
    options: listing?.options,
    destination_charge: listing?.destination_charge,
    total_msrp: listing?.msrp || listing?.price,
    mpg_city: listing?.city_mpg,
    mpg_highway: listing?.highway_mpg,
    source: "marketcheck-search",
  };

  return buildVehicleSpecs(payload, vin ?? listing?.vin);
};

const cacheAndRespond = (
  cacheKey: Record<string, unknown>,
  data: VehicleSpecs,
  source: string,
) => {
  apiCache.set("vehicle-specs", cacheKey, data, CACHE_TTL.VIN_REPORT);
  return NextResponse.json({
    success: true,
    data,
    source,
  });
};

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/cars/vehicle-specs/neovin");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const body = await request.json();
    const { vin, year, make, model, trim } = body ?? {};

    if (!vin && !(year && make && model)) {
      return NextResponse.json(
        {
          error: "VIN or year/make/model is required",
        },
        { status: 400 },
      );
    }

    if (vin) {
      if (typeof vin !== "string" || vin.length !== 17) {
        return NextResponse.json(
          { error: "Valid 17-digit VIN is required" },
          { status: 400 },
        );
      }

      const cacheKey = { vin };
      const cachedData = apiCache.get<VehicleSpecs>("vehicle-specs", cacheKey);
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          source: "cache",
        });
      }

      const response = await fetch(
        `${MARKETCHECK_BASE_URL}/v2/decode/car/neovin/${vin}/specs?api_key=${MARKETCHECK_API_KEY}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("NeoVIN specs error:", response.status, errorText);

        // Try fallback search endpoint
        const fallback = await fetch(
          `${MARKETCHECK_BASE_URL}/v2/search/car/active?api_key=${MARKETCHECK_API_KEY}&vin=${vin}&rows=1`,
        );

        if (!fallback.ok) {
          return NextResponse.json(
            {
              error: `Failed to fetch specs for VIN (${response.status})`,
              details: errorText,
            },
            { status: response.status },
          );
        }

        const fallbackData = await fallback.json();
        if (!fallbackData.listings?.length) {
          return NextResponse.json(
            { error: "No vehicle found for this VIN" },
            { status: 404 },
          );
        }

        const vehicleSpecs = buildVehicleSpecsFromListing(
          fallbackData.listings[0],
          vin,
        );
        return cacheAndRespond(
          cacheKey,
          vehicleSpecs,
          "marketcheck-search-fallback",
        );
      }

      const data = await response.json();
      const vehicleSpecs = buildVehicleSpecs(
        { ...data, source: "marketcheck" },
        vin,
      );
      return cacheAndRespond(cacheKey, vehicleSpecs, "marketcheck");
    }

    // Non-VIN lookup fallback using Y/M/M(/Trim)
    const cacheKey = {
      year,
      make: String(make).toLowerCase(),
      model: String(model).toLowerCase(),
      trim: trim ? String(trim).toLowerCase() : undefined,
    };

    const cachedData = apiCache.get<VehicleSpecs>("vehicle-specs", cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        source: "cache",
      });
    }

    const params = new URLSearchParams({
      year: String(year),
      make: String(make).toLowerCase(),
      model: String(model).toLowerCase(),
      rows: "1",
    });
    if (trim) {
      params.set("trim", String(trim).toLowerCase());
    }

    const response = await fetch(
      `${MARKETCHECK_BASE_URL}/v2/search/car/active?api_key=${MARKETCHECK_API_KEY}&${params.toString()}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vehicle specs search error:", response.status, errorText);
      return NextResponse.json(
        {
          error: `Failed to search vehicle specs: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    if (!data.listings?.length) {
      return NextResponse.json(
        { error: "No vehicle found with specified criteria" },
        { status: 404 },
      );
    }

    const vehicleSpecs = buildVehicleSpecsFromListing(data.listings[0]);
    return cacheAndRespond(cacheKey, vehicleSpecs, "marketcheck-search");
  } catch (error) {
    console.error("Error fetching NeoVIN specs:", error);
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
  const vin = searchParams.get("vin");
  const year = searchParams.get("year");
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const trim = searchParams.get("trim");

  const mockRequest = new NextRequest(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vin,
      year: year ? Number(year) : undefined,
      make,
      model,
      trim,
    }),
  });

  return POST(mockRequest);
}
