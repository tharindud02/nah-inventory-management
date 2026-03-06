"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { VehicleDetailHeader } from "@/components/acquisition/VehicleDetailHeader";
import { VehicleDetailTabs } from "@/components/acquisition/VehicleDetailTabs";
import { DetailsTabContent } from "@/components/details/DetailsTabContent";
import { ValuationTabContent } from "@/components/valuation/ValuationTabContent";
import { CostAnalysisTabContent } from "@/components/cost-analysis/CostAnalysisTabContent";
import { SellerContactTabContent } from "@/components/seller-contact/SellerContactTabContent";
import { AppointmentsTabContent } from "@/components/appointments/AppointmentsTabContent";
import { NotesTabContent } from "@/components/notes/NotesTabContent";
import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import type { ConfigItem } from "@/components/details/ConfigurationCard";
import type { ListingItem, ListingDetail } from "@/types/listing";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { PriorityFlag } from "@/components/notes/InternalStrategySidebar";
import { normalizeListingItem } from "@/lib/listing-utils";
import { transformVindataToValuationResults } from "@/lib/vindata-transform";
import {
  EMPTY_EVENTS,
  EMPTY_UPCOMING,
  EMPTY_AVAILABILITY,
  EMPTY_NOTES,
  EMPTY_NEGOTIATION_GOALS,
  EMPTY_PRIORITY_FLAGS,
  EMPTY_AI_SUGGESTIONS,
  EMPTY_SELLER_CONTACT,
  EMPTY_SOURCE_INFO,
  EMPTY_SELLER_ACTIONS,
} from "@/lib/sample-page-data";
import { useSellerContact } from "@/hooks/useSellerContact";

function buildConfiguration(listing: ListingDetail): ConfigItem[] {
  return [
    { label: "Engine", value: "—" },
    { label: "Transmission", value: "—" },
    { label: "Exterior Color", value: listing.color ?? "—" },
    { label: "Interior Color", value: "—" },
    { label: "Fuel Economy", value: "—" },
  ];
}

export default function ListingDetailsPage() {
  const params = useParams<{ jobId: string; listingSk: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("details");
  const [valuationData, setValuationData] =
    useState<ValuationResultsData | null>(null);

  const jobId = params.jobId;
  const listingSk = params.listingSk ? decodeURIComponent(params.listingSk) : "";

  const sellerContact = useSellerContact({
    listingId: listingSk,
    sellerContact: {
      sellerPhone: listing?.seller_phone ?? null,
      sellerEmail: listing?.seller_email ?? null,
      messengerHref: listing?.product_id
        ? `https://www.facebook.com/marketplace/item/${listing.product_id}`
        : null,
      forceShowSamples: true,
    },
    enabled: !isLoading && !error && !!listing && activeTab === "seller",
  });

  useEffect(() => {
    if (!listingSk) {
      setError("Invalid listing");
      setIsLoading(false);
      return;
    }

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("Missing access token. Please log in again.");
        setIsLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        let item: ListingItem | null = null;

        const res = await fetch(`/api/listings/${encodeURIComponent(listingSk)}`, {
          headers,
        });

        if (res.ok) {
          const raw = await res.json();
          if (raw?.data?.items?.[0]) {
            item = raw.data.items[0] as ListingItem;
          } else if (raw?.data && (raw.data.vehicle_details || raw.data.gallery)) {
            item = raw.data as ListingItem;
          } else if (raw?.vehicle_details || raw?.gallery) {
            item = raw as ListingItem;
          }
        }

        if (!item) {
          const jobRes = await fetch(`/api/listings/job/${encodeURIComponent(jobId)}`, {
            headers,
          });
          if (!jobRes.ok) throw new Error("Failed to fetch listing details");
          const jobRaw = await jobRes.json();
          const items = (jobRaw?.data?.items ?? jobRaw?.items ?? []) as ListingItem[];
          const arr = Array.isArray(items) ? items : [];
          item =
            arr.find(
              (it) =>
                it.vehicle_details?.id === listingSk ||
                (it as ListingItem & { SK?: string }).SK === listingSk ||
                it.identifiers?.SK === listingSk,
            ) ?? null;
        }

        if (!item) throw new Error("Listing not found");

        const detail = normalizeListingItem(item, listingSk);
        setListing(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [jobId, listingSk]);

  const handleFetchValuation = useCallback(
    async (vinToFetch: string) => {
      const miles = listing?.mileage
        ? Number(listing.mileage)
        : undefined;
      const zip = "";

      try {
        const valuationRes = await fetch("/api/vindata/valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vinToFetch, miles, zip }),
        });
        const valuationJson = await valuationRes.json().catch(() => null);

        if (!valuationRes.ok || !valuationJson?.success) {
          const err = valuationJson?.error ?? "Failed to fetch VIN valuation";
          throw new Error(err);
        }

        const result = transformVindataToValuationResults({
          vin: vinToFetch,
          generateReport: null,
          valuation: { data: valuationJson?.data?.valuation },
          marketComps: { data: valuationJson?.data?.marketComps },
          soldComps: { data: valuationJson?.data?.soldComps },
          mmr: valuationJson?.data?.mmr ?? null,
          listingPrice: listing?.final_price ?? undefined,
          listingMileage: miles,
          listingZip: zip,
        });

        setValuationData(result);
        toast.success("Valuation & build sheet data loaded");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch valuation";
        toast.error(msg);
        throw err;
      }
    },
    [listing?.final_price, listing?.mileage],
  );

  const vehicleName = listing?.title ?? "Listing";
  const hasVin = Boolean(listing?.vin || listing?.vin_number);
  const vin = listing?.vin ?? listing?.vin_number ?? "";
  const price = listing?.final_price
    ? `$${listing.final_price.toLocaleString()}`
    : "N/A";
  const location = listing?.location ?? "N/A";
  const images = listing?.images ?? [];
  const configuration = listing ? buildConfiguration(listing) : [];

  const domActive = (listing as { dom_active?: number })?.dom_active;
  const marketOverview = listing?.final_price
    ? {
        currentPrice: `$${listing.final_price.toLocaleString()}`,
        previousPrice: undefined,
        priceDrop: undefined,
        daysOnMarket: domActive != null ? `${domActive} Days` : "—",
        marketCondition: "—",
        estRecon: "",
        mmrApi: "",
        mcApi: "",
      }
    : undefined;

  const sourcingIntel =
    "Listing data from marketplace. Enter VIN and fetch valuation for full market intelligence.";

  const listingDetails = listing
    ? {
        make: listing.make,
        model: listing.model,
        location: listing.location,
        color: listing.color,
        price,
        condition: listing.condition,
        scrapedAt: listing.scraped_at
          ? new Date(listing.scraped_at).toLocaleDateString()
          : undefined,
        productId: listing.product_id,
        description: listing.description,
        profileId: listing.profile_id,
        countryCode: listing.country_code,
        marketplaceUrl: listing.product_id
          ? `https://web.facebook.com/marketplace/item/${listing.product_id}`
          : undefined,
      }
    : undefined;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="ml-64 flex min-h-screen flex-col">
          <VehicleDetailHeader
            vehicleName={vehicleName}
            status={hasVin ? "IN DISCOVERY" : "VIN MISSING"}
            statusVariant={hasVin ? "default" : "vinMissing"}
            vin={hasVin ? vin : undefined}
            mileage=""
            targetOffer={price}
            backHref={`/job-listing/${jobId}`}
            onMoveToNegotiate={() => {}}
          />

          <VehicleDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => router.push(`/job-listing/${jobId}`)}
                  className="mt-4 text-sm font-medium text-red-800 underline"
                >
                  Back to Listings
                </button>
              </div>
            )}

            {!isLoading && !error && listing && activeTab === "details" && (
              <DetailsTabContent
                hasVin={hasVin}
                images={images}
                listingDetails={listingDetails}
                marketOverview={marketOverview}
                configuration={configuration}
                location={location}
                distance=""
                sourcingIntel={sourcingIntel}
              />
            )}

            {!isLoading && !error && listing && activeTab === "appointments" && (
              <AppointmentsTabContent
                vehicleName={vehicleName}
                events={EMPTY_EVENTS}
                upcomingEvents={EMPTY_UPCOMING}
                availability={EMPTY_AVAILABILITY}
                onNewEvent={() => {}}
                onSyncCalendar={() => {}}
              />
            )}

            {!isLoading && !error && listing && activeTab === "notes" && (
              <NotesTabContent
                notes={EMPTY_NOTES}
                negotiationGoals={EMPTY_NEGOTIATION_GOALS}
                maxBidLimit={price !== "N/A" ? price : "—"}
                reconBudget="—"
                totalAllInCost={price !== "N/A" ? price : "—"}
                exitStrategy="—"
                priorityFlags={EMPTY_PRIORITY_FLAGS}
                onAddNote={() => {}}
                onTagMember={() => {}}
                onSaveStrategy={() => {}}
              />
            )}

            {!isLoading &&
              !error &&
              listing &&
              activeTab === "valuation" && (
                <ValuationTabContent
                  defaultVin={hasVin ? vin : undefined}
                  valuationData={valuationData}
                  onFetchValuation={handleFetchValuation}
                />
              )}

            {!isLoading && !error && listing && activeTab === "cost-analysis" && (
              <div className="pb-24">
                <CostAnalysisTabContent
                  purchasePrice={listing.final_price ?? 0}
                  buyerFee={0}
                  shipping={0}
                  otherFees={0}
                  targetSalePrice={listing.final_price ? Math.round(listing.final_price * 1.05) : 0}
                  turnTime={0}
                  marketAverage={0}
                  marketHigh={0}
                  marketLow={0}
                  velocity={0}
                  projectedTurn={0}
                  sourcingIntel="—"
                />
              </div>
            )}

            {!isLoading && !error && listing && activeTab === "seller" && (
              <SellerContactTabContent
                contactName="—"
                contactInitials="—"
                contactStatus="offline"
                messengerHref={
                  listing.product_id
                    ? `https://www.facebook.com/marketplace/item/${listing.product_id}`
                    : undefined
                }
                messages={sellerContact.messages}
                aiSuggestions={EMPTY_AI_SUGGESTIONS}
                contactInfo={{
                  mobile: listing.seller_phone ?? EMPTY_SELLER_CONTACT.mobile,
                  email: listing.seller_email ?? EMPTY_SELLER_CONTACT.email,
                  location: listing.location ?? EMPTY_SELLER_CONTACT.location,
                }}
                sourceInfo={EMPTY_SOURCE_INFO}
                actions={EMPTY_SELLER_ACTIONS}
                isLoading={sellerContact.isLoading}
                channelAvailability={sellerContact.channelAvailability}
                selectedChannel={sellerContact.selectedChannel}
                onChannelSelect={sellerContact.setSelectedChannel}
                isSending={sellerContact.isSending}
                onSendMessage={(msg) => sellerContact.onSendMessage(msg)}
                onSuggestionClick={() => {}}
                onLogActivity={() => {}}
                onActionClick={() => {}}
              />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
