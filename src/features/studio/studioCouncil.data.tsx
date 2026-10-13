import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction, TranslateOptions } from "../../shared/i18n/types";
import { StudioEuroAmount } from "./StudioEuroAmount";

/**
 * Council fact strip is platform-authored chrome (Pattern B, `buildFacts(t)`).
 * `MEMBERS` is a demo-only roster: Studio has no live council endpoint, so its
 * seats, roles, bios, notebook lines and payout labels ship in the bundle and
 * resolve through `studioShowcase:council.member.*` keys (Pattern A). Proper
 * nouns stay literal here: curator names, cities, set titles, and the
 * already-formatted dates. Euro figures are numbers, rendered as
 * `payoutSlots` so they format in the active locale.
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
  /** Already-formatted date, rendered through the slate meta key. */
  date: string;
  trackCount: number;
  /** `<Translation>` key for the payout line, plus its `{token}` values. */
  payoutKey: string;
  payoutValues?: TranslateOptions;
  /** `{token}`s rendered as nodes: the euro figure in the active locale. */
  payoutSlots?: Record<string, ReactNode>;
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
  noteDate: string;
  noteKey: string;
  slatesThisYear: number;
  slates: CouncilSlate[];
  tracksProgrammed: number;
  artistsPaid: number;
  image?: string;
}

const PAYOUT_OUT = "studioShowcase:council.member.slate.payout.out";
const PAYOUT_PAID = "studioShowcase:council.member.slate.payout.paid";
const PAYOUT_GRANT = "studioShowcase:council.member.slate.payout.grant";

/** The `{amount}` slot of a payout line, formatted for the active locale. */
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
    noteDate: "9 Jun",
    noteKey: "studioShowcase:council.member.saraMarques.note",
    slatesThisYear: 18,
    slates: [
      {
        pre: "Vespertina, ",
        em: "vol. iv",
        date: "9 Jun",
        trackCount: 12,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(8.2),
      },
      {
        pre: "Songs to play your ",
        em: "mother",
        date: "2 Jun",
        trackCount: 14,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(11400, true),
      },
    ],
    tracksProgrammed: 312,
    artistsPaid: 89,
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
    noteDate: "5 Jun",
    noteKey: "studioShowcase:council.member.dOkoye.note",
    slatesThisYear: 9,
    slates: [
      {
        pre: "Trans ",
        em: "composers",
        post: ", 1972 to now",
        date: "28 May",
        trackCount: 12,
        payoutKey: PAYOUT_PAID,
        payoutValues: { count: 12 },
      },
      {
        pre: "Songs for ",
        em: "insomnia",
        date: "14 May",
        trackCount: 22,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(4.1),
      },
    ],
    tracksProgrammed: 148,
    artistsPaid: 61,
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
    noteDate: "2 Jun",
    noteKey: "studioShowcase:council.member.yaraReis.note",
    slatesThisYear: 11,
    slates: [
      {
        pre: "Lisbon dyke-bar ",
        em: "standards",
        date: "21 May",
        trackCount: 28,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(9.3),
      },
      {
        pre: "Almost ",
        em: "asleep",
        date: "9 May",
        trackCount: 31,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(5.8),
      },
    ],
    tracksProgrammed: 204,
    artistsPaid: 73,
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
    noteDate: "30 May",
    noteKey: "studioShowcase:council.member.joaoRibeiro.note",
    slatesThisYear: 7,
    slates: [
      {
        pre: "Kitchen ",
        em: "warm-up",
        date: "23 May",
        trackCount: 9,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(3.2),
      },
      {
        pre: "Made ",
        em: "here",
        post: ", spring",
        date: "16 May",
        trackCount: 5,
        payoutKey: PAYOUT_GRANT,
        payoutSlots: euroAmountSlot(5500, true),
      },
    ],
    tracksProgrammed: 96,
    artistsPaid: 44,
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
    noteDate: "27 May",
    noteKey: "studioShowcase:council.member.akinDiallo.note",
    slatesThisYear: 6,
    slates: [
      {
        pre: "Salt water, ",
        em: "slowly",
        date: "19 May",
        trackCount: 10,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(4.6),
      },
      {
        pre: "The long way ",
        em: "home",
        date: "5 May",
        trackCount: 14,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(6.1),
      },
    ],
    tracksProgrammed: 84,
    artistsPaid: 52,
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
    noteDate: "24 May",
    noteKey: "studioShowcase:council.member.helenaPinto.note",
    slatesThisYear: 3,
    slates: [
      {
        pre: "Vespers, ",
        em: "recorded",
        date: "17 May",
        trackCount: 12,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(3.4),
      },
      {
        pre: "Fifteen voices, one ",
        em: "stairwell",
        date: "10 May",
        trackCount: 8,
        payoutKey: PAYOUT_OUT,
        payoutSlots: euroAmountSlot(2.8),
      },
    ],
    tracksProgrammed: 28,
    artistsPaid: 19,
    image:
      "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=800&auto=format&fit=crop",
  },
];
