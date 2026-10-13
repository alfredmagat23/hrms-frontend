"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import type { AssignedTodoCategory } from "@/lib/domain/types";
import {
  listAssignedTodos,
  listTimeOffTodos,
} from "@/lib/services/hr-todo-service";
import { useSession } from "@/lib/session/session-context";

export function HrTodoListPage({
  title,
  category,
  description,
}: {
  title: string;
  category: AssignedTodoCategory;
  description: string;
}) {
  const { ready } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<
    { id: string; title: string; dueDate: string; href: string }[]
  >([]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    const loader =
      category === "time-off"
        ? listTimeOffTodos()
        : listAssignedTodos(category);
    void loader.then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError("");
      setItems(res.data);
    });
  }, [ready, category]);

  return (
    <AppShell title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <DemoNotice>
          Read-only mock assignments — no task engine or completion actions.
        </DemoNotice>
        {loading ? <LoadingBlock /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && items.length === 0 ? (
          <EmptyState title="No items" />
        ) : null}
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="block rounded-lg border bg-card p-3 text-sm outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">Due {item.dueDate}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </AppShell>
  );
}
