"use client";

import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { todayIso } from "@/lib/domain/dates";
import { listDailyAttendance } from "@/lib/services/attendance-service";
import { listEmployees } from "@/lib/services/people-service";
import { listReferenceOptions } from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

export default function HrAttendancePage() {
  const { ready } = useSession();
  const [date, setDate] = useState(todayIso());
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nameById, setNameById] = useState<Map<string, string>>(new Map());
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [payload, setPayload] = useState<
    Extract<Awaited<ReturnType<typeof listDailyAttendance>>, { ok: true }>["data"] | null
  >(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    void listDailyAttendance({
      date,
      departmentId: departmentId || undefined,
      status: status || undefined,
    }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setPayload(res.data);
    });
  }, [date, departmentId, status]);

  useEffect(() => {
    if (!ready) return;
    void Promise.all([listEmployees(), listReferenceOptions()]).then(
      ([emps, refs]) => {
        if (emps.ok) {
          const map = new Map<string, string>();
          for (const e of emps.data) {
            map.set(e.id, `${e.firstName} ${e.lastName}`);
          }
          setNameById(map);
        }
        if (refs.ok) setDepartments(refs.data.departments);
      },
    );
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, load]);

  return (
    <AppShell title="Daily Attendance">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="att-date" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="att-dept" className="text-sm font-medium">
            Department
          </label>
          <Select
            value={departmentId || "all"}
            onValueChange={(v) => setDepartmentId(v === "all" ? "" : v)}
          >
            <SelectTrigger id="att-dept">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="att-status" className="text-sm font-medium">
            Status
          </label>
          <Select
            value={status || "all"}
            onValueChange={(v) => setStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger id="att-status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="on_time">On time</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="half_day_leave">Half-day leave</SelectItem>
              <SelectItem value="on_leave">On leave</SelectItem>
              <SelectItem value="missing_in">Missing in</SelectItem>
              <SelectItem value="missing_out">Missing out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {payload ? (
        <p className="mb-3 text-sm text-muted-foreground">
          Late: {payload.summary.lateCount} ({payload.summary.lateMinutes} min) ·
          Undertime: {payload.summary.undertimeCount} · Missing punches:{" "}
          {payload.summary.missingPunches}
        </p>
      ) : null}
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && payload && payload.records.length === 0 ? (
        <EmptyState title="No records for this date" />
      ) : null}
      {payload && payload.records.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Employee</th>
                <th className="p-3 font-medium">Shift</th>
                <th className="p-3 font-medium">In</th>
                <th className="p-3 font-medium">Out</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payload.records.map((r) => (
                <tr key={`${r.employeeId}-${r.date}`}>
                  <td className="p-3">
                    {nameById.get(r.employeeId) ?? r.employeeId}
                  </td>
                  <td className="p-3">{r.scheduledShift}</td>
                  <td className="p-3">{r.timeIn ?? "—"}</td>
                  <td className="p-3">{r.timeOut ?? "—"}</td>
                  <td className="p-3">
                    <StatusBadge label={r.statusLabel} tone="neutral" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AppShell>
  );
}
