import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { type CrudFilters, useList, useShow } from "@refinedev/core";
import { useNavigate, useParams } from "react-router";

import { EmailsTable } from "@/pages/emails/components/EmailsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import type { OpsPractice, PracticeInvitation } from "./types";

const invitationPageSize = 10;
const invitationStatuses = ["all", "pending", "accepted", "rejected", "canceled", "expired"];

const buildInvitationFilters = (search: string, status: string) => {
  const filters: CrudFilters = [];

  if (search.trim()) {
    filters.push({
      field: "q",
      operator: "contains",
      value: search.trim(),
    });
  }

  if (status !== "all") {
    filters.push({
      field: "status",
      operator: "eq",
      value: status,
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

const getPracticeName = (practice: OpsPractice | undefined) => {
  return practice?.name ?? practice?.practiceName ?? practice?.displayName ?? "Practice";
};

const getCreatedAt = (practice: OpsPractice) => practice.created_at ?? practice.createdAt;
const getUpdatedAt = (practice: OpsPractice) => practice.updated_at ?? practice.updatedAt;
const getInvitationCreatedAt = (invitation: PracticeInvitation) =>
  invitation.created_at ?? invitation.createdAt;
const getInvitationExpiresAt = (invitation: PracticeInvitation) =>
  invitation.expires_at ?? invitation.expiresAt;

const invitationStatusClassName = (status: string | null | undefined) => {
  if (status === "pending") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (status === "accepted") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "rejected" || status === "canceled" || status === "expired") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  return "border-border bg-muted/50 text-muted-foreground";
};

type PracticeInvitationsTableProps = {
  practiceId: string;
};

const PracticeInvitationsTable = ({ practiceId }: PracticeInvitationsTableProps) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [current, setCurrent] = useState(1);

  const filters = useMemo(
    () => buildInvitationFilters(search, status),
    [search, status]
  );

  const { query, result } = useList<PracticeInvitation>({
    resource: "practiceInvitations",
    pagination: {
      currentPage: current,
      pageSize: invitationPageSize,
    },
    filters,
    meta: {
      practiceId,
    },
  });

  const invitations = result.data ?? [];
  const total = result.total ?? 0;
  const hasPrevious = current > 1;
  const hasNext = current * invitationPageSize < total;

  const resetPage = () => setCurrent(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Search invite email"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value ?? "all");
            resetPage();
          }}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {invitationStatuses.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? "All statuses" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inviter</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                  Loading invitations...
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-center text-sm">
                    <div>
                      <p className="font-medium text-destructive">
                        Invitations could not be loaded.
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
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                  No invitations found.
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="max-w-64 truncate font-medium">
                    {invitation.email ?? "No email"}
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-muted-foreground">
                    {invitation.role ?? "No role"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
                        invitationStatusClassName(invitation.status)
                      )}
                    >
                      {invitation.status ?? "unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {invitation.inviter?.name ?? invitation.inviter?.email ?? "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(getInvitationExpiresAt(invitation))}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(getInvitationCreatedAt(invitation))}
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
            ? `Showing ${(current - 1) * invitationPageSize + 1}-${Math.min(
                current * invitationPageSize,
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
    </div>
  );
};

export const PracticesShow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { query } = useShow<OpsPractice>({
    resource: "practices",
    id,
  });
  const practice = query.data?.data;
  const practiceName = getPracticeName(practice);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{practiceName}</h1>
          <p className="text-sm text-muted-foreground">
            Review practice details, invitations, and operational email history.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigate("/practices");
          }}
        >
          <ArrowLeft />
          Practices
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="rounded-md border p-4">
          {query.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading practice...</p>
          ) : query.isError ? (
            <p className="text-sm text-destructive">Practice could not be loaded.</p>
          ) : practice ? (
            <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{practiceName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="font-medium">{practice.slug ?? "No slug"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all font-medium">{practice.email ?? "No email"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{practice.phone ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Website</dt>
                <dd className="break-all font-medium">{practice.website ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">{practice.status ?? "Active"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{formatDate(getCreatedAt(practice))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">{formatDate(getUpdatedAt(practice))}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ID</dt>
                <dd className="break-all font-mono text-xs">{practice.id}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Practice not found.</p>
          )}
        </TabsContent>
        <TabsContent value="invitations">
          {id ? <PracticeInvitationsTable practiceId={id} /> : null}
        </TabsContent>
        <TabsContent value="emails">
          {id ? <EmailsTable practiceId={id} compact /> : null}
        </TabsContent>
      </Tabs>
    </section>
  );
};
