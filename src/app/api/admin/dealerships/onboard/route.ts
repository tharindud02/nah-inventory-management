import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${AWS_API_BASE_URL}/dealerships/onboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Dealer onboarding failed" },
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
