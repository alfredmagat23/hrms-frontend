"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import { getMyBalances } from "@/lib/services/leave-service";
import { useSession } from "@/lib/session/session-context";

export default function LeaveBalancesPage() {
  const { ready, user } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState<
    Extract<Awaited<ReturnType<typeof getMyBalances>>, { ok: true }>["data"]
  >([]);

  function load() {
    setLoading(true);
    void getMyBalances().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError("");
      setBalances(res.data);
    });
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  const noProfile = Boolean(ready && user && !user.employeeId);

  return (
    <AppShell title="Leave Balance">
      {noProfile ? (
        <EmptyState
          title="No employee profile is linked to this demo account."
          description="Leave balance is available only to users with an employee profile."
        />
      ) : null}
      {!noProfile && (!ready || loading) ? <LoadingBlock /> : null}
      {!noProfile && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!noProfile && !loading && !error && balances.length === 0 ? (
        <EmptyState title="No leave balances" />
      ) : null}
      {!noProfile && balances.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Entitled</th>
                <th className="p-3 font-medium">Used</th>
                <th className="p-3 font-medium">Pending</th>
                <th className="p-3 font-medium">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {balances.map((b) => (
                <tr key={b.leaveTypeId}>
                  <td className="p-3 font-medium">{b.leaveTypeName}</td>
                  <td className="p-3">{b.entitled}</td>
                  <td className="p-3">{b.used}</td>
                  <td className="p-3">{b.pending}</td>
                  <td className="p-3 font-semibold">{b.available}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AppShell>
  );
}
