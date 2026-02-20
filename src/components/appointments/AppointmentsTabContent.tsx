"use client";

import { Calendar, Plus } from "lucide-react";
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
  onNewEvent,
  onSyncCalendar,
  onEventClick,
  onEventDelete,
  onDateClick,
}: AppointmentsTabContentProps) {
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
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-500" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Upcoming Events
            </h3>
          </div>
          <p className="mb-4 text-xs text-slate-500">
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
          className="w-full gap-2"
          onClick={onNewEvent}
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Vehicle Event
        </Button>
      </aside>
    </div>
  );
}
