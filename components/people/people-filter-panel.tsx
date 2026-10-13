"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PeopleFilterOptions } from "@/lib/services/people-service";
import { cn } from "@/lib/utils";

export type PeopleFilterDraft = {
  statusLabels: string[];
  locations: string[];
  companyIds: string[];
  departmentNames: string[];
  teams: string[];
  positionNames: string[];
};

export const EMPTY_FILTERS: PeopleFilterDraft = {
  statusLabels: [],
  locations: [],
  companyIds: [],
  departmentNames: [],
  teams: [],
  positionNames: [],
};

export function countActiveFilters(f: PeopleFilterDraft): number {
  return (
    f.statusLabels.length +
    f.locations.length +
    f.companyIds.length +
    f.departmentNames.length +
    f.teams.length +
    f.positionNames.length
  );
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function MultiSelectDropdown({
  placeholder,
  options,
  selected,
  onToggle,
}: {
  placeholder: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring",
          open
            ? "border-primary ring-1 ring-primary/40"
            : "border-border text-muted-foreground",
        )}
      >
        <span className="truncate">
          {selected.length
            ? `${placeholder} (${selected.length})`
            : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul
          id={listId}
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-card p-2 shadow-md"
        >
          {options.map((opt) => {
            const id = `${listId}-${opt.value}`;
            return (
              <li key={opt.value} className="flex items-start gap-2 px-1 py-1.5">
                <Checkbox
                  id={id}
                  checked={selected.includes(opt.value)}
                  onCheckedChange={() => onToggle(opt.value)}
                />
                <label htmlFor={id} className="cursor-pointer text-sm leading-snug">
                  {opt.label}
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function FilterBody({
  options,
  draft,
  setDraft,
}: {
  options: PeopleFilterOptions;
  draft: PeopleFilterDraft;
  setDraft: (d: PeopleFilterDraft) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-5 sm:gap-x-6">
      <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Employment Status
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {options.statuses.map((status) => {
          const id = `flt-status-${status}`.replace(/\W+/g, "-");
          return (
            <li key={status} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={draft.statusLabels.includes(status)}
                onCheckedChange={() =>
                  setDraft({
                    ...draft,
                    statusLabels: toggle(draft.statusLabels, status),
                  })
                }
              />
              <label htmlFor={id} className="cursor-pointer text-sm">
                {status}
              </label>
            </li>
          );
        })}
      </ul>

      <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Location
      </p>
      <MultiSelectDropdown
        placeholder="Location"
        options={options.locations.map((v) => ({ value: v, label: v }))}
        selected={draft.locations}
        onToggle={(v) =>
          setDraft({ ...draft, locations: toggle(draft.locations, v) })
        }
      />

      {options.isGroupHr ? (
        <>
          <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Company
          </p>
          <MultiSelectDropdown
            placeholder="Company"
            options={options.companies.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            selected={draft.companyIds}
            onToggle={(v) =>
              setDraft({
                ...draft,
                companyIds: toggle(draft.companyIds, v),
              })
            }
          />
        </>
      ) : null}

      <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Department
      </p>
      <MultiSelectDropdown
        placeholder="Department"
        options={options.departments.map((v) => ({ value: v, label: v }))}
        selected={draft.departmentNames}
        onToggle={(v) =>
          setDraft({
            ...draft,
            departmentNames: toggle(draft.departmentNames, v),
          })
        }
      />

      <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Team
      </p>
      <MultiSelectDropdown
        placeholder="Team"
        options={options.teams.map((v) => ({ value: v, label: v }))}
        selected={draft.teams}
        onToggle={(v) => setDraft({ ...draft, teams: toggle(draft.teams, v) })}
      />

      <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Position
      </p>
      <MultiSelectDropdown
        placeholder="Position"
        options={options.positions.map((v) => ({ value: v, label: v }))}
        selected={draft.positionNames}
        onToggle={(v) =>
          setDraft({
            ...draft,
            positionNames: toggle(draft.positionNames, v),
          })
        }
      />
    </div>
  );
}

export function PeopleFilterPanel({
  open,
  onOpenChange,
  options,
  applied,
  onApply,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: PeopleFilterOptions;
  applied: PeopleFilterDraft;
  onApply: (next: PeopleFilterDraft) => void;
  trigger: ReactNode;
}) {
  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  return (
    <>
      <div
        onClick={() => onOpenChange(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenChange(true);
          }
        }}
      >
        {trigger}
      </div>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b px-4 py-3 text-left">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <FilterBody options={options} draft={draft} setDraft={setDraft} />
          </div>
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(EMPTY_FILTERS);
                onApply(EMPTY_FILTERS);
                onOpenChange(false);
              }}
            >
              Clear All
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
