import "server-only";

import { getManheimAccessToken } from "@/lib/manheim-auth";

const DEFAULT_MANHEIM_BASE_URL = "https://sandbox.api.coxautoinc.com";
const DEFAULT_INCLUDE = "ci,retail,forecast";

interface ManheimPricingBand {
  above?: number;
  average?: number;
  below?: number;
}

interface ManheimAdjustedBy {
  Odometer?: string;
  Region?: string;
  Grade?: string;
  Color?: string;
  EVBH?: string;
  buildOptions?: boolean;
}

interface ManheimAdjustedPricing {
  wholesale?: ManheimPricingBand;
  retail?: ManheimPricingBand;
  adjustedBy?: ManheimAdjustedBy;
}

interface ManheimDescription {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  subSeries?: string;
  transmission?: string;
}

export interface ManheimValuationItem {
  href?: string;
  description?: ManheimDescription;
  adjustedPricing?: ManheimAdjustedPricing;
  wholesale?: ManheimPricingBand;
  retail?: ManheimPricingBand;
  averageOdometer?: number;
  averageGrade?: number;
  averageEVBH?: number;
  currency?: string;
  sampleSize?: string;
  bestMatch?: boolean;
}

interface ManheimValuationsResponse {
  href?: string;
  count?: number;
  items?: ManheimValuationItem[];
}

export interface ManheimValuationQuery {
  odometer?: number;
  region?: string;
  zip?: string;
  zipCode?: string;
  include?: string;
  color?: string;
  grade?: number;
  buildOptions?: boolean;
  evbh?: number;
  date?: string;
  extendedCoverage?: boolean;
  orgId?: string;
  excludeBuild?: boolean;
  subseries?: string;
  transmission?: string;
}

export interface MmrRequestContext {
  vin: string;
  zip?: string;
  odometer?: number;
  region?: string;
  color?: string;
  grade?: number;
  build_options?: boolean;
}

export interface NormalizedMmrData {
  base_mmr: number;
  adjusted_mmr: number;
  adjustments: {
    odometer: number;
    region: number;
    cr_score: number;
    color: number;
  };
  typical_range: {
    min: number;
    max: number;
  };
  avg_odo: number;
  avg_condition: string;
  request_context: MmrRequestContext;
}

export interface ManheimMmrResult {
  raw: ManheimValuationsResponse;
  item: ManheimValuationItem;
  mmrData: NormalizedMmrData;
}

type MmrLookupKind = "colors" | "regions";

const FALLBACK_LOOKUPS: Record<MmrLookupKind, string[]> = {
  colors: [
    "Black",
    "White",
    "Silver",
    "Gray",
    "Blue",
    "Red",
    "Green",
    "Brown",
    "Gold",
    "Orange",
    "Yellow",
    "Purple",
  ],
  regions: [
    "Northeast",
    "Southeast",
    "Midwest",
    "Southwest",
    "West",
    "Northwest",
  ],
};

function getManheimBaseUrl(): string {
  const baseUrl =
    process.env.MANHEIM_BASE_URL?.trim() || DEFAULT_MANHEIM_BASE_URL;
  return baseUrl.replace(/\/$/, "");
}

function parseManheimValuationsResponse(
  data: unknown,
): ManheimValuationsResponse | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const payload = data as ManheimValuationsResponse;
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return null;
  }
  return payload;
}

function pickValuationItem(
  items: ManheimValuationItem[],
): ManheimValuationItem | null {
  if (items.length === 0) return null;
  return items.find((item) => item.bestMatch) ?? items[0] ?? null;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseGradeValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
}

export function normalizeGradeForApi(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }
  const normalized = value <= 5 ? Math.round(value * 10) : Math.round(value);
  if (normalized < 10 || normalized > 50) {
    return undefined;
  }
  return normalized;
}

export function normalizeManheimToMMRData(
  item: ManheimValuationItem,
  requestContext: MmrRequestContext,
): NormalizedMmrData {
  const baseMmr = toFiniteNumber(item.wholesale?.average, 0);
  const adjustedWholesale = item.adjustedPricing?.wholesale;
  const adjustedMmr = toFiniteNumber(adjustedWholesale?.average, baseMmr);
  const rangeMin = toFiniteNumber(
    adjustedWholesale?.below,
    toFiniteNumber(item.wholesale?.below, adjustedMmr || baseMmr),
  );
  const rangeMax = toFiniteNumber(
    adjustedWholesale?.above,
    toFiniteNumber(item.wholesale?.above, adjustedMmr || baseMmr),
  );
  const avgConditionRaw = toFiniteNumber(item.averageGrade, 0);
  const avgCondition = avgConditionRaw > 0 ? String(avgConditionRaw) : "N/A";
  const adjustedBy = item.adjustedPricing?.adjustedBy;

  return {
    base_mmr: baseMmr,
    adjusted_mmr: adjustedMmr,
    adjustments: {
      // Manheim returns the adjusted total but does not expose per-field deltas
      // in this response shape, so keep row deltas neutral unless that changes.
      odometer: 0,
      region: 0,
      cr_score: 0,
      color: 0,
    },
    typical_range: {
      min: rangeMin,
      max: rangeMax,
    },
    avg_odo: toFiniteNumber(item.averageOdometer, 0),
    avg_condition: avgCondition,
    request_context: {
      vin: requestContext.vin,
      zip: requestContext.zip,
      odometer:
        requestContext.odometer ??
        parseGradeValue(toTrimmedString(adjustedBy?.Odometer)),
      region: requestContext.region ?? toTrimmedString(adjustedBy?.Region),
      color:
        requestContext.color ??
        (toTrimmedString(adjustedBy?.Color)
          ? toTitleCase(String(adjustedBy?.Color))
          : undefined),
      grade:
        requestContext.grade ??
        normalizeGradeForApi(parseGradeValue(toTrimmedString(adjustedBy?.Grade))),
      build_options:
        requestContext.build_options ??
        (typeof adjustedBy?.buildOptions === "boolean"
          ? adjustedBy.buildOptions
          : true),
    },
  };
}

function collectLookupStrings(payload: unknown, kind: MmrLookupKind): string[] {
  const candidates: unknown[] = [];
  if (Array.isArray(payload)) {
    candidates.push(...payload);
  } else if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const possibleKeys = [
      kind,
      kind.slice(0, -1),
      "items",
      "data",
      "values",
      "options",
    ];
    for (const key of possibleKeys) {
      const value = record[key];
      if (Array.isArray(value)) {
        candidates.push(...value);
      }
    }
  }

  const values = new Set<string>();
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() && !candidate.startsWith("http")) {
      values.add(toTitleCase(candidate.trim()));
      continue;
    }
    if (!candidate || typeof candidate !== "object") continue;
    const record = candidate as Record<string, unknown>;
    const raw =
      toTrimmedString(record.value) ??
      toTrimmedString(record.label) ??
      toTrimmedString(record.name) ??
      toTrimmedString(record.description) ??
      toTrimmedString(record.code);
    if (raw && !raw.startsWith("http")) {
      values.add(toTitleCase(raw));
    }
  }

  return values.size > 0 ? [...values] : FALLBACK_LOOKUPS[kind];
}

export async function fetchManheimMmrLookup(
  kind: MmrLookupKind,
): Promise<string[]> {
  const token = await getManheimAccessToken();
  if (!token) {
    return FALLBACK_LOOKUPS[kind];
  }

  const endpoint = new URL(
    `${getManheimBaseUrl()}/wholesale-valuations/vehicle/mmr/${kind}`,
  );
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return FALLBACK_LOOKUPS[kind];
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    return FALLBACK_LOOKUPS[kind];
  }

  return collectLookupStrings(payload, kind);
}

export async function fetchManheimMmrByVin(
  vin: string,
  query: ManheimValuationQuery = {},
): Promise<ManheimMmrResult | null> {
  const token = await getManheimAccessToken();
  if (!token) {
    return null;
  }

  const normalizedVin = vin.trim().toUpperCase();
  if (!normalizedVin) {
    return null;
  }

  const normalizedGrade = normalizeGradeForApi(query.grade);
  const normalizedZip = query.zip?.trim() || query.zipCode?.trim() || undefined;
  const buildOptionsEnabled =
    typeof query.buildOptions === "boolean"
      ? query.buildOptions
      : typeof query.excludeBuild === "boolean"
        ? !query.excludeBuild
        : true;
  const baseUrl = getManheimBaseUrl();
  const pathParts = [
    "wholesale-valuations",
    "vehicle",
    "mmr",
    "vin",
    encodeURIComponent(normalizedVin),
  ];

  if (query.subseries) {
    pathParts.push(encodeURIComponent(query.subseries));
  }
  if (query.transmission) {
    pathParts.push(encodeURIComponent(query.transmission));
  }

  const endpoint = new URL(`${baseUrl}/${pathParts.join("/")}`);
  if (
    typeof query.odometer === "number" &&
    Number.isFinite(query.odometer) &&
    query.odometer >= 0
  ) {
    endpoint.searchParams.set("odometer", String(Math.round(query.odometer)));
  }
  if (query.region) endpoint.searchParams.set("region", query.region);
  if (normalizedZip) endpoint.searchParams.set("zip", normalizedZip);
  endpoint.searchParams.set("include", query.include?.trim() || DEFAULT_INCLUDE);
  if (query.color) endpoint.searchParams.set("color", query.color);
  if (normalizedGrade !== undefined) {
    endpoint.searchParams.set("grade", String(normalizedGrade));
  }
  if (typeof query.evbh === "number" && Number.isFinite(query.evbh)) {
    endpoint.searchParams.set("evbh", String(Math.round(query.evbh)));
  }
  if (query.date) endpoint.searchParams.set("date", query.date);
  if (typeof query.extendedCoverage === "boolean") {
    endpoint.searchParams.set(
      "extendedCoverage",
      String(query.extendedCoverage),
    );
  }
  if (query.orgId) endpoint.searchParams.set("orgId", query.orgId);
  endpoint.searchParams.set("excludeBuild", String(!buildOptionsEnabled));

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    return null;
  }

  const parsed = parseManheimValuationsResponse(payload);
  if (!parsed?.items) {
    return null;
  }

  const item = pickValuationItem(parsed.items);
  if (!item) {
    return null;
  }

  return {
    raw: parsed,
    item,
    mmrData: normalizeManheimToMMRData(item, {
      vin: normalizedVin,
      zip: normalizedZip,
      odometer:
        typeof query.odometer === "number" && Number.isFinite(query.odometer)
          ? Math.round(query.odometer)
          : undefined,
      region: query.region?.trim() || undefined,
      color: query.color?.trim() || undefined,
      grade: normalizedGrade,
      build_options: buildOptionsEnabled,
    }),
  };
}
