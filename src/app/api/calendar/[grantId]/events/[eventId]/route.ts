import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string; eventId: string }> }
) {
  try {
    const { grantId, eventId } = await params;
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${AWS_API_BASE_URL}/calendar/${grantId}/events/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to update event" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string; eventId: string }> }
) {
  try {
    const { grantId, eventId } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${AWS_API_BASE_URL}/calendar/${grantId}/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    // DELETE often returns 204 No Content or 200 with empty body - JSON parse would throw
    let data: { message?: string } | null = null;
    try {
      const text = await response.text();
      if (text.trim()) data = JSON.parse(text) as { message?: string };
    } catch {
      /* empty or invalid body - data stays null */
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            (data && typeof data === "object" && "message" in data
              ? (data as { message?: string }).message
              : null) || "Failed to delete event",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data ?? { success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
