"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VehicleDetailHeaderProps {
  vehicleName: string;
  status: string;
  statusVariant?: "default" | "vinMissing";
  vin?: string;
  trim?: string;
  mileage: string;
  targetOffer: string;
  onMoveToNegotiate?: () => void;
  backHref?: string;
}

export function VehicleDetailHeader({
  vehicleName,
  status,
  statusVariant = "default",
  vin,
  trim,
  mileage,
  targetOffer,
  onMoveToNegotiate,
  backHref = "/acquisition-search",
}: VehicleDetailHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push(backHref)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">{vehicleName}</h1>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              statusVariant === "vinMissing"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-700",
            )}
          >
            {status}
          </span>
          {vin && <span className="text-sm text-slate-500">{vin}</span>}
          {trim && <span className="text-sm text-slate-500">{trim}</span>}
          <span className="text-sm text-slate-500">{mileage}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target Offer
            </p>
            <p className="text-xl font-bold text-emerald-600">{targetOffer}</p>
          </div>
          <Button
            onClick={onMoveToNegotiate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Diamond className="h-4 w-4" aria-hidden />
            Move to Negotiate
          </Button>
        </div>
      </div>
    </header>
  );
}
