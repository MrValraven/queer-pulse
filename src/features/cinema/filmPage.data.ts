/** Hero poster (3:4) for the cover film on the film page. */
export const FILM_POSTER =
  "https://images.unsplash.com/photo-1753944847480-92f369a5f00e?q=80&w=600&auto=format&fit=crop";

export const TIPS = ["€3", "€7", "€15", "€30", "···"];

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

export const WATCH_TABS = [
  { label: "Watch", sub: "included · sustainer" },
  { label: "Rent · €3", sub: "48 hrs" },
  { label: "Buy · €8", sub: "forever" },
];

export const FACTS = [
  { k: "Language", v: "Portuguese", ok: false },
  { k: "Captions", v: "EN · PT", ok: true },
  { k: "Audio described", v: "EN · PT", ok: true },
  { k: "Sign language", v: "LGP track", ok: true },
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
