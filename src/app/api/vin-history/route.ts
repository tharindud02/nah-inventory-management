import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";
import type { VinHistoryItem } from "@/lib/api/vin-history";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

interface RawExteriorColor {
  name?: unknown;
  base?: unknown;
}

interface RawVinHistoryItem {
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  exterior_color?: string | RawExteriorColor;
  created_at?: string | number;
  created_at_date?: string;
  updated_at?: string | number;
  report_type?: string;
}

interface RawVinHistoryResponse {
  data?: RawVinHistoryItem[];
}

function parseExteriorColor(
  val: string | RawExteriorColor | undefined,
): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  const extracted = (val.name ?? val.base) as unknown;
  return typeof extracted === "string" ? extracted : undefined;
}

function parseTimestamp(val: string | number | undefined): number | undefined {
  if (val == null) return undefined;
  if (typeof val === "number") {
    return val < 1e12 ? val * 1000 : val;
  }
  const parsed = Date.parse(val);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeItem(raw: RawVinHistoryItem): VinHistoryItem | null {
  const vin = raw?.vin?.trim();
  if (!vin) return null;

  const ts =
    parseTimestamp(raw.created_at) ??
    parseTimestamp(raw.updated_at as string | number) ??
    (raw.created_at_date ? Date.parse(raw.created_at_date) : undefined);
  const searchDate = ts
    ? new Date(ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  const createdAt =
    ts !== undefined
      ? new Date(ts).toISOString()
      : (typeof raw.created_at === "string" ? raw.created_at : undefined);

  return {
    vin,
    year: raw.year,
    make: raw.make,
    model: raw.model,
    trim: raw.trim,
    exteriorColor: parseExteriorColor(raw.exterior_color),
    reportType: raw.report_type as VinHistoryItem["reportType"],
    searchDate,
    createdAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${AWS_API_BASE_URL}/vin`, {
      method: "GET",
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string; message?: string };
      return NextResponse.json(
        { error: err?.error ?? err?.message ?? `VIN history failed: ${res.status}` },
        { status: res.status },
      );
    }

    const raw = (await res.json()) as RawVinHistoryResponse;
    const items = raw?.data ?? [];
    const normalized = items
      .map(normalizeItem)
      .filter((x): x is VinHistoryItem => x !== null);

    const sorted = normalized.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(sorted);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "VIN history failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
