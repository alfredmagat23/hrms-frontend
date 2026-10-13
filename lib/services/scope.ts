import type {
  DemoDataStore,
  MockSession,
  ServiceResult,
} from "@/lib/domain/types";
import { fail } from "@/lib/domain/types";
import { getStore, loadSession } from "@/lib/mock/store";

export interface ScopedContext {
  store: DemoDataStore;
  session: MockSession;
  companyId: string;
  userId: string;
  roleId: MockSession["roleId"];
  employeeId: string | null;
  permittedCompanyIds: string[];
}

export function requireScopedSession(): ServiceResult<ScopedContext> {
  const session = loadSession();
  if (!session) {
    return fail("UNAUTHENTICATED", "Sign in is required.");
  }
  if (!session.activeCompanyId) {
    return fail("VALIDATION", "Select an active company first.");
  }

  const store = getStore();
  const permittedCompanyIds = store.memberships
    .filter((m) => m.userId === session.userId)
    .map((m) => m.companyId);

  if (!permittedCompanyIds.includes(session.activeCompanyId)) {
    return fail(
      "FORBIDDEN_COMPANY",
      "You are not permitted to access this company.",
    );
  }

  const user = store.users.find((u) => u.id === session.userId);
  if (!user) {
    return fail("UNAUTHENTICATED", "Session user was not found.");
  }

  return {
    ok: true,
    data: {
      store,
      session,
      companyId: session.activeCompanyId,
      userId: session.userId,
      roleId: session.roleId,
      employeeId: user.employeeId,
      permittedCompanyIds,
    },
  };
}

export function inActiveCompany<T extends { companyId: string }>(
  items: T[],
  companyId: string,
): T[] {
  return items.filter((item) => item.companyId === companyId);
}
