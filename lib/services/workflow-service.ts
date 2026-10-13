import type { ServiceResult, WorkflowActivityItem } from "@/lib/domain/types";
import { ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

export interface WorkflowDashboard {
  activeCount: number;
  pendingSteps: number;
  completedThisMonth: number;
  recentActivity: WorkflowActivityItem[];
  workflows: { name: string; status: string }[];
}

export async function getWorkflowDashboard(): Promise<
  ServiceResult<WorkflowDashboard>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const { roleId, permittedCompanyIds, store } = scoped.data;
  const items = store.workflowActivities.filter((w) => {
    if (!permittedCompanyIds.includes(w.companyId)) return false;
    const audience = w.audience ?? "all";
    if (audience === "all") return true;
    if (roleId === "hr") return audience === "hr";
    return audience === "employee";
  });

  const month = new Date().toISOString().slice(0, 7);
  return delay(
    ok({
      activeCount: items.filter((i) => i.status === "Active").length,
      pendingSteps: items.filter((i) => i.status === "Pending").length,
      completedThisMonth: items.filter(
        (i) => i.status === "Completed" && i.at.startsWith(month),
      ).length,
      recentActivity: items
        .slice()
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 8),
      workflows: [
        ...new Map(
          items.map((i) => [i.workflowName, { name: i.workflowName, status: i.status }]),
        ).values(),
      ],
    }),
  );
}
