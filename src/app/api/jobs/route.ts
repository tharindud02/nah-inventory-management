import { NextRequest, NextResponse } from "next/server";
import { AWS_API_BASE_URL } from "@/lib/api/aws-config";
import type { JobSummary } from "@/lib/types/jobs";

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth;
}

export async function GET(request: NextRequest) {
  const auth = getAuthHeader(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${AWS_API_BASE_URL}/jobs`, {
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to fetch jobs" },
        { status: res.status },
      );
    }

    const raw = await res.json();
    const jobs = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

    const result: JobSummary[] = jobs.map((job: Record<string, unknown>, idx: number) => {
      const totalScraped =
        (job.stats as { total_scraped?: number })?.total_scraped ??
        (job.total_scraped as number) ??
        (job.totalScraped as number) ??
        0;
      const jobKey =
        (job.SK as string) ||
        (job.job_id as string) ||
        (job.jobId as string) ||
        `job-${idx}`;
      const status = ((job.status as string) || "ACTIVE").toString().toUpperCase();

      return {
        id:
          (job.SK as string) ||
          (job.id as string) ||
          (job.jobId as string) ||
          (job._id as string) ||
          (job.PK ? `${job.PK}-${idx}` : Math.random().toString(36)),
        jobKey,
        scrapedCount: totalScraped,
        status,
        demandColor: "text-blue-600",
        borderColor: "border-l-blue-500",
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch jobs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
