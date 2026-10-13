import { isWeekend, minutesBetween, todayIso } from "@/lib/domain/dates";
import type {
  AttendancePunch,
  AttendanceRecord,
  AttendanceStatus,
  Holiday,
  LeavePortion,
  LeaveRequest,
  Shift,
} from "@/lib/domain/types";
import { overallStatus } from "@/lib/domain/leave";

export interface ComputeAttendanceInput {
  employeeId: string;
  companyId: string;
  date: string;
  shift: Shift;
  punches: AttendancePunch[];
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
}

function hhmmFromIso(timestamp: string): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function approvedLeaveForDate(
  requests: LeaveRequest[],
  employeeId: string,
  companyId: string,
  date: string,
): LeaveRequest | null {
  return (
    requests.find((req) => {
      if (req.employeeId !== employeeId || req.companyId !== companyId) {
        return false;
      }
      if (overallStatus(req) !== "Approved") return false;
      return req.startDate <= date && date <= req.endDate;
    }) ?? null
  );
}

function statusLabel(
  status: AttendanceStatus,
  halfDay: LeavePortion | null,
): string {
  switch (status) {
    case "on_time":
      return "On time";
    case "late":
      return "Late";
    case "undertime":
      return "Undertime";
    case "late_undertime":
      return "Late + Undertime";
    case "absent":
      return "Absent";
    case "missing_in":
      return "Missing time-in";
    case "missing_out":
      return "Missing time-out";
    case "in_progress":
      return "In progress";
    case "holiday":
      return "Holiday";
    case "on_leave":
      return halfDay === "am"
        ? "On leave (AM)"
        : halfDay === "pm"
          ? "On leave (PM)"
          : "On leave";
    case "rest_day":
      return "Rest day";
    case "half_day_leave":
      return halfDay === "am" ? "On leave (AM)" : "On leave (PM)";
    default:
      return status;
  }
}

export function computeAttendanceRecord(
  input: ComputeAttendanceInput,
): AttendanceRecord {
  const { employeeId, companyId, date, shift, punches, holidays, leaveRequests } =
    input;
  const scheduledShift = `${shift.name} (${shift.start}–${shift.end})`;
  const base = {
    employeeId,
    companyId,
    date,
    scheduledShift,
    timeIn: null as string | null,
    timeOut: null as string | null,
    lateMinutes: null as number | null,
    undertimeMinutes: null as number | null,
    halfDayLeave: null as LeavePortion | null,
    calculationPending: false,
  };

  const holiday = holidays.find((h) => h.date === date && h.companyId === companyId);
  if (holiday) {
    const status: AttendanceStatus = "holiday";
    return {
      ...base,
      status,
      statusLabel: `${statusLabel(status, null)} — ${holiday.name}`,
    };
  }

  const leave = approvedLeaveForDate(leaveRequests, employeeId, companyId, date);
  if (leave && leave.portion === "whole") {
    const status: AttendanceStatus = "on_leave";
    return {
      ...base,
      status,
      statusLabel: statusLabel(status, "whole"),
    };
  }

  if (isWeekend(date) || !shift.workDays.includes(new Date(date + "T12:00:00").getDay())) {
    const status: AttendanceStatus = "rest_day";
    return { ...base, status, statusLabel: statusLabel(status, null) };
  }

  const dayPunches = punches
    .filter(
      (p) =>
        p.employeeId === employeeId &&
        p.companyId === companyId &&
        p.timestamp.slice(0, 10) === date,
    )
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const timeIn = dayPunches[0] ? hhmmFromIso(dayPunches[0].timestamp) : null;
  const timeOut =
    dayPunches.length > 1
      ? hhmmFromIso(dayPunches[dayPunches.length - 1].timestamp)
      : null;

  // Half-day leave: display only — do not claim late/undertime policy.
  if (leave && (leave.portion === "am" || leave.portion === "pm")) {
    const status: AttendanceStatus = "half_day_leave";
    return {
      ...base,
      timeIn,
      timeOut,
      halfDayLeave: leave.portion,
      calculationPending: true,
      lateMinutes: null,
      undertimeMinutes: null,
      status,
      statusLabel: `${statusLabel(status, leave.portion)} — Not calculated — rule pending HR confirmation`,
    };
  }

  if (!timeIn && !timeOut) {
    const status: AttendanceStatus = "absent";
    return { ...base, status, statusLabel: statusLabel(status, null) };
  }

  if (!timeIn && timeOut) {
    const status: AttendanceStatus = "missing_in";
    return {
      ...base,
      timeOut,
      status,
      statusLabel: statusLabel(status, null),
    };
  }

  if (timeIn && !timeOut) {
    if (date === todayIso()) {
      const status: AttendanceStatus = "in_progress";
      return {
        ...base,
        timeIn,
        status,
        statusLabel: statusLabel(status, null),
      };
    }
    const status: AttendanceStatus = "missing_out";
    return {
      ...base,
      timeIn,
      status,
      statusLabel: statusLabel(status, null),
    };
  }

  // Confirmed rules: 9:15 on time; 9:16 = 16 min late from 9:00; leave before 6:00 = undertime.
  let lateMinutes = 0;
  if (timeIn! > shift.graceEnd) {
    lateMinutes = minutesBetween(shift.start, timeIn!);
  }

  let undertimeMinutes = 0;
  if (timeOut! < shift.end) {
    undertimeMinutes = minutesBetween(timeOut!, shift.end);
  }

  let status: AttendanceStatus = "on_time";
  if (lateMinutes > 0 && undertimeMinutes > 0) status = "late_undertime";
  else if (lateMinutes > 0) status = "late";
  else if (undertimeMinutes > 0) status = "undertime";

  return {
    ...base,
    timeIn,
    timeOut,
    lateMinutes: lateMinutes > 0 ? lateMinutes : 0,
    undertimeMinutes: undertimeMinutes > 0 ? undertimeMinutes : 0,
    status,
    statusLabel: statusLabel(status, null),
  };
}
