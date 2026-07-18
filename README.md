# QueerPulse

The web front end for **QueerPulse** — a queer community platform rooted in Lisbon. It brings together the many things a real-world LGBTQ+ community needs in one place: people, events, culture, mutual support, and the infrastructure to run it all transparently.

> **Dual-mode.** This app began as a pure design prototype and is being wired to a real [NestJS backend](../queerpulse-backend) (a separate repo, deployed at `api.queerpulse.com`). It runs in one of two modes:
>
> - **Live mode** — the default whenever `VITE_API_URL` is set. Real Google OAuth, httpOnly-cookie sessions with CSRF + token refresh, real persistence, and socket.io realtime. See [`src/shared/api/client.ts`](src/shared/api/client.ts).
> - **Demo mode** — forced on when `VITE_API_URL` is unset, or opted into with `VITE_DEMO=1`. Every data hook falls back to colocated `*.data.ts` mock fixtures, so the prototype still runs standalone with no backend.
>
> **Every live-mode code path must keep its demo fallback.** Preserving this split is a hard rule for any change — see [`CLAUDE.md`](CLAUDE.md).
>
> Not all surfaces are wired yet. Roughly a quarter of pages talk to the API today; the rest still render static content. [`docs/production-readiness/00-ROADMAP.md`](docs/production-readiness/00-ROADMAP.md) tracks what remains.

## What's in it

The app spans the full surface of the imagined platform, including:

- **Community & people** — member directory and profiles, search, connections/vouching, communities, the feed, forum, and messaging.
- **Gatherings** — a calendar, event pages and RSVPs, hosting and co-hosting flows, a live check-in dashboard, and recaps.
- **Culture** — a magazine (articles, authors, issues, cover gallery), a podcast with an audio player, a **Cinema** co-op (film pages, browsing, memberships), and a **Studio** co-op (tracks, albums, live sessions, open calls, payouts).
- **Economy** — jobs, mentorship, freelance tools, salary transparency, flatmate matching, a barter/skills exchange, and a community micro-grants fund.
- **Resources** — practical guides on sexual and mental health, trans healthcare, harm reduction, intersectionality, sober community, hate-crime reporting, visas/relocation, and "Queer 101".
- **Safety & trust** — a verified safe-spaces network and a city map.
- **Governance** — public transparency reports, the manifesto, code of conduct, constitution, and annual assembly.

## Tech stack

- **Vite** + **React 19** + **TypeScript**
- **react-router-dom v7** for routing
- **@tanstack/react-query** for server state
- **socket.io-client** for realtime (messages + notifications)
- **CSS Modules** + a global design-token system (no CSS-in-JS, no utility framework)
- **Vitest** + React Testing Library + jsdom + MSW for tests; **Playwright** for e2e

## Getting started

Requires Node and **pnpm**.

```bash
pnpm install
cp .env.example .env   # then set VITE_API_URL (omit it to run in demo mode)
pnpm dev               # start the dev server (HMR)
```

Other scripts:

```bash
pnpm build      # typecheck + production build (tsc -b && vite build)
pnpm preview    # serve the production build locally
pnpm lint       # run ESLint
pnpm test       # run the Vitest suite once
pnpm test:watch # watch mode
pnpm test:cov   # with coverage (gated on src/shared/api/client.ts)
pnpm test:e2e   # Playwright happy-paths (browsers must be installed)
pnpm sitemap    # regenerate public/sitemap.xml (not part of build)
```

Tests live in `src/**/*.test.ts(x)` and `src/test/**`. Note there is **no CI** in this repo — run `pnpm build && pnpm lint && pnpm test` before pushing.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | **Yes, in production** | Backend origin, no trailing slash (`https://api.queerpulse.com`). Inlined at build time; a production build **throws at boot** without it, by design. Unset ⇒ demo mode. |
| `VITE_DEMO` | No | `1` forces demo mode. **Never set this on a real deployment** — it serves fabricated content as real community data. |
| `VITE_SITE_ORIGIN` | Recommended | Canonical origin for SEO/OG/sitemap URLs. Unset ⇒ falls back to `https://queerpulse.com`, which is wrong on preview deploys. |
| `VITE_SENTRY_DSN` | No | Currently **inert** — `@sentry/react` is not installed and the observability layer is a no-op stub. |
| `VITE_RELEASE` | No | Sentry release tag; inert for the same reason. |

Cookies are `SameSite=Lax` with no `Domain` attribute, so the frontend and API **must share a registrable domain** (`queerpulse.com` + `api.queerpulse.com`). Deploying the frontend on an unrelated domain silently breaks authentication.

## Project layout

```
docs/                 Design system, style rules, production-readiness roadmap
e2e/                  Playwright specs
src/
  app/                Router, route map, providers, app shell
  features/<domain>/  Feature-first pages, styles, mock data, API modules
  shared/
    api/              Fetch client (CSRF + refresh), realtime, contracts
    components/       Design-system primitives, layout shells
    i18n/             Translation catalogs (EN + PT)
  styles/             Global tokens, fonts, base CSS
  test/               Vitest setup + MSW handlers
```

Each feature folder colocates a page (`XPage.tsx`), its styles (`XPage.module.css`), its mock data (`x.data.ts`), its API layer (`api/`), and any extracted presentational sub-components.

## Conventions

- **Design system is law.** Read [`docs/STYLE-RULES.md`](docs/STYLE-RULES.md) (and the fuller [`docs/design-system.md`](docs/design-system.md)) before touching any UI — design tokens only, never a pure-white page background, plum panels for success states, Fraunces serif + coral emphasis, DM Sans body, and the shared `<Button>` component.
- **Keep components small.** No single component over ~200 lines; each component's mock data lives in its own colocated `*.data.ts(x)` file.
- **Preserve dual-mode.** Any live-mode path keeps its `*.data.ts` demo fallback. A change that only works with a backend running is incomplete.
- **Never hardcode paths.** Use `linkToPath()` / `routes` from [`src/app/routeMap.ts`](src/app/routeMap.ts).
- **Both translation catalogs.** EN and PT are parity-tested — adding a key to one without the other fails the suite.

See [`CLAUDE.md`](CLAUDE.md) for the deeper architecture notes.
