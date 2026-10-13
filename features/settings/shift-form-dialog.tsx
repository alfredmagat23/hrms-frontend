"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Shift } from "@/lib/domain/types";

export function ShiftFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial: Pick<
    Shift,
    "name" | "start" | "graceEnd" | "lunchStart" | "lunchEnd" | "end"
  >;
  onSave: (
    input: Pick<
      Shift,
      "name" | "start" | "graceEnd" | "lunchStart" | "lunchEnd" | "end"
    >,
  ) => Promise<{ ok: boolean; fieldErrors?: Record<string, string> }>;
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Name" id="shift-name" error={errors.name}>
            <Input
              id="shift-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </Field>
          {(
            [
              ["start", "Start"],
              ["graceEnd", "Grace end"],
              ["lunchStart", "Lunch start"],
              ["lunchEnd", "Lunch end"],
              ["end", "End"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label} id={key} error={errors[key]}>
              <Input
                id={key}
                type="time"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </Field>
          ))}
          {errors.graceEnd || errors.end ? (
            <p className="text-sm text-destructive">
              {errors.graceEnd ?? errors.end}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={saving}
            onClick={() => {
              void (async () => {
                setSaving(true);
                const res = await onSave(form);
                setSaving(false);
                if (res.ok) onOpenChange(false);
                else setErrors(res.fieldErrors ?? {});
              })();
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
