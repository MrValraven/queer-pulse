/** Static content for the Cinema film-submission wizard (`/cinema/submit`). */

/** The five wizard steps, in order. Label/sub are catalog keys (Pattern A). */
export interface StepKeyDef {
  labelKey: string;
  subKey: string;
}

export const SUBMIT_STEPS: StepKeyDef[] = [
  {
    labelKey: "cinema:submit.step.theFilm.label",
    subKey: "cinema:submit.step.theFilm.sub",
  },
  {
    labelKey: "cinema:submit.step.accessibility.label",
    subKey: "cinema:submit.step.accessibility.sub",
  },
  {
    labelKey: "cinema:submit.step.rights.label",
    subKey: "cinema:submit.step.rights.sub",
  },
  {
    labelKey: "cinema:submit.step.revenue.label",
    subKey: "cinema:submit.step.revenue.sub",
  },
  {
    labelKey: "cinema:submit.step.review.label",
    subKey: "cinema:submit.step.review.sub",
  },
];

/** "The promise, in numbers" rows in the header panel. `labelKey` is chrome
 * (Pattern A). The numeric rows' `em` is a bare percentage fixed by the co-op
 * deed and stays a plain display field; the two word-valued rows resolve
 * `valueKey` instead (with an embedded <em> run) since "Weekly" /
 * "Non-exclusive" are real translatable words, not numbers. */
export const PROMISE_ROWS: {
  labelKey: string;
  pre?: string;
  em?: string;
  post?: string;
  valueKey?: string;
}[] = [
  { labelKey: "cinema:submit.promise.row.yourShareRent", em: "80", post: "%" },
  { labelKey: "cinema:submit.promise.row.yourShareBuy", em: "80", post: "%" },
  { labelKey: "cinema:submit.promise.row.yourShareTip", em: "100", post: "%" },
  {
    labelKey: "cinema:submit.promise.row.paidToYou",
    valueKey: "cinema:submit.promise.value.weekly",
  },
  {
    labelKey: "cinema:submit.promise.row.contractType",
    valueKey: "cinema:submit.promise.value.nonExclusive",
  },
];

/**
 * i18n stored-value trap (see docs/i18n/sweep-agent-brief.md §5.1): every
 * option list below used to be a bare `string[]`/`label` field that doubled
 * as BOTH the form's stored value (`draft.country`, `draft.format`, …) AND
 * the display label. Translating the label in place would have corrupted
 * already-filled-in drafts the moment a member switched language mid-wizard.
 * Every list here now carries a stable canonical `value` (an ISO code where
 * one exists, otherwise an English slug) that is never translated, plus a
 * `labelKey`/`subKey` resolved via `t()` only at render time in the
 * consuming component.
 */
export interface OptionKeyDef {
  value: string;
  labelKey: string;
}

export interface FormatOption {
  value: string;
  labelKey: string;
  subKey?: string;
}

export const FORMATS: FormatOption[] = [
  {
    value: "documentary",
    labelKey: "cinema:submit.option.format.documentary.label",
    subKey: "cinema:submit.option.format.documentary.sub",
  },
  {
    value: "narrative",
    labelKey: "cinema:submit.option.format.narrative.label",
    subKey: "cinema:submit.option.format.narrative.sub",
  },
  {
    value: "short",
    labelKey: "cinema:submit.option.format.short.label",
    subKey: "cinema:submit.option.format.short.sub",
  },
  {
    value: "series",
    labelKey: "cinema:submit.option.format.series.label",
    subKey: "cinema:submit.option.format.series.sub",
  },
  {
    value: "experimental",
    labelKey: "cinema:submit.option.format.experimental.label",
    subKey: "cinema:submit.option.format.experimental.sub",
  },
  {
    value: "animation",
    labelKey: "cinema:submit.option.format.animation.label",
  },
];

/** ISO 3166-1 alpha-2 country codes, "other" as the sole non-ISO escape hatch. */
export const COUNTRIES: OptionKeyDef[] = [
  { value: "pt", labelKey: "cinema:submit.option.country.pt" },
  { value: "br", labelKey: "cinema:submit.option.country.br" },
  { value: "fr", labelKey: "cinema:submit.option.country.fr" },
  { value: "es", labelKey: "cinema:submit.option.country.es" },
  { value: "other", labelKey: "cinema:submit.option.country.other" },
];

/** ISO 639-1 language codes, "other" as the sole non-ISO escape hatch. */
export const LANGUAGES: OptionKeyDef[] = [
  { value: "pt", labelKey: "cinema:submit.option.language.pt" },
  { value: "en", labelKey: "cinema:submit.option.language.en" },
  { value: "fr", labelKey: "cinema:submit.option.language.fr" },
  { value: "es", labelKey: "cinema:submit.option.language.es" },
  { value: "other", labelKey: "cinema:submit.option.language.other" },
];

/** Self-identification terms (filmmaker's own tags). Canonical English
 * slugs as the stored value; see labelKey for the pt-PT rendering, chosen
 * per docs/i18n/glossary-pt.md's "queer terminology" table where a term is
 * listed there, and flagged in the sweep report otherwise. */
export const IDENTITY_TAGS: OptionKeyDef[] = [
  { value: "lesbian", labelKey: "cinema:submit.option.identity.lesbian" },
  { value: "gay", labelKey: "cinema:submit.option.identity.gay" },
  { value: "bi", labelKey: "cinema:submit.option.identity.bi" },
  {
    value: "trans-woman",
    labelKey: "cinema:submit.option.identity.transWoman",
  },
  { value: "trans-man", labelKey: "cinema:submit.option.identity.transMan" },
  {
    value: "non-binary",
    labelKey: "cinema:submit.option.identity.nonBinary",
  },
  { value: "queer", labelKey: "cinema:submit.option.identity.queer" },
  { value: "intersex", labelKey: "cinema:submit.option.identity.intersex" },
  { value: "asexual", labelKey: "cinema:submit.option.identity.asexual" },
];

/* ── Step 2: Accessibility ── */
export interface RadioOption {
  value: string;
  labelKey: string;
  subKey?: string;
}

export const CAPTION_OPTIONS: RadioOption[] = [
  {
    value: "have",
    labelKey: "cinema:submit.option.captions.have.label",
    subKey: "cinema:submit.option.captions.have.sub",
  },
  {
    value: "help",
    labelKey: "cinema:submit.option.captions.help.label",
    subKey: "cinema:submit.option.captions.help.sub",
  },
  {
    value: "none",
    labelKey: "cinema:submit.option.captions.none.label",
    subKey: "cinema:submit.option.captions.none.sub",
  },
];

/** Caption *track* languages the filmmaker can supply — distinct from the
 * UI/original-language pickers above. "Brazilian PT" describes a specific
 * existing caption file (pt-BR), not the platform's own language; it is
 * translated like any other option label, never conflated with pt-PT UI
 * copy (see docs/i18n/glossary-pt.md's pt-PT-only rule, which governs the
 * platform's own chrome, not a captioned file's dialect). */
export const CAPTION_LANGS: OptionKeyDef[] = [
  { value: "pt", labelKey: "cinema:submit.option.captionLang.pt" },
  { value: "en", labelKey: "cinema:submit.option.captionLang.en" },
  { value: "es", labelKey: "cinema:submit.option.captionLang.es" },
  { value: "fr", labelKey: "cinema:submit.option.captionLang.fr" },
  { value: "pt-br", labelKey: "cinema:submit.option.captionLang.ptBr" },
];

export const AD_OPTIONS: RadioOption[] = [
  {
    value: "have",
    labelKey: "cinema:submit.option.ad.have.label",
    subKey: "cinema:submit.option.ad.have.sub",
  },
  {
    value: "help",
    labelKey: "cinema:submit.option.ad.help.label",
    subKey: "cinema:submit.option.ad.help.sub",
  },
  { value: "none", labelKey: "cinema:submit.option.ad.none.label" },
];

/** LGP/ASL/BSL are sign-language names, kept as their established
 * abbreviations in both catalogs (like "PT"/"EN" — proper-noun-shaped, not
 * prose); only "None yet" is translated chrome. */
export const SIGN_TRACKS: OptionKeyDef[] = [
  { value: "lgp", labelKey: "cinema:submit.option.signTrack.lgp" },
  { value: "asl", labelKey: "cinema:submit.option.signTrack.asl" },
  { value: "bsl", labelKey: "cinema:submit.option.signTrack.bsl" },
  { value: "none", labelKey: "cinema:submit.option.signTrack.none" },
];

/* ── Step 3: Rights ── */
export const TERRITORY_OPTIONS: RadioOption[] = [
  {
    value: "worldwide",
    labelKey: "cinema:submit.option.territory.worldwide.label",
    subKey: "cinema:submit.option.territory.worldwide.sub",
  },
  {
    value: "europe",
    labelKey: "cinema:submit.option.territory.europe.label",
    subKey: "cinema:submit.option.territory.europe.sub",
  },
  {
    value: "portugal",
    labelKey: "cinema:submit.option.territory.portugal.label",
    subKey: "cinema:submit.option.territory.portugal.sub",
  },
];

export const TERM_OPTIONS: RadioOption[] = [
  {
    value: "1yr",
    labelKey: "cinema:submit.option.term.oneYear.label",
    subKey: "cinema:submit.option.term.oneYear.sub",
  },
  {
    value: "2yr",
    labelKey: "cinema:submit.option.term.twoYear.label",
    subKey: "cinema:submit.option.term.twoYear.sub",
  },
  {
    value: "perpetual",
    labelKey: "cinema:submit.option.term.rolling.label",
    subKey: "cinema:submit.option.term.rolling.sub",
  },
];

/* ── Step 4: Revenue ── */
export interface RevenueModel {
  value: string;
  labelKey: string;
  tagKey: string;
  tagKind: "free" | "paid";
  descKey: string;
  splitKey: string;
  /** Whether this model asks for a rental / buy price. */
  priced?: "rent" | "rentbuy";
}

export const REVENUE_MODELS: RevenueModel[] = [
  {
    value: "free",
    labelKey: "cinema:submit.option.revenue.free.label",
    tagKey: "cinema:submit.option.revenue.free.tag",
    tagKind: "free",
    descKey: "cinema:submit.option.revenue.free.desc",
    splitKey: "cinema:submit.option.revenue.free.split",
  },
  {
    value: "sustainer",
    labelKey: "cinema:submit.option.revenue.sustainer.label",
    tagKey: "cinema:submit.option.revenue.sustainer.tag",
    tagKind: "paid",
    descKey: "cinema:submit.option.revenue.sustainer.desc",
    splitKey: "cinema:submit.option.revenue.sustainer.split",
  },
  {
    value: "rent",
    labelKey: "cinema:submit.option.revenue.rent.label",
    tagKey: "cinema:submit.option.revenue.rent.tag",
    tagKind: "paid",
    descKey: "cinema:submit.option.revenue.rent.desc",
    splitKey: "cinema:submit.option.revenue.rent.split",
    priced: "rent",
  },
  {
    value: "rentbuy",
    labelKey: "cinema:submit.option.revenue.rentbuy.label",
    tagKey: "cinema:submit.option.revenue.rentbuy.tag",
    tagKind: "paid",
    descKey: "cinema:submit.option.revenue.rentbuy.desc",
    splitKey: "cinema:submit.option.revenue.rentbuy.split",
    priced: "rentbuy",
  },
];

/* ── Sidebar ── */
/** i18n Pattern A — reassurance points, resolved via t() in the consumer. */
export const NEXT_POINTS: { strongKey: string; restKey: string }[] = [
  {
    strongKey: "cinema:submit.aside.next.point1.strong",
    restKey: "cinema:submit.aside.next.point1.rest",
  },
  {
    strongKey: "cinema:submit.aside.next.point2.strong",
    restKey: "cinema:submit.aside.next.point2.rest",
  },
  {
    strongKey: "cinema:submit.aside.next.point3.strong",
    restKey: "cinema:submit.aside.next.point3.rest",
  },
  {
    strongKey: "cinema:submit.aside.next.point4.strong",
    restKey: "cinema:submit.aside.next.point4.rest",
  },
];
