import type { ExpenseSubmission, ServiceResult } from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay, mutateStore } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";
import { todayIso } from "@/lib/domain/dates";

export async function listExpenseSubmissions(): Promise<
  ServiceResult<ExpenseSubmission[]>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const items = scoped.data.store.expenseSubmissions.filter(
    (e) =>
      e.userId === scoped.data.userId &&
      scoped.data.permittedCompanyIds.includes(e.companyId),
  );
  return delay(
    ok(items.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))),
  );
}

export async function createExpenseSubmission(input: {
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  receiptFilename: string;
}): Promise<ServiceResult<ExpenseSubmission>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!input.category.trim() || !input.description.trim()) {
    return delay(fail("VALIDATION", "Category and description are required."));
  }
  if (!(input.amount > 0) || input.amount > 100) {
    return delay(
      fail("VALIDATION", "Use a fictional amount between 0.01 and 100."),
    );
  }

  const entry: ExpenseSubmission = {
    id: `exp-${crypto.randomUUID().slice(0, 8)}`,
    category: input.category.trim(),
    amount: Math.round(input.amount * 100) / 100,
    currency: "USD",
    expenseDate: input.expenseDate || todayIso(),
    description: input.description.trim(),
    receiptFilename: input.receiptFilename.trim() || "receipt-demo.pdf",
    status: "Pending",
    userId: scoped.data.userId,
    companyId: scoped.data.companyId,
  };

  mutateStore((s) => {
    s.expenseSubmissions.unshift(entry);
  });

  return delay(ok(entry));
}
