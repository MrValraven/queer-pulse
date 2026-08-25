import type { ReactNode } from "react";
import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";
import { routes } from "../../app/routeMap";

export interface CuratorStat {
  k: string;
  v: ReactNode;
}

export interface CuratorProgramme {
  week: string;
  poster?: string;
  posterTint: ImageSlotTint;
  eyebrow: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: string;
  note: ReactNode;
  to: string;
}

export interface CuratorCollection {
  eyebrow: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  foot: string;
  status: string;
  statusKind: "active" | "new";
  to: string;
}

export interface CuratorNote {
  week: string;
  quote: ReactNode;
  foot: string;
  to: string;
}

export interface CuratorProfile {
  slug: string;
  portrait?: string;
  /** Aside avatar. */
  initials: string;
  tone: "coral" | "jade" | "plum";
  kicker: { label: string; jade?: boolean }[];
  namePre: string;
  nameEm: string;
  pronouns: string;
  identity: string[];
  bio: ReactNode;
  pull: ReactNode;
  /** Aside "focus" line + hero chips source. */
  focus: string[];
  stats: CuratorStat[];
  programmes: CuratorProgramme[];
  programmesTotal: number;
  collections: CuratorCollection[];
  notebook: CuratorNote[];
  notebookTotal: number;
  /** Outro CTA target. */
  leadCollectionTo: string;
  outroSub: string;
  links: { label: string; to: string }[];
}

const collection = (slug: string) => `${routes.cinemaCollections}/${slug}`;

export const CURATORS: Record<string, CuratorProfile> = {
  "joao-ribeiro": {
    slug: "joao-ribeiro",
    portrait:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    initials: "JR",
    tone: "coral",
    kicker: [
      { label: "Curator" },
      { label: "Programming lead" },
      { label: "Council since 2024", jade: true },
    ],
    namePre: "João ",
    nameEm: "Ribeiro",
    pronouns: "he/him · Lisbon",
    identity: ["Gay", "Portuguese", "Documentary", "Archive"],
    bio: (
      <>
        Programming lead and founding council member. João is a film critic and
        archivist based in Marvila, Lisbon. He has written on Portuguese cinema
        for Expresso, Público, and DocLisboa. His programming thesis is,
        roughly:{" "}
        <em>
          that the room where queer people lived always precedes the film about
          it.
        </em>
      </>
    ),
    pull: (
      <>
        "I programme the cover film each week. I try to choose something that
        resists the easy arc: <em>no coming out, no reveal, no redemption</em>.
        Just people, in rooms, living."
      </>
    ),
    focus: ["PT", "Documentary", "Archive"],
    stats: [
      { k: "Films programmed", v: <em>68</em> },
      { k: "Collections curated", v: <em>3</em> },
      { k: "Weeks as cover programmer", v: <em>23</em> },
      { k: "Notebook essays", v: <em>46</em> },
    ],
    programmes: [
      {
        week: "Week 23",
        poster:
          "https://images.unsplash.com/photo-1753944847480-92f369a5f00e?q=80&w=300&auto=format&fit=crop",
        posterTint: "plum",
        eyebrow: "Cover film · documentary · 92 min",
        titlePre: "The light ",
        titleEm: "between",
        titlePost: " rooms",
        meta: "Maria Vasconcelos · Portugal, 2025",
        note: (
          <>
            "A patient, generous film about Lisbon's working-class queer elders,
            made over three years in the kitchens that raised them.{" "}
            <em>Stay for the second hour.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 21",
        poster:
          "https://images.unsplash.com/photo-1711479898431-9031deb4ff0e?q=80&w=300&auto=format&fit=crop",
        posterTint: "coral",
        eyebrow: "Cover film · feature · 118 min",
        titlePre: "Mother, ",
        titleEm: "weather",
        meta: "Yuki Tanaka · Japan, 2024",
        note: (
          <>
            "Tanaka takes a premise that could be sentimental (son cooks dinner
            to come out) and makes something almost Ozu-like from it.{" "}
            <em>The patience of it.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 18",
        poster:
          "https://images.unsplash.com/photo-1618410321132-9f4cebb2f7f5?q=80&w=300&auto=format&fit=crop",
        posterTint: "jade",
        eyebrow: "Cover film · archive · 94 min",
        titlePre: "O Crime ",
        titleEm: "do Padre Amaro",
        meta: "Carlos Coelho · Portugal, 1967",
        note: (
          <>
            "Watch it as coded silence. The thing that cannot be named
            accumulates until the last scene.{" "}
            <em>It's the most Portuguese film in the archive.</em>"
          </>
        ),
        to: routes.film,
      },
    ],
    programmesTotal: 23,
    collections: [
      {
        eyebrow: "Collection · lead curator",
        titlePre: "Iberian queer cinema, ",
        titleEm: "1974–now",
        foot: "24 films · 37h",
        status: "Active",
        statusKind: "active",
        to: collection("iberian-queer-cinema"),
      },
      {
        eyebrow: "Collection · lead curator",
        titlePre: "Queer elders: ",
        titleEm: "portrait",
        titlePost: " films",
        foot: "12 films · 22h",
        status: "Active",
        statusKind: "active",
        to: routes.cinemaCollections,
      },
      {
        eyebrow: "Collection · co-curator with Sofía Castro",
        titlePre: "Galician & ",
        titleEm: "borderland",
        titlePost: " cinema",
        foot: "7 films · 9h",
        status: "New",
        statusKind: "new",
        to: routes.cinemaCollections,
      },
    ],
    notebook: [
      {
        week: "Week 23 · 9 June 2026",
        quote: (
          <>
            "We chose six films this week that share one thing: they refuse the
            cleanness of the coming-out arc. They are messy, slow, alive.{" "}
            <em>Watch them in the order you want.</em>"
          </>
        ),
        foot: "On this week's programme",
        to: routes.cinema,
      },
      {
        week: "Week 18 · 4 May 2026",
        quote: (
          <>
            "There is a difference between a film that was made in secret and a
            film that feels like a secret. O Crime do Padre Amaro is both.{" "}
            <em>
              I have watched it six times and each time the last scene surprises
              me.
            </em>
            "
          </>
        ),
        foot: "On the archive pick",
        to: routes.cinema,
      },
      {
        week: "Week 12 · 23 March 2026",
        quote: (
          <>
            "What Tanaka does with domestic space, the way the kitchen is both{" "}
            <em>staging ground and safe room</em>, is exactly what I'm trying to
            find in everything we programme."
          </>
        ),
        foot: "On Mother, weather",
        to: routes.cinema,
      },
    ],
    notebookTotal: 46,
    leadCollectionTo: collection("iberian-queer-cinema"),
    outroSub:
      "Every film João chooses has a reason. Read his notebook. Watch in order.",
    links: [
      {
        label: "View QueerPulse profile",
        to: `${routes.members}/joao-ribeiro`,
      },
    ],
  },

  "d-okoye": {
    slug: "d-okoye",
    initials: "DO",
    tone: "jade",
    kicker: [{ label: "Curator" }, { label: "Council since 2024", jade: true }],
    namePre: "D. ",
    nameEm: "Okoye",
    pronouns: "they/them · Lagos / London",
    identity: ["Queer", "Nigerian", "Ballroom", "Trans docs"],
    bio: (
      <>
        West African ballroom, diaspora cinema, and trans documentary. Okoye
        programmes for genuine collaboration:{" "}
        <em>where the subject and the filmmaker are in the room together</em>,
        not one looking at the other.
      </>
    ),
    pull: (
      <>
        "I will not programme a film that watches its subjects from the outside.{" "}
        <em>The camera has to be let in.</em>"
      </>
    ),
    focus: ["West Africa", "Ballroom", "Trans"],
    stats: [
      { k: "Films programmed", v: <em>31</em> },
      { k: "Collections curated", v: <em>1</em> },
      { k: "Weeks as cover programmer", v: <em>9</em> },
      { k: "Notebook essays", v: <em>14</em> },
    ],
    programmes: [
      {
        week: "Week 20",
        posterTint: "coral",
        eyebrow: "Cover film · documentary · 88 min",
        titlePre: "Houses of ",
        titleEm: "Lagos",
        meta: "Ada Nwosu · Nigeria / UK, 2025",
        note: (
          <>
            "A ballroom film made from inside the houses, by the people who live
            there. <em>Nobody here is being explained.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 15",
        posterTint: "jade",
        eyebrow: "Cover film · documentary · 76 min",
        titlePre: "After the ",
        titleEm: "crossing",
        meta: "Kwame Mensah · Ghana, 2023",
        note: (
          <>
            "A trans migration story that refuses to be only about the border.{" "}
            <em>The best hour is the ordinary one.</em>"
          </>
        ),
        to: routes.film,
      },
    ],
    programmesTotal: 9,
    collections: [
      {
        eyebrow: "Collection · lead curator",
        titlePre: "Trans documentaries ",
        titleEm: "of the 2020s",
        foot: "14 films · 19h",
        status: "Active",
        statusKind: "active",
        to: collection("trans-documentaries-2020s"),
      },
    ],
    notebook: [
      {
        week: "Week 20 · 19 May 2026",
        quote: (
          <>
            "Collaboration is not a credit at the end. It is who holds the
            camera, who decides the cut, <em>who gets to say stop</em>."
          </>
        ),
        foot: "On Houses of Lagos",
        to: routes.cinema,
      },
    ],
    notebookTotal: 14,
    leadCollectionTo: collection("trans-documentaries-2020s"),
    outroSub: "Okoye programmes for collaboration. Watch who holds the camera.",
    links: [{ label: "View QueerPulse profile", to: routes.members }],
  },

  "sara-marques": {
    slug: "sara-marques",
    initials: "SM",
    tone: "coral",
    kicker: [{ label: "Curator" }, { label: "Council since 2024", jade: true }],
    namePre: "Sara ",
    nameEm: "Marques",
    pronouns: "she/her · Lisbon",
    identity: ["Queer", "Portuguese", "Narrative", "Made here"],
    bio: (
      <>
        Narrative feature and generational storytelling. Sara programmes the
        Made Here track, manages filmmaker submissions, and writes the weekly
        curator's notebook. <em>She reads every pitch that comes in.</em>
      </>
    ),
    pull: (
      <>
        "Made here does not mean small. It means{" "}
        <em>the person who made it can walk to the screening</em>."
      </>
    ),
    focus: ["Narrative", "Made here", "PT/BR"],
    stats: [
      { k: "Films programmed", v: <em>41</em> },
      { k: "Collections curated", v: <em>2</em> },
      { k: "Weeks as cover programmer", v: <em>12</em> },
      { k: "Notebook essays", v: <em>28</em> },
    ],
    programmes: [
      {
        week: "Week 22",
        posterTint: "plum",
        eyebrow: "Cover film · feature · 104 min",
        titlePre: "Rooms we ",
        titleEm: "rented",
        meta: "Beatriz Lima · Portugal, 2025",
        note: (
          <>
            "Three generations in one Lisbon flat. It could have been a play; it
            is entirely a film. <em>Watch the hands.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 17",
        posterTint: "coral",
        eyebrow: "Made here · short · 24 min",
        titlePre: "Noite de ",
        titleEm: "fado",
        meta: "Made-here track · Portugal, 2024",
        note: (
          <>
            "The clearest thing we programmed all season.{" "}
            <em>Made ten minutes from the room.</em>"
          </>
        ),
        to: routes.film,
      },
    ],
    programmesTotal: 12,
    collections: [
      {
        eyebrow: "Collection · lead curator",
        titlePre: "Films our parents ",
        titleEm: "could watch",
        foot: "16 films · 26h",
        status: "Active",
        statusKind: "active",
        to: collection("films-our-parents-could-watch"),
      },
    ],
    notebook: [
      {
        week: "Week 22 · 2 June 2026",
        quote: (
          <>
            "The Made Here track is not a charity slot. It is the argument that{" "}
            <em>proximity is a kind of authorship</em>."
          </>
        ),
        foot: "On the Made Here track",
        to: routes.cinema,
      },
    ],
    notebookTotal: 28,
    leadCollectionTo: collection("films-our-parents-could-watch"),
    outroSub: "Sara programmes what was made here. Watch who could walk in.",
    links: [{ label: "View QueerPulse profile", to: routes.members }],
  },

  "yara-reis": {
    slug: "yara-reis",
    initials: "YR",
    tone: "plum",
    kicker: [{ label: "Curator" }, { label: "Council since 2024", jade: true }],
    namePre: "Yara ",
    nameEm: "Reis",
    pronouns: "she/her · São Paulo",
    identity: ["Lesbian", "Brazilian", "Sci-fi", "Speculative"],
    bio: (
      <>
        Lesbian sci-fi, speculative documentary, and non-Western queer futures.
        Yara manages the East Asian and Latin American collection tracks.{" "}
        <em>She programmes the future tense.</em>
      </>
    ),
    pull: (
      <>
        "Every speculative film is a documentary about the present.{" "}
        <em>The spaceship is always a country.</em>"
      </>
    ),
    focus: ["Sci-fi", "BR", "East Asia"],
    stats: [
      { k: "Films programmed", v: <em>27</em> },
      { k: "Collections curated", v: <em>1</em> },
      { k: "Weeks as cover programmer", v: <em>7</em> },
      { k: "Notebook essays", v: <em>11</em> },
    ],
    programmes: [
      {
        week: "Week 19",
        posterTint: "jade",
        eyebrow: "Cover film · feature · 111 min",
        titlePre: "The last ",
        titleEm: "orbit",
        meta: "Mei Lin · Taiwan, 2025",
        note: (
          <>
            "Two women, one station, no rescue coming.{" "}
            <em>It is the most tender thing we showed all year.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 13",
        posterTint: "coral",
        eyebrow: "Cover film · feature · 96 min",
        titlePre: "Cidade ",
        titleEm: "futura",
        meta: "Luana Costa · Brazil, 2024",
        note: (
          <>
            "A favela imagined fifty years on, still queer, still standing.{" "}
            <em>Speculation as survival.</em>"
          </>
        ),
        to: routes.film,
      },
    ],
    programmesTotal: 7,
    collections: [
      {
        eyebrow: "Collection · lead curator",
        titlePre: "Lesbian ",
        titleEm: "sci-fi",
        foot: "11 films · 17h",
        status: "Active",
        statusKind: "active",
        to: collection("lesbian-sci-fi"),
      },
    ],
    notebook: [
      {
        week: "Week 19 · 12 May 2026",
        quote: (
          <>
            "We keep asking what a queer future looks like.{" "}
            <em>These filmmakers already live there and send back footage.</em>"
          </>
        ),
        foot: "On Lesbian sci-fi",
        to: routes.cinema,
      },
    ],
    notebookTotal: 11,
    leadCollectionTo: collection("lesbian-sci-fi"),
    outroSub: "Yara programmes the future tense. Watch what they send back.",
    links: [{ label: "View QueerPulse profile", to: routes.members }],
  },

  "sofia-castro": {
    slug: "sofia-castro",
    initials: "SC",
    tone: "jade",
    kicker: [{ label: "Curator" }, { label: "Council since 2024", jade: true }],
    namePre: "Sofía ",
    nameEm: "Castro",
    pronouns: "ella/ella · Madrid",
    identity: ["Queer", "Spanish", "Galician", "Regional"],
    bio: (
      <>
        Spanish and Galician queer cinema. Sofía co-curates the Iberian
        collection with João and specialises in regional cinema and languages
        that never appear in mainstream catalogues.{" "}
        <em>She programmes in the languages the market forgets.</em>
      </>
    ),
    pull: (
      <>
        "A language is not a subtitle problem.{" "}
        <em>It is who a film is allowed to be for.</em>"
      </>
    ),
    focus: ["ES", "Galician", "Regional"],
    stats: [
      { k: "Films programmed", v: <em>22</em> },
      { k: "Collections curated", v: <em>2</em> },
      { k: "Weeks as cover programmer", v: <em>6</em> },
      { k: "Notebook essays", v: <em>9</em> },
    ],
    programmes: [
      {
        week: "Week 16",
        posterTint: "plum",
        eyebrow: "Cover film · feature · 99 min",
        titlePre: "A marea ",
        titleEm: "vermella",
        meta: "Uxía Vázquez · Spain (Galician), 2024",
        note: (
          <>
            "A Galician-language love story the festivals filed under Spanish.{" "}
            <em>We filed it correctly.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 11",
        posterTint: "coral",
        eyebrow: "Cover film · feature · 108 min",
        titlePre: "Verano sin ",
        titleEm: "nombre",
        meta: "Rosa Iglesias · Spain, 2023",
        note: (
          <>
            "Small-town Andalucía, one long summer, nothing named until it has
            to be. <em>The heat does the talking.</em>"
          </>
        ),
        to: routes.film,
      },
    ],
    programmesTotal: 6,
    collections: [
      {
        eyebrow: "Collection · co-curator with João Ribeiro",
        titlePre: "Iberian queer cinema, ",
        titleEm: "1974–now",
        foot: "24 films · 37h",
        status: "Active",
        statusKind: "active",
        to: collection("iberian-queer-cinema"),
      },
    ],
    notebook: [
      {
        week: "Week 16 · 28 April 2026",
        quote: (
          <>
            "When we say Iberian we mean the plural.{" "}
            <em>
              Galician, Basque, Catalan, Portuguese: the border is the subject.
            </em>
            "
          </>
        ),
        foot: "On Iberian queer cinema",
        to: routes.cinema,
      },
    ],
    notebookTotal: 9,
    leadCollectionTo: collection("iberian-queer-cinema"),
    outroSub:
      "Sofía programmes the languages the market forgets. Watch in the plural.",
    links: [{ label: "View QueerPulse profile", to: routes.members }],
  },

  "laila-hassan": {
    slug: "laila-hassan",
    initials: "LH",
    tone: "coral",
    kicker: [{ label: "Curator" }, { label: "Council since 2024", jade: true }],
    namePre: "Laila ",
    nameEm: "Hassan",
    pronouns: "she/her · Cairo / London",
    identity: ["Queer", "Egyptian", "Archive", "Access"],
    bio: (
      <>
        North African and Middle Eastern cinema and the politics of archiving
        under censorship. Laila manages the access and translation programme.{" "}
        <em>She keeps the films that were meant to disappear.</em>
      </>
    ),
    pull: (
      <>
        "An archive under censorship is not neutral storage.{" "}
        <em>It is an argument that this happened.</em>"
      </>
    ),
    focus: ["MENA", "Archive", "Access"],
    stats: [
      { k: "Films programmed", v: <em>19</em> },
      { k: "Collections curated", v: <em>1</em> },
      { k: "Weeks as cover programmer", v: <em>5</em> },
      { k: "Notebook essays", v: <em>8</em> },
    ],
    programmes: [
      {
        week: "Week 14",
        posterTint: "jade",
        eyebrow: "Cover film · archive · 71 min",
        titlePre: "Letters from ",
        titleEm: "Alexandria",
        meta: "Restored · Egypt, 1979",
        note: (
          <>
            "Thought lost for forty years. What survives is a coded, tender,
            furious film. <em>Someone hid this on purpose.</em>"
          </>
        ),
        to: routes.film,
      },
      {
        week: "Week 9",
        posterTint: "coral",
        eyebrow: "Cover film · documentary · 84 min",
        titlePre: "The quiet ",
        titleEm: "channel",
        meta: "Yasmin Haddad · Lebanon, 2022",
        note: (
          <>
            "On the underground networks that kept queer film moving.{" "}
            <em>Distribution as resistance.</em>"
          </>
        ),
        to: routes.film,
      },
    ],
    programmesTotal: 5,
    collections: [
      {
        eyebrow: "Collection · lead curator",
        titlePre: "Archived under ",
        titleEm: "censorship",
        foot: "9 films · 11h",
        status: "New",
        statusKind: "new",
        to: routes.cinemaCollections,
      },
    ],
    notebook: [
      {
        week: "Week 14 · 14 April 2026",
        quote: (
          <>
            "Access and archive are the same programme.{" "}
            <em>A film nobody can reach has been censored twice.</em>"
          </>
        ),
        foot: "On the access programme",
        to: routes.cinema,
      },
    ],
    notebookTotal: 8,
    leadCollectionTo: routes.cinemaCollections,
    outroSub:
      "Laila keeps the films that were meant to disappear. Watch what survived.",
    links: [{ label: "View QueerPulse profile", to: routes.members }],
  },
};

/** Full display name → slug, for linking curator credits elsewhere in the app. */
const NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.values(CURATORS).map((c) => [
    `${c.namePre.trim()} ${c.nameEm}`,
    c.slug,
  ]),
);

/** Resolve a full curator name (e.g. "João Ribeiro") to a profile slug, if any. */
export function curatorSlugForName(name: string): string | undefined {
  return NAME_TO_SLUG[name.trim()];
}
