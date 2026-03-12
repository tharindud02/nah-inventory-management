import { JobSummary } from "../types/jobs";

export async function fetchJobs(
  accessToken: string,
  signal?: AbortSignal,
): Promise<JobSummary[]> {
  const response = await fetch("/api/jobs", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err?.error ?? "Failed to fetch jobs");
  }

  const jobs = (await response.json()) as JobSummary[];
  return jobs;
}
