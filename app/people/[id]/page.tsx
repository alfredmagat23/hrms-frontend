"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { hasCapability } from "@/lib/auth/capabilities";
import {
  getEmployee,
  type DirectoryEmployeeProfile,
  type HrEmployeeDetail,
} from "@/lib/services/people-service";
import { useSession } from "@/lib/session/session-context";

function isHrDetail(
  value: DirectoryEmployeeProfile | HrEmployeeDetail,
): value is HrEmployeeDetail {
  return "assignments" in value && "email" in value;
}

export default function EmployeeProfilePage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Employee Profile">
          <LoadingBlock />
        </AppShell>
      }
    >
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const company = search.get("company") ?? undefined;
  const { ready, roleId } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState<
    DirectoryEmployeeProfile | HrEmployeeDetail | null
  >(null);

  const load = useCallback(() => {
    setLoading(true);
    void getEmployee(id, company).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setEmployee(res.data);
    });
  }, [id, company]);

  useEffect(() => {
    if (!ready || !id) return;
    load();
  }, [ready, id, load]);

  const hrDetail = employee && isHrDetail(employee) ? employee : null;
  const canEdit = hasCapability(roleId, "hr.people.edit");

  return (
    <AppShell title="Employee Profile">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/people">Back to people</Link>
        </Button>
        {hrDetail && canEdit ? (
          <Button size="sm" asChild>
            <Link href={`/people/${hrDetail.id}/edit`}>Edit</Link>
          </Button>
        ) : null}
      </div>
      {!ready || loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {employee ? (
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{employee.employeeNo}</p>
            <div className="mt-2">
              <StatusBadge label={employee.statusLabel} tone="neutral" />
            </div>
          </div>
          <section className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Profile</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Company contact</dt>
                <dd>{employee.workContact}</dd>
              </div>
              {hrDetail ? (
                <div>
                  <dt className="text-muted-foreground">Work email</dt>
                  <dd>{hrDetail.email}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd>{employee.location}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd>{employee.companyName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd>{employee.departmentName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Team</dt>
                <dd>{employee.team}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Position</dt>
                <dd>{employee.positionName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Employment status</dt>
                <dd>{employee.statusLabel}</dd>
              </div>
            </dl>
          </section>
          {hrDetail ? (
            <section className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Assignments</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {hrDetail.assignments.map((a, i) => (
                  <li key={i} className="rounded-md bg-muted/40 px-3 py-2">
                    {a.kind === "active" ? (
                      <>
                        <span className="font-medium">{a.companyName}</span> —{" "}
                        {a.departmentName}, {a.team}, {a.positionName} (
                        {a.shiftName})
                        {a.isPrimary ? (
                          <span className="text-muted-foreground"> · Primary</span>
                        ) : null}
                      </>
                    ) : a.kind === "switch" ? (
                      <>
                        Also assigned at{" "}
                        <span className="font-medium">{a.companyName}</span>{" "}
                        (switch company to view details)
                      </>
                    ) : (
                      <>Additional company assignment</>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </AppShell>
  );
}
