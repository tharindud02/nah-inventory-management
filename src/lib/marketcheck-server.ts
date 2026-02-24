/**
 * Server-only MarketCheck API configuration.
 * Uses MARKETCHECK_API_KEY and MARKETCHECK_BASE_URL (no NEXT_PUBLIC_ prefix).
 * Never expose these values to the client.
 */

const DEFAULT_BASE_URL = "https://api.marketcheck.com";

export interface MarketcheckConfig {
  apiKey: string;
  baseUrl: string;
  dealerId: string;
}

/**
 * Returns MarketCheck config from server-only env vars.
 * When key is missing, returns null (callers should return 503 or use demo data).
 */
export function getMarketcheckConfig(): MarketcheckConfig | null {
  const apiKey = process.env.MARKETCHECK_API_KEY;
  const baseUrl =
    process.env.MARKETCHECK_BASE_URL ??
    process.env.NEXT_PUBLIC_MARKETCHECK_BASE_URL ??
    DEFAULT_BASE_URL;
  const dealerId =
    process.env.MARKETCHECK_DEALER_ID ??
    process.env.NEXT_PUBLIC_DEALER_ID ??
    "11018373";

  if (!apiKey?.trim()) {
    return null;
  }

  return {
    apiKey: apiKey.trim(),
    baseUrl: baseUrl.replace(/\/$/, ""),
    dealerId,
  };
}
