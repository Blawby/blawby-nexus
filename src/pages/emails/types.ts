export type EmailStatus = "sent" | "failed" | "skipped";

export type OpsEmailListItem = {
  id: string;
  recipient?: string | null;
  recipientEmail?: string | null;
  recipient_email?: string | null;
  subject?: string | null;
  template?: string | null;
  templateName?: string | null;
  template_name?: string | null;
  status: EmailStatus;
  errorMessage?: string | null;
  error_message?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
  sentAt?: string | null;
  practiceId?: string | null;
  practice_id?: string | null;
  practiceName?: string | null;
  practice_name?: string | null;
};

export type ActionableEmailLink = {
  label?: string | null;
  url: string;
};

export type OpsEmailDetail = OpsEmailListItem & {
  html?: string | null;
  renderedHtml?: string | null;
  rendered_html?: string | null;
  actionableLinks?: ActionableEmailLink[];
  actionable_links?: ActionableEmailLink[];
  links?: ActionableEmailLink[];
  contentUnavailableReason?: string | null;
  content_unavailable_reason?: string | null;
  isAnonymized?: boolean;
  is_anonymized?: boolean;
};
