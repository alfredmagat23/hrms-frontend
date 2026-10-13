"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/session-context";

export default function NotAuthorizedPage() {
  const { roleId } = useSession();
  const home = roleId === "hr" ? "/hr" : roleId === "employee" ? "/employee" : "/login";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <EmptyState
        title="Not authorized"
        description="This screen is not available for your demo role. This is presentation-only access control, not production security."
        action={
          <Button asChild>
            <Link href={home}>Go to my home</Link>
          </Button>
        }
      />
    </main>
  );
}
