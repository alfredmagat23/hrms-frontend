import type {
  FormLibraryItem,
  FormSubmission,
  ServiceResult,
} from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

export async function listFormLibrary(filters?: {
  search?: string;
  category?: string;
}): Promise<ServiceResult<FormLibraryItem[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  let items = [...scoped.data.store.formLibrary];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q),
    );
  }
  if (filters?.category) {
    items = items.filter((f) => f.category === filters.category);
  }
  return delay(ok(items.sort((a, b) => a.name.localeCompare(b.name))));
}

export async function listFormCategories(): Promise<ServiceResult<string[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  return delay(
    ok(
      [...new Set(scoped.data.store.formLibrary.map((f) => f.category))].sort(),
    ),
  );
}

export async function listMyFormSubmissions(): Promise<
  ServiceResult<FormSubmission[]>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const items = scoped.data.store.formSubmissions.filter(
    (s) => s.userId === scoped.data.userId,
  );
  return delay(
    ok(items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))),
  );
}

export async function getFormLibraryItem(
  id: string,
): Promise<ServiceResult<FormLibraryItem>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  const item = scoped.data.store.formLibrary.find((f) => f.id === id);
  if (!item) return delay(fail("NOT_FOUND", "Form was not found."));
  return delay(ok(item));
}
