import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";

/** Valid 17-char VIN pattern (alphanumeric, no I/O/Q). */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> },
) {
  const config = getMarketcheckConfig();
  if (!config) {
    return NextResponse.json(
      { error: "MarketCheck API not configured" },
      { status: 503 },
    );
  }

  const { vin } = await params;
  const normalizedVin = vin?.trim().toUpperCase();
  if (!normalizedVin || !VIN_PATTERN.test(normalizedVin)) {
    return NextResponse.json(
      { error: "Invalid or missing VIN (must be 17 characters)" },
      { status: 400 },
    );
  }

  const url = new URL(
    `${config.baseUrl}/v2/decode/car/neovin/${normalizedVin}/specs`,
  );
  url.searchParams.set("api_key", config.apiKey);
  url.searchParams.set("include_generic", "true");

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || `NeoVIN error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch NeoVIN specs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
