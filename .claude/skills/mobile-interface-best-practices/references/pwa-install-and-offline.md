# PWA install & offline

Making QueerPulse install cleanly and behave offline. Each rule is one line, then
a short _why_.

**In QueerPulse:** the build is vite-plugin-pwa `injectManifest` with a Workbox
SW in `src/sw.ts`; the manifest (in `vite.config.ts`) is `display: standalone`,
`theme_color #2d1b3d`, `start_url /?mode=standalone`; web push is wired. Reuse
`useInstallPrompt()` (`{ canInstall, promptInstall }`) + `detectPlatform()` for
the install affordance, and `useDisplayMode().isInstalled` for standalone
detection — don't re-implement these.

## Manifest essentials

- **Set both `name` and `short_name`.** _`name` shows on the install prompt and splash; `short_name` fits under the home-screen icon._
- **Ship 192px and 512px PNG `icons`.** _Chromium requires both to consider the app installable._
- **Add a `"purpose": "maskable"` icon with a 40%-radius safe zone.** _Without it Android crops your icon inside a white circle and can trim the outer ~10%._
- **Keep `display: standalone`** (optionally `display_override: ["window-controls-overlay", "standalone"]` for desktop). _Standalone drops the tab/URL bar so it feels like an app; `display_override` opts into richer chrome with fallback._
- **Set `theme_color` and `background_color`.** _`theme_color` tints the status bar; `background_color` paints the splash before first paint — match it to the app background to avoid a flash._
- **Set `start_url`, `scope`, and a stable `id`.** _`start_url` is the launch entry; `scope` bounds "in-app"; `id` keeps install identity stable across `start_url` changes so updates don't spawn a duplicate app._
- **Leave `orientation` unset unless truly needed.** _Locking orientation fights the user's device._

```json
{
  "name": "QueerPulse",
  "short_name": "QueerPulse",
  "id": "/",
  "start_url": "/?mode=standalone",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#2d1b3d",
  "background_color": "#2d1b3d",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Install UX (Android/Chromium)

- **Capture `beforeinstallprompt`, `preventDefault()`, stash the event.** _It fires when the site is installable; deferring lets you show your own affordance with context instead of the generic mini-infobar — this is what `useInstallPrompt` does._
- **Call `prompt()` only from a user gesture at a meaningful moment.** _One `prompt()` per captured event; fire it after intent (e.g. the user joined a community), not on first paint. Don't nag._
- **Hide the affordance on `appinstalled`.** _It fires however the app was installed, so the UI stays honest._

## iOS Safari (verified current)

- **Don't rely on `beforeinstallprompt` on iOS/iPadOS — it never fires.** _Apple hasn't implemented it; every iOS install is a manual "Add to Home Screen" (so `useInstallPrompt().canInstall` stays false there and `detectPlatform() === "ios"` picks the instructions copy)._
- **Detect iOS, then show Share-sheet instructions.** _Since iOS 16.4 the PWA installs from the Share menu; a `display: standalone` manifest makes it open as a home-screen web app._
- **Provide `apple-mobile-web-app-*` meta + `apple-touch-icon`.** _iOS reads these proprietary tags (not the manifest) for the standalone shell, title, status-bar style, and icon — QueerPulse already ships them._

## Detecting installed / standalone

- **Prefer the standard media query; fall back to `navigator.standalone` on iOS.** _Installed mode removes the browser back button and URL bar, so in-app back and `env(safe-area-inset-*)` padding matter far more._

```js
const isStandaloneDisplay =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;
```

## Service worker & updates

- **Precache the app shell; pick runtime strategies per resource.** _Stale-while-revalidate for shell/CSS/JS (instant load, refresh next visit); network-first for API data (fresh, cache fallback offline); cache-first with expiration for images/avatars (fast, bounded)._
- **Never call `skipWaiting()` silently mid-session.** _The new worker likely controls pages loaded with the old version; swapping under a live session causes version skew and data loss._
- **Let the new worker wait, surface a "New version — Reload" prompt, then `postMessage` SKIP_WAITING on click.** _The user picks a safe reload boundary; only then does the SW take over._

```js
// page side
serviceWorkerRegistration.addEventListener("updatefound", () => {
  const installingWorker = serviceWorkerRegistration.installing;
  installingWorker?.addEventListener("statechange", () => {
    if (
      installingWorker.state === "installed" &&
      navigator.serviceWorker.controller
    ) {
      showReloadPrompt(() =>
        installingWorker.postMessage({ type: "SKIP_WAITING" }),
      );
    }
  });
});
navigator.serviceWorker.addEventListener("controllerchange", () =>
  window.location.reload(),
);

// in sw.ts
self.addEventListener("message", (messageEvent) => {
  if (messageEvent.data?.type === "SKIP_WAITING") self.skipWaiting();
});
```

## Offline UX

- **Serve a cached offline fallback for navigations.** _A branded offline state beats the browser dinosaur._
- **Reflect connectivity honestly via `navigator.onLine` + `online`/`offline` events.** _Show a real "You're offline" banner; don't pretend a write succeeded._
- **Queue writes and never drop them.** _Where Background Sync exists, register a tag so the SW flushes an outbox once connectivity is stable; elsewhere retry on the `online` event. Show pending / failed / retry — DMs especially must not vanish (see `messaging-craft`'s outbox)._
- **Cap image/avatar caches with expiration.** _Cache-first serving needs a max-entries/max-age policy so storage stays bounded._

## Theming & auditing

- **Give `theme-color` a light and dark variant via `media`.** _The status bar should track the user's scheme, not stay one fixed tint._

```html
<meta
  name="theme-color"
  content="#f5f0f7"
  media="(prefers-color-scheme: light)"
/>
<meta
  name="theme-color"
  content="#2d1b3d"
  media="(prefers-color-scheme: dark)"
/>
```

- **Audit installability with Lighthouse (DevTools → Lighthouse).** _Verifies manifest fields, icons, HTTPS, and SW before you ship a regression._

## Sources

- [Web app manifest — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest) — manifest members and splash-screen fields
- [Making PWAs installable — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — install requirements; iOS 16.4+ Share-menu install
- [Window: beforeinstallprompt event — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event) — defer + `prompt()`/`userChoice`; limited availability
- [Customize the install experience — web.dev](https://web.dev/articles/customize-install) — capture/defer, custom button, `appinstalled`
- [Installation prompt — web.dev (Learn PWA)](https://web.dev/learn/pwa/installation-prompt) — iOS can't fire the event; show fallback only in browser mode
- [display-mode — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode) — `matchMedia('(display-mode: standalone)')`
- [The service worker lifecycle — web.dev](https://web.dev/articles/service-worker-lifecycle) — waiting/skipWaiting hazards, data-loss warning
- [Serving — web.dev (Learn PWA)](https://web.dev/learn/pwa/serving) — cache-first / network-first / stale-while-revalidate tradeoffs
- [Background Synchronization API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) — deferring writes until stable connectivity
- [Maskable icons — web.dev](https://web.dev/articles/maskable-icon) — `purpose`, 40%-radius safe zone
- [theme-color meta — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color) — light/dark `media` variants
- [WebKit Features in Safari 16.4 — WebKit](https://webkit.org/blog/14445/webkit-features-in-safari-16-4/) — iOS Add to Home Screen; installed-web-app push
- [Lighthouse overview — Chrome](https://developer.chrome.com/docs/lighthouse/overview) — installability + PWA audits
