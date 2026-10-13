import { beforeEach, describe, expect, it } from "vitest";

import { STORE_VERSION } from "@/lib/mock/seed";
import { getStore, resetStore, saveSession } from "@/lib/mock/store";
import {
  createExpenseSubmission,
  listExpenseSubmissions,
} from "@/lib/services/expense-service";
import { listDocuments } from "@/lib/services/document-service";
import { listFormLibrary } from "@/lib/services/forms-service";
import { listTeamCalendar } from "@/lib/services/leave-service";
import { listObjectives } from "@/lib/services/okr-service";
import { listEmployees } from "@/lib/services/people-service";
import { getWorkflowDashboard } from "@/lib/services/workflow-service";

function signIn(userId: string, companyId: string) {
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

describe("People directory scope", () => {
  it("Group HR company filtering only returns permitted companies", async () => {
    signIn("usr-hr-group", "co-aug");
    const all = await listEmployees();
    expect(all.ok).toBe(true);
    if (!all.ok) return;
    expect(all.data.some((e) => e.companyId === "co-aug")).toBe(true);
    expect(all.data.some((e) => e.companyId === "co-elb")).toBe(true);
    expect(all.data.some((e) => e.companyId === "co-ima")).toBe(true);

    const filtered = await listEmployees({ companyIds: ["co-ima"] });
    expect(filtered.ok).toBe(true);
    if (!filtered.ok) return;
    expect(filtered.data.every((e) => e.companyId === "co-ima")).toBe(true);
    expect(filtered.data.every((e) => e.employeeNo.startsWith("IMA"))).toBe(
      true,
    );
  });

  it("company-specific HR cannot retrieve another company via Company filter", async () => {
    signIn("usr-hr-aug", "co-aug");
    const leaked = await listEmployees({ companyIds: ["co-elb", "co-ima"] });
    expect(leaked.ok).toBe(true);
    if (!leaked.ok) return;
    expect(leaked.data.every((e) => e.companyId === "co-aug")).toBe(true);
    expect(leaked.data.some((e) => e.id === "emp-sam")).toBe(false);
    expect(leaked.data.some((e) => e.id === "emp-dana")).toBe(false);
  });

  it("People filters combine with AND across groups and OR within a group", async () => {
    signIn("usr-hr-group", "co-aug");
    const result = await listEmployees({
      companyIds: ["co-aug", "co-elb"],
      departmentNames: ["Information Technology"],
      locations: ["Philippines"],
      statusLabels: ["Active"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.every(
        (e) =>
          (e.companyId === "co-aug" || e.companyId === "co-elb") &&
          e.departmentName === "Information Technology" &&
          e.location === "Philippines" &&
          e.statusLabel === "Active",
      ),
    ).toBe(true);
  });
});

describe("Reset and mock modules", () => {
  it("Reset restores the new module data", async () => {
    signIn("usr-hr-aug", "co-aug");
    await createExpenseSubmission({
      category: "Temp",
      amount: 1.5,
      expenseDate: "2026-10-01",
      description: "temp row",
      receiptFilename: "tmp.pdf",
    });
    let store = getStore();
    expect(store.version).toBe(STORE_VERSION);
    expect(store.expenseSubmissions.length).toBeGreaterThan(2);

    resetStore();
    store = getStore();
    expect(store.version).toBe(STORE_VERSION);
    expect(store.documents.length).toBeGreaterThan(0);
    expect(store.formLibrary.length).toBeGreaterThan(0);
    expect(store.assignedTodos.length).toBeGreaterThan(0);
    expect(store.okrObjectives.length).toBeGreaterThan(0);
    expect(store.workflowActivities.length).toBeGreaterThan(0);
    expect(store.expenseSubmissions.length).toBeGreaterThanOrEqual(2);
  });

  it("Team Calendar never includes leave reason or leave type", async () => {
    signIn("usr-hr-aug", "co-aug");
    const month = new Date().toISOString().slice(0, 7);
    const result = await listTeamCalendar(month);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const item of result.data) {
      const keys = Object.keys(item);
      expect(keys).toEqual(
        expect.arrayContaining([
          "date",
          "endDate",
          "displayName",
          "portion",
          "kind",
        ]),
      );
      expect(keys).not.toContain("reason");
      expect(keys).not.toContain("leaveType");
      expect(keys).not.toContain("leaveTypeId");
      expect(keys).not.toContain("leaveTypeName");
      expect(JSON.stringify(item)).not.toMatch(/Vacation Leave|Sick Leave|Personal/);
    }
  });

  it("Documents, Forms, Workflows and OKR use fictional mock records", async () => {
    signIn("usr-hr-group", "co-aug");
    const docs = await listDocuments();
    const forms = await listFormLibrary();
    const workflows = await getWorkflowDashboard();
    const okrs = await listObjectives();
    expect(docs.ok && forms.ok && workflows.ok && okrs.ok).toBe(true);
    if (!docs.ok || !forms.ok || !workflows.ok || !okrs.ok) return;
    expect(docs.data.some((d) => /demo|fictional|mock|sample/i.test(d.description))).toBe(
      true,
    );
    expect(forms.data.some((f) => f.name === "Background Check Form")).toBe(
      true,
    );
    expect(workflows.data.workflows.length).toBeGreaterThan(0);
    expect(okrs.data.every((o) => o.keyResults.length > 0)).toBe(true);
  });

  it("Expense submissions remain local mock state", async () => {
    signIn("usr-hr-aug", "co-aug");
    const before = await listExpenseSubmissions();
    expect(before.ok).toBe(true);
    if (!before.ok) return;
    const created = await createExpenseSubmission({
      category: "Local Transport",
      amount: 3.25,
      expenseDate: "2026-10-02",
      description: "Demo jeepney fare",
      receiptFilename: "fare-demo.pdf",
    });
    expect(created.ok).toBe(true);
    const after = await listExpenseSubmissions();
    expect(after.ok).toBe(true);
    if (!after.ok || !created.ok) return;
    expect(after.data.length).toBe(before.data.length + 1);
    expect(after.data.some((e) => e.id === created.data.id)).toBe(true);
    expect(getStore().expenseSubmissions.some((e) => e.id === created.data.id)).toBe(
      true,
    );
  });
});
