import { eachDate, isWeekend } from "@/lib/domain/dates";
import type {
  ExcludedDate,
  Holiday,
  LeavePortion,
  LeaveRequest,
  LeaveRequestDuration,
  ApprovalStage,
} from "@/lib/domain/types";

export interface DurationInput {
  startDate: string;
  endDate: string;
  portion: LeavePortion;
  holidays: Holiday[];
}

export function calculateLeaveDuration(input: DurationInput): LeaveRequestDuration {
  const { startDate, endDate, portion, holidays } = input;
  const holidayByDate = new Map(holidays.map((h) => [h.date, h]));
  const excludedDates: ExcludedDate[] = [];
  let workingDays = 0;

  for (const date of eachDate(startDate, endDate)) {
    if (isWeekend(date)) {
      excludedDates.push({ date, reason: "weekend" });
      continue;
    }
    const holiday = holidayByDate.get(date);
    if (holiday) {
      excludedDates.push({
        date,
        reason: "holiday",
        holidayName: holiday.name,
      });
      continue;
    }
    workingDays += 1;
  }

  if (portion === "am" || portion === "pm") {
    workingDays = workingDays > 0 ? 0.5 : 0;
  }

  return { workingDays, excludedDates };
}

export function validateLeaveInput(input: {
  startDate: string;
  endDate: string;
  portion: LeavePortion;
  reason: string;
  available: number;
  holidays: Holiday[];
  existing: LeaveRequest[];
}): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];

  if (!input.startDate) {
    errors.push({ field: "startDate", message: "Start date is required." });
  }
  if (!input.endDate) {
    errors.push({ field: "endDate", message: "End date is required." });
  }
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    errors.push({
      field: "endDate",
      message: "End date cannot be before start date.",
    });
  }
  if (
    input.portion !== "whole" &&
    input.startDate &&
    input.endDate &&
    input.startDate !== input.endDate
  ) {
    errors.push({
      field: "portion",
      message: "Half-day leave is limited to a single date.",
    });
  }
  if (!input.reason.trim()) {
    errors.push({ field: "reason", message: "A reason is required." });
  } else if (input.reason.trim().length < 3) {
    errors.push({
      field: "reason",
      message: "Reason must be at least 3 characters.",
    });
  }

  if (errors.length > 0) return errors;

  const duration = calculateLeaveDuration({
    startDate: input.startDate,
    endDate: input.endDate,
    portion: input.portion,
    holidays: input.holidays,
  });

  if (duration.workingDays <= 0) {
    errors.push({
      field: "startDate",
      message: "Request must include at least one working day.",
    });
  }

  if (duration.workingDays > input.available) {
    errors.push({
      field: "leaveTypeId",
      message: `Requested ${duration.workingDays} day(s) exceeds available balance of ${input.available}.`,
    });
  }

  const overlapping = input.existing.some((req) => {
    if (overallStatus(req) === "Rejected") return false;
    return datesOverlap(
      input.startDate,
      input.endDate,
      req.startDate,
      req.endDate,
    );
  });

  if (overlapping) {
    errors.push({
      field: "startDate",
      message: "Dates overlap an existing pending or approved request.",
    });
  }

  return errors;
}

function datesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function createDefaultStages(): ApprovalStage[] {
  return [
    { key: "manager", order: 1, status: "waiting" },
    { key: "hr", order: 2, status: "waiting" },
    { key: "head_hr", order: 3, status: "waiting" },
  ];
}

export function overallStatus(
  request: Pick<LeaveRequest, "stages">,
): "Pending" | "Approved" | "Rejected" {
  if (request.stages.some((s) => s.status === "rejected")) return "Rejected";
  if (request.stages.every((s) => s.status === "approved")) return "Approved";
  return "Pending";
}

export function currentStageLabel(
  request: Pick<LeaveRequest, "stages">,
): string {
  const status = overallStatus(request);
  if (status === "Rejected") return "Rejected";
  if (status === "Approved") return "Approved (final)";
  const pending = request.stages.find((s) => s.status === "pending");
  if (!pending) return "Pending";
  if (pending.key === "manager") return "Pending - Manager";
  if (pending.key === "hr") return "Pending - HR";
  return "Pending - Head of HR";
}

export function availableBalance(
  entitled: number,
  used: number,
  pendingDays: number,
): number {
  return entitled - used - pendingDays;
}

export function portionLabel(portion: LeavePortion): string {
  if (portion === "am") return "AM";
  if (portion === "pm") return "PM";
  return "Full Day";
}
