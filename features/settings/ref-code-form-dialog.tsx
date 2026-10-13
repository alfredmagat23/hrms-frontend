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

export function RefCodeFormDialog({
  open,
  onOpenChange,
  title,
  initialName,
  initialCode,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialName: string;
  initialCode: string;
  onSave: (input: { name: string; code: string }) => Promise<{ ok: boolean; fieldErrors?: Record<string, string> }>;
}) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function reset() {
    setName(initialName);
    setCode(initialCode);
    setErrors({});
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="ref-name" className="text-sm font-medium">
              Name
            </label>
            <Input id="ref-name" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <label htmlFor="ref-code" className="text-sm font-medium">
              Code
            </label>
            <Input id="ref-code" value={code} onChange={(e) => setCode(e.target.value)} />
            {errors.code ? (
              <p className="text-sm text-destructive">{errors.code}</p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => {
              void (async () => {
                setSaving(true);
                const res = await onSave({ name, code });
                setSaving(false);
                if (res.ok) {
                  onOpenChange(false);
                  reset();
                } else {
                  setErrors(res.fieldErrors ?? {});
                }
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
