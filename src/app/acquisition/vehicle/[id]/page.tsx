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
import type { VehicleDetailTabId } from "@/components/acquisition/VehicleDetailTabs";
import type { CalendarEvent } from "@/components/appointments/AppointmentsCalendar";
import type { DealNote } from "@/components/notes/DealNotesSection";
import type { PriorityFlag } from "@/components/notes/InternalStrategySidebar";
import type { ChatMessage, ChatAttachment } from "@/components/seller-contact/ChatSection";

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2024, 10, 7),
    title: "Vehicle Inspection",
    variant: "inspection",
  },
  {
    id: "2",
    date: new Date(2024, 10, 13),
    title: "Test Drive",
    variant: "test-drive",
  },
  {
    id: "3",
    date: new Date(2024, 10, 20),
    title: "Final Signing",
    variant: "signing",
  },
];

const MOCK_UPCOMING = [
  {
    title: "Vehicle Inspection",
    relativeLabel: "IN 2 DAYS",
    date: "Nov 16, 2024",
    timeRange: "09:00 AM - 10:30 AM",
    attendee: "Marcus (Seller)",
  },
  {
    title: "Test Drive",
    relativeLabel: "NEXT WEDNESDAY",
    date: "Nov 20, 2024",
    timeRange: "02:00 PM - 03:00 PM",
  },
  {
    title: "Final Signing",
    relativeLabel: "NOV 20",
    date: "Nov 20, 2024",
    timeRange: "04:30 PM - 05:30 PM",
  },
];

const MOCK_AVAILABILITY = [
  { label: "Morning Slots", available: 4, total: 8 },
  { label: "Afternoon Slots", available: 1, total: 6 },
];

const INITIAL_NOTES: DealNote[] = [
  {
    id: "1",
    authorName: "Joe Dawson",
    authorInitials: "JD",
    role: "ACQUISITION",
    roleVariant: "acquisition",
    timestamp: "10:45 AM Today",
    content:
      "Spoke with seller. Vehicle has one open recall (brake booster). Seller is motivated—moving next week and needs to close quickly. Suggested we schedule inspection for Tuesday.",
    showActions: true,
  },
  {
    id: "2",
    authorName: "Sarah Koenig",
    authorInitials: "SK",
    role: "SERVICE",
    roleVariant: "service",
    timestamp: "Yesterday, 4:20 PM",
    content:
      "Pulled service history. Clean Carfax, no accidents. Last oil change 2 months ago. Recall 22S41 applies—parts available, ~2hr labor for fix.",
    showActions: false,
  },
  {
    id: "3",
    authorName: "Robert Miller",
    authorInitials: "RM",
    role: "MANAGER",
    roleVariant: "manager",
    timestamp: "Oct 24, 2:15 PM",
    content:
      "Market comps support $38.5k–$40k range. With recall as leverage, target $39k. Approve up to $40,250 all-in.",
    showActions: false,
  },
  {
    id: "4",
    authorName: "Alex Chen",
    authorInitials: "AC",
    role: "ACQUISITION",
    roleVariant: "acquisition",
    timestamp: "Oct 23, 11:30 AM",
    content:
      "Initial listing review completed. Vehicle appears well-maintained based on photos. Seller responded quickly to inquiry—good sign for engagement. Need to verify mileage and get VIN for full history check.",
    showActions: false,
  },
  {
    id: "5",
    authorName: "Maria Rodriguez",
    authorInitials: "MR",
    role: "SERVICE",
    roleVariant: "service",
    timestamp: "Oct 22, 3:45 PM",
    content:
      "Reviewed available photos. Exterior looks clean, no visible damage. Interior appears well-kept. Recommend full mechanical inspection before finalizing offer. Check for any aftermarket modifications.",
    showActions: false,
  },
  {
    id: "6",
    authorName: "David Kim",
    authorInitials: "DK",
    role: "MANAGER",
    roleVariant: "manager",
    timestamp: "Oct 21, 9:15 AM",
    content:
      "Approved for acquisition. Budget allocated. Team can proceed with inspection and negotiation. Keep me updated on progress.",
    showActions: false,
  },
];

const MOCK_NEGOTIATION_GOALS = [
  "Anchor at $38.5k based on current market softening.",
  "Use the open recall as a point of negotiation for the $40k ceiling.",
  "Seller is moving next week, so quick cash/closing is our biggest leverage.",
];

const MOCK_PRIORITY_FLAGS: PriorityFlag[] = [
  { id: "high-demand", label: "High Demand Inventory", checked: true },
  { id: "manager-review", label: "Requires Manager Review", checked: false },
  { id: "fast-turn", label: "Fast Turn Potential", checked: true },
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    message:
      "Hi, is this F-150 still available? I saw it on Marketplace.",
    timestamp: "2:45 PM",
    isOutgoing: false,
  },
  {
    id: "2",
    message:
      "Yes it is, Marcus! I'm Joe from the acquisition team. Are you looking to trade or just sell?",
    timestamp: "2:48 PM",
    isOutgoing: true,
  },
  {
    id: "3",
    message: "Just selling. I've got a newer one coming in next week and need the space.",
    timestamp: "3:02 PM",
    isOutgoing: false,
  },
  {
    id: "4",
    message:
      "The truck is in great shape. No accidents, clean title. I've kept up with all the maintenance.",
    timestamp: "3:03 PM",
    isOutgoing: false,
  },
];

const MOCK_AI_SUGGESTIONS = [
  {
    id: "1",
    category: "Maintenance",
    actionText: "Request Service History",
    description:
      "That sounds great. Could you provide a full service history or any records you have from the dealership?",
    icon: "zap" as const,
  },
  {
    id: "2",
    category: "Inventory",
    actionText: "Confirm Availability",
    description:
      "When would be a good time to schedule a quick inspection? We can usually have someone out within 24–48 hours.",
    icon: "check" as const,
  },
  {
    id: "3",
    category: "Next Step",
    actionText: "Schedule Inspection",
    description:
      "I'd like to get our team to take a look at the truck. Are you available Tuesday or Wednesday afternoon?",
    icon: "calendar" as const,
  },
  {
    id: "4",
    category: "Negotiation",
    actionText: "Propose Initial Offer",
    description:
      "Based on the market and condition, we could offer around $38,500. Would that work as a starting point?",
    icon: "tag" as const,
  },
];

const MOCK_SELLER_CONTACT = {
  mobile: "(555) 123-4567",
  email: "m.rodriguez@gmail.com",
  location: "Austin, TX (12 mi away)",
};

const MOCK_SOURCE_INFO = {
  channel: "FB Marketplace",
  created: "Oct 24, 11:32 AM",
  leadId: "#AQ-99120",
};

const MOCK_SELLER_ACTIONS = [
  { id: "share", label: "Share with Manager" },
  { id: "inspection", label: "Request Inspection" },
];

const MOCK_VEHICLE_IMAGES = [
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=300&fit=crop",
];

const MOCK_MARKET_OVERVIEW = {
  currentPrice: "$42,500",
  previousPrice: "$44,000",
  priceDrop: "-$1,500 Price Drop",
  daysOnMarket: "14 Days",
  marketCondition: "Excellent",
  estRecon: "$1,250",
  mmrApi: "$38,200",
  mcApi: "$40,100",
};

const MOCK_CONFIGURATION = [
  { label: "Engine", value: "3.5L V6 EcoBoost" },
  { label: "Transmission", value: "10-Speed Automatic" },
  { label: "Exterior Color", value: "Agate Black Metallic" },
  { label: "Interior Color", value: "Black Leather-Trimmed" },
  { label: "Fuel Economy", value: "18 City / 23 Hwy" },
];

const MOCK_SOURCING_INTEL =
  "This unit is priced $1,200 below national average for this configuration. Estimated retail turn-time: 22 days.";

const MOCK_VALUATION_RESULTS: ValuationResultsData = {
  metrics: {
    daysOnMarket: 14,
    avgMarketDom: 32,
    activeLocal: 12,
    sold90dLocal: 48,
    marketDaysSupply: 22.5,
    consumerInterest: "High",
    consumerInterestPercentile: "85th Percentile Ranking",
  },
  mmr: {
    base_mmr: 36300,
    adjusted_mmr: 36400,
    adjustments: {
      odometer: 620,
      region: -510,
      cr_score: -60,
      color: 0,
    },
    typical_range: { min: 34600, max: 38100 },
    avg_odo: 24688,
    avg_condition: "4.6",
  },
  retail: {
    currentAsking: "$42,500",
    marketAvg: "$44,200",
    belowMarket: "-$1,700 below Market",
    retailMargin: "$4,350",
    priceRank: "4 / 42",
    competitivePositionPercent: 25,
  },
  condition: {
    score: 4.2,
    bars: [
      { label: "Mechanical", value: 4.5, max: 5, rating: "Excellent" },
      { label: "Interior", value: 4, max: 5, rating: "Good" },
    ],
  },
  comparables: [
    { date: "10/24/23", miles: 31200, price: "$41,900" },
    { date: "10/21/23", miles: 28500, price: "$42,500" },
    { date: "10/18/23", miles: 35100, price: "$40,200" },
    { date: "10/14/23", miles: 30000, price: "$41,500" },
    { date: "10/12/23", miles: 33400, price: "$41,200" },
  ],
  marketPosition: {
    sold: [
      { mileage: 31200, price: 41900 },
      { mileage: 28500, price: 42500 },
      { mileage: 35100, price: 40200 },
      { mileage: 30000, price: 41500 },
      { mileage: 33400, price: 41200 },
      { mileage: 27000, price: 43800 },
      { mileage: 38000, price: 39500 },
    ],
    subject: { mileage: 32450, price: 42500, isSubject: true },
  },
};

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
    previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
  }));
}

export default function AcquisitionVehiclePage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("details");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [notes, setNotes] = useState<DealNote[]>(INITIAL_NOTES);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DealNote | null>(null);
  const [negotiationGoals, setNegotiationGoals] = useState<string[]>(MOCK_NEGOTIATION_GOALS);
  const [priorityFlags, setPriorityFlags] = useState<PriorityFlag[]>(MOCK_PRIORITY_FLAGS);

  const [loadedVin, setLoadedVin] = useState<string | null>(null);
  const [valuationData, setValuationData] =
    useState<ValuationResultsData | null>(null);
  const hasVin = params.id !== "sample-no-vin" || loadedVin !== null;

  const handleFetchValuation = async (vinToFetch: string) => {
    const res = await fetch("/api/vindata/valuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin: vinToFetch, miles: 32450, zip: "78701" }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error ?? "Failed to fetch valuation");
    }
    setValuationData(MOCK_VALUATION_RESULTS);
    toast.success("Valuation data fetched successfully");
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

  const vehicleName = "2021 Ford F-150 Lariat";
  const vin = "1FTFW1E84MFA12345";
  const trim = "SuperCrew 4WD";
  const mileage = "32,450 mi";

  const handleVinLoad = async (vinToLoad: string) => {
    const res = await fetch("/api/vindata/valuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin: vinToLoad, miles: 32450, zip: "78701" }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to load data");
    toast.success("Vehicle data loaded successfully");
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
        prev.map((e) => (e.id === eventData.id ? { ...eventData, id: e.id } as CalendarEvent : e)),
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

  const handleNoteSave = (
    noteData: Omit<DealNote, "id"> & { id?: string },
  ) => {
    if (noteData.id) {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteData.id ? { ...noteData, id: n.id } as DealNote : n)),
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
      else relativeLabel = ev.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();

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
            targetOffer="$39,850"
            backHref="/acquisition-search"
            onMoveToNegotiate={() => {}}
          />

          <VehicleDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 p-6">
            {activeTab === "appointments" && (
              <>
                <AppointmentsTabContent
                  vehicleName={vehicleName}
                  events={events}
                  upcomingEvents={getUpcomingEvents()}
                  availability={MOCK_AVAILABILITY}
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
                images={MOCK_VEHICLE_IMAGES}
                marketOverview={hasVin ? MOCK_MARKET_OVERVIEW : undefined}
                configuration={hasVin ? MOCK_CONFIGURATION : []}
                location="San Jose, CA"
                distance="12.4 miles away"
                sourcingIntel={MOCK_SOURCING_INTEL}
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
                contactName="Marcus Rodriguez"
                contactInitials="MR"
                contactStatus="online"
                messages={chatMessages}
                aiSuggestions={MOCK_AI_SUGGESTIONS}
                contactInfo={MOCK_SELLER_CONTACT}
                sourceInfo={MOCK_SOURCE_INFO}
                actions={MOCK_SELLER_ACTIONS}
                aiAnalyzingText="AI analyzing Marcus's messages for intent..."
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
                  maxBidLimit="$40,250"
                  reconBudget="$1,200"
                  totalAllInCost="$41,450"
                  exitStrategy="retail-ready"
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
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
