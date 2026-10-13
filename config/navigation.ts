import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckSquare,
  Clock,
  FileText,
  FolderOpen,
  GitBranch,
  Home,
  Receipt,
  Target,
  Users,
} from "lucide-react";

import type { RoleId } from "@/lib/domain/types";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

/** Single shared sidebar for every authenticated role. */
export const SHARED_NAVIGATION: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Home },
  {
    id: "todos",
    label: "To-Dos",
    href: "/todos/tasks",
    icon: CheckSquare,
    children: [
      { id: "todos-tasks", label: "Tasks", href: "/todos/tasks" },
      { id: "todos-timeoff", label: "Time Off", href: "/todos/time-off" },
      {
        id: "todos-info",
        label: "Information Update",
        href: "/todos/information-update",
      },
      { id: "todos-forms", label: "Forms", href: "/todos/forms" },
      {
        id: "todos-perf",
        label: "Performance",
        href: "/todos/performance",
      },
    ],
  },
  {
    id: "calendar",
    label: "Team Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  { id: "people", label: "People", href: "/people", icon: Users },
  {
    id: "documents",
    label: "Documents",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    id: "forms",
    label: "Forms",
    href: "/forms/library",
    icon: FileText,
    children: [
      { id: "forms-library", label: "Form Library", href: "/forms/library" },
    ],
  },
  {
    id: "workflows",
    label: "Workflows",
    href: "/workflows/dashboard",
    icon: GitBranch,
    children: [
      {
        id: "workflows-dash",
        label: "Dashboard",
        href: "/workflows/dashboard",
      },
    ],
  },
  {
    id: "attendance",
    label: "Attendance",
    href: "/attendance/my-attendance",
    icon: Clock,
    children: [
      {
        id: "my-attendance",
        label: "My Attendance",
        href: "/attendance/my-attendance",
      },
    ],
  },
  {
    id: "expenses",
    label: "Expenses",
    href: "/expenses/submission",
    icon: Receipt,
    children: [
      {
        id: "expenses-sub",
        label: "Submission",
        href: "/expenses/submission",
      },
    ],
  },
  {
    id: "okr",
    label: "OKR",
    href: "/okr/objectives",
    icon: Target,
    children: [
      { id: "okr-obj", label: "Objectives", href: "/okr/objectives" },
    ],
  },
];

/** @deprecated Use SHARED_NAVIGATION — kept for call-site compatibility. */
export const NAVIGATION = SHARED_NAVIGATION;

export function navForRole(roleId: RoleId): NavItem[] {
  void roleId;
  return SHARED_NAVIGATION.map((item) => ({
    ...item,
    children: item.children ? [...item.children] : undefined,
  }));
}

export function sharedNavItems(): NavItem[] {
  return navForRole("employee");
}

/** HR-only path prefixes that remain role-gated. */
export function isHrOnlyPath(pathname: string): boolean {
  return (
    pathname.startsWith("/hr/settings") ||
    pathname.startsWith("/hr/time-off") ||
    pathname.startsWith("/leave/approvals") ||
    pathname === "/attendance/company" ||
    pathname.startsWith("/people/new") ||
    /\/people\/[^/]+\/edit/.test(pathname)
  );
}

export function roleForPath(pathname: string): RoleId | null {
  if (isHrOnlyPath(pathname)) return "hr";
  return null;
}

export function groupContainsPath(item: NavItem, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(item.href + "/")) {
    return true;
  }
  return Boolean(
    item.children?.some(
      (child) =>
        pathname === child.href || pathname.startsWith(child.href + "/"),
    ),
  );
}

/** When switching company from a detail/edit/request page, go to the section list. */
export function listPathFor(pathname: string): string {
  if (pathname.startsWith("/people")) return "/people";
  if (pathname.startsWith("/leave/approvals")) return "/leave/approvals";
  if (pathname.startsWith("/leave/history")) return "/leave/history";
  if (pathname.startsWith("/leave/balances")) return "/leave/balances";
  if (pathname.startsWith("/leave/request")) return "/leave/request";
  if (pathname.startsWith("/hr/time-off/requests")) return "/leave/approvals";
  if (pathname.startsWith("/hr/time-off/balances")) return "/leave/balances";
  if (pathname.startsWith("/attendance")) return "/attendance/my-attendance";
  if (pathname.startsWith("/calendar")) return "/calendar";
  if (pathname.startsWith("/documents")) return "/documents";
  if (pathname.startsWith("/forms")) return "/forms/library";
  if (pathname.startsWith("/workflows")) return "/workflows/dashboard";
  if (pathname.startsWith("/expenses")) return "/expenses/submission";
  if (pathname.startsWith("/okr")) return "/okr/objectives";
  if (pathname.startsWith("/todos")) return "/todos/tasks";
  if (pathname.startsWith("/hr/settings/departments")) {
    return "/hr/settings/departments";
  }
  if (pathname.startsWith("/hr/settings/positions")) {
    return "/hr/settings/positions";
  }
  if (pathname.startsWith("/hr/settings/shifts")) return "/hr/settings/shifts";
  if (pathname.startsWith("/hr/settings/holidays")) {
    return "/hr/settings/holidays";
  }
  if (pathname.startsWith("/hr")) return "/home";
  if (pathname.startsWith("/employee")) return "/home";
  if (pathname.startsWith("/home")) return "/home";
  return pathname;
}

export function isDetailPath(pathname: string): boolean {
  return (
    /\/(people|approvals|history|requests)\/[^/]+/.test(pathname) ||
    pathname.endsWith("/edit") ||
    pathname.endsWith("/new")
  );
}
