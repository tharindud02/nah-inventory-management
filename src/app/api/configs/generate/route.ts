import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

export async function POST(request: NextRequest) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let source = searchParams.get("source");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  
  // Extract source from body if it doesn't exist in query params
  if (!source && body && typeof body === "object" && "source" in body) {
    source = (body as any).source;
  }
  
  // Remove source from body if it exists
  if (body && typeof body === "object" && "source" in body) {
    const { source: _, ...bodyWithoutSource } = body as any;
    body = bodyWithoutSource;
  }


  try {
    const awsUrl = new URL(`${AWS_API_BASE_URL}/configs/generate`);
    awsUrl.searchParams.set("save", "true");
    awsUrl.searchParams.set("process", "true");
    if (source) {
      awsUrl.searchParams.set("source", source);
    }

    const res = await fetch(awsUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Request failed" },
        { status: res.status },
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
