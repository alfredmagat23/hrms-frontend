import {
  availableBalance,
  calculateLeaveDuration,
  createDefaultStages,
  currentStageLabel,
  overallStatus,
  portionLabel,
  validateLeaveInput,
} from "@/lib/domain/leave";
import type {
  LeavePortion,
  LeaveRequest,
  LeaveRequestDuration,
  LeaveType,
  ServiceResult,
} from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay, getStore, mutateStore } from "@/lib/mock/store";
import { inActiveCompany, requireScopedSession } from "@/lib/services/scope";
import type { DemoDataStore } from "@/lib/domain/types";

export interface BalanceView {
  leaveTypeId: string;
  leaveTypeName: string;
  entitled: number;
  used: number;
  pending: number;
  available: number;
  employeeId: string;
  employeeName?: string;
}

export interface LeaveRequestView extends LeaveRequest {
  employeeName: string;
  leaveTypeName: string;
  overallStatus: ReturnType<typeof overallStatus>;
  currentStageLabel: string;
  portionLabel: string;
}

function pendingDaysFor(
  requests: LeaveRequest[],
  employeeId: string,
  companyId: string,
  leaveTypeId: string,
): number {
  return requests
    .filter(
      (r) =>
        r.employeeId === employeeId &&
        r.companyId === companyId &&
        r.leaveTypeId === leaveTypeId &&
        overallStatus(r) === "Pending",
    )
    .reduce((sum, r) => sum + r.duration.workingDays, 0);
}

function toView(
  request: LeaveRequest,
  employeeName: string,
  leaveTypeName: string,
): LeaveRequestView {
  return {
    ...request,
    employeeName,
    leaveTypeName,
    overallStatus: overallStatus(request),
    currentStageLabel: currentStageLabel(request),
    portionLabel: portionLabel(request.portion),
  };
}

export async function listLeaveTypes(): Promise<ServiceResult<LeaveType[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  return delay(ok(scoped.data.store.leaveTypes));
}

export async function previewDuration(input: {
  startDate: string;
  endDate: string;
  portion: LeavePortion;
}): Promise<ServiceResult<LeaveRequestDuration>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  const holidays = scoped.data.store.holidays.filter(
    (h) => h.companyId === scoped.data.companyId,
  );
  return delay(
    ok(
      calculateLeaveDuration({
        ...input,
        holidays,
      }),
    ),
  );
}

export async function getMyBalances(): Promise<ServiceResult<BalanceView[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.employeeId) {
    return delay(fail("VALIDATION", "No employee profile is linked."));
  }
  return delay(
    ok(
      balancesFor(
        scoped.data.store,
        scoped.data.employeeId,
        scoped.data.companyId,
      ),
    ),
  );
}

export async function listBalances(filters?: {
  employeeId?: string;
  departmentId?: string;
}): Promise<ServiceResult<BalanceView[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "hr") {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const { store, companyId } = scoped.data;
  const employeeIds = store.assignments
    .filter((a) => {
      if (a.companyId !== companyId) return false;
      if (filters?.departmentId && a.departmentId !== filters.departmentId) {
        return false;
      }
      return true;
    })
    .map((a) => a.employeeId);

  const unique = [...new Set(employeeIds)].filter((id) =>
    filters?.employeeId ? id === filters.employeeId : true,
  );

  const views = unique.flatMap((employeeId) => {
    const employee = store.employees.find((e) => e.id === employeeId)!;
    return balancesFor(store, employeeId, companyId).map((b) => ({
      ...b,
      employeeName: `${employee.firstName} ${employee.lastName}`,
    }));
  });

  return delay(ok(views));
}

function balancesFor(
  store: DemoDataStore,
  employeeId: string,
  companyId: string,
): BalanceView[] {
  return store.leaveBalances
    .filter((b) => b.employeeId === employeeId && b.companyId === companyId)
    .map((b) => {
      const leaveType = store.leaveTypes.find((t) => t.id === b.leaveTypeId)!;
      const pending = pendingDaysFor(
        store.leaveRequests,
        employeeId,
        companyId,
        b.leaveTypeId,
      );
      return {
        leaveTypeId: b.leaveTypeId,
        leaveTypeName: leaveType.name,
        entitled: b.entitled,
        used: b.used,
        pending,
        available: availableBalance(b.entitled, b.used, pending),
        employeeId,
      };
    });
}

export async function listMyRequests(): Promise<ServiceResult<LeaveRequestView[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.employeeId) {
    return delay(fail("VALIDATION", "No employee profile is linked."));
  }

  const { store, companyId, employeeId } = scoped.data;
  const requests = inActiveCompany(store.leaveRequests, companyId).filter(
    (r) => r.employeeId === employeeId,
  );

  return delay(
    ok(
      requests
        .map((r) => enrich(r, store))
        .sort((a, b) => b.filedAt.localeCompare(a.filedAt)),
    ),
  );
}

export async function getMyRequest(
  id: string,
): Promise<ServiceResult<LeaveRequestView>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  const request = scoped.data.store.leaveRequests.find((r) => r.id === id);
  if (
    !request ||
    request.companyId !== scoped.data.companyId ||
    request.employeeId !== scoped.data.employeeId
  ) {
    return delay(fail("NOT_FOUND", "Leave request was not found."));
  }
  return delay(ok(enrich(request, scoped.data.store)));
}

export async function listRequests(filters?: {
  status?: string;
  employeeId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ServiceResult<LeaveRequestView[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "hr") {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const { store, companyId } = scoped.data;
  let requests = inActiveCompany(store.leaveRequests, companyId);

  if (filters?.employeeId) {
    requests = requests.filter((r) => r.employeeId === filters.employeeId);
  }
  if (filters?.departmentId) {
    const ids = new Set(
      store.assignments
        .filter(
          (a) =>
            a.companyId === companyId &&
            a.departmentId === filters.departmentId,
        )
        .map((a) => a.employeeId),
    );
    requests = requests.filter((r) => ids.has(r.employeeId));
  }
  if (filters?.startDate) {
    requests = requests.filter((r) => r.endDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    requests = requests.filter((r) => r.startDate <= filters.endDate!);
  }
  if (filters?.status === "pending_hr") {
    requests = requests.filter(
      (r) =>
        overallStatus(r) === "Pending" &&
        r.stages.find((s) => s.key === "hr")?.status === "pending",
    );
  } else if (filters?.status === "pending_head") {
    requests = requests.filter(
      (r) =>
        overallStatus(r) === "Pending" &&
        r.stages.find((s) => s.key === "head_hr")?.status === "pending",
    );
  } else if (filters?.status === "approved") {
    requests = requests.filter((r) => overallStatus(r) === "Approved");
  } else if (filters?.status === "rejected") {
    requests = requests.filter((r) => overallStatus(r) === "Rejected");
  }

  return delay(
    ok(
      requests
        .map((r) => enrich(r, store))
        .sort((a, b) => a.filedAt.localeCompare(b.filedAt)),
    ),
  );
}

export async function getRequest(
  id: string,
): Promise<ServiceResult<LeaveRequestView>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  const request = scoped.data.store.leaveRequests.find((r) => r.id === id);
  if (!request || request.companyId !== scoped.data.companyId) {
    return delay(fail("NOT_FOUND", "Leave request was not found."));
  }
  if (
    scoped.data.roleId === "employee" &&
    request.employeeId !== scoped.data.employeeId
  ) {
    return delay(fail("NOT_FOUND", "Leave request was not found."));
  }
  return delay(ok(enrich(request, scoped.data.store)));
}

export async function submitRequest(input: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  portion: LeavePortion;
  reason: string;
}): Promise<ServiceResult<LeaveRequestView>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.employeeId) {
    return delay(fail("VALIDATION", "No employee profile is linked."));
  }

  const { store, companyId, employeeId } = scoped.data;
  const holidays = store.holidays.filter((h) => h.companyId === companyId);
  const existing = store.leaveRequests.filter(
    (r) => r.employeeId === employeeId && r.companyId === companyId,
  );
  const balance = balancesFor(store, employeeId!, companyId).find(
    (b) => b.leaveTypeId === input.leaveTypeId,
  );

  const fieldErrors = validateLeaveInput({
    ...input,
    available: balance?.available ?? 0,
    holidays,
    existing,
  });

  if (fieldErrors.length > 0) {
    return delay(
      fail("VALIDATION", "Please correct the highlighted fields.", fieldErrors),
    );
  }

  const duration = calculateLeaveDuration({
    startDate: input.startDate,
    endDate: input.endDate,
    portion: input.portion,
    holidays,
  });

  const now = new Date().toISOString();
  const stages = createDefaultStages();
  stages[0].status = "approved";
  stages[1].status = "pending";

  const request: LeaveRequest = {
    id: `lr-${crypto.randomUUID().slice(0, 8)}`,
    employeeId: employeeId!,
    companyId,
    leaveTypeId: input.leaveTypeId,
    startDate: input.startDate,
    endDate: input.endDate,
    portion: input.portion,
    reason: input.reason.trim(),
    filedAt: now,
    duration,
    stages,
    timeline: [
      {
        stageKey: "manager",
        action: "simulated_manager_approval",
        actorName: null,
        at: now,
        comment: "Simulated manager approval (demo only)",
        isSimulated: true,
      },
    ],
  };

  mutateStore((s) => {
    s.leaveRequests.push(request);
  });

  return delay(ok(enrich(request, getStore())));
}

export async function approveHrStage(
  id: string,
): Promise<ServiceResult<LeaveRequestView>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "hr") {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const request = scoped.data.store.leaveRequests.find((r) => r.id === id);
  if (!request || request.companyId !== scoped.data.companyId) {
    return delay(fail("NOT_FOUND", "Leave request was not found."));
  }

  const hrStage = request.stages.find((s) => s.key === "hr");
  if (!hrStage || hrStage.status !== "pending") {
    return delay(
      fail("CONFLICT", "This request is not awaiting HR-stage approval."),
    );
  }

  const user = scoped.data.store.users.find((u) => u.id === scoped.data.userId)!;
  const now = new Date().toISOString();

  mutateStore((s) => {
    const target = s.leaveRequests.find((r) => r.id === id)!;
    const hr = target.stages.find((st) => st.key === "hr")!;
    const head = target.stages.find((st) => st.key === "head_hr")!;
    hr.status = "approved";
    head.status = "pending";
    target.timeline.push({
      stageKey: "hr",
      action: "approved",
      actorName: user.displayName,
      at: now,
      comment: null,
      isSimulated: false,
    });
  });

  const updated = getStore().leaveRequests.find((r) => r.id === id)!;
  return delay(ok(enrich(updated, getStore())));
}

export async function rejectHrStage(
  id: string,
  reason: string,
): Promise<ServiceResult<LeaveRequestView>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "hr") {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return delay(
      fail("VALIDATION", "A rejection reason of at least 10 characters is required.", [
        { field: "reason", message: "Enter at least 10 characters." },
      ]),
    );
  }

  const request = scoped.data.store.leaveRequests.find((r) => r.id === id);
  if (!request || request.companyId !== scoped.data.companyId) {
    return delay(fail("NOT_FOUND", "Leave request was not found."));
  }

  const hrStage = request.stages.find((s) => s.key === "hr");
  if (!hrStage || hrStage.status !== "pending") {
    return delay(
      fail("CONFLICT", "This request is not awaiting HR-stage approval."),
    );
  }

  const user = scoped.data.store.users.find((u) => u.id === scoped.data.userId)!;
  const now = new Date().toISOString();

  mutateStore((s) => {
    const target = s.leaveRequests.find((r) => r.id === id)!;
    const hr = target.stages.find((st) => st.key === "hr")!;
    hr.status = "rejected";
    target.timeline.push({
      stageKey: "hr",
      action: "rejected",
      actorName: user.displayName,
      at: now,
      comment: trimmed,
      isSimulated: false,
    });
  });

  const updated = getStore().leaveRequests.find((r) => r.id === id)!;
  return delay(ok(enrich(updated, getStore())));
}

/** Team calendar item shape — never includes leave type or reason. */
export type TeamCalendarItem = {
  date: string;
  endDate: string;
  displayName: string;
  portion: LeavePortion;
  kind: "leave" | "holiday";
  holidayName?: string;
};

export async function listTeamCalendar(
  month: string,
  opts?: { companyId?: string },
): Promise<ServiceResult<TeamCalendarItem[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const { store, companyId, roleId, employeeId, permittedCompanyIds } =
    scoped.data;

  let scopeCompanyId = companyId;
  if (
    roleId === "hr" &&
    opts?.companyId &&
    permittedCompanyIds.includes(opts.companyId)
  ) {
    scopeCompanyId = opts.companyId;
  } else if (roleId === "hr" && opts?.companyId) {
    return delay(fail("FORBIDDEN_COMPANY", "Company is not permitted."));
  }

  const [year, mon] = month.split("-").map(Number);
  const start = `${month}-01`;
  const endDate = new Date(year, mon, 0).getDate();
  const end = `${month}-${String(endDate).padStart(2, "0")}`;

  const events: TeamCalendarItem[] = [];

  for (const holiday of store.holidays.filter(
    (h) =>
      h.companyId === scopeCompanyId && h.date >= start && h.date <= end,
  )) {
    events.push({
      date: holiday.date,
      endDate: holiday.date,
      displayName: holiday.name,
      portion: "whole",
      kind: "holiday",
      holidayName: holiday.name,
    });
  }

  let deptId: string | null = null;
  if (roleId === "employee" && employeeId) {
    deptId =
      store.assignments.find(
        (a) =>
          a.employeeId === employeeId && a.companyId === scopeCompanyId,
      )?.departmentId ?? null;
  }

  const approved = inActiveCompany(store.leaveRequests, scopeCompanyId).filter(
    (r) => overallStatus(r) === "Approved",
  );

  for (const request of approved) {
    if (request.endDate < start || request.startDate > end) continue;
    if (deptId) {
      const assignment = store.assignments.find(
        (a) =>
          a.employeeId === request.employeeId &&
          a.companyId === scopeCompanyId,
      );
      if (!assignment || assignment.departmentId !== deptId) continue;
    }
    const employee = store.employees.find((e) => e.id === request.employeeId)!;
    const cursor = new Date(request.startDate + "T12:00:00");
    const last = new Date(request.endDate + "T12:00:00");
    while (cursor <= last) {
      const iso = cursor.toISOString().slice(0, 10);
      if (iso >= start && iso <= end) {
        events.push({
          date: iso,
          endDate: request.endDate,
          displayName: `${employee.firstName} ${employee.lastName}`,
          portion: request.portion,
          kind: "leave",
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return delay(ok(events));
}

function enrich(request: LeaveRequest, store: DemoDataStore): LeaveRequestView {
  const employee = store.employees.find((e) => e.id === request.employeeId)!;
  const leaveType = store.leaveTypes.find((t) => t.id === request.leaveTypeId)!;
  return toView(
    request,
    `${employee.firstName} ${employee.lastName}`,
    leaveType.name,
  );
}
