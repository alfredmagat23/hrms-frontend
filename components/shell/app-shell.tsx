"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, ChevronDown, LogOut, Menu, RotateCcw } from "lucide-react";

import {
  groupContainsPath,
  isDetailPath,
  listPathFor,
  navForRole,
  roleForPath,
  type NavItem,
} from "@/config/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/session/session-context";
import { cn } from "@/lib/utils";

const CONTENT_MAX = "max-w-[1440px]";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    ready,
    user,
    roleId,
    companies,
    activeCompany,
    signOut,
    setActiveCompany,
    resetDemoData,
  } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading demo session…
      </div>
    );
  }

  if (!user || !roleId) {
    router.replace("/login");
    return null;
  }

  if (!activeCompany) {
    router.replace("/select-company");
    return null;
  }

  const requiredRole = roleForPath(pathname);
  if (requiredRole && requiredRole !== roleId) {
    router.replace("/not-authorized");
    return null;
  }

  const items = navForRole(roleId);

  async function handleCompanyChange(companyId: string) {
    if (companyId === activeCompany?.id) return;
    const result = await setActiveCompany(companyId);
    if (!result.ok) return;
    const next = isDetailPath(pathname)
      ? listPathFor(pathname)
      : listPathFor(pathname);
    router.push(next);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleReset() {
    await resetDemoData();
    router.push("/login");
  }

  return (
    <TooltipProvider>
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-[var(--elevation)] lg:flex">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-bold tracking-wide text-sidebar-primary-foreground"
            aria-hidden="true"
          >
            TLS
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              TLS Group HRMS
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Internal demo
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav items={items} pathname={pathname} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div
            className={cn(
              "mx-auto flex h-14 w-full items-center gap-2 sm:gap-3 px-4 sm:px-6",
              CONTENT_MAX,
            )}
          >
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col p-0">
                <SheetHeader className="shrink-0 border-b border-sidebar-border px-4 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground"
                      aria-hidden="true"
                    >
                      TLS
                    </span>
                    <SheetTitle className="text-sm">TLS Group HRMS</SheetTitle>
                  </div>
                </SheetHeader>
                <div className="shrink-0 border-b border-sidebar-border px-4 py-3">
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    Active company
                  </p>
                  <CompanySwitcher
                    companies={companies}
                    activeCompanyId={activeCompany.id}
                    onChange={(id) => {
                      setMobileOpen(false);
                      void handleCompanyChange(id);
                    }}
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <SidebarNav
                    items={items}
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {title}
              </h1>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="hidden cursor-default rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 sm:inline">
                  Demo — mock data
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Fictional data only — not connected to production systems
              </TooltipContent>
            </Tooltip>

            <div className="hidden items-center gap-2 md:flex">
              {companies.length > 1 ? (
                <CompanySwitcher
                  companies={companies}
                  activeCompanyId={activeCompany.id}
                  onChange={(id) => void handleCompanyChange(id)}
                />
              ) : (
                <span className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-sm text-foreground">
                  <Building2
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{activeCompany.name}</span>
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="max-w-[11rem] gap-2 font-medium"
                  aria-label={`Account menu for ${user.displayName}`}
                >
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-[10px] font-bold text-accent-foreground"
                    aria-hidden="true"
                  >
                    {userInitials(user.displayName)}
                  </span>
                  <span className="hidden truncate sm:inline">
                    {user.displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <p>{user.displayName}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      Role: {roleId === "hr" ? "HR" : "Employee"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleReset()}>
                  <RotateCcw />
                  Reset Demo Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleSignOut()}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1">
          <div className={cn("mx-auto w-full p-4 sm:p-6", CONTENT_MAX)}>
            {children}
          </div>
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (item.children?.length && groupContainsPath(item, pathname)) {
          next[item.id] = true;
        }
      }
      return next;
    });
  }, [pathname, items]);

  return (
    <nav aria-label="Primary" className="space-y-0.5 p-3">
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const inGroup = groupContainsPath(item, pathname);
        const isOpen = hasChildren
          ? Boolean(expanded[item.id] || inGroup)
          : false;
        const Icon = item.icon;
        const leafActive =
          !hasChildren &&
          (pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href + "/")));
        const isActiveLeaf = leafActive || pathname === item.href;

        if (!hasChildren) {
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActiveLeaf ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                isActiveLeaf
                  ? "border-l-primary bg-accent font-semibold text-accent-foreground"
                  : "border-l-transparent font-medium text-sidebar-foreground hover:bg-muted",
              )}
            >
              {Icon ? (
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              ) : null}
              <span className="truncate">{item.label}</span>
              {isActiveLeaf ? (
                <span className="sr-only">(current)</span>
              ) : null}
            </Link>
          );
        }

        return (
          <div key={item.id} className="space-y-0.5">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`nav-group-${item.id}`}
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [item.id]: !isOpen,
                }))
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                inGroup
                  ? "border-l-primary/40 bg-muted text-foreground"
                  : "border-l-transparent text-sidebar-foreground hover:bg-muted",
              )}
            >
              {Icon ? (
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen ? "rotate-0" : "-rotate-90",
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <ul
                id={`nav-group-${item.id}`}
                className="ml-3 space-y-0.5 border-l border-sidebar-border pl-2"
              >
                {item.children!.map((child) => {
                  const childActive =
                    pathname === child.href ||
                    pathname.startsWith(child.href + "/");
                  return (
                    <li key={child.id}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={childActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-md border-l-[3px] px-2 py-1.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                          childActive
                            ? "border-l-primary bg-accent font-semibold text-accent-foreground"
                            : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span className="truncate">{child.label}</span>
                        {childActive ? (
                          <span className="sr-only">(current)</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function CompanySwitcher({
  companies,
  activeCompanyId,
  onChange,
}: {
  companies: { id: string; name: string }[];
  activeCompanyId: string;
  onChange: (id: string) => void;
}) {
  const active = companies.find((c) => c.id === activeCompanyId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 font-medium">
          <Building2
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="max-w-[10rem] truncate">{active?.name}</span>
          <ChevronDown
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => onChange(company.id)}
          >
            {company.name}
            {company.id === activeCompanyId ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
