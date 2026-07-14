# Blawby Dashboard

Internal dashboard for Blawby support/admin workflows. It is a frontend-only app built with Refine, Vite, React, React Router, Tailwind, and shadcn/ui.

The backend lives in the separate `blawby-ts` repo. This app talks to it over REST under `/api` and relies on Better Auth cookies for authentication.

## Requirements

- Node.js compatible with the project lockfile
- pnpm
- A running Blawby backend
- `cloudflared` if you want to use the local dashboard tunnel

Create `.env` in the project root:

```bash
VITE_API_URL=http://localhost:3000
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token
```

`VITE_API_URL` should point to the backend origin, without `/api`.

## Run Locally

Install dependencies:

```bash
pnpm install
```

Run the dashboard with the Cloudflare tunnel:

```bash
pnpm dev
```

Run only the tunnel:

```bash
pnpm tunnel
```

In development, Vite proxies `/api` to `VITE_API_URL`. In production, the app calls `${VITE_API_URL}/api` directly.

## Useful Commands

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm start
pnpm dlx shadcn add <component>
```

`pnpm build` runs TypeScript first, then the Refine/Vite production build.

## Project Guide

See [docs/project-guide.md](docs/project-guide.md) for the architecture, route/resource conventions, auth flow, API wiring, and how to add new dashboard modules.
