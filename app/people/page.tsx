"use client";

import Link from "next/link";
import { Filter, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EMPTY_FILTERS,
  PeopleFilterPanel,
  countActiveFilters,
  type PeopleFilterDraft,
} from "@/components/people/people-filter-panel";
import { AppShell } from "@/components/shell/app-shell";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasCapability } from "@/lib/auth/capabilities";
import {
  getPeopleFilterOptions,
  listEmployees,
  type PeopleFilterOptions,
} from "@/lib/services/people-service";
import { useSession } from "@/lib/session/session-context";

function statusTone(
  label: string,
): "neutral" | "success" | "warning" | "danger" | "info" {
  const key = label.trim().toLowerCase();
  if (key === "active") return "success";
  if (key === "inactive") return "danger";
  if (key === "on leave") return "warning";
  return "neutral";
}

export default function PeoplePage() {
  const { ready, activeCompany, roleId } = useSession();
  const canCreate = hasCapability(roleId, "hr.people.create");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<
    Extract<Awaited<ReturnType<typeof listEmployees>>, { ok: true }>["data"]
  >([]);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState<PeopleFilterDraft>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [options, setOptions] = useState<PeopleFilterOptions | null>(null);

  const activeCount = countActiveFilters(applied);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      statusLabels: applied.statusLabels.length
        ? applied.statusLabels
        : undefined,
      locations: applied.locations.length ? applied.locations : undefined,
      companyIds: applied.companyIds.length ? applied.companyIds : undefined,
      departmentNames: applied.departmentNames.length
        ? applied.departmentNames
        : undefined,
      teams: applied.teams.length ? applied.teams : undefined,
      positionNames: applied.positionNames.length
        ? applied.positionNames
        : undefined,
    }),
    [search, applied],
  );

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    void listEmployees(query).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setEmployees(res.data);
    });
  }, [query]);

  useEffect(() => {
    if (!ready) return;
    void getPeopleFilterOptions().then((res) => {
      if (res.ok) setOptions(res.data);
    });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [ready, load]);

  function removeChip(group: keyof PeopleFilterDraft, value: string) {
    setApplied((prev) => ({
      ...prev,
      [group]: prev[group].filter((v) => v !== value),
    }));
  }

  const chips: { group: keyof PeopleFilterDraft; value: string; label: string }[] =
    [];
  for (const s of applied.statusLabels) {
    chips.push({ group: "statusLabels", value: s, label: `Status: ${s}` });
  }
  for (const l of applied.locations) {
    chips.push({ group: "locations", value: l, label: `Location: ${l}` });
  }
  for (const id of applied.companyIds) {
    const name = options?.companies.find((c) => c.id === id)?.name ?? id;
    chips.push({ group: "companyIds", value: id, label: `Company: ${name}` });
  }
  for (const d of applied.departmentNames) {
    chips.push({ group: "departmentNames", value: d, label: `Dept: ${d}` });
  }
  for (const t of applied.teams) {
    chips.push({ group: "teams", value: t, label: `Team: ${t}` });
  }
  for (const p of applied.positionNames) {
    chips.push({ group: "positionNames", value: p, label: `Position: ${p}` });
  }

  const filterButton = (
    <Button
      type="button"
      variant="outline"
      aria-expanded={filterOpen}
      aria-label={
        activeCount ? `Open filters, ${activeCount} active` : "Open filters"
      }
    >
      <Filter className="size-4" aria-hidden="true" />
      Filter
      {activeCount > 0 ? (
        <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
          {activeCount}
        </span>
      ) : null}
    </Button>
  );

  return (
    <AppShell title="People">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Employee directory · {employees.length} visible
            {options?.isGroupHr ? (
              <>
                {" "}
                · Directory may include all permitted companies via Filter
                (header active company:{" "}
                <span className="font-medium text-foreground">
                  {activeCompany?.name ?? "selected company"}
                </span>
                )
              </>
            ) : (
              <>
                {" "}
                · Showing{" "}
                <span className="font-medium text-foreground">
                  {activeCompany?.name ?? "selected company"}
                </span>{" "}
                only
              </>
            )}
          </p>
          {canCreate ? (
            <Button asChild>
              <Link href="/people/new">Add employee</Link>
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="max-w-sm min-w-0 flex-1"
            placeholder="Search name or employee no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search employees"
          />
          <div className="ml-auto">
            {options ? (
              <PeopleFilterPanel
                open={filterOpen}
                onOpenChange={setFilterOpen}
                options={options}
                applied={applied}
                onApply={setApplied}
                trigger={filterButton}
              />
            ) : (
              filterButton
            )}
          </div>
        </div>

        {chips.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={`${c.group}-${c.value}`}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring"
                  onClick={() => removeChip(c.group, c.value)}
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label}
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !error && employees.length === 0 ? (
          <EmptyState title="No employees match your filters" />
        ) : null}

        {employees.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">Employee</th>
                    <th className="p-3 font-medium">Company</th>
                    <th className="p-3 font-medium">Department</th>
                    <th className="p-3 font-medium">Team</th>
                    <th className="p-3 font-medium">Position</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map((e) => (
                    <tr key={`${e.id}-${e.companyId}`}>
                      <td className="p-3">
                        {e.firstName} {e.lastName}
                      </td>
                      <td className="p-3">{e.companyName}</td>
                      <td className="p-3">{e.departmentName}</td>
                      <td className="p-3">{e.team}</td>
                      <td className="p-3">{e.positionName}</td>
                      <td className="p-3">
                        <StatusBadge
                          label={e.statusLabel}
                          tone={statusTone(e.statusLabel)}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/people/${e.id}?company=${e.companyId}`}
                          >
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-3 md:hidden">
              {employees.map((e) => (
                <li
                  key={`${e.id}-${e.companyId}`}
                  className="rounded-lg border bg-card p-3 text-sm"
                >
                  <p className="font-medium">
                    {e.firstName} {e.lastName}
                  </p>
                  <p className="mt-1">{e.companyName}</p>
                  <p>
                    {e.departmentName} · {e.team}
                  </p>
                  <p>{e.positionName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusBadge
                      label={e.statusLabel}
                      tone={statusTone(e.statusLabel)}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/people/${e.id}?company=${e.companyId}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
