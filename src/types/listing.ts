export interface VehicleDetails {
  id?: string;
  brand?: string | null;
  vin_number?: string;
  color_code?: string;
  color?: string;
  make?: string;
  model?: string;
  year?: number | string;
  mileage?: number | string;
  condition?: string;
  location?: string;
  price?: number;
  final_price?: number;
  initial_price?: number;
  currency?: string;
  description?: string;
  title?: string;
  country_code?: string;
  product_id?: string;
  profile_id?: string;
  [key: string]: unknown;
}

export interface SellerDetails {
  seller_contact_notes?: string | null;
  seller_phone?: string | null;
  seller_email?: string | null;
  seller_name?: string | null;
  [key: string]: unknown;
}

export interface Gallery {
  images?: string[];
  videos?: string[];
  [key: string]: unknown;
}

export interface NotesListingQuality {
  is_good_to_go?: boolean;
  flagged_reasons?: string[] | null;
}

export interface NotesIdentifiers {
  vin?: { vin_number?: string | null; vin_source?: string | null };
  license_plate?: {
    plate_number?: string | null;
    plate_state?: string | null;
    plate_image_url?: string | null;
    plate_confidence?: string | null;
  };
}

export interface Notes {
  listing_quality?: NotesListingQuality;
  issues?: { has_known_issues?: boolean; items?: unknown[] };
  identifiers?: NotesIdentifiers;
  [key: string]: unknown;
}

export interface Identifiers {
  product_id?: string;
  profile_id?: string;
  country_code?: string;
  SK?: string;
  PK?: string;
  job_id?: string;
  [key: string]: unknown;
}

export interface VehicleHistory {
  [key: string]: unknown;
}

export interface Valuation {
  [key: string]: unknown;
}

export interface Appointments {
  [key: string]: unknown;
}

export interface ListingItem {
  vehicle_details?: VehicleDetails;
  seller_details?: SellerDetails;
  gallery?: Gallery;
  notes?: Notes;
  identifiers?: Identifiers;
  vehicle_history?: VehicleHistory;
  valuation?: Valuation;
  appointments?: Appointments;
  scraped_at?: string;
  SK?: string;
  PK?: string;
  [key: string]: unknown;
}

export interface ListingApiResponse {
  data: {
    items: ListingItem[];
  };
}

export interface ListingDetail {
  SK: string;
  title?: string;
  images?: string[];
  make?: string;
  model?: string;
  year?: number | string;
  location?: string;
  color?: string;
  condition?: string;
  final_price?: number;
  currency?: string;
  scraped_at?: string;
  product_id?: string;
  profile_id?: string;
  description?: string;
  country_code?: string;
  vin?: string;
  vin_number?: string;
  mileage?: number | string;
  seller_contact_notes?: string | null;
  seller_phone?: string | null;
  seller_email?: string | null;
  [key: string]: unknown;
}
