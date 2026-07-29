# Navigation & app shell

How QueerPulse moves between places on a phone. Grounded in Apple HIG, Material
Design 3, Nielsen Norman Group, MDN, and Chrome docs. Each rule is one line, then
a short _why_. Motion timing/easing belongs to `web-animation-best-practices`.

**In QueerPulse:** the installed-PWA bottom bar is `BottomTabBar`
(`src/shared/components/layout/`) — it renders **only** when
`useDisplayMode().isInstalled` **and** `(max-width: 860px)`, and is `<nav>` +
`<a aria-current>`, not a `role="tablist"`. In a browser tab the `Navbar`
hamburger + `MobileNavDrawer` (the "More" drawer via `useNavDrawer`) stays in
charge. `standalone.css` stamps `data-display-mode` on `<html>` and reserves the
bar's height with `--bottom-inset` + `main[data-page-main]` padding. Route links
go through `linkToPath()` — never hardcode paths.

## Bottom tab bar: what and how many

- **Use a bottom tab bar for 3–5 top-level, peer destinations.** _M3: fewer than three should be inline tabs; more than five doesn't fit a bar._
- **Put only primary, persistent sections in tabs — not one-off actions or deep pages.** _HIG: a tab bar switches an app's main sections, it isn't a command surface._
- **Keep the bar visible across sections; hide it only under a full-screen modal.** _HIG: persistence preserves orientation and each section's state._
- **Pair every icon with a short text label; never icon-only.** _HIG + M3: unlabeled icons are ambiguous; labels raise recognition._
- **Signal the selected tab by more than colour — filled/accent icon plus the label plus `aria-current="page"`.** _HIG: colour alone fails low-vision and colourblind users; M3 uses a filled icon + active indicator._
- **Keep a tab tappable even when its section is empty; explain the emptiness inside.** _HIG: disabling a tab strands the user with no path back._
- **Place a badge (numeric or dot) at the icon's upper-right for pending items.** _M3 + HIG: an unobtrusive count signals new activity without stealing focus._ (QueerPulse already self-sources the notifications count via `useUnreadCount`.)
- **Size each tap target to at least ~44px, well spaced.** _NN/g: smaller targets cause fat-finger errors even with good spacing._

## One-handed reach & thumb zones

- **Keep primary actions and navigation in the lower region, away from top corners.** _NN/g: top corners are the hardest to reach one-handed; roughly half of use is one-handed._
- **Don't hide the single most-used control in a tiny top-left/right corner.** _It forces the stretch/regrip ("ostrich") that slows and destabilises the grip._
- **Favour the bottom-centre / mid band for the easiest, most accurate taps.** _NN/g nuance: the extreme bottom edge isn't universally most reachable — the middle is the most tappable across grips; "bottom = reachable" is a simplification._
- **Give primary calls-to-action a larger target than secondary ones.** _NN/g: primary CTAs deserve prominence and a bigger hit area._

## Bottom sheets vs. centre modals

- **On mobile, prefer a bottom sheet over a centre-screen modal for choices and detail.** _M3/HIG: sheets sit in the lower reach band and keep context visible; centre modals float in dead space._
- **Use a modal sheet to block, a nonmodal sheet to keep editing the parent.** _HIG: a nonmodal sheet (e.g. formatting) lets people keep working in the view beneath._
- **Support detents (e.g. medium then large) so the sheet grows only as needed.** _HIG: start compact within thumb reach; expand to full-screen on demand._
- **Show a grabber and allow drag-to-dismiss — but also give an explicit Close.** _NN/g: the drag handle is easy to miss and swipe-ambiguous; always offer a tapped exit. Self-contained sheets/modals here own their state and call `useScrollLock()`._

## Back navigation, gestures & SPA history

- **Make Back predictable: it returns to the immediately previous view, nothing surprising.** _NN/g: unexpected jumps trap and disorient users._
- **Let react-router push real history entries so OS/edge-swipe/hardware Back works.** _MDN: history entries + `popstate` are what wire browser and Android hardware Back to an SPA router; don't replace navigations that should be reversible._
- **Never dead-end a user with no visible or gestural way back.** _An installed PWA loses the browser chrome, so an in-app Back becomes essential._

## App-shell model & standalone chrome

- **Keep persistent chrome (tab bar, top bar) mounted; swap only the content region.** _Avoids full-page reloads, preserves scroll and tab state, feels app-like — this is what `AppShell` does._
- **Detect standalone/installed mode and lean harder on in-app Back and the tab bar.** _No browser Back exists in `display-mode: standalone`; `useDisplayMode().isInstalled` is the signal._
- **Reserve safe-area insets on any fixed bottom bar so it clears the home indicator.** _Content otherwise hides behind the gesture bar on notched devices — see `viewport-keyboard-safe-areas.md`._

```css
/* A fixed bottom bar adds the home-indicator inset to its base padding. */
.bottomTabBar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  padding-block-end: calc(var(--space-2) + env(safe-area-inset-bottom));
}
```

## Transitions that signal hierarchy

- **Push/pop for going deeper or back; cross-fade for switching peer tabs.** _Directional motion tells the user whether they descended a hierarchy or moved sideways._
- **Consider the View Transitions API for same-document (SPA) route changes.** _MDN/Chrome: `document.startViewTransition()` animates old→new state without manual DOM juggling, cutting perceived latency. Gate on support and `prefers-reduced-motion`; hand motion detail to the animation skill._

```js
function transitionToView(navigationDirection, updateDomCallback) {
  document.documentElement.dataset.navigationDirection = navigationDirection; // "push" | "pop" | "tab"
  if (!document.startViewTransition) return updateDomCallback();
  document.startViewTransition(updateDomCallback);
}
```

## Anti-patterns to avoid

- **Don't hide primary navigation behind a hamburger on mobile when a bar fits.** _NN/g measured lower discoverability, slower mobile tasks, and higher perceived difficulty vs. visible nav. (QueerPulse keeps the hamburger only in a browser tab, where a bottom bar over the browser toolbar would read cramped — the installed app promotes to the visible bar.)_
- **Don't let the nav bar jump, collapse, or reflow unpredictably on scroll.** _Movement under the thumb causes mis-taps and hides destinations._
- **Don't rely on undiscoverable gestures with no affordance.** _NN/g: even users who once found a hidden control forget it; show a handle, label, or button._

## Sources

- [Tab bars — Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/tab-bars) — tab-bar count, labels, persistence, badges, selected state
- [Sheets — Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sheets) — detents, drag-to-dismiss, modal vs nonmodal
- [Navigation bar — Material Design 3](https://m3.material.io/components/navigation-bar/guidelines) — 3–5 destinations, active indicator, badges
- [Bottom sheets — Material Design 3](https://m3.material.io/components/bottom-sheets/guidelines) — bottom-sheet usage and variants
- [Basic Patterns for Mobile Navigation — NN/g](https://www.nngroup.com/articles/mobile-navigation-patterns/) — tabs vs hidden nav, ≤5 options
- [Hamburger Menus and Hidden Navigation Hurt UX Metrics — NN/g](https://www.nngroup.com/articles/hamburger-menus/) — measured discoverability/speed loss
- [Bottom Sheets: Definition and UX Guidelines — NN/g](https://www.nngroup.com/articles/bottom-sheet/) — reachability nuance, explicit Close
- [Touch Targets on Touchscreens — NN/g](https://www.nngroup.com/articles/touch-target-size/) — ~1cm minimum, larger primary CTAs
- [View Transition API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) — same-document SPA transitions
- [History API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/History_API) — pushState/popstate back semantics
- [Smooth transitions with the View Transition API — Chrome](https://developer.chrome.com/docs/web-platform/view-transitions) — push/pop stack transitions, perceived latency
