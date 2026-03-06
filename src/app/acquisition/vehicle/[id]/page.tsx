"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import type { ValuationResultsData } from "@/components/valuation/ValuationResultsContent";
import { DetailsTabContent } from "@/components/details/DetailsTabContent";
import { CostAnalysisTabContent } from "@/components/cost-analysis/CostAnalysisTabContent";
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { PriorityFlag } from "@/components/notes/InternalStrategySidebar";
import type {
  ChatMessage,
  ChatAttachment,
} from "@/components/seller-contact/ChatSection";
import {
  EMPTY_EVENTS,
  EMPTY_UPCOMING,
  EMPTY_AVAILABILITY,
  EMPTY_NOTES,
  EMPTY_NEGOTIATION_GOALS,
  EMPTY_PRIORITY_FLAGS,
  EMPTY_CHAT_MESSAGES,
  EMPTY_AI_SUGGESTIONS,
  EMPTY_SELLER_CONTACT,
  EMPTY_SOURCE_INFO,
  EMPTY_SELLER_ACTIONS,
  EMPTY_VEHICLE_IMAGES,
  EMPTY_MARKET_OVERVIEW,
  EMPTY_CONFIGURATION,
  EMPTY_SOURCING_INTEL,
  EMPTY_VALUATION_RESULTS,
} from "@/lib/sample-page-data";

function formatChatTimestamp(): string {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = mins < 10 ? `0${mins}` : mins;
  return `${h}:${m} ${ampm}`;
}

function filesToAttachments(files: File[]): ChatAttachment[] {
  return files.map((f) => ({
    name: f.name,
    size: f.size,
    type: f.type,
    previewUrl: f.type.startsWith("image/")
      ? URL.createObjectURL(f)
      : undefined,
  }));
}

export default function AcquisitionVehiclePage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("details");
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(EMPTY_CHAT_MESSAGES);
  const [events, setEvents] = useState<CalendarEvent[]>(EMPTY_EVENTS);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [notes, setNotes] = useState<DealNote[]>(EMPTY_NOTES);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DealNote | null>(null);
  const [negotiationGoals, setNegotiationGoals] = useState<string[]>(
    EMPTY_NEGOTIATION_GOALS,
  );
  const [priorityFlags, setPriorityFlags] =
    useState<PriorityFlag[]>(EMPTY_PRIORITY_FLAGS);

  const [loadedVin, setLoadedVin] = useState<string | null>(null);
  const [valuationData, setValuationData] =
    useState<ValuationResultsData | null>(null);
  const hasVin = params.id !== "sample-no-vin" || loadedVin !== null;

  const handleFetchValuation = async (vinToFetch: string) => {
    const res = await fetch("/api/vindata/valuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin: vinToFetch, miles: undefined, zip: "" }),
    });
    const text = await res.text();
    const json = text.startsWith("{")
      ? (JSON.parse(text) as { success?: boolean; error?: string })
      : {};
    if (!json.success) {
      throw new Error(json.error ?? "Failed to fetch valuation");
    }
    setValuationData(EMPTY_VALUATION_RESULTS);
    toast.success("Valuation data loaded");
  };

  const handleSendMessage = (message: string, files?: File[]) => {
    const attachments = files ? filesToAttachments(files) : undefined;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        message,
        timestamp: formatChatTimestamp(),
        isOutgoing: true,
        attachments,
      },
    ]);
  };

  const vehicleName = "—";
  const vin = "";
  const trim = "—";
  const mileage = "—";

  const handleVinLoad = async (vinToLoad: string) => {
    const res = await fetch("/api/vindata/valuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin: vinToLoad, miles: undefined, zip: "" }),
    });
    const text = await res.text();
    const json = text.startsWith("{")
      ? (JSON.parse(text) as { success?: boolean; error?: string })
      : {};
    if (!json.success) throw new Error(json.error ?? "Failed to load data");
    toast.success("Vehicle data loaded");
    setLoadedVin(vinToLoad);
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
          e.id === eventData.id
            ? ({ ...eventData, id: e.id } as CalendarEvent)
            : e,
        ),
      );
      toast.success("Event updated successfully");
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event-${Date.now()}`,
      };
      setEvents((prev) => [...prev, newEvent]);
      toast.success("Event created successfully");
    }
    setEventFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate(undefined);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    toast.success("Event deleted successfully");
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
          n.id === noteData.id ? ({ ...noteData, id: n.id } as DealNote) : n,
        ),
      );
      toast.success("Note updated successfully");
    } else {
      const newNote: DealNote = {
        ...noteData,
        id: `note-${Date.now()}`,
      };
      setNotes((prev) => [newNote, ...prev]);
      toast.success("Note added successfully");
    }
    setNoteFormOpen(false);
    setSelectedNote(null);
  };

  const handleNoteDelete = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.success("Note deleted successfully");
  };

  const handleTagMember = () => {
    toast.info("Tag member feature coming soon");
  };

  const handleSaveStrategy = (data: {
    maxBidLimit: string;
    reconBudget: string;
    exitStrategy: string;
    priorityFlags: PriorityFlag[];
  }) => {
    setPriorityFlags(data.priorityFlags);
    toast.success("Strategy saved successfully");
  };

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="ml-64 flex min-h-screen flex-col">
          <VehicleDetailHeader
            vehicleName={vehicleName}
            status={hasVin ? "IN DISCOVERY" : "VIN MISSING"}
            statusVariant={hasVin ? "default" : "vinMissing"}
            vin={hasVin ? (loadedVin ?? vin) : undefined}
            trim={trim}
            mileage={mileage}
            targetOffer="—"
            backHref="/acquisition-search"
            onMoveToNegotiate={() => {}}
          />

          <VehicleDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 p-6">
            {activeTab === "appointments" && (
              <>
                <AppointmentsTabContent
                  vehicleName={vehicleName}
                  events={events}
                  upcomingEvents={getUpcomingEvents()}
                  availability={EMPTY_AVAILABILITY}
                  onNewEvent={handleNewEvent}
                  onSyncCalendar={() => {
                    toast.info("Calendar sync feature coming soon");
                  }}
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
            {activeTab === "details" && (
              <DetailsTabContent
                hasVin={hasVin}
                images={EMPTY_VEHICLE_IMAGES}
                marketOverview={hasVin ? EMPTY_MARKET_OVERVIEW : undefined}
                configuration={hasVin ? EMPTY_CONFIGURATION : []}
                location="—"
                distance="—"
                sourcingIntel={EMPTY_SOURCING_INTEL}
                onVinLoad={hasVin ? undefined : handleVinLoad}
              />
            )}
            {activeTab === "valuation" && (
              <ValuationTabContent
                defaultVin={vin}
                valuationData={valuationData}
                onFetchValuation={handleFetchValuation}
              />
            )}
            {activeTab === "seller" && (
              <SellerContactTabContent
                contactName="—"
                contactInitials="—"
                contactStatus="offline"
                messages={chatMessages}
                aiSuggestions={EMPTY_AI_SUGGESTIONS}
                contactInfo={EMPTY_SELLER_CONTACT}
                sourceInfo={EMPTY_SOURCE_INFO}
                actions={EMPTY_SELLER_ACTIONS}
                aiAnalyzingText="—"
                onSendMessage={handleSendMessage}
                onSuggestionClick={() => {}}
                onLogActivity={() => {}}
                onActionClick={() => {}}
              />
            )}
            {activeTab === "notes" && (
              <>
                <NotesTabContent
                  notes={notes}
                  negotiationGoals={negotiationGoals}
                  maxBidLimit="—"
                  reconBudget="—"
                  totalAllInCost="—"
                  exitStrategy="—"
                  priorityFlags={priorityFlags}
                  onAddNote={handleNewNote}
                  onTagMember={handleTagMember}
                  onNoteEdit={handleNoteEdit}
                  onNoteDelete={handleNoteDelete}
                  onSaveStrategy={handleSaveStrategy}
                />
                <NoteFormModal
                  open={noteFormOpen}
                  onOpenChange={setNoteFormOpen}
                  note={selectedNote}
                  onSave={handleNoteSave}
                />
              </>
            )}

            {activeTab === "cost-analysis" && (
              <div className="pb-24">
                <CostAnalysisTabContent
                  purchasePrice={0}
                  buyerFee={0}
                  shipping={0}
                  otherFees={0}
                  targetSalePrice={0}
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
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
