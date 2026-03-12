"use client";

import { Calendar, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppointmentsCalendar } from "./AppointmentsCalendar";
import { EventCard } from "./EventCard";
import { AvailabilityOverview } from "./AvailabilityOverview";
import type { CalendarEvent } from "./AppointmentsCalendar";
import type { SlotAvailability } from "./AvailabilityOverview";

export interface AppointmentsTabContentProps {
  vehicleName: string;
  events: CalendarEvent[];
  upcomingEvents: Array<{
    title: string;
    relativeLabel: string;
    date: string;
    timeRange: string;
    attendee?: string;
  }>;
  availability: SlotAvailability[];
  nylasGrantId?: string | null;
  onNewEvent?: () => void;
  onSyncCalendar?: () => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
}

export function AppointmentsTabContent({
  vehicleName,
  events,
  upcomingEvents,
  availability,
  nylasGrantId,
  onNewEvent,
  onSyncCalendar,
  onEventClick,
  onEventDelete,
  onDateClick,
}: AppointmentsTabContentProps) {
  const hasCalendarConnected = Boolean(nylasGrantId) && nylasGrantId !== "null";

  const handleSyncClick = () => {
    // Open Nylas OAuth in a popup
    const clientId = "65bd4172-65e0-4b5a-b1db-5bdfaffb02f2";
    const redirectUri = encodeURIComponent("http://localhost:3000/oauth/exchange");
    const nylasAuthUrl = `https://api.us.nylas.com/v3/connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&access_type=online`;
    
    const popup = window.open(
      nylasAuthUrl,
      "nylas-oauth",
      "width=500,height=600,left=100,top=100,resizable=yes,scrollbars=yes"
    );

    if (!popup) {
      toast.error("Popup blocked. Please allow popups for this site.");
      return;
    }

    // Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === "NYLAS_AUTH_SUCCESS") {
        window.removeEventListener("message", handleMessage);
        onSyncCalendar?.();
      } else if (event.data?.type === "NYLAS_AUTH_ERROR") {
        window.removeEventListener("message", handleMessage);
        toast.error(event.data.error || "Failed to connect calendar");
      }
    };

    window.addEventListener("message", handleMessage);
  };

  if (!hasCalendarConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12">
        <Calendar className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          Calendar Not Connected
        </h3>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          Connect your Google or Outlook calendar to schedule and manage appointments
          with sellers for {vehicleName}.
        </p>
        <Button
          className="mt-6 gap-2 bg-gray-800 hover:bg-gray-900 text-white"
          onClick={handleSyncClick}
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Sync with Google/Outlook
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 min-w-0">
        <AppointmentsCalendar
          events={events}
          onSyncClick={onSyncCalendar}
          onEventClick={onEventClick}
          onEventDelete={onEventDelete}
          onDateClick={onDateClick}
        />
      </div>

      <aside className="w-full space-y-6 lg:w-80 lg:shrink-0">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Upcoming Events
            </h3>
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Specific to {vehicleName}
          </p>
          <div className="space-y-3">
            {upcomingEvents.map((ev, i) => (
              <EventCard
                key={i}
                title={ev.title}
                relativeLabel={ev.relativeLabel}
                date={ev.date}
                timeRange={ev.timeRange}
                attendee={ev.attendee}
              />
            ))}
          </div>
        </div>

        <AvailabilityOverview slots={availability} />

        <Button
          className="w-full gap-2 bg-gray-800 hover:bg-gray-900 text-white"
          onClick={onNewEvent}
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Vehicle Event
        </Button>
      </aside>
    </div>
  );
}
