"use client";

import { useState } from "react";
import { Search, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeatureCheckItem } from "./FeatureCheckItem";
import { cn } from "@/lib/utils";

const VIN_LENGTH = 17;

export interface VINRequiredCardProps {
  defaultVin?: string;
  onFetch?: (vin: string) => Promise<void>;
  onSettingsClick?: () => void;
  className?: string;
}

export function VINRequiredCard({
  defaultVin = "",
  onFetch,
  onSettingsClick,
  className,
}: VINRequiredCardProps) {
  const [vin, setVin] = useState(defaultVin.toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = vin.replace(/\s/g, "").length === VIN_LENGTH;

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    setVin(value.slice(0, VIN_LENGTH));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = vin.replace(/\s/g, "");

    if (trimmed.length !== VIN_LENGTH) {
      setError("VIN must be exactly 17 characters");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onFetch?.(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch valuation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-8 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Search className="h-6 w-6 text-slate-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900">
            VIN Required for Market Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            To generate precise MMR, retail valuations, and local market
            positioning, please provide a valid Vehicle Identification Number.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <div className="relative">
            <BarChart3
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              type="text"
              value={vin}
              onChange={handleVinChange}
              placeholder="INSERT 17-CHARACTER VIN"
              maxLength={VIN_LENGTH}
              className={cn(
                "h-12 pl-12 font-mono text-lg uppercase tracking-wider",
                error && "border-red-500 focus-visible:ring-red-500",
              )}
              aria-invalid={!!error}
              aria-describedby={error ? "vin-error" : undefined}
            />
          </div>
          {error && (
            <p id="vin-error" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="h-12 gap-2 px-6 text-base font-semibold"
        >
          <BarChart3 className="h-5 w-5" aria-hidden />
          {isLoading ? "Fetching..." : "Fetch Valuation & Build Sheet"}
        </Button>

        <div className="flex flex-wrap gap-6">
          <FeatureCheckItem label="MMR DATA" />
          <FeatureCheckItem label="RETAIL COMPS" />
          <FeatureCheckItem label="FACTORY SPECS" />
        </div>
      </form>

      <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onSettingsClick}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <p className="text-xs text-slate-500">
          Integrated with national auction data & market velocity indices
        </p>
      </div>
    </div>
  );
}
