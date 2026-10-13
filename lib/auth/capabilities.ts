import type { RoleId } from "@/lib/domain/types";

export type Capability =
  | "hr.people.create"
  | "hr.people.edit"
  | "hr.people.change_status"
  | "hr.leave.review"
  | "hr.attendance.company_view"
  | "hr.settings.manage";

const HR_CAPABILITIES: readonly Capability[] = [
  "hr.people.create",
  "hr.people.edit",
  "hr.people.change_status",
  "hr.leave.review",
  "hr.attendance.company_view",
  "hr.settings.manage",
];

export function hasCapability(
  roleId: RoleId | null | undefined,
  capability: Capability,
): boolean {
  if (roleId !== "hr") return false;
  return HR_CAPABILITIES.includes(capability);
}

export function requireCapability(
  roleId: RoleId | null | undefined,
  capability: Capability,
): boolean {
  return hasCapability(roleId, capability);
}
