"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  ErrorState,
  LoadingBlock,
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
import type { Holiday } from "@/lib/domain/types";
import {
  createHoliday,
  listHolidays,
  updateHoliday,
} from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

export default function HrHolidaysSettingsPage() {
  const { ready, activeCompany } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Holiday[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    void listHolidays().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setItems(res.data);
    });
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  function openDialog(item: Holiday | null) {
    setEditing(item);
    setName(item?.name ?? "");
    setDate(item?.date ?? "");
    setFieldErrors({});
    setDialogOpen(true);
  }

  async function saveHoliday() {
    setSaving(true);
    setFieldErrors({});
    const res = editing
      ? await updateHoliday(editing.id, { name, date })
      : await createHoliday({ name, date });
    setSaving(false);
    if (!res.ok) {
      const map: Record<string, string> = {};
      for (const fe of res.error.fieldErrors ?? []) map[fe.field] = fe.message;
      setFieldErrors(map);
      return;
    }
    setDialogOpen(false);
    load();
  }

  return (
    <AppShell title="Holidays">
      <div className="mx-auto max-w-2xl space-y-4">
        <DemoNotice>
          Holidays are scoped to{" "}
          <strong>{activeCompany?.name ?? "the active company"}</strong>. They
          affect leave duration and calendars for that company only.
        </DemoNotice>
        <div className="flex justify-end">
          <Button onClick={() => openDialog(null)}>Add holiday</Button>
        </div>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !error ? (
          <ul className="divide-y rounded-lg border bg-card text-sm">
            {items.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-muted-foreground">{h.date}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openDialog(h)}>
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit holiday" : "New holiday"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="hol-name" className="text-sm font-medium">
                  Name
                </label>
                <Input id="hol-name" value={name} onChange={(e) => setName(e.target.value)} />
                {fieldErrors.name ? (
                  <p className="text-sm text-destructive">{fieldErrors.name}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label htmlFor="hol-date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="hol-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {fieldErrors.date ? (
                  <p className="text-sm text-destructive">{fieldErrors.date}</p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={saving} onClick={() => void saveHoliday()}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
