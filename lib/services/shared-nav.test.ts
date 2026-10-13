import { beforeEach, describe, expect, it } from "vitest";

import { hasCapability } from "@/lib/auth/capabilities";
import { SHARED_NAVIGATION, navForRole } from "@/config/navigation";
import { STORE_VERSION } from "@/lib/mock/seed";
import { getStore, resetStore, saveSession } from "@/lib/mock/store";
import { listMyAttendance } from "@/lib/services/attendance-service";
import {
  createExpenseSubmission,
  listExpenseSubmissions,
} from "@/lib/services/expense-service";
import {
  approveHrStage,
  getMyRequest,
  listRequests,
  listTeamCalendar,
  submitRequest,
} from "@/lib/services/leave-service";
import { getEmployee, listEmployees } from "@/lib/services/people-service";

function signIn(
  userId: string,
  roleId: "employee" | "hr",
  companyId: string,
) {
  saveSession({
    userId,
    roleId,
    activeCompanyId: companyId,
    signedInAt: new Date().toISOString(),
  });
}

const SHARED_LABELS = [
  "Home",
  "To-Dos",
  "Team Calendar",
  "People",
  "Documents",
  "Forms",
  "Workflows",
  "Attendance",
  "Expenses",
  "OKR",
];

beforeEach(() => {
  resetStore();
});

describe("Shared navigation", () => {
  it("Employee receives the shared navigation items", () => {
    const items = navForRole("employee");
    expect(items.map((i) => i.label)).toEqual(SHARED_LABELS);
    expect(items).toEqual(SHARED_NAVIGATION);
  });

  it("HR receives the shared navigation items", () => {
    const items = navForRole("hr");
    expect(items.map((i) => i.label)).toEqual(SHARED_LABELS);
    expect(items[0].href).toBe("/home");
  });

  it("Employee cannot see Add Employee, Edit Employee, or Change Status actions", () => {
    expect(hasCapability("employee", "hr.people.create")).toBe(false);
    expect(hasCapability("employee", "hr.people.edit")).toBe(false);
    expect(hasCapability("employee", "hr.people.change_status")).toBe(false);
    expect(hasCapability("hr", "hr.people.create")).toBe(true);
  });
});

describe("People privacy and scope", () => {
  it("Employee People responses contain only approved directory fields", async () => {
    signIn("usr-emp-aug", "employee", "co-aug");
    const list = await listEmployees();
    expect(list.ok).toBe(true);
    if (!list.ok) return;
    expect(list.data.length).toBeGreaterThan(0);
    const row = list.data[0];
    expect("email" in row).toBe(false);
    expect("shiftId" in row).toBe(false);
    expect("statusId" in row).toBe(false);
    expect(row).toHaveProperty("workContact");
    expect(row).toHaveProperty("departmentName");

    const profile = await getEmployee(row.id, row.companyId);
    expect(profile.ok).toBe(true);
    if (!profile.ok) return;
    expect("email" in profile.data).toBe(false);
    expect("assignments" in profile.data).toBe(false);
  });

  it("Employee cannot retrieve another company's employees", async () => {
    signIn("usr-emp-aug", "employee", "co-aug");
    const leaked = await listEmployees({ companyIds: ["co-elb", "co-ima"] });
    expect(leaked.ok).toBe(true);
    if (!leaked.ok) return;
    expect(leaked.data.every((e) => e.companyId === "co-aug")).toBe(true);
    expect(leaked.data.some((e) => e.id === "emp-sam")).toBe(false);
  });

  it("Company HR remains limited to permitted companies", async () => {
    signIn("usr-hr-aug", "hr", "co-aug");
    const leaked = await listEmployees({ companyIds: ["co-elb"] });
    expect(leaked.ok).toBe(true);
    if (!leaked.ok) return;
    expect(leaked.data.every((e) => e.companyId === "co-aug")).toBe(true);
  });

  it("Group HR remains limited to membership companies", async () => {
    signIn("usr-hr-group", "hr", "co-aug");
    const all = await listEmployees();
    expect(all.ok).toBe(true);
    if (!all.ok) return;
    expect(
      all.data.every((e) =>
        ["co-aug", "co-elb", "co-ima"].includes(e.companyId),
      ),
    ).toBe(true);
  });
});

describe("Calendar, attendance, expenses", () => {
  it("Employee Team Calendar is limited to the user's department", async () => {
    signIn("usr-emp-aug", "employee", "co-aug");
    const store = getStore();
    const assignment = store.assignments.find(
      (a) => a.employeeId === "emp-jamie" && a.companyId === "co-aug",
    )!;
    const month = new Date().toISOString().slice(0, 7);
    const cal = await listTeamCalendar(month);
    expect(cal.ok).toBe(true);
    if (!cal.ok) return;
    for (const event of cal.data.filter((e) => e.kind === "leave")) {
      const emp = store.employees.find(
        (e) => `${e.firstName} ${e.lastName}` === event.displayName,
      );
      if (!emp) continue;
      const asg = store.assignments.find(
        (a) => a.employeeId === emp.id && a.companyId === "co-aug",
      );
      expect(asg?.departmentId).toBe(assignment.departmentId);
    }
  });

  it("HR Team Calendar covers the active company", async () => {
    signIn("usr-hr-aug", "hr", "co-aug");
    const month = new Date().toISOString().slice(0, 7);
    const cal = await listTeamCalendar(month);
    expect(cal.ok).toBe(true);
    if (!cal.ok) return;
    expect(Array.isArray(cal.data)).toBe(true);
  });

  it("My Attendance returns only the linked employee's records", async () => {
    signIn("usr-emp-aug", "employee", "co-aug");
    const res = await listMyAttendance();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.every((r) => r.employeeId === "emp-jamie")).toBe(true);
  });

  it("An account without employeeId receives the approved empty state path", async () => {
    signIn("usr-hr-group", "hr", "co-aug");
    const user = getStore().users.find((u) => u.id === "usr-hr-group")!;
    expect(user.employeeId).toBeNull();
    const res = await listMyAttendance();
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.message).toMatch(/No employee profile is linked/);
  });

  it("Expenses returns only the signed-in employee's mock submissions", async () => {
    signIn("usr-emp-aug", "employee", "co-aug");
    const list = await listExpenseSubmissions();
    expect(list.ok).toBe(true);
    if (!list.ok) return;
    expect(list.data.every((e) => e.userId === "usr-emp-aug")).toBe(true);
    expect(list.data.some((e) => e.userId === "usr-hr-aug")).toBe(false);
  });
});

describe("Leave regression and reset", () => {
  it("Existing leave submission and HR approval still work", async () => {
    signIn("usr-emp-aug", "employee", "co-aug");
    const created = await submitRequest({
      leaveTypeId: "lt-vl",
      startDate: "2026-11-10",
      endDate: "2026-11-10",
      portion: "whole",
      reason: "Demo shared-nav regression",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    signIn("usr-hr-aug", "hr", "co-aug");
    const queue = await listRequests({ status: "pending_hr" });
    expect(queue.ok).toBe(true);
    if (!queue.ok) return;
    expect(queue.data.some((r) => r.id === created.data.id)).toBe(true);

    const approved = await approveHrStage(created.data.id);
    expect(approved.ok).toBe(true);

    signIn("usr-emp-aug", "employee", "co-aug");
    const detail = await getMyRequest(created.data.id);
    expect(detail.ok).toBe(true);
    if (!detail.ok) return;
    expect(detail.data.currentStageLabel).toMatch(/Head of HR/i);
  });

  it("Existing reset behavior restores all fixtures", async () => {
    signIn("usr-hr-aug", "hr", "co-aug");
    await createExpenseSubmission({
      category: "Temp",
      amount: 1,
      expenseDate: "2026-10-01",
      description: "temp",
      receiptFilename: "t.pdf",
    });
    resetStore();
    const store = getStore();
    expect(store.version).toBe(STORE_VERSION);
    expect(store.documents.length).toBeGreaterThan(0);
    expect(
      store.assignedTodos.some((t) => t.assigneeUserId === "usr-emp-aug"),
    ).toBe(true);
  });

  it("Old /employee/* and /hr/* links map to shared destinations in nav config", () => {
    const emp = navForRole("employee");
    const hr = navForRole("hr");
    expect(emp.every((i) => !i.href.startsWith("/employee"))).toBe(true);
    expect(hr.every((i) => !i.href.startsWith("/hr"))).toBe(true);
    expect(emp[0].href).toBe("/home");
    expect(hr.find((i) => i.id === "people")?.href).toBe("/people");
  });
});
