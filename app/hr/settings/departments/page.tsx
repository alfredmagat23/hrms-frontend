"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { RefCodeFormDialog } from "@/features/settings/ref-code-form-dialog";
import type { Department } from "@/lib/domain/types";
import {
  createDepartment,
  listDepartments,
  updateDepartment,
} from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

export default function HrDepartmentsSettingsPage() {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Department[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  function load() {
    setLoading(true);
    void listDepartments().then((res) => {
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

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: Department) {
    setEditing(item);
    setDialogOpen(true);
  }

  return (
    <AppShell title="Departments">
      <div className="mx-auto max-w-2xl space-y-4">
        <DemoNotice>
          Shared across TLS Group — changes apply to all companies in this demo.
        </DemoNotice>
        <div className="flex justify-end">
          <Button onClick={openCreate}>Add department</Button>
        </div>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !error ? (
          <ul className="divide-y rounded-lg border bg-card">
            {items.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-muted-foreground">{d.code}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <RefCodeFormDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editing ? "Edit department" : "New department"}
          initialName={editing?.name ?? ""}
          initialCode={editing?.code ?? ""}
          onSave={async (input) => {
            const res = editing
              ? await updateDepartment(editing.id, input)
              : await createDepartment(input);
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
