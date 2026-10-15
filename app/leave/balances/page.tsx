"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <Table className="min-w-[480px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Type</TableHead>
              <TableHead>Entitled</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Available</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((b) => (
              <TableRow key={b.leaveTypeId}>
                <TableCell className="font-medium">{b.leaveTypeName}</TableCell>
                <TableCell>{b.entitled}</TableCell>
                <TableCell>{b.used}</TableCell>
                <TableCell>{b.pending}</TableCell>
                <TableCell className="font-semibold">{b.available}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </AppShell>
  );
}
