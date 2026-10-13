import { overallStatus } from "@/lib/domain/leave";
import { todayIso } from "@/lib/domain/dates";
import type { ServiceResult } from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { listDailyAttendance } from "@/lib/services/attendance-service";
import {
  getMyBalances,
  listMyRequests,
  listRequests,
  type BalanceView,
  type LeaveRequestView,
} from "@/lib/services/leave-service";
import { listMyToDos, type ToDoView } from "@/lib/services/todo-service";
import { requireScopedSession } from "@/lib/services/scope";

export async function getEmployeeHome(): Promise<
  ServiceResult<{
    greetingName: string;
    balances: BalanceView[];
    pendingRequests: LeaveRequestView[];
    upcomingHolidays: { id: string; date: string; name: string }[];
    todos: ToDoView[];
  }>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "employee") {
    return delay(fail("FORBIDDEN_COMPANY", "Employee access is required."));
  }

  const user = scoped.data.store.users.find((u) => u.id === scoped.data.userId)!;
  const balances = await getMyBalances();
  const requests = await listMyRequests();
  const todos = await listMyToDos();
  if (!balances.ok || !requests.ok || !todos.ok) {
    return delay(fail("VALIDATION", "Unable to load employee home."));
  }

  const today = todayIso();
  const upcomingHolidays = scoped.data.store.holidays
    .filter((h) => h.companyId === scoped.data.companyId && h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
    .map((h) => ({ id: h.id, date: h.date, name: h.name }));

  return delay(
    ok({
      greetingName: user.displayName.split(" ")[0],
      balances: balances.data,
      pendingRequests: requests.data.filter((r) => r.overallStatus === "Pending"),
      upcomingHolidays,
      todos: todos.data.slice(0, 3),
    }),
  );
}

export async function getHrHome(): Promise<
  ServiceResult<{
    pendingLeaveCount: number;
    pendingRequests: LeaveRequestView[];
    attendanceToday: {
      present: number;
      late: number;
      absent: number;
      missingPunch: number;
      onLeave: number;
    };
    headcountByStatus: { statusId: string; label: string; count: number }[];
  }>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "hr") {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const pending = await listRequests({ status: "pending_hr" });
  const attendance = await listDailyAttendance({ date: todayIso() });
  if (!pending.ok || !attendance.ok) {
    return delay(fail("VALIDATION", "Unable to load HR home."));
  }

  const { store, companyId } = scoped.data;
  const employeeIds = new Set(
    store.assignments
      .filter((a) => a.companyId === companyId)
      .map((a) => a.employeeId),
  );

  const headcountByStatus = store.employmentStatuses.map((status) => ({
    statusId: status.id,
    label: status.label,
    count: store.employees.filter(
      (e) => employeeIds.has(e.id) && e.statusId === status.id,
    ).length,
  }));

  const records = attendance.data.records.filter(
    (r) => !["rest_day", "holiday"].includes(r.status),
  );

  return delay(
    ok({
      pendingLeaveCount: pending.data.length,
      pendingRequests: pending.data.slice(0, 5),
      attendanceToday: {
        present: records.filter((r) =>
          ["on_time", "late", "undertime", "late_undertime", "in_progress"].includes(
            r.status,
          ),
        ).length,
        late: records.filter((r) => (r.lateMinutes ?? 0) > 0).length,
        absent: records.filter((r) => r.status === "absent").length,
        missingPunch: records.filter((r) =>
          ["missing_in", "missing_out"].includes(r.status),
        ).length,
        onLeave: records.filter((r) =>
          ["on_leave", "half_day_leave"].includes(r.status),
        ).length,
      },
      headcountByStatus,
    }),
  );
}

export async function getDashboardScopeProbe(): Promise<
  ServiceResult<{ companyId: string; employeeCount: number; requestCount: number }>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  const { store, companyId } = scoped.data;
  return delay(
    ok({
      companyId,
      employeeCount: store.assignments.filter((a) => a.companyId === companyId)
        .length,
      requestCount: store.leaveRequests.filter(
        (r) => r.companyId === companyId && overallStatus(r) === "Pending",
      ).length,
    }),
  );
}
