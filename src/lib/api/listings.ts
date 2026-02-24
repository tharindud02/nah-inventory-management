export async function bookmarkListing(
  listingId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    `/api/listings/${encodeURIComponent(listingId)}/bookmark`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err?.error ?? `Bookmark failed: ${response.status}`);
  }
}
