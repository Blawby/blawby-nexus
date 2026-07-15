import { useMemo, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { useOne } from "@refinedev/core";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getErrorMessage } from "@/lib/errors";
import { type ActionableEmailLink, type OpsEmailDetail } from "@/pages/emails/types";

type EmailPreviewProps = {
  emailId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getHtml = (detail?: OpsEmailDetail) => {
  return detail?.renderedHtml ?? detail?.rendered_html ?? detail?.html ?? "";
};

const getLinks = (detail?: OpsEmailDetail): ActionableEmailLink[] => {
  return (
    detail?.actionableLinks ??
    detail?.actionable_links ??
    detail?.links ??
    []
  ).filter((link) => Boolean(link.url));
};

export const EmailPreview = ({
  emailId,
  open,
  onOpenChange,
}: EmailPreviewProps) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { query, result } = useOne<OpsEmailDetail>({
    resource: "emails",
    id: emailId ?? "",
    queryOptions: {
      enabled: open && Boolean(emailId),
    },
  });

  const detail = result;
  const html = useMemo(() => getHtml(detail), [detail]);
  const links = useMemo(() => getLinks(detail), [detail]);
  const unavailableReason =
    detail?.contentUnavailableReason ??
    detail?.content_unavailable_reason ??
    (detail?.isAnonymized || detail?.is_anonymized
      ? "Content is no longer available because this email log was anonymized."
      : null);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl(null), 1600);
    } catch {
      setCopiedUrl(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-3xl">
        <SheetHeader className="pr-8">
          <SheetTitle>Email Preview</SheetTitle>
          <SheetDescription>
            Best-effort reconstruction from the stored email log.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {links.map((link, index) => (
                <Button
                  key={`${link.url}-${index}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { void copyLink(link.url); }}
                >
                  <Copy />
                  {copiedUrl === link.url ? "Copied" : link.label ?? "Copy link"}
                </Button>
              ))}
            </div>
          ) : null}

          {query.isLoading ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Loading preview...
            </div>
          ) : query.isError ? (
            <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <div>
                <p className="font-medium text-destructive">
                  Email preview could not be loaded.
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
          ) : unavailableReason ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {unavailableReason}
            </div>
          ) : html ? (
            <iframe
              title="Email HTML preview"
              sandbox=""
              srcDoc={html}
              className="min-h-[520px] flex-1 rounded-md border bg-white"
            />
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              This email does not have rendered content available.
            </div>
          )}

          {links.length > 0 ? (
            <div className="space-y-2 text-xs text-muted-foreground">
              {links.map((link, index) => (
                <a
                  key={`${link.url}-raw-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 break-all hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {link.url}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};
