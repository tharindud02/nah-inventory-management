import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchManheimMmrByVin, normalizeGradeForApi } from "@/lib/manheim-mmr";

const vinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^(?:[A-HJ-NPR-Z0-9]{10}|[A-HJ-NPR-Z0-9]{17})$/, "Invalid VIN");

const gradeSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => {
    if (!value) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && normalizeGradeForApi(parsed) !== undefined;
  }, "Grade must be between 1.0-5.0 or 10-50")
  .transform((value) => {
    if (!value) return undefined;
    return normalizeGradeForApi(Number(value));
  });

const querySchema = z.object({
  odometer: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined;
    }),
  region: z.string().trim().optional(),
  zip: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  include: z.string().trim().optional().default("ci,retail,forecast"),
  color: z.string().trim().optional(),
  grade: gradeSchema,
  buildOptions: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      if (value === "true") return true;
      if (value === "false") return false;
      return undefined;
    }),
  subseries: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> },
) {
  const { vin: rawVin } = await params;
  const vinParsed = vinSchema.safeParse(rawVin);
  if (!vinParsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid VIN in route parameter" },
      { status: 400 },
    );
  }

  const rawQuery = {
    odometer: request.nextUrl.searchParams.get("odometer") ?? undefined,
    region: request.nextUrl.searchParams.get("region") ?? undefined,
    zip: request.nextUrl.searchParams.get("zip") ?? undefined,
    zipCode: request.nextUrl.searchParams.get("zipCode") ?? undefined,
    include: request.nextUrl.searchParams.get("include") ?? undefined,
    color: request.nextUrl.searchParams.get("color") ?? undefined,
    grade: request.nextUrl.searchParams.get("grade") ?? undefined,
    buildOptions: request.nextUrl.searchParams.get("buildOptions") ?? undefined,
    subseries: request.nextUrl.searchParams.get("subseries") ?? undefined,
    transmission: request.nextUrl.searchParams.get("transmission") ?? undefined,
  };
  const queryParsed = querySchema.safeParse(rawQuery);
  if (!queryParsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid query parameters", details: queryParsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await fetchManheimMmrByVin(vinParsed.data, queryParsed.data);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch MMR from Manheim" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.mmrData,
      source: "manheim",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while fetching MMR";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
