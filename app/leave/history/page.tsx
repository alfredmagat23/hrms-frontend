"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { LeaveRequestStatusBadge } from "@/features/leave/request-status-badge";
import { listMyRequests } from "@/lib/services/leave-service";
import { useSession } from "@/lib/session/session-context";

export default function EmployeeLeaveHistoryPage() {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<
    Extract<Awaited<ReturnType<typeof listMyRequests>>, { ok: true }>["data"]
  >([]);

  function load() {
    setLoading(true);
    void listMyRequests().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setRequests(res.data);
    });
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  return (
    <AppShell title="Request History">
      {!ready || loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          action={
            <Button asChild>
              <Link href="/leave/request">Request time off</Link>
            </Button>
          }
        />
      ) : null}
      {requests.length > 0 ? (
        <ul className="divide-y rounded-lg border bg-card">
          {requests.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/leave/history/${r.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {r.leaveTypeName}
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
