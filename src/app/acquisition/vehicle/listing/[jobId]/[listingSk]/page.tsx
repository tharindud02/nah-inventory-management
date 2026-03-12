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
import { EventFormModal } from "@/components/appointments/EventFormModal";
import { NotesTabContent } from "@/components/notes/NotesTabContent";
import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import type { ConfigItem } from "@/components/details/ConfigurationCard";
import type { ListingItem, ListingDetail, JobListingItem } from "@/types/listing";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { PriorityFlag } from "@/components/notes/InternalStrategySidebar";
import { normalizeListingItemOrJobItem, isJobListingItem } from "@/lib/listing-utils";
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

interface DealerData {
  id: string;
  dealershipId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  provisions?: {
    id: string;
    dealerId: string;
    assignedEmail: string;
    phoneNumber: string;
    twilioSid: string;
    nylasGrantId: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

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
  const [dealerData, setDealerData] = useState<DealerData | null>(null);
  const [isLoadingDealer, setIsLoadingDealer] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

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

    const controller = new AbortController();
    const signal = controller.signal;

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
        let item: ListingItem | JobListingItem | null = null;

        const res = await fetch(`/api/listings/${encodeURIComponent(listingSk)}`, {
          headers,
          signal,
        });

        if (signal.aborted) return;

        if (res.ok) {
          const raw = await res.json();
          if (raw?.data?.items?.[0]) {
            item = raw.data.items[0] as ListingItem | JobListingItem;
          } else if (raw?.data && (raw.data.vehicle_details || raw.data.gallery)) {
            item = raw.data as ListingItem;
          } else if (raw?.data && (raw.data.productId || raw.data.id)) {
            item = raw.data as JobListingItem;
          } else if (raw?.vehicle_details || raw?.gallery) {
            item = raw as ListingItem;
          } else if (raw?.productId || raw?.id) {
            item = raw as JobListingItem;
          }
        }

        if (!item) {
          const jobRes = await fetch(`/api/listings/job/${encodeURIComponent(jobId)}`, {
            headers,
            signal,
          });
          if (signal.aborted) return;
          if (!jobRes.ok) throw new Error("Failed to fetch listing details");
          const jobRaw = await jobRes.json();
          const items = (jobRaw?.data?.items ?? jobRaw?.items ?? []) as (ListingItem | JobListingItem)[];
          const arr = Array.isArray(items) ? items : [];
          item =
            arr.find((it) => {
              if (isJobListingItem(it)) {
                return it.productId === listingSk || it.id === listingSk;
              }
              const li = it as ListingItem;
              return (
                li.vehicle_details?.id === listingSk ||
                (li as ListingItem & { SK?: string }).SK === listingSk ||
                li.identifiers?.SK === listingSk
              );
            }) ?? null;
        }

        if (!item) throw new Error("Listing not found");
        if (signal.aborted) return;

        const detail = normalizeListingItemOrJobItem(item, listingSk);
        setListing(detail);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    };

    fetchListing();
    return () => controller.abort();
  }, [jobId, listingSk]);

  useEffect(() => {
    if (activeTab !== "appointments") return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const fetchDealer = async () => {
      setIsLoadingDealer(true);
      try {
        const res = await fetch("/api/dealers/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDealerData(data.data);
        }
      } catch {
        // Silently fail - user can still use the page
      } finally {
        setIsLoadingDealer(false);
      }
    };

    fetchDealer();
  }, [activeTab]);

  // Fetch calendar events when appointments tab is active and calendar is connected
  useEffect(() => {
    if (activeTab !== "appointments") return;
    
    const nylasGrantId = dealerData?.provisions?.nylasGrantId;
    if (!nylasGrantId || nylasGrantId === "null") return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    fetchEvents(nylasGrantId, accessToken);
  }, [activeTab, dealerData?.provisions?.nylasGrantId]);

  const fetchEvents = async (grantId: string, token: string) => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch(`/api/calendar/${grantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Transform API events to CalendarEvent format
        // API returns events in data.data.data (nested structure)
        const eventsArray = data.data?.data || [];
        console.log("Fetched events:", eventsArray.length, eventsArray);
        const calendarEvents: CalendarEvent[] = eventsArray.map((event: {
          id: string;
          master_event_id?: string;
          title: string;
          description?: string;
          location?: string;
          when?: {
            start_time?: number;
            date?: string;
            end_time?: number;
          };
          participants?: Array<{ name?: string; email?: string }>;
        }) => {
          const startTime = event.when?.start_time;
          const endTime = event.when?.end_time;
          const eventDate = startTime ? new Date(startTime * 1000) : new Date();
          
          // Build timeRange string
          let timeRange: string | undefined;
          if (startTime && endTime) {
            const formatTime = (timestamp: number) => {
              const d = new Date(timestamp * 1000);
              let hours = d.getHours();
              const minutes = d.getMinutes().toString().padStart(2, "0");
              const period = hours >= 12 ? "PM" : "AM";
              hours = hours % 12 || 12;
              return `${hours}:${minutes} ${period}`;
            };
            timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;
          }
          
          // Use master_event_id for updates/deletes if available
          const eventId = event.master_event_id || event.id;
          
          return {
            id: eventId,
            title: event.title,
            date: eventDate,
            variant: "inspection" as const,
            description: event.description,
            location: event.location,
            attendee: event.participants?.[0]?.name,
            attendeeEmail: event.participants?.[0]?.email,
            timeRange,
          };
        });
        console.log("Transformed events:", calendarEvents.length, calendarEvents);
        setEvents(calendarEvents);
      }
    } catch {
      // Silently fail - user can still use the page
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSyncCalendar = () => {
    // Refresh dealer data to get updated nylasGrantId
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const refreshDealer = async () => {
      setIsLoadingDealer(true);
      try {
        const res = await fetch("/api/dealers/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDealerData(data.data);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoadingDealer(false);
      }
    };

    refreshDealer();
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(new Date());
    setEventFormOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setEventFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setEventFormOpen(true);
  };

  const handleEventSave = async (
    eventData: Omit<CalendarEvent, "id"> & { id?: string }
  ) => {
    const nylasGrantId = dealerData?.provisions?.nylasGrantId;
    if (!nylasGrantId || nylasGrantId === "null") {
      toast.error("Calendar not connected");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Please log in again");
      return;
    }

    try {
      // Parse timeRange to get start and end times
      let startTime: number;
      let endTime: number;
      
      if (eventData.timeRange) {
        const parts = eventData.timeRange.split(" - ").map((s) => s?.trim()).filter(Boolean);
        const start = parts[0];
        const end = parts[1] ?? parts[0];
        const baseDate = eventData.date;

        const parseTime = (timeStr: string) => {
          if (!timeStr || typeof timeStr !== "string") return Math.floor(baseDate.getTime() / 1000);
          const tokens = timeStr.trim().split(/\s+/);
          const timePart = tokens[0];
          const period = tokens[1];
          if (!timePart) return Math.floor(baseDate.getTime() / 1000);
          const [h, m] = timePart.split(":").map(Number);
          const hours = Number.isFinite(h) ? h : 9;
          const minutes = Number.isFinite(m) ? m : 0;
          let hour = hours;
          if (period === "PM" && hour !== 12) hour += 12;
          if (period === "AM" && hour === 12) hour = 0;
          const date = new Date(baseDate);
          date.setHours(hour, minutes, 0, 0);
          return Math.floor(date.getTime() / 1000);
        };

        startTime = parseTime(start);
        endTime = parseTime(end);
        if (endTime <= startTime) endTime = startTime + 3600;
      } else {
        // Default to 1 hour event
        startTime = Math.floor(eventData.date.getTime() / 1000);
        endTime = startTime + 3600;
      }

      const participants = [];
      if (eventData.attendee || eventData.attendeeEmail) {
        participants.push({
          name: eventData.attendee || "",
          email: eventData.attendeeEmail || "",
        });
      }

      const payload = {
        title: eventData.title,
        description: eventData.description || "",
        location: eventData.location || "",
        when: {
          start_time: startTime,
          end_time: endTime,
          start_timezone: "Asia/Colombo",
          end_timezone: "Asia/Colombo",
        },
        participants,
        reminders: {
          use_default: false,
          overrides: [
            { reminder_minutes: 15, reminder_method: "popup" },
            { reminder_minutes: 60, reminder_method: "email" },
          ],
        },
      };

      if (eventData.id) {
        // Update existing event
        const res = await fetch(`/api/calendar/${nylasGrantId}/events/${eventData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update event");
        
        // Refetch events from API to get updated data
        await fetchEvents(nylasGrantId, accessToken);
        toast.success("Event updated successfully");
      } else {
        // Create new event
        const res = await fetch(`/api/calendar/${nylasGrantId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create event");
        
        // Refetch events from API to get new event with proper ID
        await fetchEvents(nylasGrantId, accessToken);
        toast.success("Event created successfully");
      }

      setEventFormOpen(false);
      setSelectedEvent(null);
      setSelectedDate(undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    }
  };

  const handleEventDelete = async (eventId: string) => {
    const nylasGrantId = dealerData?.provisions?.nylasGrantId;
    if (!nylasGrantId || nylasGrantId === "null") {
      toast.error("Calendar not connected");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Please log in again");
      return;
    }

    try {
      const res = await fetch(`/api/calendar/${nylasGrantId}/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => null);
        const errMessage =
          (errPayload && typeof errPayload === "object" && "error" in errPayload
            ? String((errPayload as { error?: string }).error)
            : null) || "Failed to delete event";
        throw new Error(errMessage);
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event deleted successfully");
      await fetchEvents(nylasGrantId, accessToken);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

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

  // Generate upcoming events from events list
  const getUpcomingEvents = () => {
    const now = new Date();
    const sorted = [...events]
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);

    return sorted.map((ev) => {
      const daysDiff = Math.ceil(
        (ev.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      let relativeLabel = "";
      if (daysDiff === 0) relativeLabel = "TODAY";
      else if (daysDiff === 1) relativeLabel = "TOMORROW";
      else if (daysDiff <= 7) relativeLabel = `IN ${daysDiff} DAYS`;
      else if (daysDiff <= 14) relativeLabel = "NEXT WEEK";
      else
        relativeLabel = ev.date
          .toLocaleDateString("en-US", { month: "short", day: "numeric" })
          .toUpperCase();

      return {
        title: ev.title,
        relativeLabel,
        date: ev.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timeRange: ev.timeRange || "All Day",
        attendee: ev.attendee,
      };
    });
  };

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
              <>
                <AppointmentsTabContent
                  vehicleName={vehicleName}
                  events={events}
                  upcomingEvents={getUpcomingEvents()}
                  availability={EMPTY_AVAILABILITY}
                  nylasGrantId={dealerData?.provisions?.nylasGrantId}
                  onNewEvent={handleNewEvent}
                  onSyncCalendar={handleSyncCalendar}
                  onEventClick={handleEventClick}
                  onEventDelete={handleEventDelete}
                  onDateClick={handleDateClick}
                />
                <EventFormModal
                  open={eventFormOpen}
                  onOpenChange={setEventFormOpen}
                  event={selectedEvent}
                  selectedDate={selectedDate}
                  onSave={handleEventSave}
                />
              </>
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
