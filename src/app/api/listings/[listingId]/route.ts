import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await params;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${AWS_API_BASE_URL}/listings/${encodeURIComponent(listingId)}`,
      { headers: { Authorization: auth } },
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to fetch listing" },
        { status: res.status },
      );
    }

    const raw = await res.json();
    return NextResponse.json(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch listing";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
