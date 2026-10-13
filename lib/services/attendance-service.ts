import { computeAttendanceRecord } from "@/lib/domain/attendance";
import { addDays, eachDate, todayIso } from "@/lib/domain/dates";
import type {
  AttendanceRecord,
  DemoDataStore,
  ServiceResult,
} from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

export async function listMyAttendance(range?: {
  startDate?: string;
  endDate?: string;
}): Promise<ServiceResult<AttendanceRecord[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.employeeId) {
    return delay(fail("VALIDATION", "No employee profile is linked."));
  }

  const end = range?.endDate ?? todayIso();
  const start = range?.startDate ?? addDays(end, -13);
  return delay(
    ok(
      buildRecords(
        scoped.data.store,
        scoped.data.companyId,
        [scoped.data.employeeId],
        start,
        end,
      ),
    ),
  );
}

export async function listDailyAttendance(input: {
  date?: string;
  departmentId?: string;
  employeeId?: string;
  status?: string;
}): Promise<
  ServiceResult<{
    date: string;
    records: AttendanceRecord[];
    summary: {
      lateCount: number;
      lateMinutes: number;
      undertimeCount: number;
      undertimeMinutes: number;
      missingPunches: number;
    };
  }>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (scoped.data.roleId !== "hr") {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const date = input.date ?? todayIso();
  const { store, companyId } = scoped.data;

  let employeeIds = store.assignments
    .filter((a) => a.companyId === companyId)
    .map((a) => a.employeeId);

  if (input.departmentId) {
    employeeIds = store.assignments
      .filter(
        (a) =>
          a.companyId === companyId && a.departmentId === input.departmentId,
      )
      .map((a) => a.employeeId);
  }
  if (input.employeeId) {
    employeeIds = employeeIds.filter((id) => id === input.employeeId);
  }

  let records = buildRecords(store, companyId, [...new Set(employeeIds)], date, date);
  if (input.status) {
    records = records.filter((r) => r.status === input.status);
  }

  const summary = {
    lateCount: records.filter((r) => (r.lateMinutes ?? 0) > 0).length,
    lateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes ?? 0), 0),
    undertimeCount: records.filter((r) => (r.undertimeMinutes ?? 0) > 0).length,
    undertimeMinutes: records.reduce(
      (sum, r) => sum + (r.undertimeMinutes ?? 0),
      0,
    ),
    missingPunches: records.filter(
      (r) => r.status === "missing_in" || r.status === "missing_out",
    ).length,
  };

  return delay(ok({ date, records, summary }));
}

function buildRecords(
  store: DemoDataStore,
  companyId: string,
  employeeIds: string[],
  start: string,
  end: string,
): AttendanceRecord[] {
  const shift = store.shifts[0];
  const holidays = store.holidays.filter((h) => h.companyId === companyId);
  const leaveRequests = store.leaveRequests.filter((r) => r.companyId === companyId);
  const punches = store.punches.filter((p) => p.companyId === companyId);
  const records: AttendanceRecord[] = [];

  for (const employeeId of employeeIds) {
    const assignment = store.assignments.find(
      (a) => a.employeeId === employeeId && a.companyId === companyId,
    );
    if (!assignment) continue;
    const employeeShift =
      store.shifts.find((s) => s.id === assignment.shiftId) ?? shift;

    for (const date of eachDate(start, end)) {
      records.push(
        computeAttendanceRecord({
          employeeId,
          companyId,
          date,
          shift: employeeShift,
          punches,
          holidays,
          leaveRequests,
        }),
      );
    }
  }

  return records.sort((a, b) =>
    a.date === b.date
      ? a.employeeId.localeCompare(b.employeeId)
      : b.date.localeCompare(a.date),
  );
}
