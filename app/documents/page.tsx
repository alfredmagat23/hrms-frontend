"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import {
  DemoNotice,
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/shared/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listDocumentCategories,
  listDocuments,
} from "@/lib/services/document-service";
import { useSession } from "@/lib/session/session-context";

export default function DocumentsPage() {
  const { ready } = useSession();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [docs, setDocs] = useState<
    Extract<Awaited<ReturnType<typeof listDocuments>>, { ok: true }>["data"]
  >([]);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void listDocumentCategories().then((res) => {
      if (res.ok) setCategories(res.data);
    });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    void listDocuments({
      search: search.trim() || undefined,
      category: category || undefined,
    }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError("");
      setDocs(res.data);
    });
  }, [ready, search, category]);

  return (
    <AppShell title="Documents">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Here is the centralized repository for documents shared across your
          organization.
        </p>
        <DemoNotice>
          Demo metadata only — View / Download does not fetch real files.
        </DemoNotice>
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-sm flex-1"
            placeholder="Search documents"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search documents"
          />
          <Select
            value={category || "all"}
            onValueChange={(v) => setCategory(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-48" aria-label="Category filter">
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
        {!loading && !error && docs.length === 0 ? (
          <EmptyState title="No documents match" />
        ) : null}
        {docs.length > 0 ? (
          <>
            <div className="hidden md:block">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Document name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.category}</TableCell>
                      <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                        {d.description}
                      </TableCell>
                      <TableCell>{d.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setDemoOpen(true)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="space-y-3 md:hidden">
              {docs.map((d) => (
                <li key={d.id}>
                  <Card>
                    <CardContent className="p-3 text-sm">
                      <p className="font-medium">{d.name}</p>
                      <p className="text-muted-foreground">{d.category}</p>
                      <p className="mt-1">{d.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {d.updatedAt}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setDemoOpen(true)}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demo only</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This action does not download or open a real file. Document
              storage is not part of this front-end demo.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
