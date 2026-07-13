# SEO & metadata (`src/shared/seo`)

Per-route `<title>` / description / canonical / Open Graph / Twitter-card metadata
for the QueerPulse SPA. React-19-native, **no external dependency** (no
`react-helmet`).

## Usage

```tsx
import { PageMeta } from "../../shared/seo";

export function MyPage() {
  return (
    <PageShell>
      <PageMeta
        title="My Page — QueerPulse"
        description="A one-line summary that unfurls on Slack/WhatsApp/X."
        image="/og-default.svg" // optional; root-relative or absolute
      />
      {/* … */}
    </PageShell>
  );
}
```

- `title` is set verbatim — include the brand (e.g. `"… — QueerPulse"`).
- Anything omitted falls back to `defaultMeta` in `seo.data.ts` (neutral,
  brand-level copy — **never** invite-specific).
- Canonical / `og:url` default to `SITE_ORIGIN + current path`. Override
  `SITE_ORIGIN` at build time with `VITE_SITE_ORIGIN`.
- `<PageMeta>` restores the previous tag values on unmount, so it composes with
  the static defaults baked into `index.html`.

## ⚠️ SPA-crawler limitation (important)

`<PageMeta>` applies metadata **client-side, after the JS bundle loads and React
renders**. Two audiences don't run (or don't wait for) that JS:

1. **Social scrapers** — Slack, WhatsApp, iMessage, Facebook, Signal, LinkedIn,
   and X by default — fetch the raw HTML and **do not execute JavaScript**. They
   see only the static `index.html` shell, so client-side `<PageMeta>` **does not
   fix link unfurls on its own**. It only fixes in-app document titles and the
   experience of any JS-running client.
2. **Search crawlers** — Googlebot renders JS (deferred, best-effort), so CSR
   meta is _mostly_ indexable by Google over time; Bing and most others are
   unreliable.

### Fix for correct unfurls: prerender the public pages (recommended)

Add a build-time prerender pass that renders the **public** static routes to real
HTML files in `dist/`, each with its correct baked-in `<title>`/OG/Twitter — while
the gated member app stays a pure CSR SPA.

- Feed the prerender tool exactly the public path list from
  `scripts/generate-sitemap.mjs` (`PUBLIC_SITEMAP_PATHS`). **Never** prerender a
  gated path — it would bake in the sign-in redirect.
- Tooling options: a Puppeteer/`react-snap`-style crawl, or `vite-plugin-prerender`.
- Dynamic `:slug` pages (magazine articles, films) stay CSR until there is a real
  content source to enumerate — acceptable with mock data.

Alternatives, in decreasing preference: an on-demand OG service for bot
user-agents (Prerender.io / an edge function), or full SSR (a large architectural
change; not warranted for a P2). Accepting CSR-only meta leaves social unfurls
wrong and is only a stopgap once `index.html`'s default is at least neutral.

See `docs/production-readiness/15-seo-and-metadata.md` for the full rationale.
