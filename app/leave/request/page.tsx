"use client";

import { AppShell } from "@/components/shell/app-shell";
import { DemoNotice, EmptyState } from "@/components/shared/page-states";
import { LeaveRequestForm } from "@/features/leave/leave-request-form";
import { useSession } from "@/lib/session/session-context";

export default function LeaveRequestPage() {
  const { ready, user } = useSession();
  const noProfile = Boolean(ready && user && !user.employeeId);

  return (
    <AppShell title="Request Time Off">
      {noProfile ? (
        <EmptyState
          title="No employee profile is linked to this demo account."
          description="Request Time Off is available only to users with an employee profile."
        />
      ) : (
        <div className="space-y-4">
          <DemoNotice>
            Manager approval is simulated in this demo. Your request goes to HR after
            submission.
          </DemoNotice>
          <LeaveRequestForm />
        </div>
      )}
    </AppShell>
  );
}
