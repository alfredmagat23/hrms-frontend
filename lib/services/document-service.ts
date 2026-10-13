import type { DocumentRecord, ServiceResult } from "@/lib/domain/types";
import { ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

export async function listDocuments(filters?: {
  search?: string;
  category?: string;
}): Promise<ServiceResult<DocumentRecord[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  let items = scoped.data.store.documents.filter((d) =>
    scoped.data.permittedCompanyIds.includes(d.companyId),
  );

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }
  if (filters?.category) {
    items = items.filter((d) => d.category === filters.category);
  }

  return delay(
    ok(items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))),
  );
}

export async function listDocumentCategories(): Promise<ServiceResult<string[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  const cats = [
    ...new Set(
      scoped.data.store.documents
        .filter((d) => scoped.data.permittedCompanyIds.includes(d.companyId))
        .map((d) => d.category),
    ),
  ].sort();
  return delay(ok(cats));
}
