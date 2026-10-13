"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Info, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/config/demo-accounts";
import { useSession } from "@/lib/session/session-context";

type DemoAccountCard = (typeof DEMO_ACCOUNTS)[number];

export function LoginPanel() {
  const router = useRouter();
  const { signIn, resetDemoData } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.needsCompanyChoice) {
      router.push("/select-company");
      return;
    }
    router.push("/home");
  }

  function fillAccount(account: DemoAccountCard) {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setMessage(`Filled in the ${account.label} demo account.`);
  }

  async function handleReset() {
    setBusy(true);
    await resetDemoData();
    setEmail("");
    setPassword("");
    setBusy(false);
    setMessage("Demo data was reset to the original fictional seed.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <section
        aria-labelledby="sign-in-heading"
        className="rounded-xl bg-card p-6 text-card-foreground shadow-lg sm:p-8"
      >
        <h1 id="sign-in-heading" className="font-heading text-2xl font-semibold">
          Sign in
        </h1>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-300">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Demo only - not real authentication
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10"
            />
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <ForgotPasswordDialog />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10"
            />
          </div>
          <Button type="submit" className="h-10 w-full" disabled={busy}>
            Sign in
          </Button>
        </form>

        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-5 text-sm text-muted-foreground"
        >
          {message}
        </p>
      </section>

      <section
        aria-labelledby="demo-accounts-heading"
        className="rounded-xl bg-card p-6 text-card-foreground shadow-lg sm:p-8"
      >
        <h2
          id="demo-accounts-heading"
          className="font-heading text-lg font-semibold"
        >
          Demo accounts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fictional accounts for this demo. Select one to fill in the form.
          Password for all accounts:{" "}
          <span className="font-mono text-foreground">{DEMO_PASSWORD}</span>
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => fillAccount(account)}
                className="flex h-full w-full flex-col items-start gap-1 rounded-lg border border-border p-4 text-left transition-colors outline-none hover:border-primary hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring"
              >
                <span className="font-medium">{account.label}</span>
                <span className="text-sm text-muted-foreground">
                  {account.companies}
                </span>
                <span className="text-sm [overflow-wrap:anywhere]">
                  {account.email}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={busy}
            onClick={() => void handleReset()}
          >
            <RotateCcw aria-hidden="true" />
            Reset Demo Data
          </Button>
        </div>
      </section>
    </div>
  );
}

function ForgotPasswordDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="-my-1 -mr-1 rounded-sm px-1 py-1 text-sm font-medium text-primary underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-ring"
        >
          Forgot password?
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Password recovery is not available</DialogTitle>
          <DialogDescription>
            This is a demo with fictional accounts. Password recovery will be
            handled by the production authentication system later. Use the demo
            accounts listed on this page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
