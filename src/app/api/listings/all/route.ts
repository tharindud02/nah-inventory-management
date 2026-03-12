import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

export async function GET(request: NextRequest) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get cursor from query params for pagination
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  try {
    const url = new URL(`${AWS_API_BASE_URL}/listings`);
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to fetch listings" },
        { status: res.status },
      );
    }

    const raw = await res.json();
    return NextResponse.json(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch listings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
