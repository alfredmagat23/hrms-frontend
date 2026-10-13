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
import type { Position } from "@/lib/domain/types";
import {
  createPosition,
  listPositions,
  updatePosition,
} from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

export default function HrPositionsSettingsPage() {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Position[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);

  function load() {
    setLoading(true);
    void listPositions().then((res) => {
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
    <AppShell title="Positions">
      <div className="mx-auto max-w-2xl space-y-4">
        <DemoNotice>
          Shared across TLS Group — changes apply to all companies in this demo.
        </DemoNotice>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add position
          </Button>
        </div>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !error ? (
          <ul className="divide-y rounded-lg border bg-card">
            {items.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-muted-foreground">{p.code}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(p);
                    setDialogOpen(true);
                  }}
                >
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
          title={editing ? "Edit position" : "New position"}
          initialName={editing?.name ?? ""}
          initialCode={editing?.code ?? ""}
          onSave={async (input) => {
            const res = editing
              ? await updatePosition(editing.id, input)
              : await createPosition(input);
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
