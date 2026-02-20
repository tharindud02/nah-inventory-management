"use client";

import { VehicleImageGallery } from "./VehicleImageGallery";
import { MarketOverviewCard } from "./MarketOverviewCard";
import { ConfigurationCard } from "./ConfigurationCard";
import { VehicleLocationCard } from "./VehicleLocationCard";
import { SourcingIntelCard } from "./SourcingIntelCard";
import { CompleteVehicleIdentityCard } from "./CompleteVehicleIdentityCard";
import { ListingDetailsCard } from "./ListingDetailsCard";
import type { ConfigItem } from "./ConfigurationCard";
import type { ListingDetailsCardProps } from "./ListingDetailsCard";

export interface DetailsTabContentProps {
  hasVin: boolean;
  images?: string[];
  listingDetails?: ListingDetailsCardProps;
  marketOverview?: {
    currentPrice: string;
    previousPrice?: string;
    priceDrop?: string;
    daysOnMarket: string;
    marketCondition: string;
    estRecon: string;
    mmrApi: string;
    mcApi: string;
  };
  configuration?: ConfigItem[];
  location: string;
  distance: string;
  sourcingIntel: string;
  onVinLoad?: (vin: string) => Promise<void>;
}

export function DetailsTabContent({
  hasVin,
  images = [],
  listingDetails,
  marketOverview,
  configuration = [],
  location,
  distance,
  sourcingIntel,
  onVinLoad,
}: DetailsTabContentProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <VehicleImageGallery images={images} />

        {listingDetails && (
          <ListingDetailsCard {...listingDetails} />
        )}

        <VehicleLocationCard
          location={location}
          distance={distance}
        />
      </div>

      <div className="space-y-6">
        {hasVin && marketOverview && (
          <MarketOverviewCard
            currentPrice={marketOverview.currentPrice}
            previousPrice={marketOverview.previousPrice}
            priceDrop={marketOverview.priceDrop}
            daysOnMarket={marketOverview.daysOnMarket}
            marketCondition={marketOverview.marketCondition}
            estRecon={marketOverview.estRecon}
            mmrApi={marketOverview.mmrApi}
            mcApi={marketOverview.mcApi}
          />
        )}

        {!hasVin && (
          <CompleteVehicleIdentityCard onLoadData={onVinLoad} />
        )}

        {hasVin && configuration.length > 0 && (
          <ConfigurationCard items={configuration} />
        )}

        <SourcingIntelCard content={sourcingIntel} />
      </div>
    </div>
  );
}
