import { NextResponse } from "next/server";
import { fetchManheimMmrLookup } from "@/lib/manheim-mmr";

export async function GET() {
  try {
    const colors = await fetchManheimMmrLookup("colors");
    return NextResponse.json({ success: true, data: colors });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch MMR colors";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
