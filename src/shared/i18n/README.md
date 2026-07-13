# i18n

Lightweight, dependency-free i18n for QueerPulse. Spec: `docs/production-readiness/13-i18n-and-portuguese.md`.

This is the **infrastructure + a vertical slice** (`common`, `nav`, `footer`, `auth`
namespaces, with real European-Portuguese for `common`/`nav`/`footer`). The remaining
~290 pages are extracted wave-by-wave using the workflow below.

## What exists

| Piece                                                                       | File                                   |
| --------------------------------------------------------------------------- | -------------------------------------- |
| Types (`Language`, `Namespace`, `Catalog`, `TFunction`, `TranslateOptions`) | `types.ts`                             |
| Locale detection + persistence + `Intl` locale mapping                      | `locale.ts`                            |
| Pure resolver: `interpolate`, `pluralCategory`, `resolveEntry`, `parseKey`  | `translate.ts`                         |
| Per-namespace catalogs, `en/*` + `pt/*`, registry                           | `catalogs/`                            |
| Provider (wires detection, `<html lang>`, `t`)                              | `../../app/providers/I18nProvider.tsx` |
| Hook: `useTranslation() → { language, setLanguage, t }`                     | `useTranslation.ts`                    |
| `Intl` number/date/currency: `useFormat()` / `createFormatters()`           | `format.ts`                            |
| Accessible EN/PT switcher (mounted in the footer)                           | `LanguageSwitcher.tsx`                 |

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
- **Formatting:** use `useFormat()` — never hand-roll `toLocale*`. PT gets a
  24-hour clock, decimal comma, and `€` suffix from `Intl` automatically.

## Adding a namespace

1. Add the id to `Namespace` in `types.ts`.
2. Create `catalogs/en/<ns>.ts` and `catalogs/pt/<ns>.ts` (each `export const <ns>: Catalog`).
3. Register both in `catalogs/index.ts`.

Keep each catalog small; if the registry grows heavy, swap the inner values in
`catalogs/index.ts` for lazy `() => import(...)` — the resolver is agnostic.

## Extraction workflow (remaining waves)

Mirrors the `component-decomposition` parallel model: **batch by feature, one
subagent per batch, run concurrently.** Per feature:

1. **Freeze** the EN copy for the feature (extraction-done) before translating it.
2. **Extract** JSX text + user-facing attributes (`aria-label`, `placeholder`,
   `title`, `alt`) into `en/<feature>.ts`, replacing the literal with
   `t("<feature>:key")`. Author clear keys (`eventCard.reserveCta`, not `text1`).
3. **Data-file prose** (`*.data.tsx` with `ReactNode`): keep the JSX shell in the
   file, pull each **text run** through `t()`; for inline `<em>`/`<strong>` store
   the run as a string and render emphasis in the component, or split into
   sub-keys. (A `<Trans>`-style rich renderer is a future addition; this slice
   ships without one.)
4. **Never** move CSS-module class maps (`Record<…, styles.xxx>`) — they aren't copy.
5. Leave the matching `pt/<feature>.ts` **empty of new keys** for the authoring
   track; the resolver falls back to EN until PT lands.

## Portuguese authoring

- **European (pt-PT), not Brazilian:** _utilizador_, _ecrã_, _telemóvel_,
  _palavra-passe_ (not _senha_), 24h clock, decimal comma, `€` suffix. The
  provider maps `pt → pt-PT` for all `Intl` calls (`locale.ts`).
- **Inclusive / gender-neutral (in priority order):**
  1. **Neutral rephrasing first** — _pessoa_, _quem_, _a comunidade_; e.g.
     "Members" → _Pessoas_, "member" → _pessoa_ (see `pt/common.ts`, `pt/nav.ts`).
  2. **Second person / imperative** — the warm house voice: _Pedir um convite_,
     _Entra para continuar_.
  3. **-e / elu neutral forms** when addressing the member directly and neutrality
     can't be rephrased away — _bem-vinde_ (see `pt/common.ts`, `pt/auth.ts`).
     Never `@`/`x` (screen-reader hostile); never default to masculine.
- **Review is the source of truth:** route final wording through native pt-PT
  non-binary/queer reviewers. Machine-only PT does not ship.
- Maintain a glossary (`docs/i18n/glossary-pt.md`, per spec) so product nouns and
  queer terminology stay consistent across namespaces.

## Persistence & detection

- localStorage key **`qp.lang`** (reads legacy `qp-lang` once for migration).
- Detection order: `qp.lang` → `navigator.language` (`pt*` → `pt`) → `en`.
- `<html lang>` is synced on every change (`I18nProvider`).
