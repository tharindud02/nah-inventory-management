/**
 * Client-side cache for listing fetches. Deduplicates requests for the same listingId.
 * Use when multiple consumers (e.g. Details tab, Valuation tab) need the same listing.
 */

import type { MarketCheckCarListing } from "@/lib/marketcheck-listing-transform";

const cache = new Map<
  string,
  { promise: Promise<MarketCheckCarListing | null>; data?: MarketCheckCarListing | null }
>();

/**
 * Fetches listing by ID. Returns cached promise if a request for this ID is in flight or completed.
 * Completed results are cached; in-flight requests are deduplicated.
 */
export function fetchListingCached(
  listingId: string,
): Promise<MarketCheckCarListing | null> {
  const entry = cache.get(listingId);
  if (entry?.data !== undefined) {
    return Promise.resolve(entry.data);
  }
  if (entry?.promise) {
    return entry.promise;
  }

  const promise = fetch(`/api/marketcheck/listing/${encodeURIComponent(listingId)}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data: MarketCheckCarListing | null) => {
      cache.set(listingId, { promise, data });
      return data;
    })
    .catch(() => {
      cache.delete(listingId);
      return null;
    });

  cache.set(listingId, { promise });
  return promise;
}

/** Clears cache for a listing (e.g. on unmount or listing change). */
export function clearListingCache(listingId?: string): void {
  if (listingId) {
    cache.delete(listingId);
  } else {
    cache.clear();
  }
}
