/** Hero poster (3:4) for the cover film on the film page. */
export const FILM_POSTER =
  "https://images.unsplash.com/photo-1753944847480-92f369a5f00e?q=80&w=600&auto=format&fit=crop";

/** Tip-jar quick amounts; `null` is the "···" custom-amount slot (decorative,
 * not user-facing copy). Amounts are plain numbers so the component can format
 * them with `fmt.currency()` per locale. */
export const TIP_AMOUNTS: (number | null)[] = [3, 7, 15, 30, null];

/** Watchlist entry for the cover film, saved via SavedProvider. */
export const FILM_SAVED = {
  id: "film:the-light-between-rooms",
  kind: "film" as const,
  title: "The light between rooms",
  href: "/film",
  meta: "Maria Vasconcelos · 2025",
  description:
    "A chamber drama about two strangers sharing a house in Lisbon — and the light that passes between their rooms.",
  readTime: "1h 48m",
};

/**
 * i18n Pattern A: `labelKey`/`subKey` resolve via `t()`; `price`/`hours` are
 * plain numbers the component interpolates (price formatted with
 * `fmt.currency()`, matching `cinema:access.rent`'s `{price}` token).
 */
export const WATCH_TABS = [
  { labelKey: "cinema:film.watchTabs.watch.label", subKey: "cinema:film.watchTabs.watch.sub" },
  { labelKey: "cinema:access.rent", price: 3, subKey: "cinema:film.watchTabs.rent.sub", hours: 48 },
  { labelKey: "cinema:film.watchTabs.buy.label", price: 8, subKey: "cinema:film.watchTabs.buy.sub" },
];

/** `labelKey` is chrome (the fact's name); `v` is this film's own data and
 * stays untranslated English (see docs/i18n/extraction-brief.md §1). */
export const FACTS = [
  { labelKey: "cinema:film.facts.language", v: "Portuguese", ok: false },
  { labelKey: "cinema:film.facts.captions", v: "EN · PT", ok: true },
  { labelKey: "cinema:browse.accessibility.audioDescription", v: "EN · PT", ok: true },
  { labelKey: "cinema:browse.accessibility.signLanguage", v: "LGP track", ok: true },
];

export const CREW = [
  {
    initials: "MV",
    tone: "coral",
    name: "Maria Vasconcelos",
    role: "Director, cinematographer",
    tags: ["Lesbian", "PT", "member"],
  },
  {
    initials: "CB",
    tone: "jade",
    name: "Cláudia Borges",
    role: "Editor",
    tags: ["Bi", "PT"],
  },
  {
    initials: "IL",
    tone: "",
    name: "Dona Ilda Pereira",
    role: "Featured · Marvila",
    tags: ["Lesbian", "b. 1947"],
  },
  {
    initials: "RC",
    tone: "coral",
    name: "Rui Costa",
    role: "Sound recordist, mix",
    tags: ["Gay", "PT", "member"],
  },
];
