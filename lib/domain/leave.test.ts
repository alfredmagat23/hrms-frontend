import { describe, expect, it } from "vitest";

import {
  availableBalance,
  calculateLeaveDuration,
  validateLeaveInput,
} from "@/lib/domain/leave";
import type { Holiday, LeaveRequest } from "@/lib/domain/types";

const holidays: Holiday[] = [
  {
    id: "h1",
    date: "2026-10-09",
    name: "Sample Holiday",
    companyId: "co-aug",
    isSample: true,
  },
];

describe("leave duration", () => {
  it("excludes weekends and company holidays", () => {
    // Fri 2026-10-09 holiday, Sat/Sun weekend, Mon working
    const result = calculateLeaveDuration({
      startDate: "2026-10-09",
      endDate: "2026-10-12",
      portion: "whole",
      holidays,
    });
    expect(result.workingDays).toBe(1);
    expect(result.excludedDates.map((e) => e.date)).toEqual([
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
  });

  it("counts AM and PM half-days as 0.5", () => {
    const am = calculateLeaveDuration({
      startDate: "2026-10-08",
      endDate: "2026-10-08",
      portion: "am",
      holidays: [],
    });
    const pm = calculateLeaveDuration({
      startDate: "2026-10-08",
      endDate: "2026-10-08",
      portion: "pm",
      holidays: [],
    });
    expect(am.workingDays).toBe(0.5);
    expect(pm.workingDays).toBe(0.5);
  });

  it("rejects half-day across a date range", () => {
    const errors = validateLeaveInput({
      startDate: "2026-10-07",
      endDate: "2026-10-08",
      portion: "am",
      reason: "Need half day",
      available: 5,
      holidays: [],
      existing: [],
    });
    expect(errors.some((e) => e.field === "portion")).toBe(true);
  });

  it("computes available as entitled - used - pending", () => {
    expect(availableBalance(15, 2, 1.5)).toBe(11.5);
  });
});

describe("leave validation balance", () => {
  it("blocks when request exceeds available", () => {
    const existing: LeaveRequest[] = [];
    const errors = validateLeaveInput({
      startDate: "2026-10-08",
      endDate: "2026-10-08",
      portion: "whole",
      reason: "Vacation day",
      available: 0,
      holidays: [],
      existing,
    });
    expect(errors.some((e) => e.field === "leaveTypeId")).toBe(true);
  });
});
