"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/page-states";
import type { LeavePortion, LeaveType } from "@/lib/domain/types";
import {
  listLeaveTypes,
  previewDuration,
  submitRequest,
} from "@/lib/services/leave-service";

export function LeaveRequestForm() {
  const router = useRouter();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portion, setPortion] = useState<LeavePortion>("whole");
  const [reason, setReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [workingDays, setWorkingDays] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    void listLeaveTypes().then((res) => {
      if (res.ok) {
        setTypes(res.data);
        if (res.data[0]) setLeaveTypeId(res.data[0].id);
      }
      setLoadingTypes(false);
    });
  }, []);

  const refreshPreview = useCallback(async () => {
    if (!startDate || !endDate) {
      setWorkingDays(null);
      return;
    }
    const res = await previewDuration({ startDate, endDate, portion });
    if (res.ok) setWorkingDays(res.data.workingDays);
    else setWorkingDays(null);
  }, [startDate, endDate, portion]);

  useEffect(() => {
    void refreshPreview();
  }, [refreshPreview]);

  useEffect(() => {
    if (portion !== "whole" && startDate) {
      setEndDate(startDate);
    }
  }, [portion, startDate]);

  const selectedType = types.find((t) => t.id === leaveTypeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);
    const res = await submitRequest({
      leaveTypeId,
      startDate,
      endDate,
      portion,
      reason,
    });
    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.error.message);
      const map: Record<string, string> = {};
      for (const fe of res.error.fieldErrors ?? []) {
        map[fe.field] = fe.message;
      }
      setFieldErrors(map);
      return;
    }
    router.push(`/employee/time-off/history/${res.data.id}`);
  }

  if (loadingTypes) {
    return <p className="text-sm text-muted-foreground">Loading leave types…</p>;
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-lg space-y-4">
      {formError ? <ErrorState message={formError} /> : null}
      <div className="space-y-1">
        <label htmlFor="leaveTypeId" className="text-sm font-medium">
          Leave type
        </label>
        <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
          <SelectTrigger id="leaveTypeId" aria-invalid={Boolean(fieldErrors.leaveTypeId)}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.leaveTypeId ? (
          <p className="text-sm text-destructive">{fieldErrors.leaveTypeId}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="startDate" className="text-sm font-medium">
            Start date
          </label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-invalid={Boolean(fieldErrors.startDate)}
          />
          {fieldErrors.startDate ? (
            <p className="text-sm text-destructive">{fieldErrors.startDate}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label htmlFor="endDate" className="text-sm font-medium">
            End date
          </label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            disabled={portion !== "whole"}
            onChange={(e) => setEndDate(e.target.value)}
            aria-invalid={Boolean(fieldErrors.endDate)}
          />
          {fieldErrors.endDate ? (
            <p className="text-sm text-destructive">{fieldErrors.endDate}</p>
          ) : null}
        </div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Portion</legend>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["whole", "Full day"],
              ["am", "AM (half day)"],
              ["pm", "PM (half day)"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="portion"
                value={value}
                checked={portion === value}
                disabled={
                  value !== "whole" &&
                  Boolean(selectedType && !selectedType.allowsHalfDay)
                }
                onChange={() => setPortion(value)}
                className="size-4 accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
        {fieldErrors.portion ? (
          <p className="text-sm text-destructive">{fieldErrors.portion}</p>
        ) : null}
      </fieldset>
      <div className="space-y-1">
        <label htmlFor="reason" className="text-sm font-medium">
          Reason
        </label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          aria-invalid={Boolean(fieldErrors.reason)}
        />
        {fieldErrors.reason ? (
          <p className="text-sm text-destructive">{fieldErrors.reason}</p>
        ) : null}
      </div>
      {workingDays !== null ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          Estimated working days: <strong>{workingDays}</strong>
        </p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
