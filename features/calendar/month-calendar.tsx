"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { portionLabel } from "@/lib/domain/leave";
import type { LeavePortion } from "@/lib/domain/types";

export type CalendarEvent = {
  date: string;
  endDate?: string;
  displayName: string;
  portion: LeavePortion;
  kind: "leave" | "holiday";
  holidayName?: string;
};

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthTitle(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function MonthCalendar({
  month,
  events,
  onMonthChange,
}: {
  month: string;
  events: CalendarEvent[];
  onMonthChange: (month: string) => void;
}) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const startWeekday = firstDay.getDay();
  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const list = byDate.get(ev.date) ?? [];
    list.push(ev);
    byDate.set(ev.date, list);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const agenda = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const header = (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous month"
        onClick={() => onMonthChange(shiftMonth(month, -1))}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <h2 className="text-base font-semibold">{monthTitle(month)}</h2>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next month"
        onClick={() => onMonthChange(shiftMonth(month, 1))}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {header}
      {/* Desktop month grid */}
      <div
        className="hidden grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-sm md:grid"
        role="grid"
        aria-label={`Calendar for ${monthTitle(month)}`}
      >
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="bg-muted px-1 py-2 text-center text-xs font-medium"
            role="columnheader"
          >
            {wd}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-20 bg-card"
                role="gridcell"
              />
            );
          }
          const iso = `${month}-${String(day).padStart(2, "0")}`;
          const dayEvents = byDate.get(iso) ?? [];
          return (
            <div
              key={iso}
              className="min-h-20 bg-card p-1"
              role="gridcell"
              aria-label={`${iso}, ${dayEvents.length} events`}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {day}
              </span>
              <ul className="mt-1 space-y-0.5">
                {dayEvents.map((ev, i) => (
                  <li
                    key={`${iso}-${i}`}
                    className={`rounded px-1 py-0.5 text-[10px] leading-tight sm:text-xs ${
                      ev.kind === "holiday"
                        ? "bg-amber-50 text-amber-950 ring-1 ring-amber-200"
                        : "bg-sky-50 text-sky-950 ring-1 ring-sky-200"
                    }`}
                  >
                    <span className="block truncate font-medium">
                      {ev.displayName}
                    </span>
                    <span className="text-muted-foreground">
                      {portionLabel(ev.portion)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {/* Mobile agenda */}
      <ul className="space-y-2 md:hidden" aria-label="Agenda">
        {agenda.length === 0 ? (
          <li className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No absences or holidays this month.
          </li>
        ) : (
          agenda.map((ev, i) => (
            <li
              key={`${ev.date}-${i}`}
              className="rounded-lg border bg-card p-3 text-sm"
            >
              <p className="font-medium">{ev.displayName}</p>
              <p className="text-muted-foreground">
                {ev.endDate && ev.endDate !== ev.date
                  ? `${ev.date} – ${ev.endDate}`
                  : ev.date}{" "}
                · {portionLabel(ev.portion)}
                {ev.kind === "holiday" ? " · Holiday" : ""}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
