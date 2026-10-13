import { describe, expect, it } from "vitest";

import { computeAttendanceRecord } from "@/lib/domain/attendance";
import type { Holiday, LeaveRequest, Shift } from "@/lib/domain/types";

const shift: Shift = {
  id: "shift-std",
  name: "Standard 9–6",
  start: "09:00",
  graceEnd: "09:15",
  lunchStart: "12:00",
  lunchEnd: "13:00",
  end: "18:00",
  workDays: [1, 2, 3, 4, 5],
};

function punch(hhmm: string, date = "2026-10-08") {
  return {
    id: `p-${hhmm}`,
    employeeId: "emp-1",
    companyId: "co-aug",
    timestamp: `${date}T${hhmm}:00`,
    source: "mock" as const,
  };
}

describe("attendance calculations", () => {
  it("treats 09:15 as on time", () => {
    const record = computeAttendanceRecord({
      employeeId: "emp-1",
      companyId: "co-aug",
      date: "2026-10-08",
      shift,
      punches: [punch("09:15"), punch("18:00")],
      holidays: [],
      leaveRequests: [],
    });
    expect(record.status).toBe("on_time");
    expect(record.lateMinutes).toBe(0);
  });

  it("treats 09:16 as 16 minutes late", () => {
    const record = computeAttendanceRecord({
      employeeId: "emp-1",
      companyId: "co-aug",
      date: "2026-10-08",
      shift,
      punches: [punch("09:16"), punch("18:00")],
      holidays: [],
      leaveRequests: [],
    });
    expect(record.status).toBe("late");
    expect(record.lateMinutes).toBe(16);
  });

  it("creates undertime when leaving before 18:00", () => {
    const record = computeAttendanceRecord({
      employeeId: "emp-1",
      companyId: "co-aug",
      date: "2026-10-08",
      shift,
      punches: [punch("09:00"), punch("17:30")],
      holidays: [],
      leaveRequests: [],
    });
    expect(record.status).toBe("undertime");
    expect(record.undertimeMinutes).toBe(30);
  });

  it("does not calculate late/undertime on half-day leave", () => {
    const leave: LeaveRequest = {
      id: "lr-1",
      employeeId: "emp-1",
      companyId: "co-aug",
      leaveTypeId: "lt-vl",
      startDate: "2026-10-08",
      endDate: "2026-10-08",
      portion: "am",
      reason: "Half day",
      filedAt: "2026-10-01T00:00:00",
      duration: { workingDays: 0.5, excludedDates: [] },
      stages: [
        { key: "manager", order: 1, status: "approved" },
        { key: "hr", order: 2, status: "approved" },
        { key: "head_hr", order: 3, status: "approved" },
      ],
      timeline: [],
    };
    const record = computeAttendanceRecord({
      employeeId: "emp-1",
      companyId: "co-aug",
      date: "2026-10-08",
      shift,
      punches: [punch("13:05"), punch("18:00")],
      holidays: [] as Holiday[],
      leaveRequests: [leave],
    });
    expect(record.calculationPending).toBe(true);
    expect(record.lateMinutes).toBeNull();
    expect(record.undertimeMinutes).toBeNull();
    expect(record.statusLabel).toContain(
      "Not calculated — rule pending HR confirmation",
    );
  });
});
