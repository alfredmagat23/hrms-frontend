"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { ErrorState, LoadingBlock } from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import {
  EmployeeForm,
  type EmployeeFormValues,
  type ReferenceOptions,
} from "@/features/people/employee-form";
import {
  getEmployee,
  updateEmployee,
  type HrEmployeeDetail,
} from "@/lib/services/people-service";
import { listReferenceOptions } from "@/lib/services/settings-service";
import { useSession } from "@/lib/session/session-context";

export default function HrEditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready } = useSession();
  const [options, setOptions] = useState<ReferenceOptions | null>(null);
  const [values, setValues] = useState<EmployeeFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !id) return;
    void Promise.all([getEmployee(id), listReferenceOptions()]).then(
      ([emp, refs]) => {
        setLoading(false);
        if (!emp.ok) {
          setError(emp.error.message);
          return;
        }
        if (refs.ok) setOptions(refs.data);
        if (!("email" in emp.data && "assignments" in emp.data)) {
          setError("Employee was not found.");
          return;
        }
        const detail = emp.data as HrEmployeeDetail;
        setValues({
          employeeNo: detail.employeeNo,
          firstName: detail.firstName,
          lastName: detail.lastName,
          email: detail.email,
          statusId: detail.statusId,
          departmentId: detail.departmentId,
          positionId: detail.positionId,
          shiftId: detail.shiftId,
        });
      },
    );
  }, [ready, id]);

  async function handleSubmit() {
    if (!values) return;
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    const res = await updateEmployee(id, values);
    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.error.message);
      const map: Record<string, string> = {};
      for (const fe of res.error.fieldErrors ?? []) map[fe.field] = fe.message;
      setFieldErrors(map);
      return;
    }
    router.push(`/people/${id}`);
  }

  return (
    <AppShell title="Edit Employee">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link href={`/people/${id}`}>Cancel</Link>
      </Button>
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorState message={error} /> : null}
      {values && options ? (
        <EmployeeForm
          values={values}
          onChange={setValues}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={() => void handleSubmit()}
          submitLabel="Save changes"
          submitting={submitting}
          options={options}
        />
      ) : null}
    </AppShell>
  );
}
