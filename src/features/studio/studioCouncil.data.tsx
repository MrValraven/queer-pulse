import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Council fact strip is platform-authored chrome (Pattern B, `buildFacts(t)`).
 * `MEMBERS` below is each curator's own profile — seat, bio, notebook quotes,
 * programmed slates, and stats are the curator's authored/personal record and
 * stay English in both modes per `docs/i18n/extraction-brief.md` §1 (same
 * treatment as the Cinema curator profile pages).
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

export interface Member {
  tint: "coral" | "jade" | "plum";
  seat: string;
  pre: string;
  em: string;
  where: string[];
  bio: ReactNode;
  noteDate: string;
  note: ReactNode;
  slatesCount: string;
  slates: {
    pre: string;
    em?: string;
    post?: string;
    date: string;
    out: ReactNode;
  }[];
  stat: ReactNode;
  image?: string;
}

export const MEMBERS: Member[] = [
  {
    tint: "coral",
    seat: "Seat 1 · chair this quarter",
    pre: "Sara ",
    em: "Marques",
    where: ["Lisbon", "DJ & programmer", "since 2024"],
    bio: (
      <>
        Ran the Casa do Comum Wednesday nights for a decade before the co-op
        existed. Programs for{" "}
        <em>the hour between sunset and the second bottle</em>.
      </>
    ),
    noteDate: "9 Jun",
    note: (
      <>
        "I keep coming back to Mariana's <em>Carta</em>. It's a hymn that
        refuses church. We led the week with it because the room needs
        permission to be tender on a Wednesday."
      </>
    ),
    slatesCount: "18 this year",
    slates: [
      {
        pre: "Vespertina, ",
        em: "vol. iv",
        date: "9 Jun · 12 tracks",
        out: (
          <>
            <em>€8.20</em> out
          </>
        ),
      },
      {
        pre: "Songs to play your ",
        em: "mother",
        date: "2 Jun · 14 tracks",
        out: (
          <>
            <em>€11.4k</em> out
          </>
        ),
      },
    ],
    stat: (
      <>
        <em>312</em> tracks programmed · <em>89</em> artists paid
      </>
    ),
    image:
      "https://images.unsplash.com/photo-1779497056298-7a23ec268963?q=80&w=600&auto=format&fit=crop",
  },
  {
    tint: "jade",
    seat: "Seat 4",
    pre: "D. ",
    em: "Okoye",
    where: ["London / Lagos", "composer & archivist", "since 2025"],
    bio: (
      <>
        Builds the long mixes nobody else has time for —{" "}
        <em>trans composers 1972 to now</em>. Believes a playlist is an argument
        and a citation is a kindness.
      </>
    ),
    noteDate: "5 Jun",
    note: (
      <>
        "Half this week's grant strand went to people the algorithms had given
        up on. <em>That's the whole job.</em> Find the ones the metrics buried,
        pay them first."
      </>
    ),
    slatesCount: "9 this year",
    slates: [
      {
        pre: "Trans ",
        em: "composers",
        post: ", 1972–now",
        date: "28 May · 12 tracks",
        out: (
          <>
            <em>12</em> paid
          </>
        ),
      },
      {
        pre: "Songs for ",
        em: "insomnia",
        date: "14 May · 22 tracks",
        out: (
          <>
            <em>€4.10</em> out
          </>
        ),
      },
    ],
    stat: (
      <>
        <em>148</em> tracks programmed · <em>61</em> artists paid
      </>
    ),
    image:
      "https://images.unsplash.com/flagged/photo-1555604858-34f65cfdc1db?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    seat: "Seat 3",
    pre: "Yara ",
    em: "Reis",
    where: ["Lisbon", "sound archivist", "since 2024"],
    bio: (
      <>
        Keeper of the <em>Lisbon dyke-bar standards</em> archive — field
        recordings, bootlegs, the songs that only existed in one room on one
        night.
      </>
    ),
    noteDate: "2 Jun",
    note: (
      <>
        "A recording held for clearance is not a recording withheld from you.
        It's a recording <em>waiting to pay the right person</em>."
      </>
    ),
    slatesCount: "11 this year",
    slates: [
      {
        pre: "Lisbon dyke-bar ",
        em: "standards",
        date: "21 May · 28 tracks",
        out: (
          <>
            <em>€9.30</em> out
          </>
        ),
      },
      {
        pre: "Almost ",
        em: "asleep",
        date: "9 May · 31 tracks",
        out: (
          <>
            <em>€5.80</em> out
          </>
        ),
      },
    ],
    stat: (
      <>
        <em>204</em> tracks programmed · <em>73</em> artists paid
      </>
    ),
    image:
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "coral",
    seat: "Seat 2",
    pre: "João ",
    em: "Ribeiro",
    where: ["Porto", "producer", "since 2025"],
    bio: (
      <>
        The one who programs the warm-ups and the come-downs. Runs the{" "}
        <em>made here</em> strand for first releases by members.
      </>
    ),
    noteDate: "30 May",
    note: (
      <>
        "Gave the spring grant to seven first-timers this week. Not one has a
        manager. <em>Good.</em> The point was never to find the ready — it was
        to make people ready."
      </>
    ),
    slatesCount: "7 this year",
    slates: [
      {
        pre: "Kitchen ",
        em: "warm-up",
        date: "23 May · 9 tracks",
        out: (
          <>
            <em>€3.20</em> out
          </>
        ),
      },
      {
        pre: "Made ",
        em: "here",
        post: ", spring",
        date: "16 May · 5 tracks",
        out: (
          <>
            <em>€5.5k</em> grant
          </>
        ),
      },
    ],
    stat: (
      <>
        <em>96</em> tracks programmed · <em>44</em> artists paid
      </>
    ),
    image:
      "https://images.unsplash.com/photo-1513517178-1aca306e52a9?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "jade",
    seat: "Seat 5",
    pre: "Akin ",
    em: "Diallo",
    where: ["Dakar / Paris", "artist-curator", "since 2025"],
    bio: (
      <>
        The only working touring artist on the council — programs from the road.
        Recuses from any vote on his own releases.
      </>
    ),
    noteDate: "27 May",
    note: (
      <>
        "Programmed from a dressing room in Marseille tonight. The council
        should always have one person who's{" "}
        <em>tired in the way the artists are tired</em>."
      </>
    ),
    slatesCount: "6 this year",
    slates: [
      {
        pre: "Salt water, ",
        em: "slowly",
        date: "19 May · 10 tracks",
        out: (
          <>
            <em>€4.60</em> out
          </>
        ),
      },
      {
        pre: "The long way ",
        em: "home",
        date: "5 May · 14 tracks",
        out: (
          <>
            <em>€6.10</em> out
          </>
        ),
      },
    ],
    stat: (
      <>
        <em>84</em> tracks programmed · <em>52</em> artists paid
      </>
    ),
    image:
      "https://images.unsplash.com/photo-1514960919797-5ff58c52e5ba?q=80&w=800&auto=format&fit=crop",
  },
  {
    tint: "plum",
    seat: "Seat 6 · newest",
    pre: "Helena ",
    em: "Pinto",
    where: ["Braga", "choir director", "since 2026"],
    bio: (
      <>
        Came up through community choirs and brought all of them with her.
        Programs the choral and the congregational. Elected at the last
        assembly.
      </>
    ),
    noteDate: "24 May",
    note: (
      <>
        "My first month on the council. I keep wanting to apologise for picking
        so much choir music. Then I remember: <em>nobody else will</em>, and the
        choirs need paying too."
      </>
    ),
    slatesCount: "3 this year",
    slates: [
      {
        pre: "Vespers, ",
        em: "recorded",
        date: "17 May · 12 tracks",
        out: (
          <>
            <em>€3.40</em> out
          </>
        ),
      },
      {
        pre: "Fifteen voices, one ",
        em: "stairwell",
        date: "10 May · 8 tracks",
        out: (
          <>
            <em>€2.80</em> out
          </>
        ),
      },
    ],
    stat: (
      <>
        <em>28</em> tracks programmed · <em>19</em> artists paid
      </>
    ),
    image:
      "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=800&auto=format&fit=crop",
  },
];
