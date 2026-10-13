"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { LoadingBlock } from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import {
  EmployeeForm,
  type EmployeeFormValues,
  type ReferenceOptions,
} from "@/features/people/employee-form";
import { createEmployee } from "@/lib/services/people-service";
import { listReferenceOptions } from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

const empty: EmployeeFormValues = {
  employeeNo: "",
  firstName: "",
  lastName: "",
  email: "",
  statusId: "",
  departmentId: "",
  positionId: "",
  shiftId: "",
};

export default function HrNewEmployeePage() {
  const router = useRouter();
  const { ready } = useSession();
  const [options, setOptions] = useState<ReferenceOptions | null>(null);
  const [values, setValues] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void listReferenceOptions().then((res) => {
      if (res.ok) {
        setOptions(res.data);
        setValues((v) => ({
          ...v,
          statusId: res.data.statuses[0]?.id ?? "",
          departmentId: res.data.departments[0]?.id ?? "",
          positionId: res.data.positions[0]?.id ?? "",
          shiftId: res.data.shifts[0]?.id ?? "",
        }));
      }
    });
  }, [ready]);

  async function handleSubmit() {
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    const res = await createEmployee(values);
    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.error.message);
      const map: Record<string, string> = {};
      for (const fe of res.error.fieldErrors ?? []) map[fe.field] = fe.message;
      setFieldErrors(map);
      return;
    }
    router.push(`/people/${res.data.id}`);
  }

  return (
    <AppShell title="New Employee">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/people">Back to people</Link>
      </Button>
      {!ready || !options ? (
        <LoadingBlock />
      ) : (
        <EmployeeForm
          values={values}
          onChange={setValues}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={() => void handleSubmit()}
          submitLabel="Create employee"
          submitting={submitting}
          options={options}
        />
      )}
    </AppShell>
  );
}
