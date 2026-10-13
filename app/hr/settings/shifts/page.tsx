"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { ShiftFormDialog } from "@/features/settings/shift-form-dialog";
import type { Shift } from "@/lib/domain/types";
import { createShift, listShifts, updateShift } from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

export default function HrShiftsSettingsPage() {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Shift[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  function load() {
    setLoading(true);
    void listShifts().then((res) => {
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

  return (
    <AppShell title="Shifts">
      <div className="mx-auto max-w-2xl space-y-4">
        <DemoNotice>
          Sample shared shift templates across TLS Group (demo data).
        </DemoNotice>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add shift
          </Button>
        </div>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !error ? (
          <ul className="divide-y rounded-lg border bg-card text-sm">
            {items.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2 p-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-muted-foreground">
                    {s.start} – {s.end} (grace until {s.graceEnd}, lunch{" "}
                    {s.lunchStart}–{s.lunchEnd})
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(s);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <ShiftFormDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editing ? "Edit shift" : "New shift"}
          initial={
            editing ?? {
              name: "",
              start: "08:00",
              graceEnd: "08:15",
              lunchStart: "12:00",
              lunchEnd: "13:00",
              end: "17:00",
            }
          }
          onSave={async (input) => {
            const res = editing
              ? await updateShift(editing.id, input)
              : await createShift(input);
            if (!res.ok) {
              const map: Record<string, string> = {};
              for (const fe of res.error.fieldErrors ?? []) map[fe.field] = fe.message;
              return { ok: false, fieldErrors: map };
            }
            load();
            return { ok: true };
          }}
        />
      </div>
    </AppShell>
  );
}
