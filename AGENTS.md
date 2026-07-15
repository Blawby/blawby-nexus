# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

Internal ops/admin dashboard for Blawby, built with Refine v5 + Vite + React 19 + React Router 7 + Tailwind v4 + shadcn/ui (new-york style, lucide icons). Package manager is **pnpm**.

The backend lives in a separate repo (`blawby-ts`: Hono + Drizzle/Postgres + Better Auth). This repo is frontend-only and talks to it over REST at `/api`.

## Commands

```bash
pnpm dev          # runs cloudflared tunnel + `refine dev` concurrently
pnpm build        # tsc && refine build
pnpm start        # serve production build
pnpm tunnel       # cloudflared tunnel only
pnpm lint         # oxlint (config in .oxlintrc.json)
pnpm typecheck    # tsc (TypeScript 7, native compiler)
pnpm dlx shadcn add <component>   # add a shadcn/ui component
```

Linting is oxlint, not ESLint — the ESLint stack was removed because typescript-eslint does not support TypeScript 7. Do not reintroduce ESLint packages. Type-aware rules are enabled via `oxlint-tsgolint` (`options.typeAware` in `.oxlintrc.json`).

There are no tests.

Dev environment requirements:
- `.env` with `VITE_API_URL` (backend origin) and `CLOUDFLARE_TUNNEL_TOKEN` (the tunnel script fails fast without it).
- In dev, Vite proxies `/api` → `VITE_API_URL`; in production the app calls `VITE_API_URL + "/api"` directly (see `src/providers/constants.ts`).
- Dev host is exposed as `dashboard-local.blawby.com` via the tunnel (allowedHosts in `vite.config.ts`).

## Architecture

Refine wires everything in `src/App.tsx`: router provider, data provider, auth provider, and the resource list.

**Resources** (`src/app/resources.ts`): `dashboard`, `users`, `practices`, `emails`. Each resource maps to a page module under `src/pages/<resource>/` containing `list.tsx` / `create.tsx` / `edit.tsx` / `show.tsx` plus a `routes.tsx` that exports a JSX `<Route>` tree. Those route trees are composed in `src/app/routes.tsx` inside an `<Authenticated>` wrapper with `DashboardLayout`. To add a resource: create the page module + routes file, register routes in `src/app/routes.tsx`, and add the resource entry in `src/app/resources.ts`.

**Data provider** (`src/providers/data.ts`): wraps `@refinedev/rest` simple-rest and overrides methods per resource for endpoints that don't follow REST conventions — `users` hits Better Auth's `auth/list-users` (limit/offset), `emails` hits `ops/emails` (limit/offset + recipient/status/practiceId filters, tolerant response-shape unwrapping). Everything else falls through to the base provider. The shared `ky` instance (`kyInstance`, exported from the same file) sends `credentials: "include"` — auth is cookie-based, no tokens.

**Auth provider** (`src/providers/auth.ts`): Better Auth session endpoints (`auth/get-session`, `auth/sign-in/email`, `auth/sign-out`, social sign-in redirect). Sessions are cached in-memory for 5s with an in-flight promise dedupe, and mirrored to localStorage (`auth_session`) for HMR recovery. Dashboard access is role-gated: only `admin` and `super_admin` (see `DASHBOARD_ROLES`) pass `check()`.

**UI**: shadcn/ui components in `src/components/ui/` (configured via `components.json`); app chrome (sidebar, nav, theme) in `src/components/`. Path alias `@` → `src`. Theming via `ThemeProvider` (`blawby-ui-theme` storage key, dark default).

## Planning docs

Requirements and implementation plans live in `docs/brainstorms/` and `docs/plans/` (dated markdown with frontmatter). Plans may span both this repo and `blawby-ts` — check the plan's "Target repos" note before assuming a path refers to this repo.

## Core Conventions

### Imports And Types

- Use `@/` aliases for project imports. Do not introduce `./` or `../` imports in `src/`.
- Use `import type` for type-only imports.
- Do not use explicit `any`; use domain types, generics, or `unknown` with narrowing.
- Do not introduce `as` type assertions to coerce values. Treat `as unknown as Type`, broad assertions, and assertion-based mocks as blockers to clean up in touched code. Prefer type guards, Zod parsing, typed helper interfaces, generics, `satisfies`, or narrowing from `unknown`; remove nearby unsafe assertions when touching code.
- When types are missing, create the local/domain type or ask to install the package's official typings. Do not replace missing types with `any`, `unknown as`, or broad assertions.
- Keep shared types in dedicated type files when they are reused or form a module contract.
- Use `camelCase` for internal variables, functions, and service parameters.
