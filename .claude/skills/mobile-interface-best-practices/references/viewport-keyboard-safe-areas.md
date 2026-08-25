# Viewport, keyboard & safe areas

Mobile browser chrome (address bar, keyboard, notch) makes the "viewport" a
moving target. `100vh`, `position: fixed`, and untagged inputs all break in
predictable ways. Each rule is one line, then a short _why_.

**In QueerPulse:** `index.html` already ships `viewport-fit=cover` and the
`apple-mobile-web-app-*` meta; horizontal safe-area insets live once on the
shared content wrapper (`base.css`); `standalone.css` reserves the bottom bar via
`--tab-bar-h` + `--bottom-inset`. **Two real gaps this reference closes:** the
viewport meta has **no `interactive-widget`** value, and **`visualViewport` is
used nowhere** — so a fixed composer can sit behind the on-screen keyboard.

## Viewport units: stop using `100vh`

`vh` resolves against the **large** viewport (toolbars retracted), so `height: 100vh`
is taller than the screen while the address bar shows — its bottom bleeds under
the chrome. CSS defines three families: **small** (`svh`/`svw`), **large**
(`lvh`/`lvw`), **dynamic** (`dvh`/`dvw`). `vh` ≡ `lvh`.

- **Never size full-height layouts with `vh`/`100vh`; use `svh` or `dvh`.** _`vh` = large viewport, so content overflows under a shown address bar._
- **Use `svh` for anything that must never be clipped** — sticky footers, "hero fills the first screen". _Small viewport assumes chrome expanded, so it's the stable minimum; worst case is a little empty space when chrome retracts._
- **Use `dvh` when the element must always fill exactly and can tolerate reflow.** _`dvh` tracks chrome live but updates are throttled (not 60fps), so content resizes while scrolling._
- **Order `100svh` then `100dvh` for full-screen shells.** _Older engines ignore the unit they don't know; the last understood one wins._

```css
.app-shell {
  min-height: 100svh; /* stable fallback */
  min-height: 100dvh; /* fills live where supported */
}
```

Baseline: Chrome 108+, Firefox 101+, Safari 15.4+. Prefer a flex column on
`min-height: 100dvh` with a scrolling middle and a non-`vh` footer — never nested
`vh` chains.

## Visual viewport & the on-screen keyboard

The keyboard shrinks the **visual** viewport (what's visible) without moving the
**layout** viewport (where `position: fixed` anchors). So a `fixed; bottom: 0`
composer stays pinned to the layout bottom — now hidden _behind_ the keyboard.
`window.visualViewport` exposes the truth: `height`, `offsetTop`, `resize`/`scroll`.

- **Read `window.visualViewport.height`/`offsetTop`, never `window.innerHeight`, to know what's actually visible.** _`innerHeight` doesn't shrink for the keyboard under the default behaviour._
- **Translate a fixed composer up by the hidden amount on visualViewport `resize`+`scroll`.** _Keeps the input above the keyboard instead of behind it._
- **Detect "keyboard open" as a large `innerHeight − visualViewport.height` gap, not a fixed pixel threshold.** _Keyboard heights vary by device and language._

```js
const composer = document.querySelector(".composer");
const visualViewport = window.visualViewport;

function repositionComposer() {
  const keyboardOverlap =
    window.innerHeight - visualViewport.height - visualViewport.offsetTop;
  composer.style.transform = `translateY(${-Math.max(keyboardOverlap, 0)}px)`;
}

visualViewport.addEventListener("resize", repositionComposer);
visualViewport.addEventListener("scroll", repositionComposer);
```

The `interactive-widget` viewport-meta value controls keyboard behaviour:
`resizes-visual` (**default** — layout viewport unchanged, fixed elements can be
obscured), `resizes-content` (shrinks both, so `vh`/fixed reflow),
`overlays-content` (nothing resizes). Only Chromium 108+ honours it; iOS behaves
like `resizes-visual` regardless — so the `visualViewport` handler above is what
you actually rely on cross-browser.

- **Add `interactive-widget=resizes-content` if you want CSS (not JS) to reflow the page for the keyboard.** _Makes `svh`/`dvh` and layout shrink to the keyboard-free area — Chromium only, harmless elsewhere._

## Safe-area insets: notch, Dynamic Island, home indicator

`env(safe-area-inset-top|right|bottom|left)` report obstructed edges. They are
**zero until you opt into full-bleed** with `viewport-fit=cover` (QueerPulse
already does).

- **Keep `viewport-fit=cover` in the viewport meta so insets report real values.** _Cover lets the page fill under the notch/indicator._
- **Pad fixed top/bottom chrome with the matching inset.** _Otherwise a bottom bar sits under the home indicator, a top bar under the Dynamic Island._
- **Combine with a base padding via `max()`, never bare `env()`.** _In portrait a side inset is `0`; `max()` keeps your normal padding as the floor._

```css
.bottom-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  padding-block-end: max(0.75rem, env(safe-area-inset-bottom));
}
```

The bottom inset matters most in installed/standalone PWAs and full-screen pages,
where no browser chrome absorbs it — exactly where `BottomTabBar` renders.

## Inputs & focus

- **Set input `font-size` to ≥16px.** _iOS Safari auto-zooms on focus of any input under 16px — the single most common mobile-form bug._
- **Pick the keyboard with the semantic `type` first, `inputmode` as fallback.** _`type="email"`/`tel`/`url`/`search` also add validation; `inputmode` is a keyboard hint only._
- **Label the Enter key with `enterkeyhint` (`send`, `search`, `next`, `go`, `done`).** _Turns a generic return key into the field's action — matters for a chat composer._
- **Add `autocomplete` tokens (`email`, `name`, `one-time-code`, `current-password`).** _Enables autofill and SMS-OTP; a real completion-rate win._
- **After focus, scroll the field into view once the keyboard settles.** _Under `resizes-visual` the browser won't do it for you._

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
/>
```

```css
.form-field input {
  font-size: 16px;
} /* >=16px: no iOS zoom-on-focus */
```

## Accessibility, orientation & overscroll

- **Never set `user-scalable=no` or `maximum-scale=1`.** _Both block pinch-zoom and fail WCAG 1.4.4 (Resize Text); QueerPulse's meta deliberately omits them — keep it that way._
- **Don't lock orientation without cause; design for landscape and short heights.** _Keyboard-open is an extremely short viewport (~200px tall) — the same case as landscape; test there._
- **Put `overscroll-behavior: contain` on scrollable overlays/composers.** _Stops scroll-chaining and rubber-banding from leaking to the page behind a fixed panel. Not yet full Baseline — progressive enhancement._

## Sources

- [CSS values and units: length / viewport units — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/length) — `vh`/`svh`/`lvh`/`dvh` definitions; `vh`≡`lvh`; dynamic units unstable
- [The large, small, and dynamic viewport units — web.dev](https://web.dev/blog/viewport-units) — why `100vh` bleeds; `dv*` throttled; browser support
- [VisualViewport — MDN](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) — `height`/`offsetTop`, `resize`/`scroll`; keyboard shrinks visual not layout viewport
- [env() / safe-area-inset — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/env) — insets non-zero only with `viewport-fit=cover`; `max()` pattern
- [Viewport meta tag — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport) — `viewport-fit`, `interactive-widget`, `user-scalable` warnings
- [Viewport resize behavior with the virtual keyboard — Chrome](https://developer.chrome.com/blog/viewport-resize-behavior) — `resizes-visual`/`resizes-content`/`overlays-content`; Chromium-only, not iOS
- [Designing Websites for iPhone X — WebKit](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) — `viewport-fit=cover`, `env()`, `max(12px, env(...))`
- [inputmode — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode) — values and keyboards; prefer semantic `type`
- [enterkeyhint — MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint) — Enter-key action labels
- [Understanding SC 1.4.4: Resize Text — W3C](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html) — 200% zoom; disabling zoom fails
- [overscroll-behavior — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior) — contain/none; stops chaining and pull-to-refresh
