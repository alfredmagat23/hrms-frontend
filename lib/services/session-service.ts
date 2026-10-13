import type {
  Company,
  MockSession,
  RoleId,
  ServiceResult,
  User,
} from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import {
  clearSession,
  delay,
  getStore,
  loadSession,
  resetStore,
  saveSession,
} from "@/lib/mock/store";

export interface SessionView {
  session: MockSession;
  user: User;
  roleId: RoleId;
  companies: Company[];
  needsCompanyChoice: boolean;
}

export async function getSession(): Promise<ServiceResult<SessionView | null>> {
  const session = loadSession();
  if (!session) return delay(ok(null));

  const store = getStore();
  const user = store.users.find((u) => u.id === session.userId);
  if (!user) {
    clearSession();
    return delay(ok(null));
  }

  const companies = store.memberships
    .filter((m) => m.userId === user.id)
    .map((m) => store.companies.find((c) => c.id === m.companyId)!)
    .filter(Boolean);

  return delay(
    ok({
      session,
      user,
      roleId: session.roleId,
      companies,
      needsCompanyChoice: !session.activeCompanyId && companies.length > 1,
    }),
  );
}

export async function signIn(
  email: string,
  password: string,
): Promise<ServiceResult<SessionView>> {
  const store = getStore();
  const normalized = email.trim().toLowerCase();
  const user = store.users.find((u) => u.email.toLowerCase() === normalized);

  if (!user || user.mockPassword !== password) {
    return delay(
      fail("UNAUTHENTICATED", "Email or password is incorrect."),
      300,
    );
  }

  const companies = store.memberships
    .filter((m) => m.userId === user.id)
    .map((m) => store.companies.find((c) => c.id === m.companyId)!)
    .filter(Boolean);

  const session: MockSession = {
    userId: user.id,
    roleId: user.roleId,
    activeCompanyId: companies.length === 1 ? companies[0].id : null,
    signedInAt: new Date().toISOString(),
  };

  saveSession(session);

  return delay(
    ok({
      session,
      user,
      roleId: user.roleId,
      companies,
      needsCompanyChoice: companies.length > 1,
    }),
  );
}

export async function signOut(): Promise<ServiceResult<null>> {
  clearSession();
  return delay(ok(null));
}

export async function resetDemoData(): Promise<ServiceResult<null>> {
  resetStore();
  return delay(ok(null));
}
