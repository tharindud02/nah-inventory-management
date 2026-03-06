import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";
import type { CreateConversationResponse } from "@/types/conversations";

const createEmailSchema = z.object({
  dealerEmail: z.string().email(),
  sellerEmail: z.string().email(),
  message: z.string().min(1),
  channel: z.literal("email"),
});

const createSmsSchema = z.object({
  dealerPhone: z.string().min(1),
  sellerPhone: z.string().min(1),
  message: z.string().min(1),
  channel: z.literal("sms"),
});

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

/**
 * POST /api/conversations/[listingId]
 * Creates and sends initial email conversation. Validates payload with Zod.
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

  const emailParsed = createEmailSchema.safeParse(body);
  const smsParsed = createSmsSchema.safeParse(body);

  if (!emailParsed.success && !smsParsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: emailParsed.success ? smsParsed.error.flatten() : emailParsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const parsed = emailParsed.success ? emailParsed : smsParsed;
  const url = `${AWS_API_BASE_URL}/conversations/${encodeURIComponent(listingId)}`;

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
        { error: text || "Failed to create email conversation" },
        { status: res.status },
      );
    }

    const data = (await res.json()) as CreateConversationResponse;
    return NextResponse.json(data);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Failed to create conversation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
