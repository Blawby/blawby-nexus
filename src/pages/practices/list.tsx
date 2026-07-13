import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { type CrudFilters, useList } from "@refinedev/core";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/errors";
import type { OpsPractice } from "./types";

const pageSize = 20;

const buildFilters = (search: string) => {
  const filters: CrudFilters = [];

  if (search.trim()) {
    filters.push({
      field: "q",
      operator: "contains",
      value: search.trim(),
    });
  }

  return filters;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getPracticeName = (practice: OpsPractice) => {
  return practice.name ?? practice.practiceName ?? practice.displayName ?? "Unnamed practice";
};

const getCreatedAt = (practice: OpsPractice) => practice.created_at ?? practice.createdAt;

export const PracticesList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState(1);

  const filters = useMemo(() => buildFilters(search), [search]);

  const { query, result } = useList<OpsPractice>({
    resource: "practices",
    pagination: {
      currentPage: current,
      pageSize,
    },
    filters,
  });

  const practices = result.data ?? [];
  const total = result.total ?? 0;
  const hasPrevious = current > 1;
  const hasNext = current * pageSize < total;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Practices</h1>
          <p className="text-sm text-muted-foreground">
            Search practices and inspect their operational activity.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrent(1);
            }}
            placeholder="Search practices"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  Loading practices...
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-center text-sm">
                    <div>
                      <p className="font-medium text-destructive">
                        Practices could not be loaded.
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {getErrorMessage(query.error)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void query.refetch();
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : practices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  No practices found.
                </TableCell>
              </TableRow>
            ) : (
              practices.map((practice) => (
                <TableRow key={practice.id}>
                  <TableCell className="max-w-56 truncate font-medium">
                    {getPracticeName(practice)}
                  </TableCell>
                  <TableCell className="max-w-44 truncate text-muted-foreground">
                    {practice.slug ?? "No slug"}
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {practice.email ?? "No email"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {practice.phone ?? "Not set"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {practice.status ?? "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(getCreatedAt(practice))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigate(`/practices/show/${practice.id}`);
                      }}
                    >
                      <Eye />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total > 0
            ? `Showing ${(current - 1) * pageSize + 1}-${Math.min(
                current * pageSize,
                total
              )} of ${total}`
            : "No results"}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            onClick={() => setCurrent((page) => Math.max(1, page - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => setCurrent((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
};
