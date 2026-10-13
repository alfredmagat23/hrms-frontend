import type {
  AssignedTodoCategory,
  AssignedTodoItem,
  ServiceResult,
} from "@/lib/domain/types";
import { ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";
import { hasCapability } from "@/lib/auth/capabilities";
import { listMyToDos } from "@/lib/services/todo-service";
import { listRequests } from "@/lib/services/leave-service";

export async function listAssignedTodos(
  category: AssignedTodoCategory,
): Promise<ServiceResult<AssignedTodoItem[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const { roleId, userId, permittedCompanyIds, store } = scoped.data;
  const items = store.assignedTodos.filter((t) => {
    if (t.category !== category) return false;
    if (!permittedCompanyIds.includes(t.companyId)) return false;
    if (roleId === "hr") {
      return !t.assigneeUserId || t.assigneeUserId === userId;
    }
    return t.assigneeUserId === userId;
  });

  return delay(ok(items.sort((a, b) => a.dueDate.localeCompare(b.dueDate))));
}

/** Time Off to-dos: personal leave items + HR approval queue when capable. */
export async function listTimeOffTodos(): Promise<
  ServiceResult<
    {
      id: string;
      title: string;
      dueDate: string;
      href: string;
      source: "assigned" | "leave" | "personal";
    }[]
  >
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const assigned = await listAssignedTodos("time-off");
  if (!assigned.ok) return assigned;

  const rows: {
    id: string;
    title: string;
    dueDate: string;
    href: string;
    source: "assigned" | "leave" | "personal";
  }[] = assigned.data.map((t) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    href: t.href,
    source: "assigned" as const,
  }));

  if (hasCapability(scoped.data.roleId, "hr.leave.review")) {
    const requests = await listRequests({ status: "pending_hr" });
    if (requests.ok) {
      for (const r of requests.data.slice(0, 10)) {
        rows.push({
          id: `leave-${r.id}`,
          title: `Review leave: ${r.employeeName}`,
          dueDate: r.startDate,
          href: `/leave/approvals/${r.id}`,
          source: "leave",
        });
      }
    }
  }

  if (scoped.data.employeeId) {
    const personal = await listMyToDos();
    if (personal.ok) {
      for (const t of personal.data.filter(
        (x) => x.kind === "rejected_leave" || x.kind === "upcoming_leave",
      )) {
        rows.push({
          id: t.id,
          title: t.title,
          dueDate: t.relatedDate,
          href: t.href,
          source: "personal",
        });
      }
    }
  }

  return delay(ok(rows));
}
