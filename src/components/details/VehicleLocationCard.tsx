"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VehicleLocationCardProps {
  location: string;
  distance: string;
  mapsHref?: string;
  className?: string;
}

function buildMapsUrl(location: string): string {
  if (!location || location === "N/A") return "https://maps.google.com";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function VehicleLocationCard({
  location,
  distance,
  mapsHref,
  className,
}: VehicleLocationCardProps) {
  const href = mapsHref ?? buildMapsUrl(location);

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <MapPin className="h-4 w-4" aria-hidden />
        Vehicle Location
      </h3>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-50/80 px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate text-sm font-medium text-slate-700">
            {location}
          </span>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Open in Maps
        </a>
      </div>
      {distance && distance !== "N/A" && (
        <p className="mt-3 text-xs text-slate-500">{distance} from your location</p>
      )}
    </div>
  );
}
