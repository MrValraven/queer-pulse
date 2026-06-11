# QueerPulse

A front-end prototype for **QueerPulse** — a queer community platform rooted in Lisbon. It brings together the many things a real-world LGBTQ+ community needs in one place: people, events, culture, mutual support, and the infrastructure to run it all transparently.

> This is a **design/interaction prototype**. All content is mock/static data — there is no backend, authentication, or persistence. Interactions are simulated with local component state and toast notifications.

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
- **CSS Modules** + a global design-token system (no CSS-in-JS, no utility framework)

## Getting started

Requires Node and **pnpm**.

```bash
pnpm install
pnpm dev        # start the dev server (HMR)
```

Other scripts:

```bash
pnpm build      # typecheck + production build (tsc -b && vite build)
pnpm preview    # serve the production build locally
pnpm lint       # run ESLint
```

There is no test suite configured.

## Project layout

```
docs/                 Design system & style rules (read before building UI)
src/
  app/                Router, route map, providers, app shell
  features/<domain>/  Feature-first pages, styles, mock data, components
  shared/             Design-system primitives, layout shells, hooks, i18n
  styles/             Global tokens, fonts, base CSS
```

Each feature folder colocates a page (`XPage.tsx`), its styles (`XPage.module.css`), its mock data (`x.data.ts`), and any extracted presentational sub-components.

## Conventions

- **Design system is law.** Read [`docs/STYLE-RULES.md`](docs/STYLE-RULES.md) (and the fuller [`docs/design-system.md`](docs/design-system.md)) before touching any UI — design tokens only, never a pure-white page background, plum panels for success states, Fraunces serif + coral emphasis, DM Sans body, and the shared `<Button>` component.
- **Keep components small.** No single component over ~200 lines; each component's mock data lives in its own colocated `*.data.ts(x)` file.

See [`CLAUDE.md`](CLAUDE.md) for the deeper architecture notes.
