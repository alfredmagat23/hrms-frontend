"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  Clock,
  FileWarning,
  Plane,
} from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { hasCapability } from "@/lib/auth/capabilities";
import {
  getEmployeeHome,
  getHrHome,
} from "@/lib/services/dashboard-service";
import type { ToDoView } from "@/lib/services/todo-service";
import { useSession } from "@/lib/session/session-context";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { ready, roleId } = useSession();

  if (!ready) {
    return (
      <AppShell title="Home">
        <LoadingBlock />
      </AppShell>
    );
  }

  if (roleId === "hr") {
    return <HrHomeContent />;
  }

  return <EmployeeHomeContent />;
}

function EmployeeHomeContent() {
  const { ready, activeCompany } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<
    Extract<Awaited<ReturnType<typeof getEmployeeHome>>, { ok: true }>["data"] | null
  >(null);

  function load() {
    setLoading(true);
    setError("");
    void getEmployeeHome().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setData(res.data);
    });
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  return (
    <AppShell title="Home">
      {!ready || loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {data ? (
        <div className="space-y-5">
          <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Hello, {data.greetingName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeCompany?.name
                  ? `Your overview for ${activeCompany.name}`
                  : "Your personal HR overview."}
              </p>
            </div>
            <Button className="w-full shrink-0 sm:w-auto" asChild>
              <Link href="/leave/request">Request Time Off</Link>
            </Button>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Leave balances
                </h2>
                <Button variant="link" className="h-auto p-0 text-sm" asChild>
                  <Link href="/leave/balances">View all</Link>
                </Button>
              </div>
              {data.balances.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No balances.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {data.balances.map((b) => {
                    const pct =
                      b.entitled > 0
                        ? Math.min(100, Math.max(0, (b.available / b.entitled) * 100))
                        : 0;
                    return (
                      <li key={b.leaveTypeId} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="font-medium text-foreground">
                            {b.leaveTypeName}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {b.available}
                            </span>{" "}
                            available
                            <span className="text-muted-foreground">
                              {" "}
                              / {b.entitled} entitled
                            </span>
                          </span>
                        </div>
                        <div
                          className="h-1.5 overflow-hidden rounded-full bg-muted"
                          role="img"
                          aria-label={`${b.leaveTypeName}: ${b.available} of ${b.entitled} days available`}
                        >
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Pending requests
              </h2>
              {data.pendingRequests.length === 0 ? (
                <div className="mt-3">
                  <EmptyState
                    title="No pending requests"
                    description="You have no leave requests awaiting approval."
                    action={
                      <Button asChild size="sm">
                        <Link href="/leave/request">Request time off</Link>
                      </Button>
                    }
                  />
                </div>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {data.pendingRequests.map((r) => (
                    <li key={r.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          href={`/leave/history/${r.id}`}
                          className="font-medium text-foreground underline-offset-2 hover:underline"
                        >
                          {r.leaveTypeName}
                        </Link>
                        <StatusBadge
                          label={r.currentStageLabel}
                          tone="warning"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {r.startDate} – {r.endDate}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-lg border border-border bg-card px-4 py-3 shadow-[var(--elevation)] sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground"
                aria-hidden="true"
              >
                <CalendarDays className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Upcoming holidays
                </h2>
                {data.upcomingHolidays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None scheduled.</p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {data.upcomingHolidays.map((h) => (
                      <li key={h.id}>
                        <span className="font-medium tabular-nums text-foreground">
                          {h.date}
                        </span>
                        <span aria-hidden="true"> — </span>
                        {h.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">To-dos</h2>
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <Link href="/todos/tasks">All to-dos</Link>
              </Button>
            </div>
            {data.todos.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {data.todos.map((t) => {
                  const meta = todoMeta(t);
                  const Icon = meta.icon;
                  return (
                    <li
                      key={t.id}
                      className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"
                          aria-hidden="true"
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {t.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {meta.kindLabel}
                            {t.relatedDate ? (
                              <>
                                <span aria-hidden="true"> · </span>
                                <span className="tabular-nums">
                                  {t.relatedDate}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        asChild
                      >
                        <Link href={t.href}>Open</Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}

function todoMeta(todo: ToDoView): {
  icon: typeof CheckSquare;
  kindLabel: string;
} {
  switch (todo.kind) {
    case "rejected_leave":
      return { icon: FileWarning, kindLabel: "Rejected leave" };
    case "missing_punch":
      return { icon: Clock, kindLabel: "Missing punch" };
    case "upcoming_leave":
      return { icon: Plane, kindLabel: "Upcoming leave" };
    default:
      return { icon: CheckSquare, kindLabel: "To-do" };
  }
}

function HrHomeContent() {
  const { ready, roleId, activeCompany } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<
    Extract<Awaited<ReturnType<typeof getHrHome>>, { ok: true }>["data"] | null
  >(null);

  function load() {
    setLoading(true);
    void getHrHome().then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setData(res.data);
    });
  }

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  return (
    <AppShell title="Home">
      {!ready || loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {data ? (
        <div className="space-y-5">
          <section className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              HR overview
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeCompany?.name
                ? `Company snapshot for ${activeCompany.name}`
                : "Company snapshot for today."}
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Pending HR approval"
              value={data.pendingLeaveCount}
              emphasis
              href="/leave/approvals"
              actionLabel="Review leave"
            />
            <StatCard label="Present today" value={data.attendanceToday.present} />
            <StatCard label="Late today" value={data.attendanceToday.late} />
            <StatCard label="Absent today" value={data.attendanceToday.absent} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Leave awaiting HR
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/leave/approvals">View all</Link>
                </Button>
              </div>
              {data.pendingRequests.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No pending items.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {data.pendingRequests.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/leave/approvals/${r.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {r.employeeName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {r.leaveTypeName}
                          <span aria-hidden="true"> · </span>
                          <span className="tabular-nums">
                            {r.startDate} – {r.endDate}
                          </span>
                        </p>
                      </div>
                      <StatusBadge
                        label={r.currentStageLabel}
                        tone="warning"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Headcount by status
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {data.headcountByStatus.map((s) => (
                  <li
                    key={s.statusId}
                    className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="tabular-nums font-semibold text-foreground">
                      {s.count}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--elevation)] sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Today&apos;s attendance snapshot
            </h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                <dt className="text-muted-foreground">Missing punches</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {data.attendanceToday.missingPunch}
                </dd>
              </div>
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                <dt className="text-muted-foreground">On leave</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {data.attendanceToday.onLeave}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {hasCapability(roleId, "hr.attendance.company_view") ? (
                <Button variant="link" className="h-auto p-0" asChild>
                  <Link href="/attendance/company">Open daily attendance</Link>
                </Button>
              ) : null}
              <Button variant="link" className="h-auto p-0" asChild>
                <Link href="/attendance/my-attendance">My Attendance</Link>
              </Button>
              <Button variant="link" className="h-auto p-0" asChild>
                <Link href="/todos/time-off">Time Off to-dos</Link>
              </Button>
              {hasCapability(roleId, "hr.settings.manage") ? (
                <Button variant="link" className="h-auto p-0" asChild>
                  <Link href="/hr/settings/departments">Settings</Link>
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  emphasis,
  href,
  actionLabel,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 shadow-[var(--elevation)] sm:p-5",
        emphasis
          ? "border-primary/30 bg-accent/40"
          : "border-border",
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {href && actionLabel ? (
        <Button variant="link" className="mt-2 h-auto p-0 text-sm" asChild>
          <Link href={href}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
