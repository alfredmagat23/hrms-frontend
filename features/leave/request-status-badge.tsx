import { StatusBadge } from "@/components/shared/page-states";

export function leaveStatusTone(
  status: "Pending" | "Approved" | "Rejected",
): "warning" | "success" | "danger" | "neutral" {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "danger";
  return "warning";
}

export function LeaveRequestStatusBadge({
  overallStatus,
  currentStageLabel,
}: {
  overallStatus: "Pending" | "Approved" | "Rejected";
  currentStageLabel: string;
}) {
  const label =
    overallStatus === "Pending" ? currentStageLabel : overallStatus;
  return <StatusBadge label={label} tone={leaveStatusTone(overallStatus)} />;
}
