import Link from "next/link";

import { EmptyState } from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <EmptyState
        title="Page not found"
        description="The page you requested does not exist in this demo."
        action={
          <Button asChild>
            <Link href="/login">Go to sign in</Link>
          </Button>
        }
      />
    </main>
  );
}
