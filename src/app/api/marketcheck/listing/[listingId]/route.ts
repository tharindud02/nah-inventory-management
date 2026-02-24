import { NextRequest, NextResponse } from "next/server";
import { getMarketcheckConfig } from "@/lib/marketcheck-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const config = getMarketcheckConfig();
  if (!config) {
    return NextResponse.json(
      { error: "MarketCheck API not configured" },
      { status: 503 },
    );
  }

  const { listingId } = await params;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  const url = `${config.baseUrl}/v2/listing/car/${encodeURIComponent(listingId)}?api_key=${config.apiKey}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || `MarketCheck error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch listing";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
