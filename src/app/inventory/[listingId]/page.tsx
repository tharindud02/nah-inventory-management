"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { VehicleDetailHeader } from "@/components/acquisition/VehicleDetailHeader";
import { VehicleDetailTabs } from "@/components/acquisition/VehicleDetailTabs";
import { AppointmentsTabContent } from "@/components/appointments/AppointmentsTabContent";
import { EventFormModal } from "@/components/appointments/EventFormModal";
import { NotesTabContent } from "@/components/notes/NotesTabContent";
import { NoteFormModal } from "@/components/notes/NoteFormModal";
import { SellerContactTabContent } from "@/components/seller-contact/SellerContactTabContent";
import { ValuationTabContent } from "@/components/valuation/ValuationTabContent";
import { DetailsTabContent } from "@/components/details/DetailsTabContent";
import { CostAnalysisTabContent } from "@/components/cost-analysis/CostAnalysisTabContent";
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import type { ConfigItem } from "@/components/details/ConfigurationCard";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import {
  buildConfigurationFromMarketCheck,
  buildMarketOverviewFromMarketCheck,
  buildValuationFromMarketCheck,
  buildVinDataFromListing,
  type MarketCheckCarListing,
  type VinDataFromListing,
} from "@/lib/marketcheck-listing-transform";
import { fetchListingCached, clearListingCache } from "@/lib/listing-fetch-cache";
import {
  EMPTY_EVENTS,
  EMPTY_AVAILABILITY,
  EMPTY_NOTES,
  EMPTY_NEGOTIATION_GOALS,
  EMPTY_PRIORITY_FLAGS,
  EMPTY_CHAT_MESSAGES,
  EMPTY_AI_SUGGESTIONS,
  EMPTY_SELLER_CONTACT,
  EMPTY_SOURCE_INFO,
  EMPTY_SELLER_ACTIONS,
} from "@/lib/sample-page-data";

export default function InventoryVehicleDetailPage() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const listingId = params.listingId as string;
  const [vinData, setVinData] = useState<VinDataFromListing | null>(null);
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("details");
  const [events, setEvents] = useState<CalendarEvent[]>(EMPTY_EVENTS);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState<DealNote[]>(EMPTY_NOTES);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DealNote | null>(null);
  const [valuationData, setValuationData] = useState<ValuationResultsData | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [configuration, setConfiguration] = useState<ConfigItem[]>([]);
  const [listingData, setListingData] = useState<MarketCheckCarListing | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !listingId) {
      setInitialized(true);
      return;
    }
    const raw = sessionStorage.getItem("vinData");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as VinDataFromListing;
        if (parsed?.make && parsed?.model && parsed.id === listingId) {
          setVinData(parsed);
          setInitialized(true);
          return;
        }
      } catch {
        // ignore
      }
    }
    fetchListingCached(listingId).then((listing) => {
      const data = buildVinDataFromListing(listingId, listing);
      setVinData(data);
      if (listing) {
        setListingData(listing);
        setConfiguration(buildConfigurationFromMarketCheck(listing));
      }
      setInitialized(true);
    });
  }, [listingId]);

  useEffect(() => {
    if (!vinData?.id) return;
    let cancelled = false;
    fetchListingCached(vinData.id).then((data) => {
      if (cancelled) return;
      if (data) {
        setListingData(data);
        setConfiguration(buildConfigurationFromMarketCheck(data));
      } else {
        setListingData(null);
        setConfiguration([]);
      }
    });
    return () => {
      cancelled = true;
      clearListingCache(vinData.id);
    };
  }, [vinData?.id]);

  const vehicleName = vinData
    ? `${vinData.year} ${vinData.make} ${vinData.model}`
    : "Loading...";
  const vin = vinData?.vin ?? "";
  const trim = vinData?.trim ?? "";
  const mileage = vinData
    ? `${vinData.mileage?.toLocaleString() ?? "0"} mi`
    : "";
  const targetOffer =
    vinData?.price != null && vinData.price > 0
      ? `$${vinData.price.toLocaleString()}`
      : "—";
  const images = vinData?.media?.photo_links ?? [];
  const hasVin = Boolean(vin);

  const handleFetchValuation = async (vinToFetch: string) => {
    const listingId = params.listingId as string;
    if (!listingId) throw new Error("Missing listing ID");

    const listing = await fetchListingCached(listingId);

    const [sales, search, mds, recents] = await Promise.all([
      fetch(`/api/marketcheck/sales?vin=${encodeURIComponent(vinToFetch)}`).then(
        (r) => (r.ok ? r.json() : null),
      ),
      fetch(`/api/marketcheck/search?vin=${encodeURIComponent(vinToFetch)}`).then(
        (r) => (r.ok ? r.json() : null),
      ),
      fetch(`/api/marketcheck/mds?vin=${encodeURIComponent(vinToFetch)}`).then(
        (r) => (r.ok ? r.json() : null),
      ),
      (async () => {
        const zip = listing?.dealer?.zip?.trim();
        const state = listing?.dealer?.state?.trim();
        const baseParams = new URLSearchParams({
          vin: vinToFetch,
          rows: "50",
          ...(zip && { zip }),
          ...(state && !zip && { state }),
        });
        if (!zip && !state) baseParams.set("state", "CA");

        const allListings: Array<{ price?: number; miles?: number; last_seen_at?: number; last_seen_at_date?: string }> = [];
        let numFound = 0;
        let start = 0;

        do {
          const q = new URLSearchParams(baseParams);
          q.set("start", String(start));
          const r = await fetch(`/api/marketcheck/recents?${q.toString()}`);
          const json = r.ok ? await r.json() : null;
          if (!json?.listings?.length) break;
          numFound = json.num_found ?? numFound;
          allListings.push(...json.listings);
          start += json.listings.length;
        } while (allListings.length < (numFound || Infinity) && start < 1000);

        return {
          num_found: numFound || allListings.length,
          listings: allListings,
        };
      })(),
    ]);

    const data = buildValuationFromMarketCheck(
      listing,
      sales,
      search,
      mds,
      recents,
    );
    setValuationData(data);
    toast.success("Valuation data fetched");
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

  const handleEventSave = (
    eventData: Omit<CalendarEvent, "id"> & { id?: string },
  ) => {
    if (eventData.id) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventData.id ? { ...eventData, id: e.id } as CalendarEvent : e,
        ),
      );
      toast.success("Event updated");
    } else {
      setEvents((prev) => [
        ...prev,
        { ...eventData, id: `event-${Date.now()}` },
      ]);
      toast.success("Event created");
    }
    setEventFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate(undefined);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    toast.success("Event deleted");
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setNoteFormOpen(true);
  };

  const handleNoteEdit = (note: DealNote) => {
    setSelectedNote(note);
    setNoteFormOpen(true);
  };

  const handleNoteSave = (noteData: Omit<DealNote, "id"> & { id?: string }) => {
    if (noteData.id) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteData.id ? { ...noteData, id: n.id } as DealNote : n,
        ),
      );
      toast.success("Note updated");
    } else {
      setNotes((prev) => [{ ...noteData, id: `note-${Date.now()}` }, ...prev]);
      toast.success("Note added");
    }
    setNoteFormOpen(false);
    setSelectedNote(null);
  };

  const handleNoteDelete = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.success("Note deleted");
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return [...events]
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3)
      .map((ev) => {
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

  const marketOverview =
    listingData != null
      ? buildMarketOverviewFromMarketCheck(listingData)
      : vinData?.price
        ? {
            currentPrice: `$${vinData.price.toLocaleString()}`,
            previousPrice: undefined,
            priceDrop: undefined,
            daysOnMarket: `${vinData.daysOnLot ?? 0} Days`,
            marketCondition: "—",
            estRecon: "",
            mmrApi: "",
            mcApi: "",
          }
        : undefined;

  const fallbackConfiguration: ConfigItem[] = vinData
    ? [
        { label: "Engine", value: "—" },
        { label: "Transmission", value: "—" },
        { label: "Exterior Color", value: "—" },
        { label: "Interior Color", value: "—" },
        { label: "Fuel Economy", value: "—" },
      ]
    : [];
  const displayConfiguration =
    configuration.length > 0 ? configuration : fallbackConfiguration;

  if (initialized && !vinData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="ml-64 flex min-h-screen flex-col items-center justify-center p-6">
            <p className="text-slate-600 mb-4">
              Invalid or missing vehicle data. Please select a vehicle from
              inventory.
            </p>
            <button
              type="button"
              onClick={() => router.push("/inventory")}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Back to Inventory
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!initialized || !vinData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="ml-64 flex min-h-screen flex-col items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-slate-600">Loading vehicle...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
            trim={trim}
            mileage={mileage}
            targetOffer={targetOffer}
            showTargetOffer={activeTab === "valuation"}
            backHref="/inventory"
            onMoveToNegotiate={() => {}}
          />

          <VehicleDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hiddenTabs={["seller", "notes", "appointments"]}
          />

          <main className="flex-1 p-6">
            {activeTab === "details" && vinData && (
              <DetailsTabContent
                hasVin={hasVin}
                images={images}
                marketOverview={marketOverview}
                configuration={displayConfiguration}
                location="Inventory"
                distance=""
                sourcingIntel="Inventory unit from Marketcheck. Fetch valuation for full market intelligence."
              />
            )}

            {activeTab === "valuation" && (
              <ValuationTabContent
                defaultVin={hasVin ? vin : undefined}
                valuationData={valuationData}
                onFetchValuation={handleFetchValuation}
              />
            )}

            {activeTab === "appointments" && (
              <>
                <AppointmentsTabContent
                  vehicleName={vehicleName}
                  events={events}
                  upcomingEvents={getUpcomingEvents()}
                  availability={EMPTY_AVAILABILITY}
                  onNewEvent={handleNewEvent}
                  onSyncCalendar={() => toast.info("Calendar sync coming soon")}
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

            {activeTab === "notes" && (
              <>
                <NotesTabContent
                  notes={notes}
                  negotiationGoals={EMPTY_NEGOTIATION_GOALS}
                  maxBidLimit={targetOffer}
                  reconBudget="$1,200"
                  totalAllInCost={
                    vinData
                      ? `$${(vinData.price + 1200).toLocaleString()}`
                      : "$0"
                  }
                  exitStrategy="retail-ready"
                  priorityFlags={EMPTY_PRIORITY_FLAGS}
                  onAddNote={handleNewNote}
                  onTagMember={() => toast.info("Tag member coming soon")}
                  onNoteEdit={handleNoteEdit}
                  onNoteDelete={handleNoteDelete}
                  onSaveStrategy={() => {}}
                />
                <NoteFormModal
                  open={noteFormOpen}
                  onOpenChange={setNoteFormOpen}
                  note={selectedNote}
                  onSave={handleNoteSave}
                />
              </>
            )}

            {activeTab === "seller" && (
              <SellerContactTabContent
                contactName="Inventory"
                contactInitials="IN"
                contactStatus="offline"
                messages={EMPTY_CHAT_MESSAGES}
                aiSuggestions={EMPTY_AI_SUGGESTIONS}
                contactInfo={EMPTY_SELLER_CONTACT}
                sourceInfo={EMPTY_SOURCE_INFO}
                actions={EMPTY_SELLER_ACTIONS}
                aiAnalyzingText=""
                onSendMessage={() => {}}
                onSuggestionClick={() => {}}
                onLogActivity={() => {}}
                onActionClick={() => {}}
              />
            )}

            {activeTab === "cost-analysis" && vinData && (
              <div className="pb-24">
                <CostAnalysisTabContent
                  purchasePrice={vinData.price}
                  buyerFee={450}
                  shipping={0}
                  otherFees={0}
                  targetSalePrice={Math.round(vinData.price * 1.08)}
                  turnTime={vinData.daysOnLot ?? 0}
                  marketAverage={vinData.price}
                  marketHigh={Math.round(vinData.price * 1.05)}
                  marketLow={Math.round(vinData.price * 0.95)}
                  velocity={85}
                  projectedTurn={30}
                  sourcingIntel="Inventory unit. Review valuation for market position."
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
