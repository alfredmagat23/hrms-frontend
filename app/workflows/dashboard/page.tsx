"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { getWorkflowDashboard } from "@/lib/services/workflow-service";
import { useSession } from "@/lib/session/session-context";

export default function WorkflowsDashboardPage() {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<
    Extract<Awaited<ReturnType<typeof getWorkflowDashboard>>, { ok: true }>["data"] | null
  >(null);

  useEffect(() => {
    if (!ready) return;
    void getWorkflowDashboard().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setData(res.data);
    });
  }, [ready]);

  return (
    <AppShell title="Workflows">
      <div className="space-y-4">
        <DemoNotice>
          Presentation-only dashboard — no workflow builder or execution engine.
        </DemoNotice>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} /> : null}
        {data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Active workflows" value={data.activeCount} />
              <Stat label="Pending steps" value={data.pendingSteps} />
              <Stat label="Completed this month" value={data.completedThisMonth} />
            </div>
            <section className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold">Workflows</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.workflows.map((w) => (
                  <li
                    key={w.name}
                    className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
                  >
                    <span>{w.name}</span>
                    <StatusBadge label={w.status} tone="neutral" />
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold">Recent activity</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="font-medium">{a.workflowName}</p>
                    <p className="text-muted-foreground">
                      {a.stepLabel} · {a.at} · {a.status}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
