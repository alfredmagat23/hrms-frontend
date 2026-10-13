import type {
  Department,
  Holiday,
  Position,
  ServiceResult,
  Shift,
} from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay, mutateStore } from "@/lib/mock/store";
import { requireScopedSession } from "@/lib/services/scope";

async function requireHr() {
  const scoped = requireScopedSession();
  if (!scoped.ok) return scoped;
  if (scoped.data.roleId !== "hr") {
    return fail("FORBIDDEN_COMPANY", "HR access is required.");
  }
  return scoped;
}

export async function listDepartments(): Promise<ServiceResult<Department[]>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  return delay(ok(scoped.data.store.departments));
}

export async function createDepartment(input: {
  name: string;
  code: string;
}): Promise<ServiceResult<Department>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  const errors = validateRef(input, scoped.data.store.departments);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }
  const item: Department = {
    id: `dept-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
  };
  mutateStore((s) => s.departments.push(item));
  return delay(ok(item));
}

export async function updateDepartment(
  id: string,
  input: { name: string; code: string },
): Promise<ServiceResult<Department>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  const existing = scoped.data.store.departments.find((d) => d.id === id);
  if (!existing) return delay(fail("NOT_FOUND", "Department was not found."));
  const errors = validateRef(input, scoped.data.store.departments, id);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }
  mutateStore((s) => {
    const item = s.departments.find((d) => d.id === id)!;
    item.name = input.name.trim();
    item.code = input.code.trim().toUpperCase();
  });
  return delay(ok(scoped.data.store.departments.find((d) => d.id === id)!));
}

export async function listPositions(): Promise<ServiceResult<Position[]>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  return delay(ok(scoped.data.store.positions));
}

export async function createPosition(input: {
  name: string;
  code: string;
}): Promise<ServiceResult<Position>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  const errors = validateRef(input, scoped.data.store.positions);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }
  const item: Position = {
    id: `pos-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
  };
  mutateStore((s) => s.positions.push(item));
  return delay(ok(item));
}

export async function updatePosition(
  id: string,
  input: { name: string; code: string },
): Promise<ServiceResult<Position>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.store.positions.some((p) => p.id === id)) {
    return delay(fail("NOT_FOUND", "Position was not found."));
  }
  const errors = validateRef(input, scoped.data.store.positions, id);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }
  mutateStore((s) => {
    const item = s.positions.find((p) => p.id === id)!;
    item.name = input.name.trim();
    item.code = input.code.trim().toUpperCase();
  });
  return delay(ok(scoped.data.store.positions.find((p) => p.id === id)!));
}

export async function listShifts(): Promise<ServiceResult<Shift[]>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  return delay(ok(scoped.data.store.shifts));
}

export async function createShift(input: {
  name: string;
  start: string;
  graceEnd: string;
  lunchStart: string;
  lunchEnd: string;
  end: string;
}): Promise<ServiceResult<Shift>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  const errors = validateShift(input);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }
  const item: Shift = {
    id: `shift-${crypto.randomUUID().slice(0, 8)}`,
    ...normalizeShift(input),
    workDays: [1, 2, 3, 4, 5],
  };
  mutateStore((s) => s.shifts.push(item));
  return delay(ok(item));
}

export async function updateShift(
  id: string,
  input: {
    name: string;
    start: string;
    graceEnd: string;
    lunchStart: string;
    lunchEnd: string;
    end: string;
  },
): Promise<ServiceResult<Shift>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  if (!scoped.data.store.shifts.some((s) => s.id === id)) {
    return delay(fail("NOT_FOUND", "Shift was not found."));
  }
  const errors = validateShift(input);
  if (errors.length) {
    return delay(fail("VALIDATION", "Please correct the highlighted fields.", errors));
  }
  mutateStore((s) => {
    const item = s.shifts.find((sh) => sh.id === id)!;
    Object.assign(item, normalizeShift(input));
  });
  return delay(ok(scoped.data.store.shifts.find((s) => s.id === id)!));
}

export async function listHolidays(): Promise<ServiceResult<Holiday[]>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  return delay(
    ok(
      scoped.data.store.holidays
        .filter((h) => h.companyId === scoped.data.companyId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    ),
  );
}

export async function createHoliday(input: {
  name: string;
  date: string;
}): Promise<ServiceResult<Holiday>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  if (!input.name.trim() || !input.date) {
    return delay(
      fail("VALIDATION", "Name and date are required.", [
        { field: "name", message: "Name is required." },
        { field: "date", message: "Date is required." },
      ]),
    );
  }
  const item: Holiday = {
    id: `hol-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    date: input.date,
    companyId: scoped.data.companyId,
    isSample: true,
  };
  mutateStore((s) => s.holidays.push(item));
  return delay(ok(item));
}

export async function updateHoliday(
  id: string,
  input: { name: string; date: string },
): Promise<ServiceResult<Holiday>> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  const existing = scoped.data.store.holidays.find(
    (h) => h.id === id && h.companyId === scoped.data.companyId,
  );
  if (!existing) return delay(fail("NOT_FOUND", "Holiday was not found."));
  mutateStore((s) => {
    const item = s.holidays.find((h) => h.id === id)!;
    item.name = input.name.trim();
    item.date = input.date;
  });
  return delay(ok(scoped.data.store.holidays.find((h) => h.id === id)!));
}

export async function listReferenceOptions(): Promise<
  ServiceResult<{
    departments: Department[];
    positions: Position[];
    shifts: Shift[];
    statuses: { id: string; label: string }[];
  }>
> {
  const scoped = await requireHr();
  if (!scoped.ok) return delay(scoped);
  return delay(
    ok({
      departments: scoped.data.store.departments,
      positions: scoped.data.store.positions,
      shifts: scoped.data.store.shifts,
      statuses: scoped.data.store.employmentStatuses,
    }),
  );
}

function validateRef(
  input: { name: string; code: string },
  existing: { id: string; code: string }[],
  excludeId?: string,
) {
  const errors: { field: string; message: string }[] = [];
  if (!input.name.trim()) {
    errors.push({ field: "name", message: "Name is required." });
  }
  if (!input.code.trim()) {
    errors.push({ field: "code", message: "Code is required." });
  } else if (
    existing.some(
      (e) =>
        e.code.toLowerCase() === input.code.trim().toLowerCase() &&
        e.id !== excludeId,
    )
  ) {
    errors.push({ field: "code", message: "Code must be unique." });
  }
  return errors;
}

function validateShift(input: {
  name: string;
  start: string;
  graceEnd: string;
  lunchStart: string;
  lunchEnd: string;
  end: string;
}) {
  const errors: { field: string; message: string }[] = [];
  if (!input.name.trim()) {
    errors.push({ field: "name", message: "Name is required." });
  }
  if (!(input.start < input.graceEnd && input.graceEnd < input.lunchStart)) {
    errors.push({
      field: "graceEnd",
      message: "Times must be in order: start, grace, lunch, end.",
    });
  }
  if (!(input.lunchStart < input.lunchEnd && input.lunchEnd < input.end)) {
    errors.push({
      field: "end",
      message: "Times must be in order: start, grace, lunch, end.",
    });
  }
  return errors;
}

function normalizeShift(input: {
  name: string;
  start: string;
  graceEnd: string;
  lunchStart: string;
  lunchEnd: string;
  end: string;
}) {
  return {
    name: input.name.trim(),
    start: input.start,
    graceEnd: input.graceEnd,
    lunchStart: input.lunchStart,
    lunchEnd: input.lunchEnd,
    end: input.end,
  };
}
