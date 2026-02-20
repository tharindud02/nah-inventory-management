"use client";

import { Car, MapPin, DollarSign, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ListingDetailsCardProps {
  make?: string;
  model?: string;
  location?: string;
  color?: string;
  price?: string;
  condition?: string;
  scrapedAt?: string;
  productId?: string;
  description?: string;
  profileId?: string;
  countryCode?: string;
  marketplaceUrl?: string;
  className?: string;
}

export function ListingDetailsCard({
  make,
  model,
  location,
  color,
  price,
  condition,
  scrapedAt,
  productId,
  description,
  profileId,
  countryCode,
  marketplaceUrl,
  className,
}: ListingDetailsCardProps) {
  const hasBasicInfo =
    make || model || location || color || price || condition || scrapedAt || productId;
  const hasExtra = profileId || countryCode;
  const hasContent = hasBasicInfo || description || hasExtra;

  if (!hasContent) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Listing Details
      </h3>

      {marketplaceUrl && (
        <a
          href={marketplaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          View on Marketplace
        </a>
      )}

      {hasBasicInfo && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {make && (
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
              <div>
                <p className="text-xs text-slate-500">Make</p>
                <p className="font-semibold capitalize">{make}</p>
              </div>
            </div>
          )}
          {model && (
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
              <div>
                <p className="text-xs text-slate-500">Model</p>
                <p className="font-semibold">{model}</p>
              </div>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-semibold">{location}</p>
              </div>
            </div>
          )}
          {color && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Color</p>
                <p className="font-semibold capitalize">{color}</p>
              </div>
            </div>
          )}
          {price && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-xl font-semibold">{price}</p>
              </div>
            </div>
          )}
          {condition && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Condition</p>
                <p className="font-semibold capitalize">{condition}</p>
              </div>
            </div>
          )}
          {scrapedAt && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
              <div>
                <p className="text-xs text-slate-500">Scraped Date</p>
                <p className="font-semibold">{scrapedAt}</p>
              </div>
            </div>
          )}
          {productId && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Product ID</p>
                <p className="font-mono text-sm font-semibold">{productId}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {description && (
        <div className="mb-6">
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Description</h4>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {description}
            </p>
          </div>
        </div>
      )}

      {(profileId || countryCode) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profileId && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Profile ID</p>
              <p className="font-mono text-sm font-semibold">{profileId}</p>
            </div>
          )}
          {countryCode && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Country</p>
              <p className="text-sm font-semibold">{countryCode}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
