# Project Guide

## What This App Is

This repository is the Blawby internal dashboard. It is not the product app and it does not own backend business logic. It is a React frontend that calls the Blawby backend through `/api`.

Stack:

- Refine v5 for admin-resource patterns, auth/data providers, and router integration
- Vite for dev/build
- React 19 and React Router 7
- Tailwind v4
- shadcn/ui components in `src/components/ui`
- Better Auth cookie sessions from the backend

## Runtime Setup

Required `.env` values:

```bash
VITE_API_URL=http://localhost:3000
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token
```

`VITE_API_URL` is the backend origin. Do not include `/api`; the dashboard adds that itself.

Development behavior:

- `pnpm dev` starts `cloudflared` and `refine dev` together.
- Vite proxies frontend `/api/*` calls to `VITE_API_URL`.
- The local tunnel host is allowed by `vite.config.ts`.

Production behavior:

- API calls go to `${VITE_API_URL}/api`.
- Auth remains cookie-based, so backend cookie/CORS settings must allow the deployed dashboard origin.

## App Bootstrap

`src/App.tsx` wires the main Refine providers:

- `routerProvider` from `@refinedev/react-router`
- `dataProvider` from `src/providers/data.ts`
- `authProvider` from `src/providers/auth.ts`
- `resources` from `src/app/resources.ts`
- `ThemeProvider` for light/dark theme state

The rendered route tree comes from `src/app/routes.tsx`.

## Routes And Resources

Resources live in `src/app/resources.ts`.

Routes live in `src/app/routes.tsx`, but each feature owns its own route tree:

- `src/pages/users/routes.tsx`
- `src/pages/practices/routes.tsx`

Current top-level resources:

- `dashboard`
- `users`
- `practices`

Email logs are intentionally not a top-level route. They are embedded in user and practice detail screens through the shared email table components.

When adding a feature:

1. Create `src/pages/<feature>/`.
2. Add `list.tsx`, `show.tsx`, `create.tsx`, or `edit.tsx` only as needed.
3. Add `routes.tsx` for that feature.
4. Import the feature routes in `src/app/routes.tsx`.
5. Add the resource to `src/app/resources.ts` if it should appear as a Refine resource.
6. Add navigation in `src/components/app-sidebar.tsx` only if it should be directly reachable.

## Auth Flow

Auth is implemented in `src/providers/auth.ts`.

Important endpoints:

- Login: `POST /api/auth/dashboard/sign-in/email`
- Session: `GET /api/auth/get-session`
- Logout: `POST /api/auth/sign-out`

The dashboard-specific login endpoint is important: normal product users should not be signed in first and rejected later by the frontend. The backend should decide dashboard access during sign-in.

Session handling:

- Requests use cookies through `credentials: "include"`.
- Session reads are cached briefly in memory.
- Session data is mirrored to localStorage for dev/HMR recovery.
- `authProvider.check()` redirects unauthenticated users to `/login`.

## API And Data Provider

API wiring lives in `src/providers/data.ts`.

The project uses Refine's simple REST data provider as a base, then overrides resources whose backend shape is custom.

Current custom mappings:

- `users` -> `GET /api/ops/users`
- `practices` -> `GET /api/ops/practices`
- `practiceInvitations` -> `GET /api/ops/practices/:practiceId/invitations`
- `emails` -> `GET /api/ops/emails`
- email preview -> `GET /api/ops/emails/:id`

Even though `emails` is not a top-level resource in navigation, it remains a data-provider resource because user and practice detail tabs use it.

## UI Structure

Shared app chrome:

- `src/components/app-sidebar.tsx`
- `src/components/nav-main.tsx`
- `src/components/nav-user.tsx`
- `src/components/team-switcher.tsx`
- `src/components/app-breadcrumbs.tsx`

shadcn/ui components live in `src/components/ui`. Add more with:

```bash
pnpm dlx shadcn add <component>
```

Use lucide icons where available.

## Validation

Before pushing dashboard changes, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Current lint may show warnings in older shared UI files. Treat new warnings in touched code as something to fix.

## Backend Expectations

This dashboard expects the backend to provide:

- Better Auth dashboard sign-in
- Cookie-based session support
- Staff/dashboard authorization on ops endpoints
- Ops resource endpoints for users, practices, invitations, and emails

The frontend can hide links, but backend authorization is the security boundary.
