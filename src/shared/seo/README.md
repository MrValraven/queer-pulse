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
        image="/og-default.png" // optional; root-relative or absolute
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
- `<PageMeta>` resets the head to the neutral site defaults on unmount — the
  same values `index.html` ships, mirrored from `defaultMeta`. The baseline is
  deliberately _absolute_ rather than "whatever the head held when this page
  mounted": the prerenderer bakes each public page's own title into its
  `dist/<path>/index.html`, so a session that lands on one starts with a
  page-specific head, and restoring that captured state left every route
  entered afterwards wearing the entry page's title. That is visible on the
  gated routes (feed, local directory), which render no `<PageMeta>` of their
  own. See `applyDefaultDocumentMeta` in `useDocumentMeta.ts`.

## The SPA-crawler problem — and how it is solved

`<PageMeta>` applies metadata **client-side, after the JS bundle loads and React
renders**. Two audiences don't run (or don't wait for) that JS:

1. **Social scrapers** — Slack, WhatsApp, iMessage, Facebook, Signal, LinkedIn,
   and X by default — fetch the raw HTML and **do not execute JavaScript**.
2. **AI retrieval crawlers** — `OAI-SearchBot`, `Claude-SearchBot`,
   `PerplexityBot` — do not execute JavaScript **at all**. (Googlebot does, on a
   deferred best-effort basis; Bing and most others are unreliable.)

**This is solved as of 2026-07-20.** `scripts/prerender.mjs` runs after
`vite build` and renders every path in `QUIET_PUBLIC_PATHS`
(`scripts/publicPaths.mjs`) to a real `dist/<path>/index.html` in headless
Chromium, with the correct `<title>`, OG/Twitter tags and JSON-LD baked in. The
gated member app stays a pure CSR SPA.

Three things to know if you touch this:

- **A page without `<PageMeta>` fails the build.** The prerenderer waits for
  `data-prerender-ready`, which only `useDocumentMeta` sets. This is deliberate —
  it makes metadata coverage build-enforced rather than aspirational.
- **`QUIET_PUBLIC_PATHS` is the single source of truth**, shared by the
  prerenderer and the sitemap generator, and guarded by an `isGatedPath` mirror
  of `src/app/authGate.ts`. A gated path can never be written to disk.
- **Anything that delays content races the serialiser.** Skeletons and count-up
  animations are skipped during the pass via `src/shared/prerender.ts`. If you
  add a new loading pattern, make it prerender-aware or the page ships empty.

Dynamic `:slug` pages (magazine articles, films) stay CSR — there is no canonical
content source to enumerate, and those surfaces are deliberately not indexed.

See `docs/superpowers/specs/2026-07-20-seo-and-ai-discoverability-design.md` for
the current design, and `docs/production-readiness/15-seo-and-metadata.md` for
the original rationale.
