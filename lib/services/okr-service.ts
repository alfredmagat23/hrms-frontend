import type { OkrObjective, ServiceResult } from "@/lib/domain/types";
import { ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

export async function listObjectives(): Promise<ServiceResult<OkrObjective[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const items = scoped.data.store.okrObjectives.filter(
    (o) =>
      o.ownerUserId === scoped.data.userId &&
      scoped.data.permittedCompanyIds.includes(o.companyId),
  );
  return delay(ok(items));
}
