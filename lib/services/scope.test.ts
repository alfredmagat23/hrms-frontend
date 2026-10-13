import { beforeEach, describe, expect, it } from "vitest";

import { listDailyAttendance } from "@/lib/services/attendance-service";
import { getDashboardScopeProbe } from "@/lib/services/dashboard-service";
import {
  getRequest,
  listBalances,
  listRequests,
} from "@/lib/services/leave-service";
import { getEmployee, listEmployees } from "@/lib/services/people-service";
import { listHolidays } from "@/lib/services/settings-service";
import { resetStore, saveSession } from "@/lib/mock/store";

function signInHr(companyId: string, userId = "usr-hr-aug") {
  saveSession({
    userId,
    roleId: "hr",
    activeCompanyId: companyId,
    signedInAt: new Date().toISOString(),
  });
}

beforeEach(() => {
  resetStore();
});

describe("company scoping", () => {
  it("scopes company-specific HR people list to active company", async () => {
    signInHr("co-aug");
    const aug = await listEmployees();
    expect(aug.ok).toBe(true);
    if (!aug.ok) return;
    expect(aug.data.every((e) => e.companyId === "co-aug")).toBe(true);
    expect(aug.data.some((e) => e.id === "emp-jamie")).toBe(true);
    expect(aug.data.some((e) => e.id === "emp-sam")).toBe(false);
  });

  it("masks unauthorized company assignments on employee details", async () => {
    signInHr("co-aug");
    const result = await getEmployee("emp-jamie");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect("assignments" in result.data).toBe(true);
    if (!("assignments" in result.data)) return;
    const kinds = result.data.assignments.map((a) => a.kind);
    expect(kinds).toContain("active");
    expect(kinds).toContain("additional");

    const additional = result.data.assignments.find(
      (a) => a.kind === "additional",
    );
    expect(additional).toEqual({ kind: "additional" });
    expect(JSON.stringify(additional)).not.toContain("Elburg");
    expect(JSON.stringify(additional)).not.toContain("co-elb");
  });

  it("returns NOT_FOUND for employee outside active company", async () => {
    signInHr("co-aug");
    const result = await getEmployee("emp-sam");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("NOT_FOUND");
  });

  it("scopes leave requests and details", async () => {
    signInHr("co-aug");
    const list = await listRequests();
    expect(list.ok).toBe(true);
    if (!list.ok) return;
    expect(list.data.every((r) => r.companyId === "co-aug")).toBe(true);
    expect(list.data.some((r) => r.id === "lr-sam-pending")).toBe(false);

    const leaked = await getRequest("lr-sam-pending");
    expect(leaked.ok).toBe(false);
    if (!leaked.ok) expect(leaked.error.code).toBe("NOT_FOUND");
  });

  it("scopes leave balances", async () => {
    signInHr("co-aug");
    const result = await listBalances();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.every((b) => b.employeeId !== "emp-sam")).toBe(true);
    expect(result.data.some((b) => b.employeeId === "emp-jamie")).toBe(true);
  });

  it("scopes attendance", async () => {
    signInHr("co-aug");
    const result = await listDailyAttendance({ date: "2026-10-08" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.records.every((r) => r.companyId === "co-aug")).toBe(
      true,
    );
    expect(result.data.records.some((r) => r.employeeId === "emp-sam")).toBe(
      false,
    );
  });

  it("scopes holidays", async () => {
    signInHr("co-aug");
    const aug = await listHolidays();
    expect(aug.ok).toBe(true);
    if (!aug.ok) return;
    expect(aug.data.every((h) => h.companyId === "co-aug")).toBe(true);
    expect(aug.data.some((h) => h.name.includes("IMA"))).toBe(false);

    signInHr("co-ima", "usr-hr-group");
    const ima = await listHolidays();
    expect(ima.ok).toBe(true);
    if (!ima.ok) return;
    expect(ima.data.some((h) => h.name.includes("IMA"))).toBe(true);
  });

  it("scopes dashboard summaries", async () => {
    signInHr("co-aug");
    const aug = await getDashboardScopeProbe();
    expect(aug.ok).toBe(true);
    if (!aug.ok) return;
    expect(aug.data.companyId).toBe("co-aug");

    signInHr("co-elb", "usr-hr-group");
    const elb = await getDashboardScopeProbe();
    expect(elb.ok).toBe(true);
    if (!elb.ok) return;
    expect(elb.data.companyId).toBe("co-elb");
    expect(elb.data.employeeCount).not.toBe(aug.data.employeeCount);
  });

  it("shows switch marker for permitted inactive company assignment", async () => {
    signInHr("co-aug", "usr-hr-group");
    const result = await getEmployee("emp-jamie");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect("assignments" in result.data).toBe(true);
    if (!("assignments" in result.data)) return;
    const switchView = result.data.assignments.find((a) => a.kind === "switch");
    expect(switchView).toMatchObject({
      kind: "switch",
      companyName: "Elburg Shipmanagement Philippines Inc.",
    });
  });
});
