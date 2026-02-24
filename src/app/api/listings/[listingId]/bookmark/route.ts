import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

export async function POST(
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
      `${AWS_API_BASE_URL}/listings/${encodeURIComponent(listingId)}/bookmark`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      return NextResponse.json(
        { error: err?.message ?? `Bookmark failed: ${res.status}` },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bookmark failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
