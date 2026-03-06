import { JobSummary } from "../types/jobs";

export async function fetchJobs(accessToken: string): Promise<JobSummary[]> {
  const response = await fetch("/api/jobs", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err?.error ?? "Failed to fetch jobs");
  }

  const jobs = (await response.json()) as JobSummary[];
  return jobs;
}
