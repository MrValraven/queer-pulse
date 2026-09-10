/**
 * i18n Pattern A: the host-guide/marketing copy below is platform-authored
 * and ships in the bundle in both modes, so the data file holds keys and the
 * component resolves them with `t()`. `SPACES` below stays untranslated:
 * partner-venue directory records fetched in live mode (hood/name/note are
 * real venue data, not chrome).
 */

/**
 * The seven format chips in the host page's hero. Format KEYS now, resolved
 * through the catalog at render, so the marketing page and the wizard can no
 * longer offer two different vocabularies: a host who reads "Skills workshop"
 * here used to find no such card in the wizard at all.
 */
export const HERO_TYPE_KEYS: readonly string[] = [
  "supper-club",
  "studio-visit",
  "workshop",
  "screening",
  "walk-or-hike",
  "book-club",
  "craft-circle",
];

/**
 * The four cards in the host guide's "pick a format" step. The TITLE comes
 * from the catalog; the BODY is marketing copy about that specific format and
 * stays where it is.
 */
export const TYPE_CARDS: {
  formatKey: string;
  bodyKey: string;
}[] = [
  {
    formatKey: "supper-club",
    bodyKey: "gatherings:host.typeCard.supperClub.body",
  },
  {
    formatKey: "studio-visit",
    bodyKey: "gatherings:host.typeCard.studioVisit.body",
  },
  {
    formatKey: "workshop",
    bodyKey: "gatherings:host.typeCard.skillsSession.body",
  },
  {
    formatKey: "screening",
    bodyKey: "gatherings:host.typeCard.screeningTalk.body",
  },
];

/**
 * One partner-venue row on the host page's "Partner spaces" card. `slug`
 * links to the directory listing when known (live rows always carry it; demo
 * fixtures may omit it). `note` is the composed venue line
 * ("Studio · up to 15 · member-run") — in live mode the adapter builds it from
 * the listing's `spaceType`/`capacity`/`hostNote` primitives.
 */
export interface HostSpace {
  slug?: string;
  hood: string;
  name: string;
  note: string;
}

/**
 * Demo-mode partner-venue rows. In live mode the same card is fed by
 * `useHostSpaces()` → `GET /directory/spaces` (listings flagged as partner
 * venues), so these must never render as platform truth in live mode.
 */
export const SPACES: HostSpace[] = [
  {
    slug: "queer-supper-club",
    hood: "Mouraria",
    name: "Queer Supper Club",
    note: "Kitchen + dining room · up to 20 · ticketed",
  },
  {
    slug: "atelier-pulso",
    hood: "Príncipe Real",
    name: "Atelier Pulso",
    note: "Studio · up to 15 · member-run",
  },
  {
    slug: "galeria-lume",
    hood: "Marvila",
    name: "Galeria Lume",
    note: "Warehouse · up to 50 · events only",
  },
];
