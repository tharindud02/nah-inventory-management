import { JobSummary } from "../types/jobs";

export async function fetchJobs(accessToken: string): Promise<JobSummary[]> {
  const response = await fetch(
    "https://i3hjth9ogf.execute-api.ap-south-1.amazonaws.com/jobs",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch jobs");
  }

  const raw = await response.json();
  const jobs = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
      ? raw
      : [];

  return jobs.map((job: any, idx: number): JobSummary => {
    const totalScraped = job.total_scraped ?? job.totalScraped ?? 0;
    const jobKey = job.SK || job.dataset_id || job.jobId || `job-${idx}`;

    const status = (job.status || "ACTIVE").toString().toUpperCase();

    return {
      id:
        job.SK ||
        job.id ||
        job.jobId ||
        job._id ||
        (job.PK ? `${job.PK}-${idx}` : Math.random().toString(36)),
      jobKey,
      scrapedCount: totalScraped,
      status,
      demandColor: "text-blue-600",
      borderColor: "border-l-blue-500",
    };
  });
}
