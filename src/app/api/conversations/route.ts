import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

/**
 * GET /api/conversations?listingId=xxx
 * Proxies to upstream conversations API. When listingId is provided, fetches
 * listing-specific threads; otherwise returns all conversations.
 */
export async function GET(request: NextRequest) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId")?.trim();

  const baseUrl = `${AWS_API_BASE_URL}/conversations`;
  const url = listingId
    ? `${baseUrl}/${encodeURIComponent(listingId)}`
    : baseUrl;

  try {
    const res = await fetch(url, {
      headers: { Authorization: auth, Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to fetch conversations" },
        { status: res.status },
      );
    }

    const raw = await res.json();
    return NextResponse.json(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch conversations";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
