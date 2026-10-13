"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { ErrorState, LoadingBlock } from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { ApprovalTimeline } from "@/features/leave/approval-timeline";
import { LeaveRequestStatusBadge } from "@/features/leave/request-status-badge";
import { getMyRequest } from "@/lib/services/leave-service";
import { useSession } from "@/lib/session/session-context";

export default function EmployeeLeaveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<
    Extract<Awaited<ReturnType<typeof getMyRequest>>, { ok: true }>["data"] | null
  >(null);

  const load = useCallback(() => {
    setLoading(true);
    void getMyRequest(id).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setRequest(res.data);
    });
  }, [id]);

  useEffect(() => {
    if (!ready || !id) return;
    load();
  }, [ready, id, load]);

  return (
    <AppShell title="Leave Request">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/leave/history">Back to history</Link>
      </Button>
      {!ready || loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {request ? (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{request.leaveTypeName}</h2>
            <LeaveRequestStatusBadge
              overallStatus={request.overallStatus}
              currentStageLabel={request.currentStageLabel}
            />
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Dates</dt>
              <dd>
                {request.startDate} – {request.endDate} ({request.portionLabel})
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Working days</dt>
              <dd>{request.duration.workingDays}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Reason</dt>
              <dd>{request.reason}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Filed</dt>
              <dd>{new Date(request.filedAt).toLocaleString()}</dd>
            </div>
          </dl>
          <ApprovalTimeline stages={request.stages} timeline={request.timeline} />
        </div>
      ) : null}
    </AppShell>
  );
}
