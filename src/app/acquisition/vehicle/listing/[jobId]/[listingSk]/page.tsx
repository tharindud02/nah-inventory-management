"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { VehicleDetailHeader } from "@/components/acquisition/VehicleDetailHeader";
import { VehicleDetailTabs } from "@/components/acquisition/VehicleDetailTabs";
import { DetailsTabContent } from "@/components/details/DetailsTabContent";
import { AppointmentsTabContent } from "@/components/appointments/AppointmentsTabContent";
import { NotesTabContent } from "@/components/notes/NotesTabContent";
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import type { ConfigItem } from "@/components/details/ConfigurationCard";
import type { ListingItem, ListingDetail } from "@/types/listing";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { PriorityFlag } from "@/components/notes/InternalStrategySidebar";
import { normalizeListingItem } from "@/lib/listing-utils";

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(),
    title: "Vehicle Inspection",
    variant: "inspection",
  },
  {
    id: "2",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    title: "Test Drive",
    variant: "test-drive",
  },
  {
    id: "3",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    title: "Final Signing",
    variant: "signing",
  },
];

const MOCK_UPCOMING = [
  {
    title: "Vehicle Inspection",
    relativeLabel: "TODAY",
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timeRange: "09:00 AM - 10:30 AM",
    attendee: "Seller",
  },
  {
    title: "Test Drive",
    relativeLabel: "NEXT WEEK",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" },
    ),
    timeRange: "02:00 PM - 03:00 PM",
  },
  {
    title: "Final Signing",
    relativeLabel: "IN 2 WEEKS",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" },
    ),
    timeRange: "04:30 PM - 05:30 PM",
  },
];

const MOCK_AVAILABILITY = [
  { label: "Morning Slots", available: 4, total: 8 },
  { label: "Afternoon Slots", available: 1, total: 6 },
];

const MOCK_NOTES: DealNote[] = [
  {
    id: "1",
    authorName: "Acquisition Team",
    authorInitials: "AT",
    role: "ACQUISITION",
    roleVariant: "acquisition",
    timestamp: "Today, 10:45 AM",
    content:
      "Initial contact made with seller. Vehicle appears to be in good condition based on photos. Need to schedule inspection to verify mechanical condition.",
    showActions: true,
  },
  {
    id: "2",
    authorName: "Service Team",
    authorInitials: "ST",
    role: "SERVICE",
    roleVariant: "service",
    timestamp: "Yesterday, 4:20 PM",
    content:
      "Reviewing listing details. No reported accidents. Service history appears complete. Recommend inspection before finalizing offer.",
    showActions: false,
  },
  {
    id: "3",
    authorName: "Manager",
    authorInitials: "MG",
    role: "MANAGER",
    roleVariant: "manager",
    timestamp: "2 days ago, 2:15 PM",
    content:
      "Market comps support current asking price. Proceed with inspection and negotiate based on findings.",
    showActions: false,
  },
];

const MOCK_NEGOTIATION_GOALS = [
  "Schedule inspection within 48 hours to assess condition.",
  "Negotiate price based on inspection findings and market comparables.",
  "Aim for quick closing if vehicle meets quality standards.",
];

const MOCK_PRIORITY_FLAGS: PriorityFlag[] = [
  { id: "high-demand", label: "High Demand Inventory", checked: true },
  { id: "manager-review", label: "Requires Manager Review", checked: false },
  { id: "fast-turn", label: "Fast Turn Potential", checked: true },
];

function buildConfiguration(listing: ListingDetail): ConfigItem[] {
  const items: ConfigItem[] = [];
  if (listing.make) items.push({ label: "Make", value: listing.make });
  if (listing.model) items.push({ label: "Model", value: listing.model });
  if (listing.color) items.push({ label: "Exterior Color", value: listing.color });
  if (listing.condition) items.push({ label: "Condition", value: listing.condition });
  return items;
}

export default function ListingDetailsPage() {
  const params = useParams<{ jobId: string; listingSk: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("details");

  const jobId = params.jobId;
  const listingSk = params.listingSk ? decodeURIComponent(params.listingSk) : "";

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

      const baseUrl =
        "https://i3hjth9ogf.execute-api.ap-south-1.amazonaws.com";
      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        let item: ListingItem | null = null;

        const res = await fetch(`${baseUrl}/listings/${listingSk}`, {
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
          const jobRes = await fetch(`${baseUrl}/listings/job/${jobId}`, {
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

  const vehicleName = listing?.title ?? "Listing";
  const hasVin = Boolean(listing?.vin || listing?.vin_number);
  const vin = listing?.vin ?? listing?.vin_number ?? "";
  const price = listing?.final_price
    ? `$${listing.final_price.toLocaleString()}`
    : "N/A";
  const location = listing?.location ?? "N/A";
  const images = listing?.images ?? [];
  const configuration = listing ? buildConfiguration(listing) : [];

  const marketOverview = listing?.final_price
    ? {
        currentPrice: `$${listing.final_price.toLocaleString()}`,
        daysOnMarket: "14 Days",
        marketCondition: "Good",
        estRecon: "$1,250",
        mmrApi: "$38,200",
        mcApi: "$40,100",
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
                events={MOCK_EVENTS}
                upcomingEvents={MOCK_UPCOMING}
                availability={MOCK_AVAILABILITY}
                onNewEvent={() => {}}
                onSyncCalendar={() => {}}
              />
            )}

            {!isLoading && !error && listing && activeTab === "notes" && (
              <NotesTabContent
                notes={MOCK_NOTES}
                negotiationGoals={MOCK_NEGOTIATION_GOALS}
                maxBidLimit={price !== "N/A" ? price : "$0"}
                reconBudget="$1,200"
                totalAllInCost={
                  price !== "N/A"
                    ? `$${(listing.final_price ?? 0) + 1200}`
                    : "$0"
                }
                exitStrategy="retail-ready"
                priorityFlags={MOCK_PRIORITY_FLAGS}
                onAddNote={() => {}}
                onTagMember={() => {}}
                onSaveStrategy={() => {}}
              />
            )}

            {!isLoading &&
              !error &&
              listing &&
              activeTab !== "details" &&
              activeTab !== "appointments" &&
              activeTab !== "notes" && (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  {activeTab} content coming soon
                </div>
              )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
