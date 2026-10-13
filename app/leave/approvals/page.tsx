"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveRequestStatusBadge } from "@/features/leave/request-status-badge";
import { listRequests } from "@/lib/services/leave-service";
import { useSession } from "@/lib/session/session-context";

export default function HrLeaveRequestsPage() {
  const { ready } = useSession();
  const [status, setStatus] = useState("pending_hr");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<
    Extract<Awaited<ReturnType<typeof listRequests>>, { ok: true }>["data"]
  >([]);

  const load = useCallback(() => {
    setLoading(true);
    void listRequests({ status }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setRequests(res.data);
    });
  }, [status]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, load]);

  return (
    <AppShell title="Leave Requests">
      <div className="mb-4 max-w-xs space-y-1">
        <label htmlFor="req-filter" className="text-sm font-medium">
          Filter
        </label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="req-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending_hr">Pending HR</SelectItem>
            <SelectItem value="pending_head">Pending Head of HR</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && requests.length === 0 ? (
        <EmptyState title="No requests in this queue" />
      ) : null}
      {requests.length > 0 ? (
        <ul className="divide-y rounded-lg border bg-card">
          {requests.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/leave/approvals/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.employeeName} — {r.leaveTypeName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {r.startDate} – {r.endDate} · {r.portionLabel} ·{" "}
                    {r.duration.workingDays} day(s)
                  </p>
                </div>
                <LeaveRequestStatusBadge
                  overallStatus={r.overallStatus}
                  currentStageLabel={r.currentStageLabel}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </AppShell>
  );
}
