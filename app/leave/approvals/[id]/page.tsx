"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { DemoNotice, ErrorState, LoadingBlock } from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalTimeline } from "@/features/leave/approval-timeline";
import { LeaveRequestStatusBadge } from "@/features/leave/request-status-badge";
import {
  approveHrStage,
  getRequest,
  rejectHrStage,
} from "@/lib/services/leave-service";
import { useSession } from "@/lib/session/session-context";

export default function HrLeaveRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<
    Extract<Awaited<ReturnType<typeof getRequest>>, { ok: true }>["data"] | null
  >(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    void getRequest(id).then((res) => {
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

  const hrPending =
    request?.stages.find((s) => s.key === "hr")?.status === "pending";

  async function handleApprove() {
    setActing(true);
    const res = await approveHrStage(id);
    setActing(false);
    setApproveOpen(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setRequest(res.data);
  }

  async function handleReject() {
    setRejectError("");
    setActing(true);
    const res = await rejectHrStage(id, rejectReason);
    setActing(false);
    if (!res.ok) {
      setRejectError(res.error.message);
      const fe = res.error.fieldErrors?.find((f) => f.field === "reason");
      if (fe) setRejectError(fe.message);
      return;
    }
    setRejectOpen(false);
    setRejectReason("");
    setRequest(res.data);
  }

  return (
    <AppShell title="Leave Request Review">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/leave/approvals">Back to queue</Link>
      </Button>
      {!ready || loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {request ? (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">
              {request.employeeName} — {request.leaveTypeName}
            </h2>
            <LeaveRequestStatusBadge
              overallStatus={request.overallStatus}
              currentStageLabel={request.currentStageLabel}
            />
          </div>
          {request.stages.find((s) => s.key === "head_hr")?.status ===
          "pending" ? (
            <DemoNotice>
              HR stage complete. This request is now{" "}
              <strong>Pending — Head of HR</strong>. Head-of-HR approval is not
              available in this demo.
            </DemoNotice>
          ) : null}
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
          </dl>
          <ApprovalTimeline stages={request.stages} timeline={request.timeline} />
          {hrPending && request.overallStatus === "Pending" ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setApproveOpen(true)}>Approve (HR)</Button>
              <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm HR approval</DialogTitle>
            <DialogDescription>
              This action is not final approval. After you approve, the request
              moves to <strong>Pending — Head of HR</strong> for final sign-off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button disabled={acting} onClick={() => void handleApprove()}>
              {acting ? "Approving…" : "Confirm approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
            <DialogDescription>
              Provide a reason (at least 10 characters) for the employee.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            aria-label="Rejection reason"
          />
          {rejectError ? (
            <p className="text-sm text-destructive">{rejectError}</p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={acting}
              onClick={() => void handleReject()}
            >
              {acting ? "Rejecting…" : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
