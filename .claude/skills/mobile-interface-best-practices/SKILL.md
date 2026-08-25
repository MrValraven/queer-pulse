---
name: mobile-interface-best-practices
description: Use when building or changing any QueerPulse UI that will be used on a phone — the installable PWA or the mobile website (one React 19 SPA). Covers navigation & one-handed reach (bottom bar, sheets, back), gestures & touch (swipe, long-press, pull-to-refresh, 44px targets, touch-action), viewport/keyboard/safe-areas (svh/dvh, visualViewport, notch insets), speed on real phones (code-split the entry chunk, 60fps, virtualized lists, images), and PWA install/offline. Grounds decisions in current best practice (Apple HIG, Material 3, web.dev, MDN, NN/g, WCAG) AND in this repo's real primitives (BottomTabBar, useSwipe, useInstallPrompt, useDisplayMode, standalone.css, safe-area tokens). Use BEFORE you build the mobile experience, not only after.
user-invocable: true
---

# Mobile Interface Best Practices (QueerPulse)

The standard for **how QueerPulse feels on a phone** — the installable PWA and
the mobile website, which are the same React 19 SPA. It's the mobile-interaction
and app-delivery _judgment_ layer: navigation architecture, gestures, viewport
and keyboard mechanics, mobile performance budgets, and PWA install/offline.
**Read this before you build a mobile page, bar, sheet, form, list, or gesture —
not only when reviewing it.** For an after-the-fact audit, dispatch the
`mobile-reviewer` agent; to implement fixes, dispatch `mobile-engineer`.

Good mobile here is **in service of the feeling** the brand asks for — warm,
calm, effortless, one-handed. Every choice answers: _can someone do this with one
thumb, on a cheap phone, on a train, without thinking?_ If it only adds chrome or
motion, cut it.

This skill is a checklist; the depth lives in `references/`:

- **`navigation-and-app-shell.md`** — bottom bar, reach, sheets vs modals, back/history, standalone chrome, transitions.
- **`gestures-and-touch.md`** — target sizes, `touch-action`, Pointer Events, swipe/long-press/pull-to-refresh, hover gating.
- **`viewport-keyboard-safe-areas.md`** — `svh`/`dvh`, `visualViewport` keyboard handling, `env(safe-area-inset-*)`, inputs.
- **`performance-on-mobile.md`** — Core Web Vitals, code-splitting the entry chunk, 60fps, virtualization, images/fonts.
- **`pwa-install-and-offline.md`** — manifest, install UX, standalone detection, SW updates, offline/outbox.

Companions — enforce your side, don't duplicate theirs:

- **`design-best-practices`** owns general visual/UX + _basic_ responsive (spacing, hierarchy, "≥44px", "use svh"). This skill owns the mobile _mechanics_. Where they touch, cross-reference.
- **`web-animation-best-practices`** owns motion (transitions, skeletons, micro-interactions). **`react-best-practices`** owns TSX/hooks correctness. **`messaging-craft`** owns chat gestures/composer/outbox internals. **`queer-community-copywriting`** owns the words.

## The checklist

Create a todo per section when applying this to real work.

### 1. Navigation & one-handed reach

- **Primary navigation is 3–5 peer destinations in a bottom bar; primary actions live in the lower thumb arc.** _Top corners are the hardest one-handed reach; roughly half of use is one-thumbed._ (QueerPulse: `BottomTabBar`, installed + `≤860px`; browser tab keeps the `Navbar` hamburger + `MobileNavDrawer`.)
- **Prefer a bottom sheet to a centre modal for choices and detail; give a grabber, drag-to-dismiss, AND an explicit Close.** _Sheets sit in reach and keep context; the drag handle alone is easy to miss._
- **Keep persistent chrome mounted and swap only the content region; never full-page reload.** _Preserves scroll and tab state, feels app-like — this is `AppShell`._
- **In standalone there is no browser Back — guarantee an in-app back and never dead-end.** _Detect via `useDisplayMode().isInstalled`._
- **Don't hide primary nav behind a hamburger when a bar fits, and don't let nav jump/reflow on scroll.** _NN/g measured lower discoverability and slower tasks; movement under the thumb causes mis-taps._ → `navigation-and-app-shell.md`

### 2. Gestures & touch

- **Touch targets ≥44px (ship 44–48) with ~8px spacing; 24px is the never-cross WCAG floor.** _Below that even careful users mis-tap; enlarge the hit area, not the ink._
- **Declare gesture intent with `touch-action`: `manipulation` on tappable controls (kills the 300ms delay), `pan-y` on a horizontal swipe surface, `none` only on surfaces you fully drive.** _Prevents scroll-vs-gesture conflict without hijacking pinch-zoom._
- **Handle drags with Pointer Events + `setPointerCapture`, and always reset on `pointercancel`.** _One path for mouse/pen/touch; the system can steal a gesture — reuse `useSwipe()`._
- **Every gesture has a visible non-gesture equivalent; give pressed feedback within ~100ms.** _Gestures are hidden; a button/menu item must reach the same outcome._
- **No hover-only affordances — gate `:hover` behind `@media (hover: hover) and (pointer: fine)`; no destructive action without confirm/undo; `overscroll-behavior: contain` on sheets/scrollers.** _Touch has no hover; mis-fires are common; stops scroll-chaining and stray pull-to-refresh._ → `gestures-and-touch.md`

### 3. Viewport, keyboard & safe areas

- **Never `100vh` on a full-height layout — use `min-height: 100svh` then `100dvh`.** _`vh` = large viewport, so it overflows under the address bar._
- **A fixed composer/input that the keyboard can cover uses the `visualViewport` handler (translate up by the overlap).** _The keyboard shrinks the visual, not the layout, viewport, so `fixed; bottom:0` hides behind it. `visualViewport` is unused in the repo today._
- **Every new fixed/sticky top or bottom element pads with `env(safe-area-inset-*)` via `max(<base>, env(...))`, and clears the tab bar with `--bottom-inset` in standalone.** _Otherwise it's clipped by the notch/home indicator._ (`viewport-fit=cover` is already set.)
- **Inputs are `font-size: 16px`+ with the right `type`/`inputmode`/`enterkeyhint`/`autocomplete`; never `user-scalable=no`.** _Under 16px iOS zooms on focus; disabling zoom fails WCAG 1.4.4._ → `viewport-keyboard-safe-areas.md`

### 4. Speed & smoothness on real phones

- **Code-split heavy routes/features with `React.lazy` + `Suspense` to keep them off the ~2.77 MB entry chunk.** _Shipping less JS is the biggest lever; the chunk currently overflows Workbox's 2 MiB precache. Keep `maplibre-gl`/`visx`/Studio/Cinema out of the initial bundle._
- **Hit Core Web Vitals at p75: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.** _INP replaced FID in 2024; preload (don't lazy-load) the LCP image, break up long tasks, reserve image space._
- **Virtualize long feeds/lists; animate only `transform`/`opacity`; `content-visibility: auto` offscreen; passive scroll listeners.** _Thousands of nodes kill scroll and memory; compositor-only props stay at 60fps._
- **Responsive images (`srcset`/`sizes`, WebP/AVIF, `loading="lazy"`, `aspect-ratio`); skeletons over spinners; optimistic UI.** _Right bytes per screen, no CLS, a wait that feels shorter._ → `performance-on-mobile.md`

### 5. PWA install & offline

- **Offer install from your own UI at a meaningful moment via `useInstallPrompt()`; on iOS show Share-sheet instructions (no `beforeinstallprompt`).** _Don't nag; iOS installs are manual._
- **Never `skipWaiting()` mid-session — surface a "New version — Reload" prompt.** _Swapping the SW under a live session causes version skew and data loss._
- **Reflect connectivity honestly; queue writes to an outbox with pending/failed/retry; cache images with expiration.** _Flaky mobile networks are the norm; a DM must never silently vanish._ → `pwa-install-and-offline.md`

### 6. Cross-cutting touch a11y (non-negotiable)

- **Everything reachable by tap AND keyboard/switch, with a visible `:focus-visible` ring.** _Gesture-only or hover-only controls exclude people._
- **Never convey meaning by colour alone; meet WCAG AA contrast; size text in `rem`.** _Colourblind/low-vision legibility; honour user zoom._
- **Respect `prefers-reduced-motion` and `prefers-color-scheme` via tokens.** _They're user-environment signals the UI must answer (`usePrefersReducedMotion`)._

## QueerPulse mobile toolkit

Reach for what exists before inventing.

| Need                             | Use                                                                                                          | Where                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Installed / standalone detection | `useDisplayMode()` → `isInstalled`; `data-display-mode` on `<html>`                                          | `app/providers/`, `styles/standalone.css`                   |
| Installed bottom navigation      | `BottomTabBar` (installed + `≤860px`, `<nav>`/`aria-current`)                                                | `shared/components/layout`                                  |
| Browser-tab mobile nav           | `Navbar` hamburger + `MobileNavDrawer` (`useNavDrawer`)                                                      | `shared/components/layout`                                  |
| Swipe gesture                    | `useSwipe()` (Pointer Events, touch-only, axis-guarded)                                                      | `shared/hooks/useSwipe.ts`                                  |
| Install prompt / platform        | `useInstallPrompt()` → `{ canInstall, promptInstall }`; `detectPlatform()`                                   | `shared/hooks/useInstallPrompt.ts`                          |
| Media query / reduced motion     | `useMediaQuery()`, `usePrefersReducedMotion()`                                                               | `shared/hooks`                                              |
| Tab-bar clearance / safe area    | `--tab-bar-h`, `--bottom-inset`, `env(safe-area-inset-*)` (horizontal insets already on the content wrapper) | `styles/tokens`, `styles/base.css`, `styles/standalone.css` |
| Viewport / iOS meta              | `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-*`                                                | `index.html`                                                |
| Full-height sizing               | `min-height: 100svh` then `100dvh`                                                                           | any full-screen shell                                       |
| Skeletons / load-in / routes     | `Skeleton*`, `FadeIn`, `Reveal`, `useSimulatedLoad`; `React.lazy`; `linkToPath()`                            | `shared/components/ui`, `hooks`, `app/routes`               |
| PWA build / service worker       | vite-plugin-pwa `injectManifest`, `src/sw.ts`, web push                                                      | `vite.config.ts`, `src/sw.ts`                               |

## Quick self-review

Before calling a mobile change done, confirm:

1. **Reach** — primary actions in the thumb arc; nav is a bottom bar (or the drawer in a browser tab), not a corner control?
2. **Touch** — targets ≥44px + spacing; `touch-action` declared; every gesture also has a button; pressed feedback; no hover-only?
3. **Fit** — no `100vh` (used `svh`/`dvh`); fixed chrome has safe-area insets; a keyboard-coverable input uses `visualViewport`; inputs ≥16px with right keyboard?
4. **Speed** — heavy routes `React.lazy`'d off the entry chunk; long lists virtualized; images sized/lazy; animating only `transform`/`opacity`?
5. **PWA** — install offered (not nagged), iOS instructed; SW update prompts reload; writes queued with pending/failed states?
6. **A11y** — tap + keyboard + visible focus; colour never the sole signal; AA contrast; `rem`; reduced-motion honoured?
7. **Does this work one-handed on a cheap phone without thinking — or does it just look nice on my desktop?** If the latter, fix it.

## Sources

The `references/*.md` files carry the full, per-topic verified source lists. Anchors:

**Navigation & touch** · [Apple HIG — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) · [Apple HIG — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) · [Material 3 — Navigation bar](https://m3.material.io/components/navigation-bar/guidelines) · [NN/g — Mobile navigation patterns](https://www.nngroup.com/articles/mobile-navigation-patterns/) · [NN/g — Touch target size](https://www.nngroup.com/articles/touch-target-size/) · [MDN — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) · [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) · [W3C — WCAG 2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

**Viewport & PWA** · [web.dev — Viewport units (svh/dvh)](https://web.dev/blog/viewport-units) · [MDN — VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) · [MDN — env()/safe-area-inset](https://developer.mozilla.org/en-US/docs/Web/CSS/env) · [MDN — Web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest) · [web.dev — Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle) · [web.dev — Customize install](https://web.dev/articles/customize-install)

**Performance** · [web.dev — Web Vitals](https://web.dev/articles/vitals) · [web.dev — INP](https://web.dev/articles/inp) · [web.dev — Code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting) · [web.dev — content-visibility](https://web.dev/articles/content-visibility) · [react.dev — lazy](https://react.dev/reference/react/lazy)
