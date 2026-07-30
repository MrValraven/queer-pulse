import type { ReactNode } from "react";
import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";
import { routes } from "../../app/routeMap";

export interface FilmmakerStat {
  k: string;
  v: ReactNode;
}

export interface FilmographyEntry {
  href: string;
  image?: string;
  tint: ImageSlotTint;
  badge: string;
  /** Badge colour: matches a film's access model. */
  badgeKind: "free" | "member" | "rent";
  eyebrow: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: string;
  earned: string;
}

export interface FestivalEntry {
  year: string;
  namePre: string;
  nameEm?: string;
  detail: string;
  award: string;
}

export interface FilmmakerEvent {
  day: string;
  month: string;
  kind: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  sub: string;
}

export interface FilmmakerIdentity {
  label: string;
  /** The accented "QueerPulse member" chip. */
  member?: boolean;
}

export interface Filmmaker {
  slug: string;
  portrait?: string;
  kicker: { label: string; jade?: boolean }[];
  namePre: string;
  nameEm: string;
  pronouns: string;
  identity: FilmmakerIdentity[];
  bio: ReactNode;
  statement: string;
  statementWho: string;
  stats: FilmmakerStat[];
  filmography: FilmographyEntry[];
  festivals: FestivalEntry[];
  events: FilmmakerEvent[];
  /** Public profile + directory links shown under the bio. */
  links: { label: string; to: string }[];
}

export const FILMMAKERS: Record<string, Filmmaker> = {
  "maria-vasconcelos": {
    slug: "maria-vasconcelos",
    portrait:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop",
    kicker: [
      { label: "Filmmaker" },
      { label: "Documentarian" },
      { label: "QueerPulse member since 2023", jade: true },
    ],
    namePre: "Maria ",
    nameEm: "Vasconcelos",
    pronouns: "she/her · Lisbon",
    identity: [
      { label: "Lesbian" },
      { label: "Portuguese" },
      { label: "Documentary" },
      { label: "QueerPulse member", member: true },
    ],
    bio: (
      <>
        Documentary filmmaker based in Marvila, Lisbon. Three features and seven
        shorts since 2014 — mostly about the city she grew up in, the people it
        keeps invisible, and the small architectures of survival they build for
        themselves. Member of the Lisbon Documentary Co-op.{" "}
        <em>All of her work is made in Marvila or about it.</em>
      </>
    ),
    statement:
      "I make films about people who were never asked whether they wanted to be documented. The asking is the film, half the time — watching someone decide whether to trust a camera is more interesting than anything the camera then records.",
    statementWho: "— Maria Vasconcelos, 2025 director's note",
    stats: [
      { k: "Films on QP", v: <em>4</em> },
      {
        k: "Total watches",
        v: (
          <>
            32,<em>141</em>
          </>
        ),
      },
      {
        k: "Paid by co-op",
        v: (
          <>
            €<em>14.8k</em>
          </>
        ),
      },
      {
        k: "Avg share",
        v: (
          <>
            <em>82</em>%
          </>
        ),
      },
    ],
    filmography: [
      {
        href: routes.film,
        image:
          "https://images.unsplash.com/photo-1753944847480-92f369a5f00e?q=80&w=400&auto=format&fit=crop",
        tint: "plum",
        badge: "Free · this week",
        badgeKind: "free",
        eyebrow: "Documentary · 2025 · 92 min",
        titlePre: "The light ",
        titleEm: "between",
        titlePost: " rooms",
        meta: "Cover film, week 23 · 14,207 watches",
        earned: "€ 6,940 earned",
      },
      {
        href: routes.film,
        image:
          "https://images.unsplash.com/photo-1711479898431-9031deb4ff0e?q=80&w=400&auto=format&fit=crop",
        tint: "coral",
        badge: "Sustainer",
        badgeKind: "member",
        eyebrow: "Documentary · 2022 · 84 min",
        titlePre: "O rio que ",
        titleEm: "atravessa",
        meta: "2 collections · 8,441 watches",
        earned: "€ 4,280 earned",
      },
      {
        href: routes.film,
        image:
          "https://images.unsplash.com/photo-1618410321132-9f4cebb2f7f5?q=80&w=400&auto=format&fit=crop",
        tint: "jade",
        badge: "Free",
        badgeKind: "free",
        eyebrow: "Short · 2024 · 22 min",
        titlePre: "Noite de ",
        titleEm: "fado",
        meta: "Made here track · 5,102 watches",
        earned: "€ 2,640 earned + tips",
      },
      {
        href: routes.film,
        image:
          "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?q=80&w=400&auto=format&fit=crop",
        tint: "plum",
        badge: "Rent · €3",
        badgeKind: "rent",
        eyebrow: "Documentary · 2019 · 67 min",
        titlePre: "Antes que ",
        titleEm: "acabes",
        meta: "3,956 watches",
        earned: "€ 940 earned",
      },
    ],
    festivals: [
      {
        year: "2025",
        namePre: "Queer Lisboa ",
        nameEm: "29",
        detail: "The light between rooms — international competition",
        award: "Best documentary",
      },
      {
        year: "2025",
        namePre: "DocLisboa",
        detail: "The light between rooms — Portuguese competition",
        award: "Jury selection",
      },
      {
        year: "2026",
        namePre: "CPH:DOX",
        detail: "The light between rooms — international competition",
        award: "Special mention",
      },
      {
        year: "2026",
        namePre: "Outfest",
        detail: "The light between rooms — international docs",
        award: "Selected",
      },
      {
        year: "2022",
        namePre: "IndieLisboa",
        detail: "O rio que atravessa — national competition",
        award: "Audience award",
      },
    ],
    events: [
      {
        day: "10",
        month: "Jun",
        kind: "Live Q&A · Premiere",
        titlePre: "In conversation · ",
        titleEm: "The light between rooms",
        sub: "Online + at the room · Casa do Comum, Lisbon · 21:00 · 142 going",
      },
      {
        day: "28",
        month: "Jun",
        kind: "Masterclass · open",
        titlePre: "Filming in the kitchen — ",
        titleEm: "intimacy and the documentary frame",
        sub: "QueerPulse Gathering · 18:00 · 34 going · free",
      },
    ],
    links: [
      { label: "View QueerPulse profile", to: routes.members },
      { label: "In the creatives directory", to: routes.subprofiles },
    ],
  },
};

/** Preset tip amounts for the filmmaker tip jar (100% to the filmmaker). */
export const TIP_AMOUNTS = [3, 7, 15, 30];
