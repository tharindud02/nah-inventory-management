import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";
import type { CreateConversationResponse } from "@/types/conversations";

const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  to: z.string().min(1),
  from: z.string().min(1),
  body: z.string().min(1),
  channel: z.enum(["email", "sms"]),
});

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

/**
 * POST /api/conversations/[listingId]/messages
 * Sends a message to an existing conversation (SMS or email follow-up).
 */
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const url = `${AWS_API_BASE_URL}/conversations/${encodeURIComponent(listingId)}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to send message" },
        { status: res.status },
      );
    }

    const data = (await res.json()) as CreateConversationResponse;
    return NextResponse.json(data);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
