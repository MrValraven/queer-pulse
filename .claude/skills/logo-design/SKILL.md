---
name: logo-design
description: Use when creating, evaluating, refining or replacing a logo, brand mark, symbol, wordmark, lockup, favicon, app icon, splash screen or social avatar in QueerPulse, or when writing brand guidelines for them (clear space, minimum size, colour versions, misuse, motion). Also use when someone asks "is this a good logo", "does this scale", "does this read at 16px", or wants a mark exported for iOS, Android, PWA or the press kit. Grounds the work in the masters' criteria, the cognitive science, EUIPO distinctiveness, platform icon specs, and this repo's tokens, pipeline and existing brand equity. Use BEFORE drawing a mark, never only after.
user-invocable: true
---

# Logo design (QueerPulse)

The standard for **QueerPulse's mark**: how to judge, draw, test, export and
document a logo so it identifies the platform for years, survives one colour and
16 px, and reads as queer and warm without a rainbow. A logo here is **code**: a
token-driven inline SVG component that every raster (favicon, icons, splash,
press kit, OG) is generated from. The research base is in
**`docs/research/logo-mark-best-practices.md`** (every claim cited and tagged).

**Companions, enforce your side, don't duplicate theirs:** `illustration` owns
decorative art (this skill owns the one mark that identifies); `design-best-
practices` owns layout around the mark; `web-animation-best-practices` and
`motion-react` own motion mechanics (this skill only says what the mark may do);
`queer-community-copywriting` owns the words beside it.

Create a todo per numbered section when applying this to real work.

---

## 1. First, decide whether you need a new mark at all

The mark identifies; the company means. Rand: a logo "derives its meaning from
the quality of the thing it symbolizes, not the other way around." Bierut: it is
"an empty vessel awaiting the meaning that will be poured into it." So before
drawing anything:

1. **Inventory the equity.** What does the product already use as its signature?
   In QueerPulse that is the **coral pulse dot** beside the Fraunces wordmark
   (navbar `.pulseDot`, the press-kit lockup, the AppLaunch `brand-dot` target).
   A mark that ignores the element people already see is a second logo.
2. **Apply the refine-or-replace rule.** Refine when the existing mark passes the
   three criteria (§2) and has equity (Mastercard 2016). Replace when it fails a
   criterion (Airbnb's script was not distinctive; the QueerPulse bolt is
   off-palette, a cliché, and dissolves at 16 px). Never replace a passing mark
   for fashion. Once replaced, commit; day-one reaction measures attachment to
   the old mark.
3. **Write the brief in one line:** who it is for, what personality it must carry
   (appropriate means the right character), where it must live
   (favicon to splash), and what it must never be read as.

---

## 2. The three criteria, in order, then the tests

Judge every candidate on Haviv's three, in this order:

| Criterion | Question | QueerPulse reading |
|---|---|---|
| **Appropriate** | Does the character fit? (warm, present, grown-up, safe) | Round reads soft and comfortable; angular reads hard and durable (Jiang et al.). Symmetry for sincerity; asymmetry only if the brand is "exciting". |
| **Distinctive and memorable** | Can someone doodle it after seeing it twice? Is there one hook? | People keep the gist and drop detail (1 of 85 could draw the Apple logo). One gist feature, no more. |
| **Simple** | Does it survive one colour and 16 px? | Rand's minimum: "reproducible in one color and in exceedingly small sizes." |

Then run the battery **in this order**, silhouette first and colour last:

1. **One colour**: solid plum on cream, then cream on plum. If the idea depends
   on a colour change (a two-tone stroke that "means" two words), it fails here.
2. **16 px on a 1x screen**, plus 32 and 48. No stroke or gap under about 2 px at
   target; even stroke widths; snap to whole pixels. If it turns to a blob, define
   a simplified small-size variant and say where the cut-over is.
3. **Reverse**: light on dark. Counters that close need a second drawing.
4. **Squint**: a confident silhouette must remain.
5. **Doodle from memory**, then **rotate and mirror** for unintended imagery.
6. **Caption test**: if the deck must explain it, it failed identification.
7. **Lookalike search** in the category and in the mark's visual genre: a dot in
   rings is Target, Sonos, Podcasts and the "live" dot; dots around a centre is a
   spinner, Ubuntu, Meetup, and since 2020 the virus particle; a zigzag is the
   ECG line and the Zap glyph. Name the misreadings and the specific feature
   that defeats each one.
8. **Colour**, only now, from tokens.

Generate at least three genuinely different directions before choosing; never
present one concept as the answer.

---

## 3. One idea, one vocabulary

- **One idea per mark.** A letterform fused with a heartbeat is two ideas; pick
  the one the name does not already say. "Pulse" already carries the heartbeat,
  so the mark can be quiet.
- **Grid and geometry.** Draw on a 64-unit box (favicon-friendly, divides to 16
  and 32). Standard angles; circular curves; at most two stroke weights; no
  detail under 4 units. Optical over mathematical: circles overshoot a square by
  about 5%, the visual centre sits slightly above the geometric one, filled and
  outline versions need separate weights.
- **No filters, masks, gradients or blurs in a mark.** They cannot follow
  `currentColor`, force a bitmap pass, and icon pipelines drop them (Android
  monochrome keeps alpha only; maskable crops; Icon Composer wants flat layers).
  Plain paths and circles only.
- **Clichés to refuse for QueerPulse:** the lightning bolt, the ECG trace, the
  medical heart and plus, people-in-a-circle clip art, rainbow fills or stripes
  in the mark, initials in a geometric container, a Wi-Fi arc. The strongest
  queer identities (HRC, Trevor, Lex, Feeld, Stonewall) own one colour and treat
  the rainbow as a palette source and keep it off the mark itself.
- **Shape semantics to keep straight:** rings expanding outward read as ripple
  or heartbeat; rings contracting read as locking on; a continuous ring train is
  sonar; any rotation is a spinner; satellites touching a dark centre are a
  virus; a red dot is recording, a green dot is online. Coral is safe precisely
  because it is neither.

---

## 4. Logo, app icon and favicon are three artworks

| Artwork | What it is | Rules |
|---|---|---|
| **Logo master** | Inline SVG React component (`BrandMark`), `viewBox="0 0 64 64"`, no `width`/`height`, fills from `var(--accent)`, `currentColor`, `rgba(var(--cream-rgb), …)`. Transparent ground. | The only source of truth. Every raster below is generated from it. Themes because it is inline; an `<img src=".svg">` cannot read page tokens. |
| **App icon** | Separate composition on an **opaque plum tile**, mark at about 60 to 66% of the tile. | Apple applies the squircle: never pre-round, never transparent. Text never. Android/PWA maskable: everything meaningful inside a circle of **radius 40%** (409 px on 512). Ship `any` (192, 512, transparent) and `maskable` (512, padded, opaque) as **separate files**, never one file with `purpose: "any maskable"`. Add a `monochrome` icon (alpha silhouette) for Android themed icons. |
| **Favicon** | `favicon.svg` on a 16/32 grid with `@media (prefers-color-scheme: dark)` **inside** its `<style>`, plus a 32 px `.ico` (Google Search ignores SVG). | If 16 px needs the dot alone, draw that variant; do not scale the master. Test on a 1x display. |
| **Splash** | Plum field, mark at about 20% of the short edge, wordmark in the real Fraunces below. | One PNG per device per orientation (index.html media queries). Apple: no advertising, minimal text. |
| **OG image** | 1200x630, mark plus wordmark inside a central band 10% in from every edge. | Set `og:image:width/height` and `og:image:alt`. X crops to 2:1. |

WCAG exempts the logotype from contrast (SC 1.4.3), once. The same mark used as a
Home link or a status glyph is a UI component and needs 3:1 in both themes.
Canonical brand values are **sRGB hex** from `src/styles/tokens/colors.css`; P3
only as a `@supports` enhancement. Never write `color(display-p3 …)` into a mark.

---

## 5. The QueerPulse pipeline (do not bypass it)

```
src/shared/components/ui/brandMark.geometry.json   ◄─ THE source: radii, arc, satellites
  ├─► src/shared/components/ui/BrandMark.tsx        (inline, token-driven; states rest/compact/dot/gathering)
  └─► scripts/brand-mark-svg.mjs                    (markSvg(): the same geometry as SVG strings)
        ├─► scripts/generate-icons.mjs  (pnpm icons)
        │     ├─ public/favicon.svg + favicon.ico        (OUTPUTS; never hand-edit)
        │     ├─ public/icons/*-v3.png                  (any 192/512, maskable, apple-touch, monochrome, badge)
        │     └─ public/splash/*.png                    (Chromium, stacked lockup in real Fraunces)
        ├─► scripts/generate-press-assets.mjs (pnpm press:assets) ► public/press/*
        └─► scripts/generate-og-image.mjs     (pnpm og)
vite.config.ts manifest.icons + includeAssets   ◄─ the -v3 names (bump ICON_VERSION to bust caches)
index.html, src/sw.ts                           ◄─ favicon links, apple-touch-icon, notification icon
src/shared/components/layout/Navbar.tsx         ◄─ .pulseDot + wordmark (the dot-alone lockup)
```

- Change the mark by changing the **geometry JSON**, then re-run the three
  scripts. The component and every raster follow. Never hand-edit a PNG or
  `favicon.svg`.
- The generators hard-code plum, coral and cream by hand (they run outside the
  token pipeline); keep them equal to `src/styles/tokens/colors.css`.
- When the artwork changes, bump `ICON_VERSION` in `generate-icons.mjs` and the
  matching names in `vite.config.ts`, `index.html`, `src/sw.ts` and the press
  script's `APP_ICON_SOURCE`, or installed apps keep the cached icon.
- Verify the maskable icon visually (DevTools safe-area toggle or maskable.app);
  Lighthouse only checks the manifest string.
- History, so nobody reintroduces it: the press script used to derive the mono
  mark by grabbing the first `<path d>` of favicon.svg, and the splash used to
  inline favicon.svg as a data URI (no theming, wordmark in Georgia). Both were
  replaced on 2026-09-03 by the shared builder above.

---

## 6. The brand guide the mark ships with

A mark without rules is re-drawn by the next person. Twelve pages, each with the
rule and the reason, and the reason in plain language:

1. **The logo and its parts**, with a one-sentence meaning.
2. **Lockups** (horizontal, stacked, symbol alone) and when each is allowed.
   Symbol alone only where the brand is already established; wordmark alone
   never.
3. **Clear space** as a **unit taken from the mark itself** (Spotify: half the
   icon height; Google: the width of the G). For QueerPulse: one dot diameter.
   Diagram it, then one wrong/right pair.
4. **Minimum size**, two numbers each (px screen, mm print) for the lockup and
   for the symbol; the symbol may go about 3x smaller than the lockup.
5. **Colour versions**: exactly three (full colour, mono plum, mono cream) plus a
   background-mapping rule; HEX, RGB, CMYK, Pantone.
6. **Backgrounds and photography**: which version on which ground; never on pure
   white (house rule); on imagery only over a plum scrim.
7. **Incorrect usage**: a grid of 8 to 12 crossed tiles, every caption starting
   with the same verb, including the misreadings from §3.
8. **App icon, favicon, avatar** as separate artwork with the safe zones.
9. **Co-branding**: equal emphasis, or a ban.
10. **Motion**: one hero behaviour, one functional sting, a reduced-motion rest
    state; named curve and duration; only the shapes the static mark is built
    from may move; transform and opacity only.
11. **Legal**: register the word mark first, the combined mark second, the symbol
    alone only if it is "a creative arrangement" rather than "a simple
    juxtaposition of basic shapes" (EUIPO); ® placement; standard alt text.
12. **Downloads** (SVG, PNG on plum and on cream, monochrome).

**Rationale writing:** (a) what it literally is, one sentence; (b) what it stands
for, two or three plain nouns; (c) the practical failure that forced the change;
(d) what it must now do. Under 150 words. Slack's model: "It was extremely easy
to get wrong... We'll not bore you with the design thinking." Never assign a
virtue to each letter or curve.

---

## 7. Motion is where a simple mark becomes ownable

A dot and two rings will never have a unique silhouette; Google's four dots became
an identity through behaviour rules. Specify the behaviours with that precision:

- **Heartbeat** (rest): the dot scales 1.0 to about 1.15 and back in a two-beat
  lub-dub, then rests; around 60 bpm; ease-out on expansion, ease-in on return.
  Never a steady 1 Hz blink (that is an alarm).
- **Ripple** (event): one or two hairline rings born from the dot travel
  **outward** to about 3x the dot and fade. Inward travel reads as locking on and a continuous train reads as sonar, so both are out.
- **Gather** (community): satellites **arrive** along gentle arcs and settle into
  irregular positions; the centre beats once when the last lands. Never rotate.
- **Reduced motion**: the dot at rest, rings and satellites present without
  travel. Declare keyframes in the CSS module (global keyframes do not reach a
  module).
- The static frame must still read as intentional: rings at unequal fade to
  imply travel; one satellite slightly out of place, as if arriving.

---

## Red flags: stop and go back to §2

| You are about to… | Reality |
|---|---|
| Present one concept as the answer | Three directions minimum; the client chooses between tested options. |
| Encode meaning in a colour change | Fails the one-colour test. The geometry must carry the idea. |
| Fuse two motifs "so it says both words" | Two ideas; the name already says one of them. |
| Bake the plum tile into the logo master | Logo and app icon are separate artworks; the tile is the icon's ground and stays out of the mark. |
| Skip the lookalike search because "it's abstract" | Abstract marks resemble the most things. Name the genre and the misreadings. |
| Write "clear space: about the stroke width" | Clear space is a labelled unit from the mark, diagrammed, with a min size in px and mm. |
| Ship `feGaussianBlur`, a gradient or `color(display-p3)` in the mark | Cannot theme, dissolves at 16 px, dropped by icon pipelines, not reproducible in sRGB rasters. |
| Reuse one PNG as `"any maskable"` | Two files: transparent `any`, padded opaque `maskable` with the 40% safe circle. |
| Add a rainbow, a bolt, an ECG line or a figure | The strongest queer identities own one colour and one geometric idea; the clichés are everyone's. |
| Explain the mark in the deck | It has failed the caption test. Simplify until it needs no explanation. |

## Quick self-review

1. **Equity**: does it grow from what people already see (the coral dot), or is
   it a second logo?
2. **Three criteria in order**: appropriate character, one doodle-able hook,
   survives one colour and 16 px?
3. **Tests run in order**, silhouette first, colour last, lookalikes named with
   their defeating feature?
4. **Three artworks**: token-driven inline master, opaque icon inside the safe
   zones, favicon on the pixel grid, no filters anywhere?
5. **Pipeline**: favicon.svg + component changed together, `pnpm icons`,
   `press:assets`, `og` re-run, filenames bumped?
6. **Guide**: clear-space unit, two-number minimums, three colour versions,
   misuse grid, motion behaviours, legal route, rationale under 150 words?
7. **Would Rand pass it**: attractive, one colour, exceedingly small?

## Sources

Full cited research in **`docs/research/logo-mark-best-practices.md`**: Rand,
Chermayeff & Geismar & Haviv, Bierut, Neumeier; Jiang et al. 2016, Luffarelli et
al. 2019, Blake et al. 2015; Apple HIG, developer.android.com, W3C appmanifest,
web.dev, MDN, Google Search Central, WCAG 2.2, CSS Color 4; Spotify, Shopify,
Wikimedia, Atlassian, NASA 1976, Slack, Discord, Stripe brand guides; HRC, &Walsh,
Made Thought, JKR case studies; EUIPO Guidelines Part B and CP3.
