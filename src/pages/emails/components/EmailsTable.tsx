import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { type CrudFilters, useList } from "@refinedev/core";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { EmailPreview } from "./EmailPreview";
import { type EmailStatus, type OpsEmailListItem } from "../types";

type EmailsTableProps = {
  practiceId?: string;
  compact?: boolean;
};

const statusOptions: Array<EmailStatus | "all"> = [
  "all",
  "sent",
  "failed",
  "skipped",
];

const getRecipient = (email: OpsEmailListItem) => {
  return email.recipient ?? email.recipientEmail ?? email.recipient_email ?? "Anonymized";
};

const getTemplate = (email: OpsEmailListItem) => {
  return email.template ?? email.templateName ?? email.template_name ?? "Unknown";
};

const getError = (email: OpsEmailListItem) => {
  return email.errorMessage ?? email.error_message ?? "";
};

const getCreatedAt = (email: OpsEmailListItem) => {
  return email.createdAt ?? email.created_at ?? email.timestamp ?? email.sentAt ?? "";
};

const getPractice = (email: OpsEmailListItem) => {
  return (
    email.practiceName ??
    email.practice_name ??
    email.practiceId ??
    email.practice_id ??
    "No practice"
  );
};

const formatDate = (value: string) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusClassName: Record<EmailStatus, string> = {
  sent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  failed: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  skipped: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const buildFilters = (
  recipient: string,
  status: EmailStatus | "all",
  practiceId?: string,
  globalPracticeFilter?: string
) => {
  const filters: CrudFilters = [];

  if (recipient.trim()) {
    filters.push({
      field: "recipient",
      operator: "contains",
      value: recipient.trim(),
    });
  }

  if (status !== "all") {
    filters.push({ field: "status", operator: "eq", value: status });
  }

  const scopedPractice = practiceId ?? globalPracticeFilter;
  if (scopedPractice && scopedPractice !== "all") {
    filters.push({ field: "practiceId", operator: "eq", value: scopedPractice });
  }

  return filters;
};

export const EmailsTable = ({ practiceId, compact = false }: EmailsTableProps) => {
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<EmailStatus | "all">("all");
  const [practiceFilter, setPracticeFilter] = useState("all");
  const [current, setCurrent] = useState(1);
  const [previewEmailId, setPreviewEmailId] = useState<string | null>(null);
  const pageSize = compact ? 10 : 20;

  const filters = useMemo(
    () => buildFilters(recipient, status, practiceId, practiceFilter),
    [practiceFilter, practiceId, recipient, status]
  );

  const { query, result } = useList<OpsEmailListItem>({
    resource: "emails",
    pagination: {
      currentPage: current,
      pageSize,
    },
    filters,
    meta: {
      practiceId,
    },
  });

  const emails = result.data ?? [];
  const total = result.total ?? 0;
  const hasPrevious = current > 1;
  const hasNext = current * pageSize < total;

  const resetPage = () => setCurrent(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={recipient}
            onChange={(event) => {
              setRecipient(event.target.value);
              resetPage();
            }}
            placeholder="Search recipient"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as EmailStatus | "all");
            resetPage();
          }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? "All statuses" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!practiceId ? (
          <Select
            value={practiceFilter}
            onValueChange={(value) => {
              setPracticeFilter(value ?? "all");
              resetPage();
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Practice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All practices</SelectItem>
              <SelectItem value="unattributed">No practice</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              {!practiceId ? <TableHead>Practice</TableHead> : null}
              <TableHead>Sent</TableHead>
              <TableHead className="w-24 text-right">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={practiceId ? 6 : 7}
                  className="h-28 text-center text-muted-foreground"
                >
                  Loading emails...
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell
                  colSpan={practiceId ? 6 : 7}
                  className="h-28"
                >
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-center text-sm">
                    <div>
                      <p className="font-medium text-destructive">
                        Emails could not be loaded.
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {getErrorMessage(query.error)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { void query.refetch(); }}
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={practiceId ? 6 : 7}
                  className="h-28 text-center text-muted-foreground"
                >
                  No emails found.
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="max-w-52 truncate font-medium">
                    {getRecipient(email)}
                  </TableCell>
                  <TableCell className="max-w-72 truncate">
                    {email.subject ?? "No subject"}
                  </TableCell>
                  <TableCell className="max-w-44 truncate text-muted-foreground">
                    {getTemplate(email)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
                        statusClassName[email.status]
                      )}
                    >
                      {email.status}
                    </span>
                    {getError(email) ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Error logged
                      </span>
                    ) : null}
                  </TableCell>
                  {!practiceId ? (
                    <TableCell className="max-w-44 truncate text-muted-foreground">
                      {getPractice(email)}
                    </TableCell>
                  ) : null}
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(getCreatedAt(email))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewEmailId(email.id)}
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

      <EmailPreview
        emailId={previewEmailId}
        open={Boolean(previewEmailId)}
        onOpenChange={(open) => {
          if (!open) setPreviewEmailId(null);
        }}
      />
    </div>
  );
};
