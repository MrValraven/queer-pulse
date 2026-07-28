# i18n

Lightweight, dependency-free i18n for QueerPulse. Spec: `docs/production-readiness/13-i18n-and-portuguese.md`.

The EN/pt-PT sweep is **complete**: every namespace that ships in the bundle is
translated, `parity.test.ts` is green (198 tests), and `tsc` is clean. The full
contract for extending or re-sweeping this system lives in
[`docs/i18n/sweep-agent-brief.md`](../../../docs/i18n/sweep-agent-brief.md) —
read it before doing any i18n work beyond a small fix. pt-PT terminology
decisions are recorded in [`docs/i18n/glossary-pt.md`](../../../docs/i18n/glossary-pt.md);
match it before coining new wording.

## What exists

| Piece                                                                       | File                                   |
| --------------------------------------------------------------------------- | -------------------------------------- |
| Types (`Language`, `Namespace`, `Catalog`, `TFunction`, `TranslateOptions`) | `types.ts`                             |
| Locale detection + persistence + `Intl` locale mapping                      | `locale.ts`                            |
| Pure resolver: `interpolate`, `pluralCategory`, `resolveEntry`, `parseKey`  | `translate.ts`                         |
| Per-namespace catalogs, `en/*` + `pt/*` (33 namespaces), registry           | `catalogs/`                            |
| Provider (wires detection, `<html lang>`, `t`)                              | `../../app/providers/I18nProvider.tsx` |
| Hook: `useTranslation() → { language, setLanguage, t }`                     | `useTranslation.ts`                    |
| Rich-text renderer for tag placeholders in catalog values                   | `Translation.tsx`                      |
| `Intl` number/date/currency: `useFormat()` / `createFormatters()`           | `format.ts`                            |
| Accessible EN/PT switcher (mounted in the footer)                           | `LanguageSwitcher.tsx`                 |
| Parity guard: 198 tests, 4 checks per namespace                             | `catalogs/parity.test.ts`              |

## Using it

```tsx
const { t } = useTranslation();

t("footer:copyright"); // namespace:path
t("common:greeting.welcome", { name }); // {token} interpolation
t("common:members.count", { count: 3 }); // CLDR plural → members.count_one / _other
```

- **Key convention:** `namespace:section.element[.variant]`, lowercase dot paths.
  A key with no `:` resolves in `common`.
- **Pluralization:** pass `count`; the resolver selects `path_<category>` via
  `Intl.PluralRules` for the active locale (PT has its own rules), falling back to
  `path_other`. Author `key_one` / `key_other` in the catalog.
- **Interpolation:** `{token}` placeholders filled from the options object.
- **Fallback order:** active language → English → the raw key (logged via
  `logWarn` so misses are visible, never blank).
- **Formatting:** use `useFormat()` — never hand-roll `toLocale*`. See below.

## Rich text — `<Translation>`

A catalog value can carry inline tag placeholders instead of plain text:

```ts
// catalogs/en/cinema.ts
about: {
  deed: {
    p2: "<em>80%</em> goes to the filmmaker";
  }
}
```

```tsx
import { Translation } from "shared/i18n/Translation";

<Translation i18nKey="cinema:about.deed.p2" components={{ em: <em /> }} />;
```

`Translation` splits the resolved string on `<tag>…</tag>` runs and clones the
matching element from `components` around each run's inner text; an unmapped
tag renders its inner text rather than throwing. `values` (same shape as `t`'s
second argument) still works for `{token}` interpolation and `count`.

**A key whose catalog value contains tags REQUIRES `<Translation>`** — plain
`t()` prints the angle brackets literally, e.g. `<em>80%</em> goes to…` on
screen.

**It is named `Translation`, never `Trans`** — deliberately: the common
i18n-library abbreviation collides with _transgender_, which this platform will
not do.

## The catalog layout

- `catalogs/en/<namespace>.ts` + `catalogs/pt/<namespace>.ts`, one pair per
  feature domain (mirroring `src/features/<domain>/`), each `export const <ns>:
Catalog`.
- Both are registered in `types.ts` (the `Namespace` union) and
  `catalogs/index.ts` (the `catalogs` record). **Don't edit either casually** —
  every namespace is already registered; adding one means adding to both files
  together.
- 33 namespaces today: `common`, `nav`, `footer`, `auth`, `subprofiles`,
  `gatherings`, `homepage`, `marketing`, `members`, `magazine`, `communities`,
  `community`, `resources`, `economy`, `studio`, `cinema`, `settings`, `admin`,
  `system`, `safety`, `feed`, `forum`, `topics`, `governance`, `myevents`,
  `support`, `connect`, `messages`, `culture`, `notifications`, `social`,
  `pages`, `shared`.
- **Reuse existing keys.** Before adding a key, grep the namespace's catalog for
  the prefix you're about to add — a duplicate key is invisible to the parity
  test (see below) and silently shadows the original.
- **Loading strategy.** EN is bundled eagerly and in full: it's the resolver's
  universal fallback, so keeping it synchronous means a not-yet-loaded namespace
  degrades to a real English string rather than the raw key. PT ships only its
  shell namespaces (`common`, `nav`, `footer`, `shared`, `system`) eagerly;
  every other PT namespace is a lazy `() => import(...)` chunk in
  `ptNamespaceLoaders` (`catalogs/index.ts`), fetched on demand by
  `I18nProvider` the first time a route asks for one of its keys. English
  visitors never download any PT. To make a PT namespace eager (e.g. to avoid a
  brief EN→PT flip on a landing route), move it from the lazy loader map into
  the eager block. Splitting EN the same way would need a Suspense boundary or a
  route→namespace preload map to preserve the no-raw-key fallback, so EN stays
  eager for now.

## The scope rule

> **If the text ships in the bundle, translate it. If live mode fetches it from
> the API, leave it in English.**

**In scope (chrome):** headings, labels, buttons, tabs, filters, form fields,
wizard steps, empty/error/success states, toasts, aria-labels, placeholders.

**Out of scope (content):** bios, posts, article bodies, film synopses, job
listings, quotes attributed to a named person, member names, community names —
anything a person wrote or the API serves. A feature with an `api/` directory
and adapters is a strong signal its content is fetched, not shipped.

Full contract, worked examples, and the triage method:
`docs/i18n/sweep-agent-brief.md`. pt-PT term decisions: `docs/i18n/glossary-pt.md`.

## `parity.test.ts` — 198 tests, four guards

Run: `npx vitest run src/shared/i18n/catalogs/parity.test.ts`

Per namespace, four checks run for both languages:

1. **Key parity** — `pt/<ns>` declares exactly the keys `en/<ns>` declares (no
   more, no fewer).
2. **No empty pt values** — a blank string is caught before it ships as
   silent English-via-fallback.
3. **No duplicate keys** — a JS object literal silently keeps the last
   duplicate, so the imported catalog _looks_ correct while a translation is
   shadowed and never renders. Only `tsc` (TS1117) and this check catch it; the
   test re-parses the source file's text rather than the imported object, since
   the object has already deduped by the time JS sees it.
4. **No HTML entities** — catalog values are plain strings; neither `t()` nor
   `<Translation>` decodes them, so `&amp;` prints literally as `&amp;` on
   screen instead of `&`. (35 real instances shipped before this guard existed.)

## Portuguese authoring

- **European (pt-PT), not Brazilian:** _utilizador_, _ecrã_, _telemóvel_,
  _palavra-passe_ (not _senha_), _registo_, _casa de banho_, _guardar_,
  _eliminar_, _definições_. "está a fazer", never "está fazendo". The provider
  maps `pt → pt-PT` for all `Intl` calls (`locale.ts`).
- **Register:** `tu`, warm, direct. Never `você`, never corporate.
- **Inclusive / gender-neutral (in priority order):**
  1. **Neutral rephrasing first** — _pessoa_, _quem_, _a comunidade_; e.g.
     "Members" → _Pessoas_, never _Membros_ (see `pt/common.ts`, `pt/nav.ts`).
  2. **Second person / imperative** — the warm house voice: _Pedir um convite_,
     _Entra para continuar_.
  3. **-e neutral forms** only when addressing the member **directly** and
     neutrality can't be rephrased away — _bem-vinde_, _obrigade_ (see
     `pt/common.ts`, `pt/auth.ts`). Never masculine-as-fake-neutral, never `@`/`x`
     (screen-reader hostile).
- **Grammatical gender limits key reuse.** pt-PT nouns carry gender, so one
  English key sometimes needs two Portuguese keys: "Added" attached to _a
  faixa_/_a coleção_ is "Adicionada", but attached to _o álbum_/_o set_ it's
  "Adicionado". Don't force a single pt value onto both — split the key.
- Brand "QueerPulse", proper nouns, Lisbon neighbourhoods, app/film/organisation
  names, phone numbers, and helpline hours stay **identical** in both catalogs.
- **When in doubt, stop and flag rather than ship plausible-but-wrong PT** —
  especially for safety, crisis, medical, legal, tax, and governance copy. See
  `docs/i18n/sweep-agent-brief.md` §6.

## Dates, numbers, currency — `useFormat()`

Never `toLocaleDateString()`, never a hand-rolled formatter, never a bare
`new Intl.*` call in a component.

```tsx
const fmt = useFormat();
fmt.date(new Date()); // pt → "10 de julho de 2026"
fmt.currency(1234.5); // pt → "1 234,50 €"   en → "€1,234.50"
```

**pt-PT suffixes the currency symbol** (`10 €`, not `€10`) — a hand-rolled
`money()` helper that always prefixed `€` shipped a real bug here. `useFormat()`
gets this right for free because it's backed by `Intl.NumberFormat(locale, …)`.

## Traps that have already bitten this project

Full detail and the story behind each: `docs/i18n/sweep-agent-brief.md` §5.

1. **`{count}` is reserved.** It's the CLDR plural selector and typed `number`.
   An opaque, non-pluralized numeric token needs a different name.
2. **`t` is reserved for the translator.** It has collided with a local, a
   countdown variable, a callback param, a loop index, and — 8 times — a
   CSS-module import (`import t from "./X.module.css"`). Never name anything
   `t`; per the repo's standing rule, never single-letter names at all.
3. **`.map(adapterFn)` passes the array index as `t`** when the adapter's
   signature is `(dto, t)`. Always write `.map((dto) => adapterFn(dto, t))`.
4. **A `ReactNode` field can't feed a `{token}` slot** — interpolation values
   are typed `string | number`. Add a plain-text sibling field (precedent:
   `members/collections.data.tsx`'s `plainName` beside its JSX `name`).
5. **Never hardcode a locale.** Both `"en-GB"` and `"pt-PT"` turned up
   hardcoded in component code — the second one was silently breaking
   **English** users. Always go through `useFormat()` / `intlLocale(language)`.
6. **Label-key indirection.** A translated label must never double as a stored
   or compared value — `selected.includes(interest)`, `name === "Authentication"`,
   a formatted string persisted to `localStorage`. Enum/option/tab/filter/status
   values keep a stable canonical **English id** as the stored value; only the
   _label_ resolves via `t()` at render. Switching language must never corrupt
   persisted data or a URL param.
7. **Fused strings don't translate.** `"42 discussing"`, `"Meets 14 Jun"` —
   split into datum + catalog phrase; never concatenate a sentence from
   fragments, since word order differs in PT.

## Persistence & detection

- localStorage key **`qp.lang`** (reads legacy `qp-lang` once for migration).
- Detection order: `qp.lang` → `navigator.language` (`pt*` → `pt`) → `en`.
- `<html lang>` is synced on every change (`I18nProvider`).

## Lint vs. gates

`local/no-literal-string` (`eslint.config.js`) is a **warn, not a gate** — it
flags bare JSX text but can't distinguish translatable chrome from
deliberately-English content (the scope rule above), so it will never reach
zero and shouldn't be treated as a checklist. **The real gates are `tsc` and
`parity.test.ts`.** Run both before calling any i18n change done:

```
npx tsc -p tsconfig.app.json --noEmit
npx vitest run src/shared/i18n/catalogs/parity.test.ts
```
