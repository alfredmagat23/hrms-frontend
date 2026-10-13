"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Company, RoleId, User } from "@/lib/domain/types";
import * as companyService from "@/lib/services/company-service";
import * as sessionService from "@/lib/services/session-service";
import { subscribeStore } from "@/lib/mock/store";

interface SessionContextValue {
  ready: boolean;
  user: User | null;
  roleId: RoleId | null;
  companies: Company[];
  activeCompany: Company | null;
  needsCompanyChoice: boolean;
  refresh: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; needsCompanyChoice: boolean; roleId: RoleId } | { ok: false; message: string }>;
  signOut: () => Promise<void>;
  setActiveCompany: (
    companyId: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  resetDemoData: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await sessionService.getSession();
    if (!result.ok || !result.data) {
      setUser(null);
      setRoleId(null);
      setCompanies([]);
      setActiveCompanyId(null);
      setReady(true);
      return;
    }
    setUser(result.data.user);
    setRoleId(result.data.roleId);
    setCompanies(result.data.companies);
    setActiveCompanyId(result.data.session.activeCompanyId);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeStore(() => {
      void refresh();
    });
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await sessionService.signIn(email, password);
    if (!result.ok) {
      return { ok: false as const, message: result.error.message };
    }
    setUser(result.data.user);
    setRoleId(result.data.roleId);
    setCompanies(result.data.companies);
    setActiveCompanyId(result.data.session.activeCompanyId);
    return {
      ok: true as const,
      needsCompanyChoice: result.data.needsCompanyChoice,
      roleId: result.data.roleId,
    };
  }, []);

  const signOut = useCallback(async () => {
    await sessionService.signOut();
    setUser(null);
    setRoleId(null);
    setCompanies([]);
    setActiveCompanyId(null);
  }, []);

  const setActiveCompany = useCallback(async (companyId: string) => {
    const result = await companyService.setActiveCompany(companyId);
    if (!result.ok) {
      return { ok: false as const, message: result.error.message };
    }
    setActiveCompanyId(result.data.id);
    return { ok: true as const };
  }, []);

  const resetDemoData = useCallback(async () => {
    await sessionService.resetDemoData();
    setUser(null);
    setRoleId(null);
    setCompanies([]);
    setActiveCompanyId(null);
  }, []);

  const activeCompany =
    companies.find((c) => c.id === activeCompanyId) ?? null;

  const value = useMemo<SessionContextValue>(
    () => ({
      ready,
      user,
      roleId,
      companies,
      activeCompany,
      needsCompanyChoice: Boolean(user && !activeCompany && companies.length > 1),
      refresh,
      signIn,
      signOut,
      setActiveCompany,
      resetDemoData,
    }),
    [
      ready,
      user,
      roleId,
      companies,
      activeCompany,
      refresh,
      signIn,
      signOut,
      setActiveCompany,
      resetDemoData,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
