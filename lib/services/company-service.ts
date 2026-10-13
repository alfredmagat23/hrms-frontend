import type { Company, ServiceResult } from "@/lib/domain/types";
import { fail, ok } from "@/lib/domain/types";
import { delay, getStore, loadSession, saveSession } from "@/lib/mock/store";

export async function listMyCompanies(): Promise<ServiceResult<Company[]>> {
  const session = loadSession();
  if (!session) {
    return delay(fail("UNAUTHENTICATED", "Sign in is required."));
  }
  const store = getStore();
  const companies = store.memberships
    .filter((m) => m.userId === session.userId)
    .map((m) => store.companies.find((c) => c.id === m.companyId)!)
    .filter(Boolean);
  return delay(ok(companies));
}

export async function setActiveCompany(
  companyId: string,
): Promise<ServiceResult<Company>> {
  const session = loadSession();
  if (!session) {
    return delay(fail("UNAUTHENTICATED", "Sign in is required."));
  }

  const store = getStore();
  const permitted = store.memberships.some(
    (m) => m.userId === session.userId && m.companyId === companyId,
  );
  if (!permitted) {
    return delay(
      fail("FORBIDDEN_COMPANY", "You are not permitted to access this company."),
    );
  }

  const company = store.companies.find((c) => c.id === companyId);
  if (!company) {
    return delay(fail("NOT_FOUND", "Company was not found."));
  }

  saveSession({ ...session, activeCompanyId: companyId });
  return delay(ok(company));
}
