import type { ListingItem, ListingDetail } from "@/types/listing";

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
