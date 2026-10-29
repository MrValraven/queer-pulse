import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction, TranslateOptions } from "../../shared/i18n/types";
import { StudioEuroAmount } from "./StudioEuroAmount";

/**
 * Council fact strip is platform-authored chrome (Pattern B, `buildFacts(t)`).
 * `MEMBERS` is a demo-only roster: Studio has no live council endpoint, so its
 * seats, roles, bios, notebook lines and slate labels ship in the bundle and
 * resolve through `studioShowcase:council.member.*` keys (Pattern A). Proper
 * nouns stay literal here: curator names, cities and set titles. Dates are
 * `yyyy-mm-dd` fixtures the page formats in the active locale, and euro
 * figures are numbers, rendered as `lineSlots` for the same reason.
 */
export interface CouncilFact {
  v: ReactNode;
  l: string;
}

export function buildFacts(t: TFunction): CouncilFact[] {
  return [
    {
      v: (
        <Translation
          i18nKey="studio:council.fact.seats.value"
          components={{ em: <em /> }}
        />
      ),
      l: t("studio:council.fact.seats.label"),
    },
    {
      v: (
        <Translation
          i18nKey="studio:council.fact.stipend.value"
          components={{ em: <em /> }}
        />
      ),
      l: t("studio:council.fact.stipend.label"),
    },
    {
      v: (
        <Translation
          i18nKey="studio:council.fact.slates.value"
          components={{ em: <em /> }}
        />
      ),
      l: t("studio:council.fact.slates.label"),
    },
    {
      v: (
        <Translation
          i18nKey="studio:council.fact.election.value"
          components={{ em: <em /> }}
        />
      ),
      l: t("studio:council.fact.election.label"),
    },
  ];
}

export interface CouncilSlate {
  /** Set title, split for the coral `<em>` run. Proper noun: stays literal. */
  pre: string;
  em?: string;
  post?: string;
  /** `yyyy-mm-dd`, formatted in the active locale through the slate meta key. */
  dateIso: string;
  trackCount: number;
  /** `<Translation>` key for the slate's result line, plus its `{token}` values. */
  lineKey: string;
  lineValues?: TranslateOptions;
  /** `{token}`s rendered as nodes: the euro figure in the active locale. */
  lineSlots?: Record<string, ReactNode>;
}

export interface Member {
  tint: "coral" | "jade" | "plum";
  seat: number;
  /** Catalog key taking `{seat}`. */
  seatKey: string;
  pre: string;
  em: string;
  city: string;
  roleKey: string;
  since: number;
  /** `<Translation>` keys: both strings carry an `<em>` run. */
  bioKey: string;
  /** `yyyy-mm-dd` of the latest notebook entry, formatted at render. */
  noteDateIso: string;
  noteKey: string;
  slatesThisYear: number;
  slates: CouncilSlate[];
  tracksProgrammed: number;
  artistsFeatured: number;
  image?: string;
}

const SLATE_LISTENERS = "studioShowcase:council.member.slate.listeners";
const SLATE_GRANT = "studioShowcase:council.member.slate.grant";

/** The `{amount}` slot of a grant line, formatted for the active locale. */
function euroAmountSlot(value: number, isCompact = false) {
  return { amount: <StudioEuroAmount value={value} isCompact={isCompact} /> };
}

export const MEMBERS: Member[] = [
  {
    tint: "coral",
    seat: 1,
    seatKey: "studioShowcase:council.member.seat.chair",
    pre: "Sara ",
    em: "Marques",
    city: "Lisbon",
    roleKey: "studioShowcase:council.member.role.djProgrammer",
    since: 2024,
    bioKey: "studioShowcase:council.member.saraMarques.bio",
    noteDateIso: "2026-06-09",
    noteKey: "studioShowcase:council.member.saraMarques.note",
    slatesThisYear: 18,
    slates: [
      {
        pre: "Vespertina, ",
        em: "vol. iv",
        dateIso: "2026-06-09",
        trackCount: 12,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 312 },
      },
      {
        pre: "Songs to play your ",
        em: "mother",
        dateIso: "2026-06-02",
        trackCount: 14,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 486 },
      },
    ],
    tracksProgrammed: 312,
    artistsFeatured: 89,
    image:
      "https://images.unsplash.com/photo-1779497056298-7a23ec268963?q=80&w=600&auto=format&fit=crop",
  },
  {
    tint: "jade",
    seat: 4,
    seatKey: "studioShowcase:council.member.seat.plain",
    pre: "D. ",
    em: "Okoye",
    city: "London / Lagos",
    roleKey: "studioShowcase:council.member.role.composerArchivist",
    since: 2025,
    bioKey: "studioShowcase:council.member.dOkoye.bio",
    noteDateIso: "2026-06-05",
    noteKey: "studioShowcase:council.member.dOkoye.note",
    slatesThisYear: 9,
    slates: [
      {
        pre: "Trans ",
        em: "composers",
        post: ", 1972 to now",
        dateIso: "2026-05-28",
        trackCount: 12,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 204 },
      },
      {
        pre: "Songs for ",
        em: "insomnia",
        dateIso: "2026-05-14",
        trackCount: 22,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 156 },
      },
    ],
    tracksProgrammed: 148,
    artistsFeatured: 61,
    image:
      "https://images.unsplash.com/flagged/photo-1555604858-34f65cfdc1db?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    seat: 3,
    seatKey: "studioShowcase:council.member.seat.plain",
    pre: "Yara ",
    em: "Reis",
    city: "Lisbon",
    roleKey: "studioShowcase:council.member.role.soundArchivist",
    since: 2024,
    bioKey: "studioShowcase:council.member.yaraReis.bio",
    noteDateIso: "2026-06-02",
    noteKey: "studioShowcase:council.member.yaraReis.note",
    slatesThisYear: 11,
    slates: [
      {
        pre: "Lisbon dyke-bar ",
        em: "standards",
        dateIso: "2026-05-21",
        trackCount: 28,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 353 },
      },
      {
        pre: "Almost ",
        em: "asleep",
        dateIso: "2026-05-09",
        trackCount: 31,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 220 },
      },
    ],
    tracksProgrammed: 204,
    artistsFeatured: 73,
    image:
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "coral",
    seat: 2,
    seatKey: "studioShowcase:council.member.seat.plain",
    pre: "João ",
    em: "Ribeiro",
    city: "Porto",
    roleKey: "studioShowcase:council.member.role.producer",
    since: 2025,
    bioKey: "studioShowcase:council.member.joaoRibeiro.bio",
    noteDateIso: "2026-05-30",
    noteKey: "studioShowcase:council.member.joaoRibeiro.note",
    slatesThisYear: 7,
    slates: [
      {
        pre: "Kitchen ",
        em: "warm-up",
        dateIso: "2026-05-23",
        trackCount: 9,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 122 },
      },
      {
        pre: "Made ",
        em: "here",
        post: ", spring",
        dateIso: "2026-05-16",
        trackCount: 5,
        lineKey: SLATE_GRANT,
        lineSlots: euroAmountSlot(5500, true),
      },
    ],
    tracksProgrammed: 96,
    artistsFeatured: 44,
    image:
      "https://images.unsplash.com/photo-1513517178-1aca306e52a9?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "jade",
    seat: 5,
    seatKey: "studioShowcase:council.member.seat.plain",
    pre: "Akin ",
    em: "Diallo",
    city: "Dakar / Paris",
    roleKey: "studioShowcase:council.member.role.artistCurator",
    since: 2025,
    bioKey: "studioShowcase:council.member.akinDiallo.bio",
    noteDateIso: "2026-05-27",
    noteKey: "studioShowcase:council.member.akinDiallo.note",
    slatesThisYear: 6,
    slates: [
      {
        pre: "Salt water, ",
        em: "slowly",
        dateIso: "2026-05-19",
        trackCount: 10,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 175 },
      },
      {
        pre: "The long way ",
        em: "home",
        dateIso: "2026-05-05",
        trackCount: 14,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 232 },
      },
    ],
    tracksProgrammed: 84,
    artistsFeatured: 52,
    image:
      "https://images.unsplash.com/photo-1514960919797-5ff58c52e5ba?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    seat: 6,
    seatKey: "studioShowcase:council.member.seat.newest",
    pre: "Helena ",
    em: "Pinto",
    city: "Braga",
    roleKey: "studioShowcase:council.member.role.choirDirector",
    since: 2026,
    bioKey: "studioShowcase:council.member.helenaPinto.bio",
    noteDateIso: "2026-05-24",
    noteKey: "studioShowcase:council.member.helenaPinto.note",
    slatesThisYear: 3,
    slates: [
      {
        pre: "Vespers, ",
        em: "recorded",
        dateIso: "2026-05-17",
        trackCount: 12,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 129 },
      },
      {
        pre: "Fifteen voices, one ",
        em: "stairwell",
        dateIso: "2026-05-10",
        trackCount: 8,
        lineKey: SLATE_LISTENERS,
        lineValues: { count: 106 },
      },
    ],
    tracksProgrammed: 28,
    artistsFeatured: 19,
    image:
      "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=800&auto=format&fit=crop",
  },
];
