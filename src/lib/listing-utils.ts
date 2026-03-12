import type { ListingItem, ListingDetail, JobListingItem } from "@/types/listing";

/** Valid 17-char VIN pattern (alphanumeric, no I/O/Q). */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export function isJobListingItem(item: unknown): item is JobListingItem {
  const x = item as Record<string, unknown>;
  return (
    x != null &&
    typeof x === "object" &&
    (typeof x.productId === "string" || typeof x.id === "string") &&
    Array.isArray(x.images)
  );
}

/**
 * Extracts VIN from listingId when it may be "VIN-HASH" or raw VIN.
 * Returns the VIN if valid, otherwise empty string.
 */
export function extractVinFromListingId(listingId: string): string {
  if (!listingId?.trim()) return "";
  const s = listingId.trim();
  if (VIN_PATTERN.test(s)) return s.toUpperCase();
  const beforeDash = s.split("-")[0]?.trim() ?? "";
  if (VIN_PATTERN.test(beforeDash)) return beforeDash.toUpperCase();
  return "";
}

/**
 * Normalizes a raw API listing item into a flat ListingDetail.
 * Uses vehicle_details.id as SK when identifiers.SK is absent.
 */
export function normalizeListingItem(
  item: ListingItem,
  fallbackSk?: string,
): ListingDetail {
  const vehicle = item.vehicle_details ?? {};
  const gallery = item.gallery ?? {};
  const identifiers = item.identifiers ?? {};
  const seller = item.seller_details ?? {};

  const sk =
    identifiers.SK ??
    item.SK ??
    vehicle.id ??
    fallbackSk ??
    "";

  return {
    SK: sk,
    title:
      vehicle.title ??
      ((vehicle.make && vehicle.model)
        ? `${vehicle.make} ${vehicle.model}`.trim()
        : undefined),
    images: gallery.images ?? [],
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    location: vehicle.location,
    color: vehicle.color_code ?? vehicle.color,
    condition: vehicle.condition,
    final_price: vehicle.final_price ?? vehicle.price,
    currency: vehicle.currency,
    scraped_at: item.scraped_at,
    product_id: identifiers.product_id ?? vehicle.product_id ?? vehicle.id,
    profile_id: identifiers.profile_id ?? vehicle.profile_id,
    description: vehicle.description,
    country_code: identifiers.country_code ?? vehicle.country_code,
    vin: vehicle.vin_number ?? vehicle.vin,
    vin_number: vehicle.vin_number ?? vehicle.vin,
    mileage: vehicle.mileage,
    seller_contact_notes: seller.seller_contact_notes,
    seller_phone: seller.seller_phone,
    seller_email: seller.seller_email,
    bookmarked: item.bookmarked === true,
  };
}

/**
 * Extracts listing identifier for navigation (used in URL).
 * Prefers vehicle_details.id when SK is not present.
 */
export function getListingId(item: ListingItem): string {
  const vehicle = item.vehicle_details ?? {};
  const identifiers = item.identifiers ?? {};
  return (
    identifiers.SK ??
    item.SK ??
    vehicle.id ??
    ""
  );
}

/**
 * Maps flat JobListingItem (new /listings/job/{jobId} response) to ListingDetail.
 */
export function mapJobListingItemToListingDetail(
  item: JobListingItem,
): ListingDetail {
  const sk = item.productId ?? item.id ?? "";
  const title =
    item.title ??
    (item.year && item.make && item.model
      ? `${item.year} ${item.make} ${item.model}`.trim()
      : undefined);

  return {
    SK: sk,
    title,
    images: item.images ?? [],
    make: item.make,
    model: item.model,
    year: item.year,
    location: item.location,
    final_price: item.price,
    currency: item.currency,
    scraped_at: item.lastSeenAt ?? item.listedAt ?? item.createdAt,
    product_id: item.productId ?? item.id,
    vin: item.vin ?? undefined,
    vin_number: item.vin ?? undefined,
    mileage: item.mileage ?? undefined,
    description: item.description ?? undefined,
    bookmarked: false,
  };
}

/**
 * Normalizes a raw API item (either legacy ListingItem or flat JobListingItem) to ListingDetail.
 */
export function normalizeListingItemOrJobItem(
  item: ListingItem | JobListingItem,
  fallbackSk?: string,
): ListingDetail {
  if (isJobListingItem(item)) {
    return mapJobListingItemToListingDetail(item);
  }
  return normalizeListingItem(item as ListingItem, fallbackSk);
}

/**
 * Gets listing identifier for navigation. Works with both ListingItem and JobListingItem.
 */
export function getListingIdFromItem(
  item: ListingItem | JobListingItem,
): string {
  if (isJobListingItem(item)) {
    return item.productId ?? item.id ?? "";
  }
  return getListingId(item as ListingItem);
}
