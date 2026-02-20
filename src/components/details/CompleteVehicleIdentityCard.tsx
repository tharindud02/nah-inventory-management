"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const VIN_LENGTH = 17;

export interface CompleteVehicleIdentityCardProps {
  onLoadData?: (vin: string) => Promise<void>;
  className?: string;
}

export function CompleteVehicleIdentityCard({
  onLoadData,
  className,
}: CompleteVehicleIdentityCardProps) {
  const [vin, setVin] = useState("");
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
      await onLoadData?.(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Complete Vehicle Identity
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <BarChart3
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            type="text"
            value={vin}
            onChange={handleVinChange}
            placeholder="Enter 17-character VIN"
            maxLength={VIN_LENGTH}
            className={cn(
              "h-11 pl-12 font-mono uppercase tracking-wider",
              error && "border-red-500 focus-visible:ring-red-500",
            )}
            aria-invalid={!!error}
          />
        </div>
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full gap-2"
        >
          <BarChart3 className="h-4 w-4" aria-hidden />
          {isLoading ? "Loading..." : "Auto-Load Data"}
        </Button>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </form>
      <p className="mt-4 text-xs text-slate-500">
        Entering the VIN will automatically pull the build sheet, factory specs,
        and market valuation data for this vehicle.
      </p>
    </div>
  );
}
