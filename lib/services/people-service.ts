import {
  COMPANY_DISPLAY_BY_ID,
  DIRECTORY_FILTER_COMPANIES,
  DIRECTORY_FILTER_DEPARTMENTS,
  DIRECTORY_FILTER_LOCATIONS,
  DIRECTORY_FILTER_POSITIONS,
  DIRECTORY_FILTER_STATUSES,
  DIRECTORY_FILTER_TEAMS,
} from "@/lib/domain/directory-catalog";
import type { ServiceResult } from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { hasCapability } from "@/lib/auth/capabilities";
import { delay, getStore, mutateStore } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

/** Employee-visible directory row — no HR-only fields. */
export interface DirectoryEmployeeSummary {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  workContact: string;
  location: string;
  statusLabel: string;
  companyId: string;
  companyName: string;
  departmentName: string;
  team: string;
  positionName: string;
}

/** HR directory row with management fields. */
export interface HrEmployeeSummary extends DirectoryEmployeeSummary {
  email: string;
  statusId: string;
  departmentId: string;
  positionId: string;
  shiftId: string;
  shiftName: string;
}

/** @deprecated Prefer DirectoryEmployeeSummary | HrEmployeeSummary */
export type EmployeeSummary = HrEmployeeSummary;

export type AssignmentView =
  | {
      kind: "active";
      companyId: string;
      companyName: string;
      departmentName: string;
      positionName: string;
      team: string;
      shiftName: string;
      isPrimary: boolean;
    }
  | {
      kind: "switch";
      companyId: string;
      companyName: string;
    }
  | {
      kind: "additional";
    };

export type DirectoryEmployeeProfile = DirectoryEmployeeSummary;

export interface HrEmployeeDetail extends HrEmployeeSummary {
  assignments: AssignmentView[];
}

/** @deprecated Prefer DirectoryEmployeeProfile | HrEmployeeDetail */
export type EmployeeDetail = HrEmployeeDetail;

export interface PeopleDirectoryFilters {
  search?: string;
  statusLabels?: string[];
  locations?: string[];
  companyIds?: string[];
  departmentNames?: string[];
  teams?: string[];
  positionNames?: string[];
}

export interface PeopleFilterOptions {
  statuses: string[];
  locations: string[];
  companies: { id: string; name: string }[];
  departments: string[];
  teams: string[];
  positions: string[];
  isGroupHr: boolean;
}

export function isGroupHrUser(permittedCompanyIds: string[]): boolean {
  return permittedCompanyIds.length > 1;
}

export async function getPeopleFilterOptions(): Promise<
  ServiceResult<PeopleFilterOptions>
> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const { roleId, companyId, permittedCompanyIds, store } = scoped.data;
  const group = roleId === "hr" && isGroupHrUser(permittedCompanyIds);

  const companyScope = group
    ? permittedCompanyIds
    : [companyId];

  const companies = store.companies
    .filter((c) => companyScope.includes(c.id))
    .map((c) => ({
      id: c.id,
      name: COMPANY_DISPLAY_BY_ID[c.id] ?? c.name,
    }))
    .filter((c) => DIRECTORY_FILTER_COMPANIES.includes(c.name));

  return delay(
    ok({
      statuses: DIRECTORY_FILTER_STATUSES,
      locations: DIRECTORY_FILTER_LOCATIONS,
      companies,
      departments: DIRECTORY_FILTER_DEPARTMENTS,
      teams: DIRECTORY_FILTER_TEAMS,
      positions: DIRECTORY_FILTER_POSITIONS,
      isGroupHr: group,
    }),
  );
}

function resolveScopeIds(
  roleId: string,
  companyId: string,
  permittedCompanyIds: string[],
  filters?: PeopleDirectoryFilters,
): string[] {
  if (roleId === "hr" && isGroupHrUser(permittedCompanyIds)) {
    const requested = (filters?.companyIds ?? []).filter((id) =>
      permittedCompanyIds.includes(id),
    );
    return requested.length ? requested : [...permittedCompanyIds];
  }
  return [companyId];
}

function applyDirectoryFilters(
  summaries: DirectoryEmployeeSummary[],
  filters?: PeopleDirectoryFilters,
): DirectoryEmployeeSummary[] {
  let next = summaries;
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.employeeNo.toLowerCase().includes(q) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q),
    );
  }
  if (filters?.statusLabels?.length) {
    const set = new Set(filters.statusLabels);
    next = next.filter((s) => set.has(s.statusLabel));
  }
  if (filters?.locations?.length) {
    const set = new Set(filters.locations);
    next = next.filter((s) => set.has(s.location));
  }
  if (filters?.departmentNames?.length) {
    const set = new Set(filters.departmentNames);
    next = next.filter((s) => set.has(s.departmentName));
  }
  if (filters?.teams?.length) {
    const set = new Set(filters.teams);
    next = next.filter((s) => set.has(s.team));
  }
  if (filters?.positionNames?.length) {
    const set = new Set(filters.positionNames);
    next = next.filter((s) => set.has(s.positionName));
  }
  return next;
}

export async function listEmployees(
  filters?: PeopleDirectoryFilters,
): Promise<ServiceResult<(DirectoryEmployeeSummary | HrEmployeeSummary)[]>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const { store, companyId, permittedCompanyIds, roleId } = scoped.data;
  const scopeIds = resolveScopeIds(
    roleId,
    companyId,
    permittedCompanyIds,
    filters,
  );

  if (roleId === "hr") {
    let summaries = store.assignments
      .filter((a) => scopeIds.includes(a.companyId))
      .map((a) => toHrSummary(store, a.employeeId, a.companyId))
      .filter((s): s is HrEmployeeSummary => Boolean(s));
    summaries = applyDirectoryFilters(
      summaries,
      filters,
    ) as HrEmployeeSummary[];
    return delay(
      ok(
        summaries.sort(
          (a, b) =>
            a.lastName.localeCompare(b.lastName) ||
            a.companyName.localeCompare(b.companyName),
        ),
      ),
    );
  }

  let summaries = store.assignments
    .filter((a) => scopeIds.includes(a.companyId))
    .map((a) => toDirectorySummary(store, a.employeeId, a.companyId))
    .filter((s): s is DirectoryEmployeeSummary => Boolean(s));
  summaries = applyDirectoryFilters(summaries, filters);
  return delay(
    ok(
      summaries.sort(
        (a, b) =>
          a.lastName.localeCompare(b.lastName) ||
          a.companyName.localeCompare(b.companyName),
      ),
    ),
  );
}

export async function getEmployee(
  id: string,
  companyIdOverride?: string,
): Promise<ServiceResult<DirectoryEmployeeProfile | HrEmployeeDetail>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);

  const { store, companyId, permittedCompanyIds, roleId } = scoped.data;
  const group = roleId === "hr" && isGroupHrUser(permittedCompanyIds);

  let viewCompanyId = companyId;
  if (group && companyIdOverride && permittedCompanyIds.includes(companyIdOverride)) {
    viewCompanyId = companyIdOverride;
  } else if (group) {
    const any = store.assignments.find(
      (a) =>
        a.employeeId === id && permittedCompanyIds.includes(a.companyId),
    );
    if (any) viewCompanyId = any.companyId;
  }

  const allowedCompanies =
    roleId === "hr" && group ? permittedCompanyIds : [companyId];

  const hasAccess = store.assignments.some(
    (a) => a.employeeId === id && allowedCompanies.includes(a.companyId),
  );
  if (!hasAccess) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }

  if (roleId !== "hr") {
    const summary = toDirectorySummary(store, id, viewCompanyId);
    if (!summary) {
      return delay(fail("NOT_FOUND", "Employee was not found."));
    }
    return delay(ok(summary));
  }

  const summary = toHrSummary(store, id, viewCompanyId);
  if (!summary) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }

  const assignments: AssignmentView[] = store.assignments
    .filter((a) => a.employeeId === id)
    .map((a) => {
      if (a.companyId === viewCompanyId) {
        const company = store.companies.find((c) => c.id === a.companyId)!;
        const department = store.departments.find((d) => d.id === a.departmentId)!;
        const position = store.positions.find((p) => p.id === a.positionId)!;
        const shift = store.shifts.find((s) => s.id === a.shiftId)!;
        return {
          kind: "active" as const,
          companyId: a.companyId,
          companyName: company.name,
          departmentName: department.name,
          positionName: position.name,
          team: a.team,
          shiftName: shift.name,
          isPrimary: a.isPrimary,
        };
      }
      if (permittedCompanyIds.includes(a.companyId)) {
        const company = store.companies.find((c) => c.id === a.companyId)!;
        return {
          kind: "switch" as const,
          companyId: a.companyId,
          companyName: company.name,
        };
      }
      return { kind: "additional" as const };
    });

  return delay(ok({ ...summary, assignments }));
}

export async function createEmployee(input: {
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  statusId: string;
  departmentId: string;
  positionId: string;
  shiftId: string;
}): Promise<ServiceResult<HrEmployeeDetail>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!hasCapability(scoped.data.roleId, "hr.people.create")) {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const errors = validateEmployeeInput(input, scoped.data.store);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }

  const id = `emp-${crypto.randomUUID().slice(0, 8)}`;
  mutateStore((s) => {
    s.employees.push({
      id,
      employeeNo: input.employeeNo.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: input.statusId,
    });
    s.assignments.push({
      id: `asg-${crypto.randomUUID().slice(0, 8)}`,
      employeeId: id,
      companyId: scoped.data.companyId,
      departmentId: input.departmentId,
      positionId: input.positionId,
      shiftId: input.shiftId,
      team: "Administrative",
      isPrimary: true,
    });
    for (const leaveType of s.leaveTypes) {
      s.leaveBalances.push({
        employeeId: id,
        companyId: scoped.data.companyId,
        leaveTypeId: leaveType.id,
        entitled: leaveType.id === "lt-vl" ? 15 : 10,
        used: 0,
      });
    }
  });

  const detail = await getEmployee(id);
  if (!detail.ok || !("assignments" in detail.data)) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }
  return delay(ok(detail.data));
}

export async function updateEmployee(
  id: string,
  input: {
    employeeNo: string;
    firstName: string;
    lastName: string;
    email: string;
    statusId: string;
    departmentId: string;
    positionId: string;
    shiftId: string;
  },
): Promise<ServiceResult<HrEmployeeDetail>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!hasCapability(scoped.data.roleId, "hr.people.edit")) {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const assignment = scoped.data.store.assignments.find(
    (a) => a.employeeId === id && a.companyId === scoped.data.companyId,
  );
  if (!assignment) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }

  const errors = validateEmployeeInput(input, scoped.data.store, id);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }

  mutateStore((s) => {
    const employee = s.employees.find((e) => e.id === id)!;
    employee.employeeNo = input.employeeNo.trim();
    employee.firstName = input.firstName.trim();
    employee.lastName = input.lastName.trim();
    employee.email = input.email.trim().toLowerCase();
    employee.statusId = input.statusId;
    const asg = s.assignments.find(
      (a) => a.employeeId === id && a.companyId === scoped.data.companyId,
    )!;
    asg.departmentId = input.departmentId;
    asg.positionId = input.positionId;
    asg.shiftId = input.shiftId;
  });

  const detail = await getEmployee(id);
  if (!detail.ok || !("assignments" in detail.data)) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }
  return delay(ok(detail.data));
}

export async function changeStatus(
  id: string,
  statusId: string,
): Promise<ServiceResult<HrEmployeeDetail>> {
  const scoped = requireScopedSession();
  if (!scoped.ok) return delay(scoped);
  if (!hasCapability(scoped.data.roleId, "hr.people.change_status")) {
    return delay(fail("FORBIDDEN_COMPANY", "HR access is required."));
  }

  const hasActive = scoped.data.store.assignments.some(
    (a) => a.employeeId === id && a.companyId === scoped.data.companyId,
  );
  if (!hasActive) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }
  if (!scoped.data.store.employmentStatuses.some((s) => s.id === statusId)) {
    return delay(fail("VALIDATION", "Invalid employment status."));
  }

  mutateStore((s) => {
    s.employees.find((e) => e.id === id)!.statusId = statusId;
  });

  const detail = await getEmployee(id);
  if (!detail.ok || !("assignments" in detail.data)) {
    return delay(fail("NOT_FOUND", "Employee was not found."));
  }
  return delay(ok(detail.data));
}

function validateEmployeeInput(
  input: {
    employeeNo: string;
    firstName: string;
    lastName: string;
    email: string;
    statusId: string;
    departmentId: string;
    positionId: string;
    shiftId: string;
  },
  store: ReturnType<typeof getStore>,
  excludeId?: string,
) {
  const errors: { field: string; message: string }[] = [];
  if (!input.firstName.trim()) {
    errors.push({ field: "firstName", message: "First name is required." });
  }
  if (!input.lastName.trim()) {
    errors.push({ field: "lastName", message: "Last name is required." });
  }
  if (!input.employeeNo.trim()) {
    errors.push({ field: "employeeNo", message: "Employee number is required." });
  } else if (
    store.employees.some(
      (e) =>
        e.employeeNo.toLowerCase() === input.employeeNo.trim().toLowerCase() &&
        e.id !== excludeId,
    )
  ) {
    errors.push({ field: "employeeNo", message: "Employee number must be unique." });
  }
  if (!input.email.trim()) {
    errors.push({ field: "email", message: "Email is required." });
  }
  if (!store.employmentStatuses.some((s) => s.id === input.statusId)) {
    errors.push({ field: "statusId", message: "Select a valid status." });
  }
  if (!store.departments.some((d) => d.id === input.departmentId)) {
    errors.push({ field: "departmentId", message: "Select a valid department." });
  }
  if (!store.positions.some((p) => p.id === input.positionId)) {
    errors.push({ field: "positionId", message: "Select a valid position." });
  }
  if (!store.shifts.some((s) => s.id === input.shiftId)) {
    errors.push({ field: "shiftId", message: "Select a valid shift." });
  }
  return errors;
}

function toDirectorySummary(
  store: ReturnType<typeof getStore>,
  employeeId: string,
  companyId: string,
): DirectoryEmployeeSummary | null {
  const employee = store.employees.find((e) => e.id === employeeId);
  const assignment = store.assignments.find(
    (a) => a.employeeId === employeeId && a.companyId === companyId,
  );
  if (!employee || !assignment) return null;
  const status = store.employmentStatuses.find((s) => s.id === employee.statusId)!;
  const department = store.departments.find((d) => d.id === assignment.departmentId)!;
  const position = store.positions.find((p) => p.id === assignment.positionId)!;
  const company = store.companies.find((c) => c.id === companyId)!;
  return {
    id: employee.id,
    employeeNo: employee.employeeNo,
    firstName: employee.firstName,
    lastName: employee.lastName,
    workContact: employee.workContact,
    location: employee.location,
    statusLabel: status.label,
    companyId,
    companyName: company.name,
    departmentName: department.name,
    team: assignment.team,
    positionName: position.name,
  };
}

function toHrSummary(
  store: ReturnType<typeof getStore>,
  employeeId: string,
  companyId: string,
): HrEmployeeSummary | null {
  const base = toDirectorySummary(store, employeeId, companyId);
  if (!base) return null;
  const employee = store.employees.find((e) => e.id === employeeId)!;
  const assignment = store.assignments.find(
    (a) => a.employeeId === employeeId && a.companyId === companyId,
  )!;
  const shift = store.shifts.find((s) => s.id === assignment.shiftId)!;
  return {
    ...base,
    email: employee.email,
    statusId: employee.statusId,
    departmentId: assignment.departmentId,
    positionId: assignment.positionId,
    shiftId: shift.id,
    shiftName: shift.name,
  };
}
