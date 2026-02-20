"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  variant: "inspection" | "test-drive" | "signing";
  timeRange?: string;
  attendee?: string;
  description?: string;
}

const VARIANT_STYLES = {
  inspection: "bg-blue-100 text-blue-700",
  "test-drive": "bg-emerald-100 text-emerald-700",
  signing: "bg-amber-100 text-amber-700",
} as const;

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export interface AppointmentsCalendarProps {
  events: CalendarEvent[];
  onSyncClick?: () => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
}

export function AppointmentsCalendar({
  events,
  onSyncClick,
  onEventClick,
  onEventDelete,
  onDateClick,
}: AppointmentsCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"monthly" | "weekly">("monthly");
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  type Cell = { day: number; month: number; year: number; isCurrentMonth: boolean };

  const { monthLabel, weeks, weekLabel, currentWeek } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const prevMonthLast = new Date(year, month, 0).getDate();

    const cells: Cell[] = [];
    const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      if (i < startPad) {
        const day = prevMonthLast - startPad + i + 1;
        cells.push({
          day,
          month: month === 0 ? 11 : month - 1,
          year: month === 0 ? year - 1 : year,
          isCurrentMonth: false,
        });
      } else if (i < startPad + daysInMonth) {
        const day = i - startPad + 1;
        cells.push({ day, month, year, isCurrentMonth: true });
      } else {
        const day = i - startPad - daysInMonth + 1;
        cells.push({
          day,
          month: month === 11 ? 0 : month + 1,
          year: month === 11 ? year + 1 : year,
          isCurrentMonth: false,
        });
      }
    }

    const weekRows: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekRows.push(cells.slice(i, i + 7));
    }

    const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const viewDay = viewDate.getDate();
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    
    let weekIndex = 0;
    for (let i = 0; i < weekRows.length; i++) {
      const week = weekRows[i];
      const weekStart = new Date(week[0].year, week[0].month, week[0].day);
      const weekEnd = new Date(week[6].year, week[6].month, week[6].day);
      const viewDateObj = new Date(viewYear, viewMonth, viewDay);
      if (viewDateObj >= weekStart && viewDateObj <= weekEnd) {
        weekIndex = i;
        break;
      }
    }
    const currentWeekCells = weekRows[weekIndex] || weekRows[0] || [];

    const weekStart = currentWeekCells[0];
    const weekEnd = currentWeekCells[6];
    const weekStartDate = new Date(weekStart.year, weekStart.month, weekStart.day);
    const weekEndDate = new Date(weekEnd.year, weekEnd.month, weekEnd.day);

    const weekLabel =
      weekStartDate.getMonth() === weekEndDate.getMonth()
        ? `${weekStartDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEndDate.toLocaleDateString("en-US", {
            day: "numeric",
            year: "numeric",
          })}`
        : `${weekStartDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEndDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`;

    return {
      monthLabel,
      weeks: weekRows,
      weekLabel,
      currentWeek: currentWeekCells,
    };
  }, [viewDate]);

  const today = new Date();
  const isToday = (cell: Cell) =>
    cell.isCurrentMonth &&
    cell.day === today.getDate() &&
    cell.month === today.getMonth() &&
    cell.year === today.getFullYear();

  const getEventsForDay = (cell: Cell) =>
    events.filter(
      (e) =>
        e.date.getDate() === cell.day &&
        e.date.getMonth() === cell.month &&
        e.date.getFullYear() === cell.year,
    );

  const prevPeriod = () => {
    if (viewMode === "weekly") {
      setViewDate((d) => new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "weekly") {
      setViewDate((d) => new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
    }
  };

  const handleDateClick = (cell: Cell) => {
    const clickedDate = new Date(cell.year, cell.month, cell.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate >= today) {
      onDateClick?.(clickedDate);
    }
  };

  const displayWeeks = viewMode === "weekly" ? [currentWeek] : weeks;
  const displayLabel = viewMode === "weekly" ? weekLabel : monthLabel;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={prevPeriod}
            aria-label={`Previous ${viewMode === "weekly" ? "week" : "month"}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-lg font-semibold text-slate-900">
            {displayLabel}
          </h2>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={nextPeriod}
            aria-label={`Next ${viewMode === "weekly" ? "week" : "month"}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "weekly"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              Weekly
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncClick}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" aria-hidden />
            Sync with Google/Outlook
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] table-fixed">
          <thead>
            <tr>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayWeeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((cell, di) => {
                  const dayEvents = getEventsForDay(cell);
                  const cellDate = new Date(cell.year, cell.month, cell.day);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  cellDate.setHours(0, 0, 0, 0);
                  const isFuture = cellDate >= today;
                  const isPast = cellDate < today;

                  return (
                    <td
                      key={di}
                      className={cn(
                        "group border-t border-slate-100 p-2 align-top",
                        isToday(cell) && "bg-blue-50",
                        isFuture && "cursor-pointer hover:bg-slate-50 transition-colors",
                      )}
                      onClick={() => {
                        if (isFuture && onDateClick) {
                          handleDateClick(cell);
                        }
                      }}
                    >
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
                          isToday(cell)
                            ? "bg-blue-600 text-white"
                            : isFuture
                              ? "text-slate-700 hover:bg-blue-100"
                              : cell.isCurrentMonth
                                ? "text-slate-400"
                                : "text-slate-300",
                        )}
                      >
                        {cell.day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={cn(
                              "group relative flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium cursor-pointer transition-all",
                              VARIANT_STYLES[ev.variant],
                              hoveredEventId === ev.id && "ring-2 ring-blue-500",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick?.(ev);
                            }}
                            onMouseEnter={() => setHoveredEventId(ev.id)}
                            onMouseLeave={() => setHoveredEventId(null)}
                          >
                            <span className="flex-1 truncate">{ev.title}</span>
                            {onEventDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventDelete(ev.id);
                                }}
                                className={cn(
                                  "opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-black/10",
                                  "focus:opacity-100 focus:outline-none",
                                )}
                                aria-label={`Delete ${ev.title}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {isFuture && dayEvents.length === 0 && (
                          <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Click to add event
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
