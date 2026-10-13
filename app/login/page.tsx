import type { Metadata } from "next";

import { LoginPanel } from "@/features/auth/login-panel";

export const metadata: Metadata = {
  title: "Sign in | TLS Group HRMS (Demo)",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1e2a44] bg-[url(/login-background.svg)] bg-cover bg-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <header className="mb-8 flex items-center gap-3 text-white">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-lg bg-white font-heading text-lg font-bold text-primary"
          >
            TLS
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-semibold">TLS Group</span>
            <span className="block text-sm text-white/85">
              Human Resource Management System
            </span>
          </span>
        </header>
        <LoginPanel />
      </div>
    </main>
  );
}
