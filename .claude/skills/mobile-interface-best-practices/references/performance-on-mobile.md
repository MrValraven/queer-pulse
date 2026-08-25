# Performance on mobile

Speed and smoothness on real phones — the constraint QueerPulse actually ships
against. Each rule is one line, then a short _why_.

**In QueerPulse:** the main entry chunk is **~2.77 MB** (it exceeds Workbox's
2 MiB precache default — see `vite.config.ts`), which means slow first paint and
jank on low-end phones. Route-level code-splitting is the single biggest lever
here. Heavy deps to keep out of the entry chunk: `maplibre-gl`, the `visx`
charts, and the Studio/Cinema sub-apps.

## Why mobile is the constraint

- **Test on a mid/low-end phone, not desktop Chrome.** _Phone CPUs are several times slower; Lighthouse's mobile preset models this with a 4× CPU slowdown and slow-4G._
- **Assume thermal throttling, flaky/metered networks, less RAM.** _A desktop hides all four; a real device surfaces the jank, long tasks, and memory pressure._
- **Shipping less JavaScript is the single biggest lever.** _Every KB is downloaded on a metered radio, then parsed and executed on a slow main thread._

## Core Web Vitals (verified 2024–2025)

The three CWV are **LCP, INP, CLS**. **INP became a stable Core Web Vital in
2024, replacing FID.** Targets are measured at the **75th percentile**, per device.

- **LCP — Largest Contentful Paint ≤ 2.5 s.** _Render time of the largest in-viewport image/text block._ Fixes: fast TTFB; `<link rel="preload">` the LCP image and **don't** lazy-load it; avoid render-blocking JS/CSS; code-split so the entry chunk paints sooner.
- **INP — Interaction to Next Paint ≤ 200 ms** (201–500 needs work, >500 poor). _Latency of every tap/click/keypress to the next painted frame._ Fixes: break up long tasks; shrink the DOM; avoid expensive style recalcs; move heavy work to a worker.
- **CLS — Cumulative Layout Shift ≤ 0.1** (≤0.25 needs work). _Largest burst of unexpected layout shift._ Fixes: give images/video `width`/`height` or `aspect-ratio`; preload fonts + `size-adjust`; reserve space for injected content. Shifts within 500 ms of an interaction don't count.

## JavaScript weight

- **Split by route with `React.lazy` + `Suspense`.** _Only the current screen's code ships; the ~2.77 MB entry chunk collapses toward the current view._
- **Prefer dynamic `import()` for on-demand features** (maps, charts, editors, heavy modals). _Keeps rarely-used code out of the initial bundle._
- **Lean on tree-shaking and side-effect-free ESM.** _Dead code never reaches the phone._
- **Set and enforce a performance budget.** _Over half of users abandon a load beyond 3 s; keep the entry chunk well under the 2 MiB precache ceiling so Workbox caches it at all._

```jsx
import { lazy, Suspense } from "react";
const CommunityFeedPage = lazy(() => import("./pages/CommunityFeedPage"));

<Suspense fallback={<FeedSkeleton />}>
  <CommunityFeedPage />
</Suspense>;
```

## Rendering at 60fps

- **Animate only `transform` and `opacity`.** _They run on the compositor, skipping layout+paint; web.dev's test dropped 50% of frames animating `top`/`left` vs 1% with `transform`._ (Motion detail lives in `web-animation-best-practices`.)
- **Never animate `top`/`left`/`width`/`height`/`margin`.** _Each frame forces layout across the subtree._
- **Use `content-visibility: auto` on offscreen sections.** _The browser skips rendering descendants until they near the viewport; pair with `contain-intrinsic-size` so the placeholder reserves height and doesn't shift the scrollbar._

```css
.feed-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

- **Register scroll/touch listeners as `{ passive: true }`.** _Lets the browser scroll without waiting on your handler._
- **Throttle/debounce scroll & resize work; batch DOM writes with `requestAnimationFrame`.** _Avoids layout thrash from interleaved reads and writes._

## Long lists

- **Virtualize (window) large feeds and message lists.** _Mounting thousands of nodes bloats layout, paint, and memory; Lighthouse warns at 800 DOM nodes, flags >1,400 as excessive. Render only visible rows plus a small overscan._ (The message list's approach is owned by `messaging-craft`.)
- **Paginate or infinite-scroll the data behind it.** _Fetch pages on demand; infinite scroll feels smoother but hurts "jump to footer" and back-restore — keep a stable key and restore scroll position._

## Images & media

- **Serve responsive images with `srcset` + `sizes`.** _Desktop-sized images cost mobile 2–4× the bytes; let the browser pick by width and DPR._
- **Use AVIF/WebP with a fallback.** _Far smaller than JPEG/PNG at equal quality._
- **Lazy-load below-the-fold media, decode async.** _`loading="lazy"` + `decoding="async"`; never lazy-load the LCP/above-the-fold image._
- **Reserve space with `aspect-ratio` (or `width`/`height`).** _Prevents CLS as images load._ (In this prototype, image slots are tinted placeholders — apply the same sizing discipline.)

```html
<img
  src="avatar-small.webp"
  srcset="avatar-small.webp 320w, avatar-large.webp 640w"
  sizes="(max-width: 600px) 50vw, 320px"
  width="320"
  height="320"
  loading="lazy"
  decoding="async"
  alt="Member avatar"
/>
```

## Fonts

- **`font-display: swap` on body text.** _Text paints immediately in a fallback (FOUT) instead of staying invisible (FOIT)._
- **Preload the one or two critical fonts** (`<link rel="preload" as="font" crossorigin>`). _Removes the swap delay for above-the-fold text._ (QueerPulse loads Fraunces + DM Sans via `@fontsource-variable`.)
- **Subset to needed glyphs; match fallback metrics with `size-adjust`/`ascent-override`.** _Smaller files; a metric-matched fallback removes the swap layout shift._

## Perceived performance

- **Skeletons over spinners.** _Show the page's shape so the wait feels shorter and layout is reserved._ (Reuse `Skeleton*` + `useSimulatedLoad`.)
- **Optimistic UI + instant tap feedback.** _Apply the mutation locally, reconcile on response; acknowledge every tap within a frame._
- **Honour `prefers-reduced-motion: reduce`.** _Swap transforms for opacity fades or drop non-essential motion (`usePrefersReducedMotion`)._

## Measuring

- **Lighthouse mobile preset** — 4× CPU slowdown + slow-4G; run it against a budget.
- **Chrome DevTools Performance panel** — record with CPU throttling to find long tasks (>50 ms) and layout thrash.
- **WebPageTest** — real devices/networks, filmstrip, waterfall.
- **`web-vitals` library + CrUX** — lab numbers lie about real phones; capture field LCP/INP/CLS from actual users at p75.

## Sources

- [Web Vitals — web.dev](https://web.dev/articles/vitals) — LCP/INP/CLS are the three CWV; INP replaced FID in 2024; p75
- [Interaction to Next Paint (INP) — web.dev](https://web.dev/articles/inp) — ≤200 ms good; long-task/rendering causes
- [Largest Contentful Paint (LCP) — web.dev](https://web.dev/articles/lcp) — ≤2.5 s; preload, don't lazy-load LCP
- [Cumulative Layout Shift (CLS) — web.dev](https://web.dev/articles/cls) — ≤0.1; `aspect-ratio` + font-preload fixes
- [Reduce JavaScript payloads with code splitting — web.dev](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting) — dynamic `import()`, route splitting, 3 s abandonment
- [content-visibility — web.dev](https://web.dev/articles/content-visibility) — `content-visibility: auto` + `contain-intrinsic-size`
- [Optimize long tasks — web.dev](https://web.dev/articles/optimize-long-tasks) — 50 ms threshold, yielding, workers
- [Optimize CSS/JS animations — web.dev](https://web.dev/articles/animations-guide) — compositor-only transform/opacity; dropped-frames data
- [How large DOM sizes affect interactivity — web.dev](https://web.dev/articles/dom-size-and-interactivity) — 800/1,400-node limits; content-visibility
- [Serve responsive images — web.dev](https://web.dev/articles/serve-responsive-images) — `srcset`/`sizes`, 2–4× mobile byte waste
- [lazy — react.dev](https://react.dev/reference/react/lazy) — `React.lazy` + `Suspense`
- [Lazy loading — MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading) — `loading="lazy"`, deferring below-fold media
- [font-display — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) — swap/block, FOIT vs FOUT
- [prefers-reduced-motion — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — detecting the preference
- [web-vitals — GitHub](https://github.com/GoogleChrome/web-vitals) — field measurement matching CrUX/PSI
- [Throttling — Chrome DevTools](https://developer.chrome.com/docs/devtools/settings/throttling) — 4× CPU + slow-4G model
