import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { memberName } from "../members/data/members";

export type Access = "free" | "member" | "rent";

export interface CinemaFilm {
  id: string;
  access: Access;
  /** Only set when `access === "rent"` — the price `accessLabel()` formats. */
  rentPrice?: number;
  kicker: string;
  /** Title parts: plain + emphasised + trailing. */
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: string;
  note: string;
  by: string;
  tint: ImageSlotTint;
  format: string;
  country: string;
  year: string;
  subs: string[];
  /** Poster image URL, when a real image is wired (else the placeholder shows). */
  image?: string;
}

export const films: CinemaFilm[] = [
  {
    id: "cascais",
    access: "free",
    kicker: "Narrative feature",
    titlePre: "A summer in ",
    titleEm: "Cascais",
    meta: `${memberName("ines")} · PT · 104 min`,
    note: "Three sisters, one inheritance, and the ghost of the great-aunt who left them the house.",
    by: "Sara M.",
    tint: "coral",
    format: "Feature",
    country: "PT",
    year: "2024",
    subs: ["PT subs", "EN subs"],
    image:
      "https://images.unsplash.com/photo-1778372670061-e84b57764aec?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "paris",
    access: "member",
    kicker: "Documentary",
    titlePre: "Paris is ",
    titleEm: "still",
    titlePost: " burning",
    meta: "Akin Diallo · FR/SN · 87 min",
    note: "A West African ballroom scene, two decades after the diaspora that built it.",
    by: "D. Okoye",
    tint: "plum",
    format: "Documentary",
    country: "FR/SN",
    year: "2025",
    subs: ["FR spoken", "EN subs", "PT subs"],
    image:
      "https://images.unsplash.com/photo-1572188863110-46d457c9234d?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "pharmacy",
    access: "free",
    kicker: "Short · 18 min",
    titlePre: "The pharmacy at 3am",
    meta: "Rui Almeida · PT · 18 min",
    note: "A trans woman, a graveyard shift, a stranger asking for testosterone.",
    by: "made here",
    tint: "jade",
    format: "Short",
    country: "PT",
    year: "2026",
    subs: ["PT spoken"],
    image:
      "https://images.unsplash.com/photo-1618410321132-9f4cebb2f7f5?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "mother",
    access: "rent",
    rentPrice: 3,
    kicker: "Narrative feature",
    titlePre: "Mother, ",
    titleEm: "weather",
    meta: "Yuki Tanaka · JP · 118 min",
    note: "A son returns to Hokkaido to come out to his mother through the act of cooking her dinner.",
    by: "curators' council",
    tint: "coral",
    format: "Feature",
    country: "JP",
    year: "2024",
    subs: ["JP spoken", "EN subs", "PT subs"],
    image:
      "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "archive",
    access: "member",
    kicker: "Documentary",
    titlePre: "The archive ",
    titleEm: "keepers",
    meta: "Laila Hassan · EG/UK · 76 min",
    note: "Cairo's hidden queer archive, smuggled to London, returned in pieces.",
    by: "Yara R.",
    tint: "plum",
    format: "Documentary",
    country: "EG/UK",
    year: "2023",
    subs: ["EN spoken", "PT subs", "AR subs"],
    image:
      "https://images.unsplash.com/photo-1711479898431-9031deb4ff0e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "carta",
    access: "free",
    kicker: "Series · 4 ep",
    titlePre: "Carta a quem ",
    titleEm: "fica",
    meta: "Mateus Ferreira · BR · 4×22 min",
    note: "Letters from young Brazilians who didn't emigrate, to those who did.",
    by: "Sara M.",
    tint: "jade",
    format: "Series",
    country: "BR",
    year: "2025",
    subs: ["PT spoken", "EN subs"],
    image:
      "https://images.unsplash.com/photo-1758232589376-9f3db5aa371d?q=80&w=400&auto=format&fit=crop",
  },
];

export const coverFilm = {
  kicker: "Cover film · streaming until 14 June",
  image:
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop",
  titlePre: "The light ",
  titleEm: "between",
  titlePost: " rooms",
  meta: "Maria Vasconcelos · Portugal, 2025 · 92 min · documentary",
  curatorWho: "— Programmed by João Ribeiro",
  curatorBody:
    "A patient, generous film about Lisbon's working-class queer elders, made over three years in the kitchens that raised them. Stay for the second hour — it's where the film stops being about loss and starts being about teaching.",
  /** Fields used to explain why other films relate to this one. */
  country: "PT",
  curator: "João Ribeiro",
  format: "Documentary",
};

/**
 * Why a film appears in "More from the programme", relative to the cover film.
 * Returns a short badge label derived from shared curator / country / format.
 * i18n Pattern A idiom (mirrors gatherings' `spotsText(spots, t, fmt)`): the
 * country code is a proper noun and isn't translated, `format` resolves
 * through `formatLabel()` below.
 */
export function filmRelationReason(film: CinemaFilm, t: TFunction): string {
  if (film.country === coverFilm.country)
    return t("cinema:film.relation.sameCountry", { country: film.country });
  if (film.format === coverFilm.format)
    return t("cinema:film.relation.sameForm", {
      format: formatLabel(film.format, t),
    });
  return t("cinema:film.relation.curatorsPick");
}

/**
 * `format` is a small fixed taxonomy ("Feature", "Documentary", "Short",
 * "Series", "Experimental") stored on `CinemaFilm` in English so filtering/
 * sorting logic (cinemaBrowse.data.ts) keeps a stable canonical value; this
 * resolves the *displayed* label through the catalog. Unknown values (there
 * shouldn't be any) fall back to the raw string rather than crashing.
 */
const FORMAT_LABEL_KEYS: Record<string, string> = {
  Feature: "cinema:format.feature",
  Documentary: "cinema:format.documentary",
  Short: "cinema:format.short",
  Series: "cinema:format.series",
  Experimental: "cinema:format.experimental",
};

export function formatLabel(format: string, t: TFunction): string {
  const key = FORMAT_LABEL_KEYS[format];
  return key ? t(key) : format;
}

/**
 * `access` is the canonical (untranslated) enum used for filtering; this
 * resolves the displayed badge text, formatting the rent price through
 * `useFormat().currency()` so pt-PT renders `3,00 €` rather than a baked `€3`.
 */
export function accessLabel(
  film: Pick<CinemaFilm, "access" | "rentPrice">,
  t: TFunction,
  fmt: Formatters,
): string {
  if (film.access === "rent")
    return t("cinema:access.rent", { price: fmt.currency(film.rentPrice ?? 0) });
  if (film.access === "member") return t("cinema:access.sustainer");
  return t("cinema:access.free");
}

export const collections = [
  {
    slug: "iberian-queer-cinema",
    tag: "Collection",
    titlePre: "Iberian queer cinema, ",
    titleEm: "1974–now",
    desc: "From the carnation revolution to Almodóvar to TikTok-native shorts from Porto. A 24-film arc through Portuguese and Spanish queer image-making.",
    by: "João Ribeiro & Sofía Castro",
    av: "JR",
    count: "24 films · 9 free · 15 sustainer",
    total: "37h",
  },
  {
    slug: "trans-documentaries-2020s",
    tag: "Collection",
    titlePre: "Trans documentaries: ",
    titleEm: "the 2020s",
    desc: "The decade is half over. Twelve documentaries — five by trans filmmakers — selected for how they treat their subjects as collaborators.",
    by: "D. Okoye",
    av: "DO",
    count: "12 films · 3 free · 9 rent",
    total: "18h",
  },
  {
    slug: "films-our-parents-could-watch",
    tag: "Collection",
    titlePre: "Films our parents ",
    titleEm: "could",
    titlePost: " watch",
    desc: "Quiet, generous, generationally translatable. A bridge collection. Bring a parent. Bring an aunt. Bring the friend who's still working it out.",
    by: "Sara Marques",
    av: "SM",
    count: "9 films · 9 free",
    total: "14h",
  },
  {
    slug: "lesbian-sci-fi",
    tag: "Collection",
    titlePre: "Lesbian sci-fi, ’78 to ",
    titleEm: "tomorrow",
    desc: "From the cult of Born in Flames to the Brazilian shorts no one's importing yet. The future has always had us in it.",
    by: "Yara Reis",
    av: "YR",
    count: "18 films · 6 free · 12 rent",
    total: "26h",
  },
];

export interface CinemaShort {
  eyebrow: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  desc: string;
  /** Author byline, rendered before an inline star icon. */
  metaBy: string;
  /** Watch count, rendered after the star icon (e.g. '412 watches this week'). */
  metaWatches: string;
}

export const shorts: CinemaShort[] = [
  {
    eyebrow: "Short · 12 min",
    titlePre: "What my grandmother ",
    titleEm: "did",
    titlePost: " say",
    desc: "A late-night phone call, transcribed and re-enacted. Lisbon, 2026. Made on the spring micro-grant.",
    metaBy: "Helena P.",
    metaWatches: "412 watches this week",
  },
  {
    eyebrow: "Short · 9 min",
    titlePre: "Bicha, with love",
    desc: "One Brazilian word, six speakers, six relationships to it. A visual essay shot on a Bolex.",
    metaBy: "Mateus F.",
    metaWatches: "286 watches this week",
  },
  {
    eyebrow: "Documentary · 28 min",
    titlePre: "The first ",
    titleEm: "Sunday",
    desc: "Inside Lisbon's first community-run queer Sunday roast. Funded by 47 sustainers, in 11 days.",
    metaBy: "Inês T. & collective",
    metaWatches: "819 watches this week",
  },
];

/**
 * `date` is a real `Date` (mock, but real) so `LiveSection` can format the
 * day/weekday through `useFormat()` instead of baking an English weekday
 * abbreviation ("Wed") into the record. `badgeKey` is chrome (a small fixed
 * set of event-type badges); `titlePre/titleEm/titlePost`, `sub` and `tags`
 * are organizer-authored event copy and stay in English.
 */
export const liveEvents = [
  {
    date: new Date(2026, 5, 10),
    badgeKey: "cinema:live.badge.premiere",
    badgeClass: "premiere",
    titlePre: "Premiere · ",
    titleEm: "The light between rooms",
    titlePost: ", with Maria Vasconcelos",
    sub: "Live Q&A after the screening. Co-hosted with Casa do Comum.",
    tags: ["21:00 Lisbon · online + at the room", "EN + PT live captions"],
  },
  {
    date: new Date(2026, 5, 12),
    badgeKey: "cinema:live.badge.watchParty",
    badgeClass: "party",
    titlePre: "Watch party · ",
    titleEm: "Paris is still burning",
    sub: "Synced playback with live chat. Hosted by D. Okoye.",
    tags: ["22:00 Lisbon · online", "Sustainer access"],
  },
  {
    date: new Date(2026, 5, 13),
    badgeKey: "cinema:live.badge.inTheRoom",
    badgeClass: "live",
    titlePre: "Open mic · ",
    titleEm: "Made here",
    titlePost: ", shorts night",
    sub: "Four community-made shorts back-to-back, with directors live in the room.",
    tags: ["20:30 · Casa do Comum", "Open"],
  },
];
