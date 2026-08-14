import type { ReactNode } from "react";
import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";

export interface CollectionCurator {
  initials: string;
  name: string;
  role: string;
}

export interface CollectionStat {
  k: string;
  v: ReactNode;
}

export interface CollectionRow {
  k: string;
  v: ReactNode;
}

export interface CollectionFilm {
  num: string;
  tint: ImageSlotTint;
  image?: string;
  /** Small coral label above the title, e.g. "Archive" or a first-timer pick. */
  kicker: string;
  /** Grey format line, e.g. "Feature · 1967 · 94 min". */
  kind: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: string;
  /** Curator's argument for the film's placement. */
  why: ReactNode;
  who: string;
  tags: string[];
  /** Access price label, e.g. "Free", "Sustainer", "Rent · €3". */
  price: string;
  free?: boolean;
  /** Primary vs ghost watch button. */
  primary?: boolean;
  /** Optional secondary action (usually a rent option). */
  secondary?: string;
}

export interface RelatedCollection {
  av: string;
  slug: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  by: string;
}

export interface CollectionDetail {
  crumbTitle: string;
  tagLine: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  stats: CollectionStat[];
  curators: CollectionCurator[];
  essayIntro: ReactNode;
  essayBody: ReactNode[];
  details: CollectionRow[];
  detailsNote: string;
  orderNote?: ReactNode;
  films: CollectionFilm[];
  showingNote?: string;
  seeAllLabel?: string;
  totalFilms: number;
  progressNote: string;
  related: RelatedCollection[];
}

const iberian: CollectionDetail = {
  crumbTitle: "Iberian queer cinema, 1974–now",
  tagLine: "Collection · updated seasonally",
  titlePre: "Iberian queer cinema, ",
  titleEm: "1974–now",
  stats: [
    { k: "Films", v: <em>24</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>37h</em> 14m
        </>
      ),
    },
    { k: "Free to watch", v: <em>9</em> },
    { k: "Sustainer", v: <em>15</em> },
  ],
  curators: [
    { initials: "JR", name: "João Ribeiro", role: "Lead curator" },
    { initials: "SC", name: "Sofía Castro", role: "Co-curator" },
  ],
  essayIntro:
    "“The collection is an argument about continuity. That queer Iberian cinema did not begin in 1978 with the transition to democracy. It began with the first person who pointed a camera at something they were told not to show.”",
  essayBody: [
    "We started building this collection in early 2024, João and I, with a shared feeling of frustration: every retrospective we'd seen of Iberian queer cinema treated the Carnation Revolution as Year Zero. As if the image-making before it had been purely heterosexual, purely obedient. It hadn't.",
    <>
      The first twelve films in this collection are, deliberately, from before
      1978. Some are coded. Some are oblique. <em>None are invisible.</em> We
      watch them now with a literacy that their makers didn't have, but they
      made them anyway. That is what we wanted to start with.
    </>,
    "The second half of the collection moves from Almodóvar, whose queer vision came partly from watching the Iberian films that couldn't show what they were, through to the current generation of Portuguese and Spanish directors for whom queerness is simply a given condition of the frame. From Marvila to Madrid, from TikTok-native short to three-hour installation work.",
    <>
      Watch in order, at least once. The argument only lands if you feel the
      distance from film 01 to film 24. <em>After that, wander.</em>
    </>,
  ],
  details: [
    {
      k: "Languages",
      v: (
        <>
          PT · ES · <em>GL</em>
        </>
      ),
    },
    {
      k: "Years",
      v: (
        <>
          1967–<em>2026</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    {
      k: "Countries",
      v: (
        <>
          PT · ES · <em>+2</em>
        </>
      ),
    },
    { k: "Last updated", v: <em>Jun 2026</em> },
  ],
  detailsNote:
    "Two films added in June 2026. Sofía added a new section on Galician cinema: films 21–24.",
  orderNote: (
    <>
      The order matters. <strong>Films 01–12</strong> are pre-democracy
      (1967–1978): they're coded, oblique, and worth watching in sequence before
      you reach film 13. <em>After that, you can wander freely</em>. The second
      half doesn't have a fixed argument. If you're short on time, films 05, 13,
      and 20 are the three we'd pick first.
    </>
  ),
  films: [
    {
      num: "01",
      tint: "plum",
      kicker: "Archive",
      kind: "Feature · 1967 · 94 min",
      titlePre: "O Crime ",
      titleEm: "do Padre Amaro",
      meta: "Carlos Coelho · Portugal · 1967",
      why: "“Watch it as coded silence: the thing that cannot be named accumulates until the last scene. It's the most Portuguese film in the collection.”",
      who: "João Ribeiro",
      tags: ["PT spoken", "EN subs", "Archive print"],
      price: "Free",
      free: true,
    },
    {
      num: "05",
      tint: "coral",
      kicker: "Recommended first-timer pick",
      kind: "Feature · 1974 · 112 min",
      titlePre: "A Noite ",
      titleEm: "Partida",
      meta: "Manuela Viegas · Portugal · 1974",
      why: "“Made the year of the revolution. Shot in secret in the Bairro Alto. The first feature by a Portuguese woman director, and she put queer women in it without apology.”",
      who: "Sofía Castro",
      tags: ["PT spoken", "EN subs", "PT subs"],
      price: "Sustainer",
      primary: true,
      secondary: "Rent · €3",
    },
    {
      num: "13",
      tint: "jade",
      kicker: "Recommended first-timer pick",
      kind: "Feature · 1988 · 101 min",
      titlePre: "Mujeres ",
      titleEm: "al borde",
      titlePost: " de un ataque de nervios",
      meta: "Pedro Almodóvar · Spain · 1988",
      why: "“The film that changed what Spanish cinema thought it was allowed to be. Watch it here, after the first twelve, and you'll feel exactly why.”",
      who: "João Ribeiro",
      tags: ["ES spoken", "EN subs", "PT subs"],
      price: "Sustainer",
      primary: true,
    },
    {
      num: "20",
      tint: "coral",
      kicker: "Recommended first-timer pick",
      kind: "Documentary · 2021 · 78 min",
      titlePre: "Bicha, ",
      titleEm: "Portuguesa",
      meta: "Rui Santos · Portugal · 2021",
      why: (
        <>
          “The film that first made me believe QueerPulse Cinema could exist.
          Rui interviews the men who <em>were</em> the Portuguese queer
          underground in the 1990s. Devastating and funny in equal measure.”
        </>
      ),
      who: "João Ribeiro",
      tags: ["PT spoken", "EN subs", "Audio description", "LGP track"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "24",
      tint: "plum",
      kicker: "New · added June 2026",
      kind: "Short · 2026 · 14 min",
      titlePre: "O que ",
      titleEm: "fica",
      meta: "Inês Lourenço · Galicia/Portugal · 2026",
      why: "“The last entry in the collection, and the newest. Inês made this at 22. It's in Galician, which is not technically Portuguese and not quite Spanish, and that liminality is what the film is about.”",
      who: "Sofía Castro",
      tags: ["GL spoken", "EN subs", "PT subs", "New"],
      price: "Free",
      free: true,
      primary: true,
    },
  ],
  showingNote:
    "Showing 5 of 24 films. Films 02–04, 06–12, 14–19, 21–23 are in the full list.",
  seeAllLabel: "See all 24 films",
  totalFilms: 24,
  progressNote: "2 of 24 watched · 35h 14m remaining",
  related: [
    {
      av: "T",
      slug: "trans-documentaries-2020s",
      titlePre: "Trans documentaries: ",
      titleEm: "the 2020s",
      by: "D. Okoye · 12 films",
    },
    {
      av: "P",
      slug: "films-our-parents-could-watch",
      titlePre: "Films our parents ",
      titleEm: "could",
      titlePost: " watch",
      by: "Sara Marques · 9 films · all free",
    },
    {
      av: "L",
      slug: "lesbian-sci-fi",
      titlePre: "Lesbian sci-fi, ",
      titleEm: "'78 to tomorrow",
      by: "Yara Reis · 18 films",
    },
  ],
};

const transDocs: CollectionDetail = {
  crumbTitle: "Trans documentaries: the 2020s",
  tagLine: "Collection · updated seasonally",
  titlePre: "Trans documentaries: ",
  titleEm: "the 2020s",
  stats: [
    { k: "Films", v: <em>12</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>18h</em> 02m
        </>
      ),
    },
    { k: "Free to watch", v: <em>3</em> },
    { k: "By trans makers", v: <em>5</em> },
  ],
  curators: [{ initials: "DO", name: "D. Okoye", role: "Lead curator" }],
  essayIntro:
    "“A documentary about a trans person is not the same thing as a documentary made with one. This collection is about the second kind: where the subject holds the edit as much as the director does.”",
  essayBody: [
    "The decade is barely half over and it has already produced more trans-authored documentary than the four before it combined. I wanted to gather the films that treat their subjects as collaborators rather than case studies: where consent is ongoing, and the camera can be told to stop.",
    <>
      Five of the twelve are directed by trans filmmakers. The other seven I
      chose because the people in front of the lens were given final say over
      the cut. <em>That distinction is the whole collection.</em>
    </>,
    "There's no single argument to watch in order here. Start anywhere. But if you only have one evening, begin with the two free titles. They're the gentlest doors into the rest.",
  ],
  details: [
    { k: "Languages", v: "EN · PT · FR" },
    {
      k: "Years",
      v: (
        <>
          2020–<em>2026</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    {
      k: "Countries",
      v: (
        <>
          UK · PT · <em>+3</em>
        </>
      ),
    },
    { k: "Last updated", v: <em>May 2026</em> },
  ],
  detailsNote:
    "Every subject in this collection reviewed their own film before it was added. Three asked for changes; all three were made.",
  films: [
    {
      num: "01",
      tint: "coral",
      kicker: "Start here",
      kind: "Documentary · 2020 · 82 min",
      titlePre: "The Making ",
      titleEm: "of Us",
      meta: "Andile Okoye · UK · 2020",
      why: "“The first film I ever co-directed with its subject. She kept a veto over the final cut and used it twice. Both times the film got better.”",
      who: "D. Okoye",
      tags: ["EN spoken", "PT subs", "Audio description"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "04",
      tint: "jade",
      kicker: "Start here",
      kind: "Documentary · 2022 · 64 min",
      titlePre: "Hormone ",
      titleEm: "City",
      meta: "Vera Nunes · Portugal · 2022",
      why: "“A year inside a Lisbon peer-support clinic, shot entirely by the people who use it. No outside crew ever entered the room.”",
      who: "D. Okoye",
      tags: ["PT spoken", "EN subs"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "08",
      tint: "plum",
      kicker: "By a trans filmmaker",
      kind: "Documentary · 2024 · 96 min",
      titlePre: "Letters to ",
      titleEm: "Marsha",
      meta: "Kel Ferreira · Brazil/Portugal · 2024",
      why: (
        <>
          “Kel spent three years finding the people Marsha's story reached in
          the Lusophone world. <em>It's an inheritance film</em>, about what we
          pass down when there are no institutions to hold it.”
        </>
      ),
      who: "D. Okoye",
      tags: ["PT spoken", "EN subs", "LGP track"],
      price: "Sustainer",
      primary: true,
      secondary: "Rent · €3",
    },
    {
      num: "12",
      tint: "coral",
      kicker: "New · added May 2026",
      kind: "Documentary · 2026 · 71 min",
      titlePre: "After the ",
      titleEm: "Archive",
      meta: "Robin Tavares · Portugal · 2026",
      why: "“The newest film here, and the one that argues hardest that the 2020s aren't over. It ends mid-sentence. On purpose.”",
      who: "D. Okoye",
      tags: ["PT spoken", "EN subs", "New"],
      price: "Sustainer",
      primary: true,
    },
  ],
  showingNote:
    "Showing 4 of 12 films. Films 02–03, 05–07, 09–11 are in the full list.",
  seeAllLabel: "See all 12 films",
  totalFilms: 12,
  progressNote: "0 of 12 watched · 18h 02m remaining",
  related: [
    {
      av: "I",
      slug: "iberian-queer-cinema",
      titlePre: "Iberian queer cinema, ",
      titleEm: "1974–now",
      by: "João Ribeiro & Sofía Castro · 24 films",
    },
    {
      av: "P",
      slug: "films-our-parents-could-watch",
      titlePre: "Films our parents ",
      titleEm: "could",
      titlePost: " watch",
      by: "Sara Marques · 9 films · all free",
    },
    {
      av: "L",
      slug: "lesbian-sci-fi",
      titlePre: "Lesbian sci-fi, ",
      titleEm: "'78 to tomorrow",
      by: "Yara Reis · 18 films",
    },
  ],
};

const parents: CollectionDetail = {
  crumbTitle: "Films our parents could watch",
  tagLine: "Collection · a bridge collection",
  titlePre: "Films our parents ",
  titleEm: "could",
  titlePost: " watch",
  stats: [
    { k: "Films", v: <em>9</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>14h</em> 08m
        </>
      ),
    },
    { k: "Free to watch", v: <em>9</em> },
    { k: "Rating", v: "Gentle" },
  ],
  curators: [{ initials: "SM", name: "Sara Marques", role: "Curator" }],
  essayIntro:
    "“I made this collection for the phone call after. The one where your mother asks what the film was about, and you don't have to translate yourself to answer.”",
  essayBody: [
    "Not every queer film has to be a confrontation. Some of them are just quiet, generous, and translatable across a generation. That's what this collection is: nine films you could put on with a parent, an aunt, or the friend who is still working it out, and no one has to brace.",
    <>
      All nine are free, on purpose. <em>A bridge shouldn't have a toll.</em> If
      one of these opens a conversation you've been avoiding, that's the whole
      collection doing its job.
    </>,
    "Watch in any order. There's no argument here, only an invitation. Bring someone.",
  ],
  details: [
    { k: "Languages", v: "PT · EN" },
    {
      k: "Years",
      v: (
        <>
          1996–<em>2025</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    { k: "Access", v: <em>All free</em> },
    { k: "Last updated", v: <em>Apr 2026</em> },
  ],
  detailsNote:
    "Chosen with the help of the QueerPulse family-support room. If a film here caused a hard conversation to go well, tell us. It earns its place.",
  films: [
    {
      num: "01",
      tint: "jade",
      kicker: "Gentle open",
      kind: "Feature · 1996 · 98 min",
      titlePre: "Domingo ",
      titleEm: "à Tarde",
      meta: "Teresa Lopes · Portugal · 1996",
      why: "“A film about a daughter and a mother that never once uses the word. My own mãe watched it and only asked, at the end, if the girl was happy.”",
      who: "Sara Marques",
      tags: ["PT spoken", "EN subs"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "04",
      tint: "coral",
      kicker: "Crowd favourite",
      kind: "Feature · 2011 · 104 min",
      titlePre: "The Long ",
      titleEm: "Sunday",
      meta: "Priya Menon · UK · 2011",
      why: "“Warm, funny, and never asks the audience to earn its ending. The safest possible first queer film to share.”",
      who: "Sara Marques",
      tags: ["EN spoken", "PT subs", "Audio description"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "07",
      tint: "plum",
      kicker: "Bring an aunt",
      kind: "Feature · 2019 · 91 min",
      titlePre: "Casa ",
      titleEm: "Cheia",
      meta: "Nuno Belo · Portugal · 2019",
      why: (
        <>
          “A big loud family lunch where the coming-out is <em>not</em> the
          climax. It's page ten, and the film keeps going. That's the gift.”
        </>
      ),
      who: "Sara Marques",
      tags: ["PT spoken", "EN subs"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "09",
      tint: "jade",
      kicker: "New · added April 2026",
      kind: "Short · 2025 · 19 min",
      titlePre: "A Chamada",
      meta: "Rita Sousa · Portugal · 2025",
      why: "“Nineteen minutes, one phone call, and the whole collection's thesis in miniature. End here.”",
      who: "Sara Marques",
      tags: ["PT spoken", "EN subs", "New"],
      price: "Free",
      free: true,
      primary: true,
    },
  ],
  showingNote:
    "Showing 4 of 9 films. Films 02–03, 05–06, 08 are in the full list.",
  seeAllLabel: "See all 9 films",
  totalFilms: 9,
  progressNote: "0 of 9 watched · 14h 08m remaining",
  related: [
    {
      av: "I",
      slug: "iberian-queer-cinema",
      titlePre: "Iberian queer cinema, ",
      titleEm: "1974–now",
      by: "João Ribeiro & Sofía Castro · 24 films",
    },
    {
      av: "T",
      slug: "trans-documentaries-2020s",
      titlePre: "Trans documentaries: ",
      titleEm: "the 2020s",
      by: "D. Okoye · 12 films",
    },
    {
      av: "L",
      slug: "lesbian-sci-fi",
      titlePre: "Lesbian sci-fi, ",
      titleEm: "'78 to tomorrow",
      by: "Yara Reis · 18 films",
    },
  ],
};

const lesbianScifi: CollectionDetail = {
  crumbTitle: "Lesbian sci-fi, '78 to tomorrow",
  tagLine: "Collection · updated seasonally",
  titlePre: "Lesbian sci-fi, ",
  titleEm: "'78 to tomorrow",
  stats: [
    { k: "Films", v: <em>18</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>26h</em> 40m
        </>
      ),
    },
    { k: "Free to watch", v: <em>6</em> },
    { k: "Rent", v: <em>12</em> },
  ],
  curators: [{ initials: "YR", name: "Yara Reis", role: "Curator" }],
  essayIntro:
    "“Science fiction is the only genre that has to imagine the future, which means it's the only genre that has to decide, out loud, whether we're in it. This collection is a record of everyone who decided yes.”",
  essayBody: [
    "It starts, as it has to, with Born in Flames in 1978: not the first, but the loudest, the one that made the argument impossible to un-hear. From there the collection reaches forward: through the video-art tapes of the '90s, through the festival features of the 2010s, and out to the Brazilian shorts no distributor has bothered to import yet.",
    <>
      The future has always had us in it.{" "}
      <em>The archive just kept losing the tapes.</em> Half the work of this
      collection was finding them.
    </>,
    "Watch out of order if you like. Sci-fi doesn't need chronology. But the leap from film 01 to film 18 is worth feeling: forty-eight years of the same stubborn refusal to be edited out of tomorrow.",
  ],
  details: [
    { k: "Languages", v: "EN · PT · ES" },
    {
      k: "Years",
      v: (
        <>
          1978–<em>2026</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    {
      k: "Countries",
      v: (
        <>
          US · BR · <em>+4</em>
        </>
      ),
    },
    { k: "Last updated", v: <em>Jun 2026</em> },
  ],
  detailsNote:
    "Four of the Brazilian shorts (films 15–18) are streaming outside Brazil for the first time here, cleared directly with the makers.",
  films: [
    {
      num: "01",
      tint: "coral",
      kicker: "The origin",
      kind: "Feature · 1983 · 80 min",
      titlePre: "Born in ",
      titleEm: "Flames",
      meta: "Lizzie Borden · USA · 1983",
      why: "“Not the first lesbian sci-fi film, but the one that made the argument impossible to un-hear. Everything after it is answering this.”",
      who: "Yara Reis",
      tags: ["EN spoken", "PT subs", "Archive print"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "07",
      tint: "plum",
      kicker: "Video-art era",
      kind: "Experimental · 1994 · 42 min",
      titlePre: "Signal ",
      titleEm: "Loss",
      meta: "Ana Vidal · Portugal · 1994",
      why: "“A tape I thought was lost. A friend found it in a shoebox in Almada. It imagines a Lisbon where the women broadcast on a frequency the state can't jam.”",
      who: "Yara Reis",
      tags: ["PT spoken", "EN subs"],
      price: "Rent · €3",
      secondary: "Rent · €3",
    },
    {
      num: "12",
      tint: "jade",
      kicker: "Festival feature",
      kind: "Feature · 2017 · 118 min",
      titlePre: "The Cartographer's ",
      titleEm: "Wife",
      meta: "Lin Zhao · UK/Portugal · 2017",
      why: (
        <>
          “Two women map a planet that keeps redrawing itself overnight.
          <em>
            {" "}
            It's about building a home in something that won't hold still
          </em>
          , which is the most lesbian premise I know.”
        </>
      ),
      who: "Yara Reis",
      tags: ["EN spoken", "PT subs", "Audio description"],
      price: "Sustainer",
      primary: true,
      secondary: "Rent · €3",
    },
    {
      num: "18",
      tint: "coral",
      kicker: "New · added June 2026",
      kind: "Short · 2026 · 16 min",
      titlePre: "Amanhã ",
      titleEm: "Talvez",
      meta: "Bruna Alves · Brazil · 2026",
      why: "“The newest and furthest out. A Brazilian short no one is importing yet, so we imported it. The future, still arriving.”",
      who: "Yara Reis",
      tags: ["PT spoken", "EN subs", "New"],
      price: "Free",
      free: true,
      primary: true,
    },
  ],
  showingNote:
    "Showing 4 of 18 films. Films 02–06, 08–11, 13–17 are in the full list.",
  seeAllLabel: "See all 18 films",
  totalFilms: 18,
  progressNote: "0 of 18 watched · 26h 40m remaining",
  related: [
    {
      av: "I",
      slug: "iberian-queer-cinema",
      titlePre: "Iberian queer cinema, ",
      titleEm: "1974–now",
      by: "João Ribeiro & Sofía Castro · 24 films",
    },
    {
      av: "T",
      slug: "trans-documentaries-2020s",
      titlePre: "Trans documentaries: ",
      titleEm: "the 2020s",
      by: "D. Okoye · 12 films",
    },
    {
      av: "P",
      slug: "films-our-parents-could-watch",
      titlePre: "Films our parents ",
      titleEm: "could",
      titlePost: " watch",
      by: "Sara Marques · 9 films · all free",
    },
  ],
};

const houseOcean: CollectionDetail = {
  crumbTitle: "The house that crossed the ocean",
  tagLine: "Collection · updated seasonally",
  titlePre: "The house that ",
  titleEm: "crossed",
  titlePost: " the ocean",
  stats: [
    { k: "Films", v: <em>8</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>11h</em> 06m
        </>
      ),
    },
    { k: "Free to watch", v: <em>2</em> },
    { k: "By diaspora makers", v: <em>6</em> },
  ],
  curators: [{ initials: "DO", name: "D. Okoye", role: "Lead curator" }],
  essayIntro:
    "“Ballroom didn't stay put. It crossed the Atlantic in both directions, and each time it landed it grew a new grammar. This is a collection about a form that refuses to sit still long enough to be archived.”",
  essayBody: [
    "I grew up between Lagos and London, and the ballroom I knew was never the one on the television. It was borrowed, translated, argued over. When people talk about the houses as if they belong to one city, one decade, one country, I want to hand them these eight films.",
    <>
      The collection traces the form as it travels: from West African drag
      lineages that predate the word "ballroom," through the diaspora scenes of
      Paris, Lisbon and London, and back again. <em>Nothing here is a copy.</em>{" "}
      Every scene reinvented what it received.
    </>,
    "Watch them in any order. There is no single argument to follow. The point is precisely that the form has no single home. But the two free titles are the warmest way in, and I'd start there if the history is new to you.",
  ],
  details: [
    { k: "Languages", v: "EN · FR · PT · Yoruba" },
    {
      k: "Years",
      v: (
        <>
          2014–<em>2025</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    {
      k: "Countries",
      v: (
        <>
          NG · FR · <em>+3</em>
        </>
      ),
    },
    { k: "Last updated", v: <em>Apr 2026</em> },
  ],
  detailsNote:
    "Two of these films were nearly lost: no distributor, no preservation copy. QueerPulse Cinema paid for the transfers. That's what the sustainer fund is for.",
  films: [
    {
      num: "01",
      tint: "plum",
      kicker: "Archive",
      kind: "Documentary · 2014 · 82 min",
      titlePre: "Before the ",
      titleEm: "Word",
      meta: "Adaeze Nwosu · Nigeria · 2014",
      why: "“Start here. Adaeze films the elders who were performing femininity and lineage decades before anyone called it ballroom. The form didn't arrive. It was already home.”",
      who: "D. Okoye",
      tags: ["EN spoken", "Yoruba", "EN subs", "Archive print"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "03",
      tint: "coral",
      kicker: "Recommended first-timer pick",
      kind: "Documentary · 2018 · 95 min",
      titlePre: "Paris Is ",
      titleEm: "Also Ours",
      meta: "Fatou Diallo · France · 2018",
      why: (
        <>
          “What happened when the houses landed in the banlieues. Fatou refuses
          the story where Black French kids simply imitated New York.{" "}
          <em>They built something France still doesn't have a word for.</em>”
        </>
      ),
      who: "D. Okoye",
      tags: ["FR spoken", "EN subs", "PT subs"],
      price: "Sustainer",
      primary: true,
    },
    {
      num: "05",
      tint: "jade",
      kicker: "Recommended first-timer pick",
      kind: "Feature · 2021 · 88 min",
      titlePre: "A Casa em ",
      titleEm: "Lisboa",
      meta: "Kiala Nzita · Portugal/Angola · 2021",
      why: "“The Lisbon scene, filmed by someone inside it. This is the film that made me want to build the collection: the ocean crossing happening in real time, in a city I could walk to.”",
      who: "D. Okoye",
      tags: ["PT spoken", "EN subs", "Audio description"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "07",
      tint: "coral",
      kicker: "Sustainer",
      kind: "Documentary · 2024 · 74 min",
      titlePre: "Return ",
      titleEm: "Category",
      meta: "Adaeze Nwosu · Nigeria/UK · 2024",
      why: "“Ten years after film 01, Adaeze goes back. The diaspora children return to Lagos and the elders read them: lovingly, mercilessly. The ocean crossed twice.”",
      who: "D. Okoye",
      tags: ["EN spoken", "Yoruba", "EN subs"],
      price: "Sustainer",
      primary: true,
      secondary: "Rent · €3",
    },
    {
      num: "08",
      tint: "plum",
      kicker: "New · added April 2026",
      kind: "Short · 2025 · 19 min",
      titlePre: "No Archive Will ",
      titleEm: "Hold Us",
      meta: "Kiala Nzita · Portugal · 2025",
      why: "“The last film, and a manifesto. Kiala argues that the refusal to be archived is itself the tradition. A fitting place to end a collection that never sits still.”",
      who: "D. Okoye",
      tags: ["PT spoken", "EN subs", "New"],
      price: "Sustainer",
      primary: true,
    },
  ],
  showingNote:
    "Showing 5 of 8 films. Films 02, 04, and 06 are in the full list.",
  seeAllLabel: "See all 8 films",
  totalFilms: 8,
  progressNote: "0 of 8 watched · 11h 06m remaining",
  related: [
    {
      av: "T",
      slug: "trans-documentaries-2020s",
      titlePre: "Trans documentaries: ",
      titleEm: "the 2020s",
      by: "D. Okoye · 12 films",
    },
    {
      av: "E",
      slug: "queer-elders-portraits",
      titlePre: "Queer elders: ",
      titleEm: "portrait",
      titlePost: " films",
      by: "João Ribeiro · 12 films",
    },
    {
      av: "I",
      slug: "iberian-queer-cinema",
      titlePre: "Iberian queer cinema, ",
      titleEm: "1974–now",
      by: "João Ribeiro & Sofía Castro · 24 films",
    },
  ],
};

const slowEastAsian: CollectionDetail = {
  crumbTitle: "Slow, East Asian",
  tagLine: "Collection · updated seasonally",
  titlePre: "Slow, ",
  titleEm: "East Asian",
  stats: [
    { k: "Films", v: <em>6</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>10h</em> 18m
        </>
      ),
    },
    { k: "Free to watch", v: <em>1</em> },
    { k: "Feature-length", v: <em>6</em> },
  ],
  curators: [{ initials: "YR", name: "Yara Reis", role: "Lead curator" }],
  essayIntro:
    "“Western queer cinema is often in a hurry: to come out, to be seen, to resolve. These six films from Japan and Korea are in no hurry at all. They ask you to sit in the room a little longer than is comfortable.”",
  essayBody: [
    "This is a small collection on purpose. Six films, all feature-length, all slow in the specific way that East Asian queer cinema has made its own: elliptical, patient, more interested in the space between two people than in the declaration that might close it.",
    <>
      I don't mean slow as a compliment you give a difficult film. I mean it as
      the actual subject. <em>Waiting is the plot.</em> The held glance, the
      meal eaten in silence, the season that changes while nothing is said:
      that is where these films live.
    </>,
    "You can watch them in any order, but watch them alone, or with one person you trust to stay quiet. They don't survive a second screen.",
  ],
  details: [
    { k: "Languages", v: "JA · KO" },
    {
      k: "Years",
      v: (
        <>
          2009–<em>2024</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    { k: "Countries", v: "JP · KR" },
    { k: "Last updated", v: <em>Mar 2026</em> },
  ],
  detailsNote:
    "Every film here is presented in its original aspect ratio and uncut. We licensed the longer festival versions where a shorter release exists.",
  films: [
    {
      num: "01",
      tint: "jade",
      kicker: "Recommended first-timer pick",
      kind: "Feature · 2009 · 118 min",
      titlePre: "The Long ",
      titleEm: "Season",
      meta: "Aoi Tanaka · Japan · 2009",
      why: "“The gentlest door in. Two women run a guesthouse through four seasons and never once name what they are to each other. By winter you'll know anyway.”",
      who: "Yara Reis",
      tags: ["JA spoken", "EN subs", "PT subs"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "02",
      tint: "plum",
      kicker: "Sustainer",
      kind: "Feature · 2014 · 106 min",
      titlePre: "Rooms Without ",
      titleEm: "Doors",
      meta: "Ji-woo Park · South Korea · 2014",
      why: (
        <>
          “A Seoul apartment, two men, one winter. Park shoots almost entirely
          in long takes. <em>The refusal to cut is the whole argument.</em>”
        </>
      ),
      who: "Yara Reis",
      tags: ["KO spoken", "EN subs"],
      price: "Sustainer",
      primary: true,
    },
    {
      num: "04",
      tint: "coral",
      kicker: "Sustainer",
      kind: "Feature · 2019 · 132 min",
      titlePre: "Tide ",
      titleEm: "Tables",
      meta: "Aoi Tanaka · Japan · 2019",
      why: "“Tanaka's masterpiece. A fishing town, a returning daughter, a childhood friend who waited. The longest film here and the one that rewards patience most.”",
      who: "Yara Reis",
      tags: ["JA spoken", "EN subs", "Audio description"],
      price: "Sustainer",
      primary: true,
      secondary: "Rent · €3",
    },
    {
      num: "06",
      tint: "plum",
      kicker: "New · added March 2026",
      kind: "Feature · 2024 · 99 min",
      titlePre: "After the ",
      titleEm: "Rain Stops",
      meta: "Ha-eun Seo · South Korea · 2024",
      why: "“The newest, and the quietest. Two retired women, a shared garden, and the slow permission to begin again at seventy. It closes the collection on a held breath.”",
      who: "Yara Reis",
      tags: ["KO spoken", "EN subs", "PT subs", "New"],
      price: "Sustainer",
      primary: true,
    },
  ],
  showingNote: "Showing 4 of 6 films. Films 03 and 05 are in the full list.",
  seeAllLabel: "See all 6 films",
  totalFilms: 6,
  progressNote: "0 of 6 watched · 10h 18m remaining",
  related: [
    {
      av: "L",
      slug: "lesbian-sci-fi",
      titlePre: "Lesbian sci-fi, ",
      titleEm: "'78 to tomorrow",
      by: "Yara Reis · 18 films",
    },
    {
      av: "P",
      slug: "films-our-parents-could-watch",
      titlePre: "Films our parents ",
      titleEm: "could",
      titlePost: " watch",
      by: "Sara Marques · 9 films · all free",
    },
    {
      av: "E",
      slug: "queer-elders-portraits",
      titlePre: "Queer elders: ",
      titleEm: "portrait",
      titlePost: " films",
      by: "João Ribeiro · 12 films",
    },
  ],
};

const queerElders: CollectionDetail = {
  crumbTitle: "Queer elders: portrait films",
  tagLine: "Collection · new · updated June 2026",
  titlePre: "Queer elders: ",
  titleEm: "portrait",
  titlePost: " films",
  stats: [
    { k: "Films", v: <em>12</em> },
    {
      k: "Total runtime",
      v: (
        <>
          <em>22h</em> 09m
        </>
      ),
    },
    { k: "Free to watch", v: <em>5</em> },
    { k: "Filmed subjects", v: <em>12</em> },
  ],
  curators: [{ initials: "JR", name: "João Ribeiro", role: "Lead curator" }],
  essayIntro:
    "“One film, one person, at least thirty minutes. No arc, no lesson, no death to make it meaningful. Just looking at someone who survived long enough to be looked at, for long enough that looking becomes something else.”",
  essayBody: [
    "I built this collection because I was tired of watching queer elders appear in films for ninety seconds: a talking head to authenticate someone else's story, then gone. I wanted twelve films that did the opposite: stayed in the room, past the point of comfort, until the person stopped performing and simply was.",
    <>
      The rule for inclusion was strict. One subject. Thirty minutes minimum. No
      voiceover explaining them to us.{" "}
      <em>The camera has to be patient enough to be forgotten.</em>
    </>,
    "There's no order to follow. Each film is complete in itself. But five are free, and I chose those five to be the ones I'd want a younger person to see first: proof, mostly, that there is an after, and that it can be tender.",
  ],
  details: [
    { k: "Languages", v: "PT · EN · ES · FR" },
    {
      k: "Years",
      v: (
        <>
          2016–<em>2026</em>
        </>
      ),
    },
    { k: "Subtitles", v: "EN · PT" },
    {
      k: "Countries",
      v: (
        <>
          PT · UK · <em>+4</em>
        </>
      ),
    },
    { k: "Last updated", v: <em>Jun 2026</em> },
  ],
  detailsNote:
    "Three of the twelve subjects have since died. Their films stay exactly as they approved them. We don't add memorial cards. They didn't want them.",
  orderNote: (
    <>
      There's no fixed order here. <em>Each portrait stands alone</em>. But if
      you want a place to begin, films 01, 04, and 09 are the three free titles
      I most want a younger person to see first.
    </>
  ),
  films: [
    {
      num: "01",
      tint: "coral",
      kicker: "Recommended first-timer pick",
      kind: "Documentary · 2016 · 41 min",
      titlePre: "Amália, ",
      titleEm: "at Home",
      meta: "João Ribeiro · Portugal · 2016",
      why: "“The film that started it. Amália ran a queer bar in the Bairro Alto for forty years. I filmed her doing nothing for an afternoon. It's the truest thing I've made.”",
      who: "João Ribeiro",
      tags: ["PT spoken", "EN subs", "PT subs"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "04",
      tint: "jade",
      kicker: "Recommended first-timer pick",
      kind: "Documentary · 2019 · 52 min",
      titlePre: "Just ",
      titleEm: "Marjorie",
      meta: "Lena Ford · United Kingdom · 2019",
      why: (
        <>
          “Marjorie transitioned at sixty-eight, in a Yorkshire village that
          decided to be kind. Lena stays with her through one ordinary year.{" "}
          <em>
            Nothing dramatic happens, and it's unbearable how much that matters.
          </em>
          ”
        </>
      ),
      who: "João Ribeiro",
      tags: ["EN spoken", "PT subs", "Audio description"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "07",
      tint: "plum",
      kicker: "Sustainer",
      kind: "Documentary · 2022 · 68 min",
      titlePre: "El Último ",
      titleEm: "Baile",
      meta: "Rosa Mendez · Spain · 2022",
      why: "“A retired dancer in Cádiz, eighty-one, teaches one last class. Rosa never leaves the studio. By the end you understand a whole life through how he holds his hands.”",
      who: "João Ribeiro",
      tags: ["ES spoken", "EN subs", "PT subs"],
      price: "Sustainer",
      primary: true,
      secondary: "Rent · €3",
    },
    {
      num: "09",
      tint: "coral",
      kicker: "Recommended first-timer pick",
      kind: "Documentary · 2024 · 47 min",
      titlePre: "Kofi Keeps the ",
      titleEm: "Keys",
      meta: "Ama Boateng · Ghana/UK · 2024",
      why: "“Kofi has kept the keys to a London community centre for thirty years: the only queer space some people had. Ama simply watches him open up, every morning, for a week.”",
      who: "João Ribeiro",
      tags: ["EN spoken", "EN subs", "New"],
      price: "Free",
      free: true,
      primary: true,
    },
    {
      num: "12",
      tint: "plum",
      kicker: "New · added June 2026",
      kind: "Documentary · 2026 · 55 min",
      titlePre: "Still ",
      titleEm: "Here",
      meta: "João Ribeiro · Portugal · 2026",
      why: "“The newest portrait, and the last in the collection. A group of friends who met at ACT UP Lisbon in 1991, filmed at the same café table thirty-five years on. The ones who are still here.”",
      who: "João Ribeiro",
      tags: ["PT spoken", "EN subs", "PT subs", "New"],
      price: "Sustainer",
      primary: true,
    },
  ],
  showingNote:
    "Showing 5 of 12 films. Films 02–03, 05–06, 08, 10–11 are in the full list.",
  seeAllLabel: "See all 12 films",
  totalFilms: 12,
  progressNote: "0 of 12 watched · 22h 09m remaining",
  related: [
    {
      av: "I",
      slug: "iberian-queer-cinema",
      titlePre: "Iberian queer cinema, ",
      titleEm: "1974–now",
      by: "João Ribeiro & Sofía Castro · 24 films",
    },
    {
      av: "H",
      slug: "house-that-crossed-the-ocean",
      titlePre: "The house that ",
      titleEm: "crossed",
      titlePost: " the ocean",
      by: "D. Okoye · 8 films",
    },
    {
      av: "P",
      slug: "films-our-parents-could-watch",
      titlePre: "Films our parents ",
      titleEm: "could",
      titlePost: " watch",
      by: "Sara Marques · 9 films · all free",
    },
  ],
};

export const collectionDetails: Record<string, CollectionDetail> = {
  "iberian-queer-cinema": iberian,
  "trans-documentaries-2020s": transDocs,
  "films-our-parents-could-watch": parents,
  "lesbian-sci-fi": lesbianScifi,
  "house-that-crossed-the-ocean": houseOcean,
  "slow-east-asian": slowEastAsian,
  "queer-elders-portraits": queerElders,
};
