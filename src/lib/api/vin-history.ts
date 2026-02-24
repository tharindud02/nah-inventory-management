export interface VinHistoryItem {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  exteriorColor?: string;
  reportType?: "Validated Build Sheet" | "Market Value Report" | "Standard Analysis" | "Full Data Package";
  searchDate: string;
  createdAt?: string;
}

export async function fetchVinHistory(
  accessToken: string,
): Promise<VinHistoryItem[]> {
  const response = await fetch("/api/vin-history", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(
      err?.error ?? `VIN history failed: ${response.status}`,
    );
  }

  const items = (await response.json()) as VinHistoryItem[];
  return items;
}
