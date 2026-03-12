import { NextRequest, NextResponse } from "next/server";

interface ChatStreamRequestBody {
  message?: unknown;
  session_id?: unknown;
}

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

const CHAT_ASSISTANT_STREAM_URL =
  process.env.CHAT_ASSISTANT_STREAM_URL ??
  "http://autohaus-intel-assistant-prod-1126841276.ap-south-1.elb.amazonaws.com/api/chat/stream";

export async function POST(request: NextRequest) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsedBody: ChatStreamRequestBody;
  try {
    parsedBody = (await request.json()) as ChatStreamRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message =
    typeof parsedBody.message === "string" ? parsedBody.message.trim() : "";
  const sessionId =
    typeof parsedBody.session_id === "string" &&
    parsedBody.session_id.trim().length > 0
      ? parsedBody.session_id.trim()
      : undefined;

  if (!message) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 },
    );
  }

  const upstreamPayload = sessionId
    ? { message, session_id: sessionId }
    : { message };

  try {
    const upstreamResponse = await fetch(CHAT_ASSISTANT_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to stream assistant response" },
        { status: upstreamResponse.status },
      );
    }

    const contentType =
      upstreamResponse.headers.get("content-type") ?? "text/plain; charset=utf-8";

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          upstreamResponse.headers.get("cache-control") ?? "no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to stream assistant response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
