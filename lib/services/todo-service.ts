import { overallStatus } from "@/lib/domain/leave";
import { addDays, todayIso } from "@/lib/domain/dates";
import type { ServiceResult } from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

export interface ToDoView {
  id: string;
  kind: "rejected_leave" | "missing_punch" | "upcoming_leave";
  title: string;
  relatedDate: string;
  href: string;
}

export async function listMyToDos(): Promise<ServiceResult<ToDoView[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.employeeId) {
    return delay(fail("VALIDATION", "No employee profile is linked."));
  }

  const { store, companyId, employeeId } = scoped.data;
  const todos: ToDoView[] = [];
  const today = todayIso();
  const periodStart = addDays(today, -13);
  const upcomingEnd = addDays(today, 7);

  for (const request of store.leaveRequests) {
    if (request.employeeId !== employeeId || request.companyId !== companyId) {
      continue;
    }
    if (overallStatus(request) === "Rejected") {
      todos.push({
        id: `todo-rej-${request.id}`,
        kind: "rejected_leave",
        title: "Review rejected leave request",
        relatedDate: request.filedAt.slice(0, 10),
        href: `/leave/history/${request.id}`,
      });
    }
    if (
      overallStatus(request) === "Approved" &&
      request.startDate >= today &&
      request.startDate <= upcomingEnd
    ) {
      todos.push({
        id: `todo-up-${request.id}`,
        kind: "upcoming_leave",
        title: "Upcoming approved leave",
        relatedDate: request.startDate,
        href: `/leave/history/${request.id}`,
      });
    }
  }

  const myPunches = store.punches.filter(
    (p) =>
      p.employeeId === employeeId &&
      p.companyId === companyId &&
      p.timestamp.slice(0, 10) >= periodStart &&
      p.timestamp.slice(0, 10) < today,
  );
  const byDate = new Map<string, string[]>();
  for (const punch of myPunches) {
    const date = punch.timestamp.slice(0, 10);
    const list = byDate.get(date) ?? [];
    list.push(punch.timestamp);
    byDate.set(date, list);
  }
  for (const [date, stamps] of byDate) {
    if (stamps.length === 1) {
      todos.push({
        id: `todo-miss-${date}`,
        kind: "missing_punch",
        title: "Missing punch on attendance record",
        relatedDate: date,
        href: "/attendance/my-attendance",
      });
    }
  }

  return delay(
    ok(todos.sort((a, b) => a.relatedDate.localeCompare(b.relatedDate))),
  );
}
