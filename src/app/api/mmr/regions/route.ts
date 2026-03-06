import { NextResponse } from "next/server";
import { fetchManheimMmrLookup } from "@/lib/manheim-mmr";

export async function GET() {
  try {
    const regions = await fetchManheimMmrLookup("regions");
    return NextResponse.json({ success: true, data: regions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch MMR regions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
