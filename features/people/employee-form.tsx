"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/shared/page-states";

export type EmployeeFormValues = {
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  statusId: string;
  departmentId: string;
  positionId: string;
  shiftId: string;
};

export type ReferenceOptions = {
  departments: { id: string; name: string }[];
  positions: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
  statuses: { id: string; label: string }[];
};

export function EmployeeForm({
  values,
  onChange,
  fieldErrors,
  formError,
  onSubmit,
  submitLabel,
  submitting,
  options,
}: {
  values: EmployeeFormValues;
  onChange: (next: EmployeeFormValues) => void;
  fieldErrors: Record<string, string>;
  formError?: string;
  onSubmit: () => void;
  submitLabel: string;
  submitting?: boolean;
  options: ReferenceOptions;
}) {
  function set<K extends keyof EmployeeFormValues>(key: K, val: EmployeeFormValues[K]) {
    onChange({ ...values, [key]: val });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="mx-auto max-w-xl space-y-4"
    >
      {formError ? <ErrorState message={formError} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Employee no." id="employeeNo" error={fieldErrors.employeeNo}>
          <Input
            id="employeeNo"
            value={values.employeeNo}
            onChange={(e) => set("employeeNo", e.target.value)}
          />
        </Field>
        <Field label="Email" id="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="First name" id="firstName" error={fieldErrors.firstName}>
          <Input
            id="firstName"
            value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </Field>
        <Field label="Last name" id="lastName" error={fieldErrors.lastName}>
          <Input
            id="lastName"
            value={values.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Department" id="departmentId" error={fieldErrors.departmentId}>
        <Select value={values.departmentId} onValueChange={(v) => set("departmentId", v)}>
          <SelectTrigger id="departmentId">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {options.departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Position" id="positionId" error={fieldErrors.positionId}>
        <Select value={values.positionId} onValueChange={(v) => set("positionId", v)}>
          <SelectTrigger id="positionId">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            {options.positions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Shift" id="shiftId" error={fieldErrors.shiftId}>
        <Select value={values.shiftId} onValueChange={(v) => set("shiftId", v)}>
          <SelectTrigger id="shiftId">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            {options.shifts.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Employment status" id="statusId" error={fieldErrors.statusId}>
        <Select value={values.statusId} onValueChange={(v) => set("statusId", v)}>
          <SelectTrigger id="statusId">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {options.statuses.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
