"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createExpenseSubmission,
  listExpenseSubmissions,
} from "@/lib/services/expense-service";
import { useSession } from "@/lib/session/session-context";

export default function ExpenseSubmissionPage() {
  const { ready } = useSession();
  const [items, setItems] = useState<
    Extract<
      Awaited<ReturnType<typeof listExpenseSubmissions>>,
      { ok: true }
    >["data"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Office Supplies");
  const [amount, setAmount] = useState("9.99");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [receiptFilename, setReceiptFilename] = useState("receipt-demo.pdf");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    void listExpenseSubmissions().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError("");
      setItems(res.data);
    });
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  async function submit() {
    setSaving(true);
    const res = await createExpenseSubmission({
      category,
      amount: Number(amount),
      expenseDate,
      description,
      receiptFilename,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setOpen(false);
    setDescription("");
    load();
  }

  return (
    <AppShell title="Expenses">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Submission</h2>
            <p className="text-sm text-muted-foreground">
              Demo reimbursement list — fictional low-value amounts only.
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)}>
            New Reimbursement
          </Button>
        </div>
        <DemoNotice>
          No real receipt uploads, payments, or accounting integration.
        </DemoNotice>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && items.length === 0 ? (
          <EmptyState title="No expense submissions" />
        ) : null}
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border bg-card p-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {e.category} · {e.currency} {e.amount.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">{e.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.expenseDate} · Receipt: {e.receiptFilename}
                    </p>
                  </div>
                  <StatusBadge label={e.status} tone="neutral" />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New reimbursement (demo)</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="exp-cat" className="text-sm font-medium">
                  Category
                </label>
                <Input
                  id="exp-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="exp-amt" className="text-sm font-medium">
                  Amount (max 100)
                </label>
                <Input
                  id="exp-amt"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="exp-date" className="text-sm font-medium">
                  Expense date
                </label>
                <Input
                  id="exp-date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="exp-desc" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="exp-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="exp-file" className="text-sm font-medium">
                  Receipt filename (mock)
                </label>
                <Input
                  id="exp-file"
                  value={receiptFilename}
                  onChange={(e) => setReceiptFilename(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                disabled={saving}
                onClick={() => void submit()}
              >
                Save demo entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
