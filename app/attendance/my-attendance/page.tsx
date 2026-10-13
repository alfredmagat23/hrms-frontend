"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, todayIso } from "@/lib/domain/dates";
import { listMyAttendance } from "@/lib/services/attendance-service";
import { useSession } from "@/lib/session/session-context";

function startOfWeek(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function hoursFromRecord(r: {
  timeIn: string | null;
  timeOut: string | null;
  status: string;
}): { scheduled: number; tracked: number | null } {
  const scheduled = 8;
  if (!r.timeIn || !r.timeOut) return { scheduled, tracked: null };
  const [ih, im] = r.timeIn.split(":").map(Number);
  const [oh, om] = r.timeOut.split(":").map(Number);
  const mins = oh * 60 + om - (ih * 60 + im) - 60;
  return { scheduled, tracked: Math.max(0, Math.round((mins / 60) * 100) / 100) };
}

export default function HrMyAttendancePage() {
  const { ready, user } = useSession();
  const [anchor, setAnchor] = useState(() => startOfWeek(todayIso()));
  const [frame, setFrame] = useState<"week" | "2weeks">("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<
    Extract<Awaited<ReturnType<typeof listMyAttendance>>, { ok: true }>["data"]
  >([]);

  const range = useMemo(() => {
    const days = frame === "week" ? 6 : 13;
    return { startDate: anchor, endDate: addDays(anchor, days) };
  }, [anchor, frame]);

  useEffect(() => {
    if (!ready) return;
    if (!user?.employeeId) {
      setLoading(false);
      setRecords([]);
      setError("");
      return;
    }
    setLoading(true);
    void listMyAttendance(range).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError("");
      setRecords(res.data);
    });
  }, [ready, user?.employeeId, range]);

  const totals = useMemo(() => {
    let scheduled = 0;
    let tracked = 0;
    for (const r of records) {
      const h = hoursFromRecord(r);
      scheduled += h.scheduled;
      if (h.tracked != null) tracked += h.tracked;
    }
    return { scheduled, tracked };
  }, [records]);

  const periodLabel = `${range.startDate} – ${range.endDate}`;

  return (
    <AppShell title="My Attendance">
      <div className="space-y-4">
        <DemoNotice>
          Biometric / imported mock punches only. No browser geolocation or live
          clock-in.
        </DemoNotice>
        {!user?.employeeId ? (
          <EmptyState
            title="No employee profile is linked to this demo account. My Attendance is available only to users with an employee profile."
          />
        ) : (
          <Tabs defaultValue="schedule">
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="submission">Submission</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous period"
                  onClick={() =>
                    setAnchor(addDays(anchor, frame === "week" ? -7 : -14))
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <p className="text-sm font-medium">{periodLabel}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Next period"
                  onClick={() =>
                    setAnchor(addDays(anchor, frame === "week" ? 7 : 14))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Select
                  value={frame}
                  onValueChange={(v) => setFrame(v as "week" | "2weeks")}
                >
                  <SelectTrigger className="w-40" aria-label="Time frame">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="2weeks">Two weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled {totals.scheduled.toFixed(1)}h · Tracked{" "}
                {totals.tracked.toFixed(1)}h
              </p>
              {loading ? <LoadingBlock /> : null}
              {error ? <ErrorState message={error} /> : null}
              {!loading && records.length === 0 ? (
                <EmptyState title="No attendance in this period" />
              ) : null}
              {records.length > 0 ? (
                <>
                  <div className="hidden overflow-x-auto rounded-lg border md:block">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="p-3 font-medium">Date</th>
                          <th className="p-3 font-medium">Scheduled Hours</th>
                          <th className="p-3 font-medium">Hours Tracked</th>
                          <th className="p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {records.map((r) => {
                          const h = hoursFromRecord(r);
                          return (
                            <tr key={r.date}>
                              <td className="p-3">{r.date}</td>
                              <td className="p-3">{h.scheduled.toFixed(1)}</td>
                              <td className="p-3">
                                {h.tracked == null ? "—" : h.tracked.toFixed(1)}
                              </td>
                              <td className="p-3">
                                <StatusBadge
                                  label={r.statusLabel}
                                  tone="neutral"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ul className="space-y-2 md:hidden">
                    {records.map((r) => {
                      const h = hoursFromRecord(r);
                      return (
                        <li
                          key={r.date}
                          className="rounded-lg border bg-card p-3 text-sm"
                        >
                          <p className="font-medium">{r.date}</p>
                          <p className="text-muted-foreground">
                            Scheduled {h.scheduled.toFixed(1)}h · Tracked{" "}
                            {h.tracked == null ? "—" : `${h.tracked.toFixed(1)}h`}
                          </p>
                          <div className="mt-2">
                            <StatusBadge label={r.statusLabel} tone="neutral" />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </TabsContent>
            <TabsContent value="submission">
              <EmptyState
                title="No correction requests"
                description="Read-only demo list. Attendance correction workflows are not implemented."
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}
