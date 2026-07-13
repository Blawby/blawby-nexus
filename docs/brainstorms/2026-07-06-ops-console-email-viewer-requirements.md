---
date: 2026-07-06
topic: ops-console-email-viewer
---

# Ops Console — Per-Practice Email Viewer (Phase 1)

## Summary

Grow the existing Refine dashboard (`blawby-dashboard`) into an internal ops console. Phase 1: a super admin opens any practice and sees every email the platform sent for it — password resets, invitations, magic links, receipts — with a rendered preview and copy-able links, backed by a new protected `/api/ops/*` route group in the `blawby-ts` backend reading the existing `email_logs` table. Rolls out on staging first; production enablement follows once 2FA and audit logging are in place.

---

## Problem Frame

Staging does not deliver email (the Resend call is skipped outside production-like configs, or keys are fake), so any flow that depends on an emailed link — password reset, practice invitation, magic link — dead-ends for testers. Today the only escape hatches are the local-only file mailbox (`/api/dev/emails`, which reads HTML files from local disk and is useless on deployed staging) or direct database access. Both are slow, and neither is available to non-engineers.

The same pain appears in production in a different costume: a user reports "I never got the reset email," and support has no way to see whether it sent, failed, or what link it contained — unblocking the user requires an engineer.

---

## Actors

- A1. Super admin: internal Blawby staff (support/ops/eng) using the dashboard to look up emails and copy links.
- A2. Tester: triggers auth/email flows on staging, then needs the generated link to continue testing. Uses the dashboard as A1 or asks an A1.
- A3. Backend (`blawby-ts`): owns the database, Better Auth, email sending, and enforces all access control.
- A4. Dashboard (`blawby-dashboard`): Refine UI; its checks are UX only, never security.

---

## Key Flows

- F1. Tester retrieves a staging link
  - **Trigger:** Tester triggers forgot-password (or invite) on staging; no email arrives.
  - **Actors:** A2, A1, A3, A4
  - **Steps:** Tester (or support) logs into dashboard as super admin → opens the practice → Emails tab (or the global Emails view when the practice is unknown) → finds the email at top of the list → copies the reset/invite link → completes the flow.
  - **Outcome:** Flow unblocked in seconds, no DB access, no engineer.
  - **Covered by:** R3, R4, R5, R6, R8, R9, R15, R16, R17

- F2. Support unblocks a production user (later rollout)
  - **Trigger:** User reports a missing email in production.
  - **Actors:** A1, A3, A4
  - **Steps:** Super admin (with 2FA) finds the practice → Emails tab → checks status (sent/failed) → if needed, copies the live link and delivers it to the user through a verified channel.
  - **Outcome:** User unblocked when the logged link is still valid; the content view is audit-logged. Reset/magic-link tokens are short-lived and often single-use, so a link logged hours earlier may be expired — in that case support confirms send status only, and unblocking via a freshly generated link is explicitly the later mutation phase.
  - **Covered by:** R3, R4, R11, R12, R13

---

## Requirements

**Access control**
- R1. Introduce a new `super_admin` user role in Better Auth, distinct from the existing `admin` role and from practice-level roles.
- R2. All `/api/ops/*` endpoints require an authenticated session with `role === "super_admin"`, enforced by backend middleware (`requireOpsAccess()`-style). Frontend checks are UX only.
- R3. A super admin can access all practices, not only ones they are a member of.
- R14. `super_admin` assignment/removal is restricted to a deliberate manual action by an engineer (DB / Better Auth admin action); there is no self-service path, and every grant/revocation is recorded.

**Backend (`blawby-ts`)**
- R4. New protected route group `/api/ops/*` (namespace deliberately not `/api/admin/*` to avoid confusion with practice admin roles).
- R5. An ops endpoint lists emails for a given practice from the existing `email_logs` table: recipient, subject, template name, status (sent/failed/skipped), error message, timestamp.
- R6. An ops endpoint returns a single email's rendered HTML (re-rendered via the existing `renderTemplate(templateName, templateData)`) and the actionable link(s) extracted from `templateData` (reset link, invite link, magic link, etc.). The preview is a best-effort re-render against the current template version — the UI labels it as a reconstruction, and the endpoint handles unknown/renamed template names and anonymized rows gracefully instead of erroring.
- R7. `email_logs` rows gain a practice association (`practice_id`), populated by threading practice context through email send callsites. Emails with no practice context (e.g., pre-signup verification) are still logged and surfaced in a "no practice" bucket.
- R8. Read-only: phase 1 performs no mutations — no resending, no generating fresh tokens/links.
- R15. Sends to `@test-blawby.com` addresses must also insert an `email_logs` row (the current early return skips logging entirely), so tester emails appear in the viewer. Skipped sends — test-domain and environment-skip alike — are logged with a distinct `skipped` status (or an equally visible skip reason) rather than `sent`, so a never-delivered email is never reported to support as delivered.
- R16. Account-level emails (password reset, email verification, magic link) are attributed to a practice only when the recipient resolves to a user with exactly one practice membership at send time. Users with zero or multiple memberships are logged unattributed and remain findable via recipient search in the global Emails view (R17).

**Dashboard (`blawby-dashboard`)**
- R9. Practice detail view gains an Emails tab: reverse-chronological list with recipient/status/template, search or filter by recipient, filter by status (sent/failed), click-through to rendered preview, and a copy-link button per actionable link.
- R17. A top-level "Emails" view in the ops console lists all emails — including those with no practice association — with recipient search, status filter, a practice column, and a practice filter that includes an explicit "no practice" value. The per-practice Emails tab (R9) is the same list pre-filtered to that practice, so there is one list UI with two entry points.
- R10. Dashboard auth provider accepts the `super_admin` role (it currently gates on `role === "admin"` only — `src/providers/auth.ts`).

**Rollout**
- R11. Ships to staging first. Production use of the email content/link endpoints is deferred until the team is comfortable and the prod prerequisites (R12, R13) land.
- R12. Prod prerequisite: 2FA required for super admin accounts.
- R13. Prod prerequisite: every email content/link view is audit-logged (who, when, which email), because live reset links are an account-takeover surface.

---

## Acceptance Examples

- AE1. **Covers R2.** Given a logged-in practice admin (role `admin`, not `super_admin`), when they call any `/api/ops/*` endpoint directly (bypassing the UI), the backend rejects the request.
- AE2. **Covers R5, R6, R9, R16.** Given a tester triggered forgot-password on staging for a user whose only practice membership is P, when a super admin opens practice P's Emails tab, the reset email appears with status `sent`, and its detail view exposes the working reset link via a copy button.
- AE3. **Covers R7.** Given an email sent with no practice context (e.g., email verification at signup), when it is logged, it still appears in the "no practice" bucket rather than being dropped.
- AE4. **Covers R8.** Given the phase-1 ops UI, when a super admin views any email, no action exists that resends it or generates a new token.
- AE5. **Covers R11.** Given the production environment before R12/R13 land, when link visibility is evaluated for release, content/link endpoints remain unexposed there even though `email_logs` has production rows.
- AE6. **Covers R15.** Given a staging tester whose account email ends in `@test-blawby.com`, when they trigger forgot-password, the email is logged and appears in the ops viewer with its `skipped` status visible, its preview and links intact.
- AE7. **Covers R16, R17.** Given a password-reset email that could not be attributed to a practice, when a super admin searches the global Emails view by the recipient's address, the email is found and its reset link is copy-able.
- AE8. **Covers R15.** Given an email whose actual send was skipped (test-domain recipient or environment skip), when a super admin views it, its status reads `skipped` — never `sent`.
- AE9. **Covers R16, R17.** Given a user who belongs to two practices, when they trigger forgot-password, the email is logged unattributed, appears under the "no practice" filter in the global Emails view, and does not appear under either practice's tab.

---

## Success Criteria

- A tester on staging gets from "triggered forgot-password" to "holding the reset link" in under a minute through the dashboard, with no database access and no engineer involved.
- Support can answer "did this user's email send, and what was in it?" for any practice from one screen.
- `ce-plan` can plan implementation without inventing product behavior: actors, gating, data source, and rollout order are all specified here.

---

## Scope Boundaries

- No resending emails or generating fresh reset/invite links (mutation) — later phase.
- No production exposure of email content/links until R12 (2FA) and R13 (audit log) are done.
- No generic Nova-style "define a resource, get CRUD" builder — that is the long-term direction for the dashboard, not this slice.
- No changes to how/when emails are actually sent or skipped per environment.
- No new backend service and no new database — reuse `blawby-ts` and its existing Postgres.

---

## Key Decisions

- Existing backend DB, no new one: the dashboard talks only to `/api/ops/*` HTTP endpoints; `blawby-ts` reads its own Postgres. A separate DB would require syncing for zero benefit.
- Reuse `email_logs` + `renderTemplate` instead of the file mailbox or reading auth tokens from the `verification` table: works on deployed staging (no disk), one mechanism covers every email type, and it sidesteps any question of token storage format.
- New `super_admin` role instead of reusing `admin`: separates internal ops access from existing dashboard admin semantics.
- `/api/ops/*` namespace instead of `/api/admin/*`: avoids collision with practice "admin" roles and fits future support/job/debug tooling.
- Per-practice as the primary browsing model (accepting the `practice_id` schema change and callsite threading) rather than a global-list-only v1: matches how support thinks ("this practice's emails").
- Prod access is wanted (unblocking real users), but staged behind 2FA + audit logging because visible live reset links are an account-takeover surface.

---

## Dependencies / Assumptions

- `email_logs` captures every email in all environments — except sends to `@test-blawby.com`, which currently return early before logging (verified in `blawby-ts` `src/shared/services/email/email.service.ts`; R15 closes this gap). Inserts are fire-and-forget (failures are swallowed), so absence of a row means "no record," not "not sent."
- Actionable links are recoverable from `templateData` for every link-bearing template (reset, invite, magic link). Spot-verified for reset/magic-link templates; full template inventory happens in planning.
- `email_logs` has 90-day retention with anonymization (`expires_at`, `is_anonymized`) — bounds the exposure window; ops viewer inherits it.
- Better Auth is hosted in `blawby-ts` (the chatbot worker delegates sessions to it); the dashboard already authenticates against it.
- Assumption: adding a role value is supported by the current Better Auth admin-plugin configuration in `blawby-ts` (not yet verified — check `adminRoles`/role config during planning).

---

## Outstanding Questions

### Deferred to Planning

- [Affects R7][Technical] How practice context is threaded to `email_logs`: per-callsite parameter, context propagation, or inference from the send payload — and the full list of send callsites to touch.
- [Affects R6][Technical] Link extraction approach: per-template known link fields vs. generic URL extraction from `templateData`.
- [Affects R1, R10][Needs research] Where roles live in the Better Auth config in `blawby-ts` and whether the admin plugin's `adminRoles` needs updating for `super_admin`.
- [Affects R12][Needs research] 2FA mechanism for super admins (Better Auth `twoFactor` plugin vs. Cloudflare Access in front of the dashboard, or both).
- [Affects R13][Technical] Audit log shape: reuse an existing audit/log table pattern in `blawby-ts` or add a dedicated ops audit table.
