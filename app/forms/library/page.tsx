"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingBlock,
  StatusBadge,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getFormLibraryItem,
  listFormCategories,
  listFormLibrary,
  listMyFormSubmissions,
} from "@/lib/services/forms-service";
import { useSession } from "@/lib/session/session-context";

export default function FormLibraryPage() {
  const { ready } = useSession();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [forms, setForms] = useState<
    Extract<Awaited<ReturnType<typeof listFormLibrary>>, { ok: true }>["data"]
  >([]);
  const [subs, setSubs] = useState<
    Extract<
      Awaited<ReturnType<typeof listMyFormSubmissions>>,
      { ok: true }
    >["data"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    void listFormCategories().then((res) => {
      if (res.ok) setCategories(res.data);
    });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    void Promise.all([
      listFormLibrary({
        search: search.trim() || undefined,
        category: category || undefined,
      }),
      listMyFormSubmissions(),
    ]).then(([lib, mine]) => {
      setLoading(false);
      if (!lib.ok) {
        setError(lib.error.message);
        return;
      }
      setError("");
      setForms(lib.data);
      if (mine.ok) setSubs(mine.data);
    });
  }, [ready, search, category]);

  async function openForm(id: string) {
    const res = await getFormLibraryItem(id);
    if (res.ok) {
      setPreview({ name: res.data.name, description: res.data.description });
    }
  }

  return (
    <AppShell title="Forms">
      <div className="space-y-4">
        <DemoNotice>
          Presentation-only form library — no form engine or submissions backend.
        </DemoNotice>
        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">Form Library</TabsTrigger>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Form Library</h2>
              <p className="text-sm text-muted-foreground">
                Repository of all official company forms that are available to
                you
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-sm flex-1"
                placeholder="Search forms"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search forms"
              />
              <Select
                value={category || "all"}
                onValueChange={(v) => setCategory(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-52" aria-label="Form category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {loading ? <LoadingBlock /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && forms.length === 0 ? (
              <EmptyState title="No forms match" />
            ) : null}
            {forms.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="p-3 font-medium">Form Name</th>
                        <th className="p-3 font-medium">Category</th>
                        <th className="p-3 font-medium">Description</th>
                        <th className="p-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {forms.map((f) => (
                        <tr key={f.id}>
                          <td className="p-3 font-medium">{f.name}</td>
                          <td className="p-3">{f.category}</td>
                          <td className="p-3 text-muted-foreground">
                            {f.description}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => void openForm(f.id)}
                            >
                              Open
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="space-y-3 md:hidden">
                  {forms.map((f) => (
                    <li
                      key={f.id}
                      className="rounded-lg border bg-card p-3 text-sm"
                    >
                      <p className="font-medium">{f.name}</p>
                      <p className="text-muted-foreground">{f.category}</p>
                      <p className="mt-1">{f.description}</p>
                      <Button
                        className="mt-2"
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => void openForm(f.id)}
                      >
                        Open
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </TabsContent>
          <TabsContent value="submissions" className="space-y-3">
            {subs.length === 0 ? (
              <EmptyState
                title="No submissions yet"
                description="Demo submissions appear here when available for your account."
              />
            ) : (
              <ul className="space-y-2">
                {subs.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{s.formName}</p>
                      <p className="text-muted-foreground">
                        Submitted {s.submittedAt} · Updated {s.lastUpdate}
                      </p>
                    </div>
                    <StatusBadge label={s.status} tone="neutral" />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
        <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demo only — {preview?.name ?? "Form"}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This is a read-only demo preview. No form submission or upload
              occurs. {preview?.description}
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
