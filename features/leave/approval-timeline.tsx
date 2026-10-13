import type { ApprovalStage, ApprovalTimelineEntry } from "@/lib/domain/types";

const STAGE_LABELS: Record<string, string> = {
  manager: "Manager",
  hr: "HR",
  head_hr: "Head of HR",
};

export function ApprovalTimeline({
  stages,
  timeline,
}: {
  stages: ApprovalStage[];
  timeline: ApprovalTimelineEntry[];
}) {
  return (
    <div className="space-y-4">
      <ol className="space-y-2" aria-label="Approval stages">
        {stages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((stage) => (
            <li
              key={stage.key}
              className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
            >
              <span className="font-medium">{STAGE_LABELS[stage.key] ?? stage.key}</span>
              <StageStatus status={stage.status} />
            </li>
          ))}
      </ol>
      {timeline.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Activity</h3>
          <ul className="space-y-3 border-l-2 pl-4">
            {timeline.map((entry, i) => (
              <li key={`${entry.at}-${i}`} className="text-sm">
                <p className="font-medium">
                  {STAGE_LABELS[entry.stageKey] ?? entry.stageKey} —{" "}
                  {actionLabel(entry.action)}
                  {entry.isSimulated ? " (demo)" : ""}
                </p>
                <p className="text-muted-foreground">
                  {formatWhen(entry.at)}
                  {entry.actorName ? ` · ${entry.actorName}` : ""}
                </p>
                {entry.comment ? (
                  <p className="mt-1 text-muted-foreground">{entry.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function StageStatus({ status }: { status: ApprovalStage["status"] }) {
  const labels: Record<ApprovalStage["status"], string> = {
    waiting: "Waiting",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span className="text-muted-foreground capitalize">{labels[status]}</span>
  );
}

function actionLabel(action: ApprovalTimelineEntry["action"]): string {
  if (action === "simulated_manager_approval") return "Simulated approval";
  if (action === "approved") return "Approved";
  return "Rejected";
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
