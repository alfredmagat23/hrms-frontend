"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/session-context";

export default function SelectCompanyPage() {
  const router = useRouter();
  const { ready, user, companies, activeCompany, setActiveCompany, signOut } =
    useSession();
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (activeCompany) {
      router.replace("/home");
    }
  }, [ready, user, activeCompany, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  async function continueWithCompany() {
    if (!selected) {
      setError("Select a company to continue.");
      return;
    }
    const result = await setActiveCompany(selected);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/home");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e2a44] px-4 py-10">
      <section className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-semibold">Choose a company</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {user.displayName}. Select the company to work in for
          this demo session.
        </p>
        <ul className="mt-6 grid gap-3" role="radiogroup" aria-label="Companies">
          {companies.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected === company.id}
                onClick={() => setSelected(company.id)}
                className={`flex w-full flex-col items-start rounded-lg border p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring ${
                  selected === company.id
                    ? "border-primary bg-muted"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{company.name}</span>
                <span className="text-sm text-muted-foreground">
                  {company.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void continueWithCompany()}>
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            Sign out
          </Button>
        </div>
      </section>
    </main>
  );
}
