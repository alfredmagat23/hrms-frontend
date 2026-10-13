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
import { listObjectives } from "@/lib/services/okr-service";
import { useSession } from "@/lib/session/session-context";

export default function OkrObjectivesPage() {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<
    Extract<Awaited<ReturnType<typeof listObjectives>>, { ok: true }>["data"]
  >([]);

  useEffect(() => {
    if (!ready) return;
    void listObjectives().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setItems(res.data);
    });
  }, [ready]);

  return (
    <AppShell title="OKR">
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Objectives</h2>
          <p className="text-sm text-muted-foreground">
            Read-only fictional objectives for demo presentation.
          </p>
        </div>
        <DemoNotice>
          No performance scoring, compensation links, or evaluation workflows.
        </DemoNotice>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && items.length === 0 ? (
          <EmptyState title="No objectives" />
        ) : null}
        <ul className="space-y-3">
          {items.map((o) => (
            <li key={o.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{o.title}</h3>
                  <p className="text-sm text-muted-foreground">{o.period}</p>
                </div>
                <StatusBadge label={o.status} tone="neutral" />
              </div>
              <p className="mt-2 text-sm">Progress: {o.progress}%</p>
              <div
                className="mt-1 h-2 overflow-hidden rounded bg-muted"
                role="progressbar"
                aria-valuenow={o.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${o.title} progress`}
              >
                <div
                  className="h-full bg-primary motion-reduce:transition-none"
                  style={{ width: `${o.progress}%` }}
                />
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {o.keyResults.map((kr) => (
                  <li key={kr.id}>
                    {kr.title} — {kr.progress}%
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
