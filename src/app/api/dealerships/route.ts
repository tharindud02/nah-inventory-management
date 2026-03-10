import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const response = await fetch(`${AWS_API_BASE_URL}/dealerships`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    console.log("AWS Response status:", response.status);

    const data = await response.json();

    console.log("AWS Response data:", data);

    if (!response.ok) {
      console.error("AWS API error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to fetch dealership data" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
