"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CalendarEvent } from "./AppointmentsCalendar";

export interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  onSave: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
}

export function EventFormModal({
  open,
  onOpenChange,
  event,
  selectedDate,
  onSave,
}: EventFormModalProps) {
  const [title, setTitle] = useState("");
  const [variant, setVariant] = useState<"inspection" | "test-drive" | "signing">("inspection");
  const [date, setDate] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [attendee, setAttendee] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setVariant(event.variant);
      const eventDate = event.date;
      setDate(
        `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`,
      );
      setTimeRange(event.timeRange ?? "");
      setAttendee(event.attendee ?? "");
      setDescription(event.description ?? "");
    } else if (selectedDate) {
      const d = selectedDate;
      setDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
      setTitle("");
      setVariant("inspection");
      setTimeRange("");
      setAttendee("");
      setDescription("");
    }
  }, [event, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = date.split("-").map(Number);
    const eventDate = new Date(year, month - 1, day);

    onSave({
      id: event?.id,
      title,
      variant,
      date: eventDate,
      timeRange: timeRange || undefined,
      attendee: attendee || undefined,
      description: description || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Vehicle Inspection"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant">Type *</Label>
            <select
              id="variant"
              value={variant}
              onChange={(e) =>
                setVariant(e.target.value as "inspection" | "test-drive" | "signing")
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="inspection">Inspection</option>
              <option value="test-drive">Test Drive</option>
              <option value="signing">Signing</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Range</Label>
            <Input
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              placeholder="e.g., 09:00 AM - 10:30 AM"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendee">Attendee</Label>
            <Input
              id="attendee"
              value={attendee}
              onChange={(e) => setAttendee(e.target.value)}
              placeholder="e.g., Seller Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
