import type { ReactNode } from "react";
import { routes } from "../../app/routeMap";
import { getMember, memberName } from "../members/data/members";
import { AUTHOR_PORTRAIT_IMG, AUTHOR_FEATURE_IMG } from "./authorPage.data";

export interface AuthorStat {
  value: ReactNode;
  label: string;
}

export interface AuthorArticle {
  /** Real magazine article id — the card links to /magazine/article?id=… */
  id: string;
  kicker: ReactNode;
  title: ReactNode;
  dek: string;
  meta: string;
}

export interface ReadingItem {
  title: ReactNode;
  tag: string;
}

export interface AuthorFeatured {
  kicker: string;
  title: ReactNode;
  dek: string;
  /**
   * i18n: `meta` used to bake "Published {date} · {mins} min read · {reads}
   * reads this week" as one opaque English string — the classic "fused mock
   * string" trap. Split into data so `AuthorWork.tsx` composes it via
   * `magazineFormat.ts`'s helpers and gets a translated + locale-formatted
   * date in pt-PT.
   */
  publishedDate: Date;
  minutes: number;
  /** Already-formatted (mock uses compact forms like "1.2k"); interpolated
   *  as an opaque token by `readsThisWeekText()`. */
  readsThisWeek: string;
  articleId: string;
  image: string;
}

export interface ElsewhereLink {
  label: string;
  note: string;
  /** External link. */
  href?: string;
  /** Internal router link (takes precedence over href). */
  to?: string;
}

export interface Author {
  slug: string;
  /** First name only, for toast copy and alt text ("Following Sara"). */
  firstName: string;
  /** Display name, with the coral <em> split, e.g. Sara <em>Pinheiro.</em> */
  name: ReactNode;
  eyebrow: string;
  role: string;
  pronouns: string;
  bio: ReactNode;
  stats: AuthorStat[];
  /** Beat chips — the first renders as the primary (plum) chip. */
  beats: string[];
  featured: AuthorFeatured;
  articles: AuthorArticle[];
  readingTitle: ReactNode;
  readingBlurb: string;
  reading: ReadingItem[];
  elsewhere: ElsewhereLink[];
  portrait: string;
}

export const AUTHORS: Record<string, Author> = {
  "sara-pinheiro": {
    slug: "sara-pinheiro",
    firstName: "Sara",
    name: (
      <>
        Sara <em>Pinheiro.</em>
      </>
    ),
    eyebrow: "Magazine · Writer",
    role: "Contributing editor, health & access",
    pronouns: "she/her",
    bio: (
      <>
        Sara writes about queer life and the systems that surround it: clinics,
        classrooms, courtrooms, neighbourhoods. She joined QueerPulse Magazine
        in 2023 after a decade in public-health reporting at <em>Público</em>{" "}
        and <em>Mensagem de Lisboa</em>. Born in Setúbal, lives in Anjos.
      </>
    ),
    stats: [
      { value: <em>14</em>, label: "Articles published" },
      { value: "3", label: "Years contributing" },
      { value: "1.8k", label: "Subscribers to her column" },
      { value: <em>2</em>, label: "Issue covers · 2025" },
    ],
    beats: [
      "Health & access",
      "Migration & visas",
      "Public services",
      "Long reads",
      "Interviews",
      "Reported essays",
    ],
    featured: {
      kicker: "Cover story · Issue 09 · Health",
      title: (
        <>
          Five things I learned{" "}
          <em>navigating Lisbon's trans health system.</em>
        </>
      ),
      dek: "From the SNS to private clinics, what nobody tells you about waiting lists, referrals, and how to actually get a hormone prescription without losing a year of your life.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 8,
      readsThisWeek: "284",
      articleId: "city-changed",
      image: AUTHOR_FEATURE_IMG,
    },
    articles: [
      {
        id: "visibility-politics",
        kicker: "Long read · 14 min",
        title: (
          <>
            What the SNS gets right (and where it{" "}
            <em>still leaves you waiting</em>).
          </>
        ),
        dek: "Six months reporting inside three regional health centres in Lisbon and the Algarve.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "kiko-neves",
        kicker: "Interview",
        title: (
          <>
            Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
          </>
        ),
        dek: "The Anjos GP who treats trans patients as adults, and changed the protocol for an entire clinic.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "i-arrived",
        kicker: "Reported essay",
        title: (
          <>
            The visa queue is <em>a kind of closet.</em>
          </>
        ),
        dek: "Three queer migrants on what it means to wait for a residency permit while not being out to your case officer.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "politics-of-staying",
        kicker: "Opinion",
        title: (
          <>
            Stop calling it "access." <em>Call it care.</em>
          </>
        ),
        dek: "A small change in language that changes how clinics get funded, and who gets seen.",
        meta: "Issue 04 · Oct 2025",
      },
      {
        id: "last-bar",
        kicker: "Reporting",
        title: (
          <>
            Inside the back room of <em>Café Beirão.</em>
          </>
        ),
        dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.",
        meta: "Issue 03 · Aug 2025",
      },
      {
        id: "mouraria-family",
        kicker: `Interview · with ${memberName("sofia")}`,
        title: (
          <>
            Mariza Câmara, <em>district health director.</em>
          </>
        ),
        dek: "An hour-long conversation about queer health policy in Lisbon's Câmara Municipal.",
        meta: "Issue 02 · Jun 2025",
      },
    ],
    readingTitle: (
      <>
        What Sara is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Curated by the writer herself: books, longforms, and resources she returns to when reporting.",
    reading: [
      {
        title: (
          <>
            The Right to Maim <em>· Jasbir K. Puar</em>
          </>
        ),
        tag: "book",
      },
      {
        title: "How a queer GP rebuilt her practice",
        tag: "FT Magazine, 2024",
      },
      {
        title: (
          <>
            Lisboa pulse: visual notes <em>· Editora Anjos</em>
          </>
        ),
        tag: "zine",
      },
      { title: "The SNS, in numbers", tag: "2025 annual report" },
      {
        title: (
          <>
            On waiting <em>· Maria Tumarkin</em>
          </>
        ),
        tag: "essay",
      },
    ],
    elsewhere: [
      {
        label: "sara@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:sara@queerpulse.app",
      },
      {
        label: "Are.na",
        note: "· /sara-pinheiro",
        href: "https://www.are.na/sara-pinheiro",
      },
      {
        label: "Bluesky",
        note: "· @sarapinheiro",
        href: "https://bsky.app/profile/sarapinheiro.bsky.social",
      },
      { label: "Member profile", note: "· in Lisbon", to: routes.members },
    ],
    portrait: AUTHOR_PORTRAIT_IMG,
  },

  jonas: {
    slug: "jonas",
    firstName: "Jonas",
    name: (
      <>
        Jonas <em>Ferreira.</em>
      </>
    ),
    eyebrow: "Magazine · Writer",
    role: "Reporter, mutual aid & the city",
    pronouns: "he/him",
    bio: (
      <>
        Jonas reports on the quiet infrastructure that keeps queer Lisbon
        standing: the open clinics, the back rooms, the WhatsApp groups that
        move faster than any institution. He came to QueerPulse from community
        radio, and it shows: he'd rather sit in a room for six hours than send
        an email. Lives in <em>Marvila</em>, mostly on foot.
      </>
    ),
    stats: [
      { value: <em>9</em>, label: "Articles published" },
      { value: "2", label: "Years contributing" },
      { value: "980", label: "Subscribers to his beat" },
      { value: <em>1</em>, label: "Issue cover · 2026" },
    ],
    beats: [
      "Mutual aid",
      "Nightlife & space",
      "Housing",
      "Reportage",
      "City politics",
      "Long reads",
    ],
    featured: {
      kicker: "Feature · Issue 09 · Reportage",
      title: (
        <>
          Inside the back room of <em>Café Beirão.</em>
        </>
      ),
      dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure, and why the people who run it don't want you to call it that.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 11,
      readsThisWeek: "1.2k",
      articleId: "last-bar",
      image:
        "https://images.unsplash.com/photo-1416273567255-8abe875affcd?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "last-bar",
        kicker: "Reportage · 11 min",
        title: (
          <>
            The clinic that meets <em>on the first Sunday.</em>
          </>
        ),
        dek: "Six months with the volunteers who turned a café back room into Marvila's open clinic.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "housing-law",
        kicker: "Reporting",
        title: (
          <>
            The eviction notice arrived <em>in English.</em>
          </>
        ),
        dek: "How Lisbon's rent crisis lands hardest on the queer migrants who built its nightlife.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "city-changed",
        kicker: "Long read · 16 min",
        title: (
          <>
            Who owns the dancefloor <em>now?</em>
          </>
        ),
        dek: "A decade of club closures, told through the door people and the leases nobody could read.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "mouraria-family",
        kicker: "Reporting",
        title: (
          <>
            The fund with <em>no application form.</em>
          </>
        ),
        dek: "Inside the emergency cash network that moves money before anyone asks for a receipt.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "i-arrived",
        kicker: "Essay",
        title: (
          <>
            A map of every place <em>that used to be ours.</em>
          </>
        ),
        dek: "Walking the city with the people who remember what stood where the co-working spaces are.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "politics-of-staying",
        kicker: "Reportage",
        title: (
          <>
            Marvila Makers, <em>two years in.</em>
          </>
        ),
        dek: "A workshop collective that started as a group chat and accidentally built a landlord-proof lease.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Jonas is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Field notes, tenant-union pamphlets, and the books he keeps lending out and not getting back.",
    reading: [
      {
        title: (
          <>
            Rent <em>· Ana Naomi de Sousa</em>
          </>
        ),
        tag: "longform",
      },
      { title: "How mutual aid actually scales", tag: "Notes on Care, 2025" },
      {
        title: (
          <>
            The Undercommons <em>· Harney &amp; Moten</em>
          </>
        ),
        tag: "book",
      },
      { title: "Lisboa, quem cá vive", tag: "Mensagem de Lisboa" },
      {
        title: (
          <>
            Direct Action <em>· L.A. Kauffman</em>
          </>
        ),
        tag: "book",
      },
    ],
    elsewhere: [
      {
        label: "jonas@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:jonas@queerpulse.app",
      },
      {
        label: "Bluesky",
        note: "· @jonasferreira",
        href: "https://bsky.app/profile/jonasferreira.bsky.social",
      },
      { label: "Member profile", note: "· in Marvila", to: routes.members },
    ],
    portrait:
      "https://images.unsplash.com/photo-1499887142886-791eca5918cd?q=80&w=400&auto=format&fit=crop",
  },

  luisa: {
    slug: "luisa",
    firstName: "Luísa",
    name: (
      <>
        Luísa <em>Gomes.</em>
      </>
    ),
    eyebrow: "Magazine · Writer",
    role: "Essayist, design & care",
    pronouns: "she/her",
    bio: (
      <>
        Luísa writes essays about the built world and what it does to the body:
        waiting rooms, ramps, doorways, the lighting in a place you go to be
        seen. She trained as an architect and left to write about why buildings
        so often forget the people inside them. Reads slowly, on purpose. Lives
        in <em>Campo de Ourique</em>.
      </>
    ),
    stats: [
      { value: <em>11</em>, label: "Essays published" },
      { value: "2", label: "Years contributing" },
      { value: "1.1k", label: "Subscribers to her column" },
      { value: <em>3</em>, label: "Pieces anthologised" },
    ],
    beats: [
      "Design & care",
      "Waiting rooms",
      "Disability & access",
      "Essays",
      "Criticism",
      "Photography",
    ],
    featured: {
      kicker: "Essay · Issue 09 · Design",
      title: (
        <>
          The waiting room is <em>also part of the treatment.</em>
        </>
      ),
      dek: "On chairs, lighting, music, and what design quietly does to a body waiting to be seen: an essay about the rooms we pretend are neutral.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 7,
      readsThisWeek: "640",
      articleId: "i-arrived",
      image:
        "https://images.unsplash.com/photo-1453906971074-ce568cccbc63?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "i-arrived",
        kicker: "Essay · 7 min",
        title: (
          <>
            The waiting room is <em>also part of the treatment.</em>
          </>
        ),
        dek: "On chairs, lighting, and what a room does to a body waiting to be seen.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "housing-law",
        kicker: "Criticism",
        title: (
          <>
            A ramp is <em>an argument.</em>
          </>
        ),
        dek: "Reading Lisbon's new civic buildings for who they quietly plan to keep out.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "politics-of-staying",
        kicker: "Essay",
        title: (
          <>
            The tyranny of the <em>single accessible toilet.</em>
          </>
        ),
        dek: "One door, a queue, and everything a building says when it makes access an exception.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "kiko-neves",
        kicker: "Reported essay",
        title: (
          <>
            Who is the lobby <em>lit for?</em>
          </>
        ),
        dek: "Three clinics, three lighting schemes, and the very different bodies they imagine.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "visibility-politics",
        kicker: "Criticism",
        title: (
          <>
            The soft violence of <em>the open-plan office.</em>
          </>
        ),
        dek: "What it costs to be visible all day when visibility was never safe for you.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "city-changed",
        kicker: "Essay",
        title: (
          <>
            Handrails, and other <em>love letters.</em>
          </>
        ),
        dek: "The small fixtures that assume you'll fall, and quietly decide to catch you.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Luísa is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Design criticism, crip theory, and the monographs she photographs pages of instead of buying.",
    reading: [
      {
        title: (
          <>
            Feminist City <em>· Leslie Kern</em>
          </>
        ),
        tag: "book",
      },
      {
        title: (
          <>
            Care Work <em>· Leah Lakshmi Piepzna-Samarasinha</em>
          </>
        ),
        tag: "book",
      },
      { title: "The politics of the ramp", tag: "Places Journal, 2023" },
      {
        title: (
          <>
            Building Access <em>· Aimi Hamraie</em>
          </>
        ),
        tag: "book",
      },
      { title: "On soft rooms", tag: "essay, self-published" },
    ],
    elsewhere: [
      {
        label: "luisa@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:luisa@queerpulse.app",
      },
      {
        label: "Are.na",
        note: "· /luisa-gomes",
        href: "https://www.are.na/luisa-gomes",
      },
      { label: "Member profile", note: "· in Lisbon", to: routes.members },
    ],
    portrait:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },

  "catarina-vaz": {
    slug: "catarina-vaz",
    firstName: "Catarina",
    name: (
      <>
        Catarina <em>Vaz.</em>
      </>
    ),
    eyebrow: "Magazine · Writer",
    role: "Long-reads writer, history & memory",
    pronouns: "she/her",
    bio: (
      <>
        Catarina writes the long ones: the twenty-minute pieces that follow a
        single thread across decades. She spent years in the ILGA Portugal
        archive before she wrote a word, and it taught her that most queer
        history survives as a phone number someone still remembers. Based in{" "}
        <em>Arroios</em>, usually near a reel-to-reel.
      </>
    ),
    stats: [
      { value: <em>7</em>, label: "Long reads published" },
      { value: "2", label: "Years contributing" },
      { value: "1.4k", label: "Subscribers to her column" },
      { value: <em>22</em>, label: "Min average read" },
    ],
    beats: [
      "Oral history",
      "Institutions",
      "Helplines",
      "Long reads",
      "Archives",
      "Reported essays",
    ],
    featured: {
      kicker: "Long read · Issue 09 · History",
      title: (
        <>
          A history of the lifeline, <em>1995–2025.</em>
        </>
      ),
      dek: "Three decades of ILGA Portugal's helpline, told through the calls operators remember, and the ones they can't stop remembering.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 22,
      readsThisWeek: "410",
      articleId: "visibility-politics",
      image:
        "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "visibility-politics",
        kicker: "Long read · 22 min",
        title: (
          <>
            A history of the lifeline, <em>1995–2025.</em>
          </>
        ),
        dek: "Three decades of a helpline, told through the calls operators can't forget.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "city-changed",
        kicker: "Long read · 18 min",
        title: (
          <>
            The decade the bars <em>learned to hide.</em>
          </>
        ),
        dek: "How queer Lisbon survived the eighties by pretending to be something else.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "kiko-neves",
        kicker: "Oral history",
        title: (
          <>
            Everyone remembers <em>a different first Pride.</em>
          </>
        ),
        dek: "Fourteen people, one march, and the gap between the record and the memory.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "housing-law",
        kicker: "Long read",
        title: (
          <>
            The apartment that <em>hid a movement.</em>
          </>
        ),
        dek: "For nine years an Arroios flat was a switchboard, a shelter, and a secret. Then the lease ended.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "mouraria-family",
        kicker: "Reported essay",
        title: (
          <>
            What the archive <em>refuses to keep.</em>
          </>
        ),
        dek: "On the letters that survive and the ones people asked to have burned.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "i-arrived",
        kicker: "Long read",
        title: (
          <>
            The operators who <em>never hung up first.</em>
          </>
        ),
        dek: "A shift-by-shift portrait of the volunteers who answered when nobody else would.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Catarina is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Archive finding-aids, oral-history method books, and the transcripts she keeps going back to.",
    reading: [
      {
        title: (
          <>
            Cruising Utopia <em>· José Esteban Muñoz</em>
          </>
        ),
        tag: "book",
      },
      { title: "Doing oral history", tag: "method guide" },
      {
        title: (
          <>
            The Archive Project <em>· ILGA Portugal</em>
          </>
        ),
        tag: "archive",
      },
      { title: "How to interview the dying", tag: "essay, 2019" },
      {
        title: (
          <>
            Dust <em>· Carolyn Steedman</em>
          </>
        ),
        tag: "book",
      },
    ],
    elsewhere: [
      {
        label: "catarina@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:catarina@queerpulse.app",
      },
      {
        label: "Bluesky",
        note: "· @catarinavaz",
        href: "https://bsky.app/profile/catarinavaz.bsky.social",
      },
      { label: "Member profile", note: "· in Arroios", to: routes.members },
    ],
    portrait:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=400&auto=format&fit=crop",
  },

  "tomas-mendes": {
    slug: "tomas-mendes",
    firstName: "Tomás",
    name: (
      <>
        Tomás <em>Mendes.</em>
      </>
    ),
    eyebrow: "Magazine · Writer",
    role: "Profiles writer, people & work",
    pronouns: "he/they",
    bio: (
      <>
        Tomás writes profiles: the pharmacist who never asks a follow-up
        question, the nurse still there after twenty years, the people who hold
        a neighbourhood up without ever being thanked for it. They believe the
        most political thing a person can do is keep showing up. Lives in{" "}
        <em>Mouraria</em>, knows everyone on the street.
      </>
    ),
    stats: [
      { value: <em>12</em>, label: "Profiles published" },
      { value: "3", label: "Years contributing" },
      { value: "1.3k", label: "Subscribers to the column" },
      { value: <em>2</em>, label: "Awards · 2025" },
    ],
    beats: [
      "Profiles",
      "Care work",
      "Pharmacies & clinics",
      "Interviews",
      "Neighbourhood",
      "Portraits",
    ],
    featured: {
      kicker: "Profile · Issue 09 · People",
      title: (
        <>
          The pharmacist who fills <em>every prescription.</em>
        </>
      ),
      dek: "Rui, from Farmácia do Carmo, doesn't ask follow-up questions. He has reasons, and a drawer of them going back fifteen years.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 6,
      readsThisWeek: "720",
      articleId: "mouraria-family",
      image:
        "https://images.unsplash.com/photo-1461784180009-21121b2f204c?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "mouraria-family",
        kicker: "Profile · 6 min",
        title: (
          <>
            The pharmacist who fills <em>every prescription.</em>
          </>
        ),
        dek: "Rui from Farmácia do Carmo doesn't ask follow-up questions. He has reasons.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "politics-of-staying",
        kicker: "Profile",
        title: (
          <>
            Twenty years in <em>a hospital corridor.</em>
          </>
        ),
        dek: "A nurse on what's changed, what hasn't, and what she still does anyway.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "kiko-neves",
        kicker: "Interview",
        title: (
          <>
            The GP who runs <em>fifteen minutes late, on purpose.</em>
          </>
        ),
        dek: "Dr. Inês Pereira changed a clinic's whole protocol by refusing to rush.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "last-bar",
        kicker: "Profile",
        title: (
          <>
            The bar owner who{" "}
            <em>never checked ID for the reason you think.</em>
          </>
        ),
        dek: "Forty years behind the same counter in Mouraria, and a very specific idea of who's welcome.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "housing-law",
        kicker: "Profile",
        title: (
          <>
            The lawyer who <em>works for pastéis.</em>
          </>
        ),
        dek: "How one housing advocate ended up on speed-dial for half the queer migrants in Lisbon.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "i-arrived",
        kicker: "Interview",
        title: (
          <>
            The porteira who <em>knows before you do.</em>
          </>
        ),
        dek: "Thirty years of doorways, deliveries, and quietly keeping a building safe.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Tomás is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Profiles they wish they'd written, plus the interviews they teach from.",
    reading: [
      {
        title: (
          <>
            The Argonauts <em>· Maggie Nelson</em>
          </>
        ),
        tag: "book",
      },
      { title: "The art of the profile", tag: "Nieman, 2022" },
      {
        title: (
          <>
            Say Nothing <em>· Patrick Radden Keefe</em>
          </>
        ),
        tag: "book",
      },
      { title: "How to interview a quiet person", tag: "craft essay" },
      {
        title: (
          <>
            Portraits <em>· Editora Anjos</em>
          </>
        ),
        tag: "zine",
      },
    ],
    elsewhere: [
      {
        label: "tomas.mendes@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:tomas.mendes@queerpulse.app",
      },
      {
        label: "Bluesky",
        note: "· @tomasmendes",
        href: "https://bsky.app/profile/tomasmendes.bsky.social",
      },
      { label: "Member profile", note: "· in Mouraria", to: routes.members },
    ],
    portrait:
      "https://images.unsplash.com/photo-1485688809171-248861015a63?q=80&w=400&auto=format&fit=crop",
  },

  anika: {
    slug: "anika",
    firstName: "Anika",
    name: (
      <>
        Anika <em>Kovač.</em>
      </>
    ),
    eyebrow: "Magazine · Writer",
    role: "Profiles writer, nurses & frontlines",
    pronouns: "she/her",
    bio: (
      <>
        Anika writes about the people who work the frontlines of care: nurses,
        outreach workers, the ones on the long shift. She arrived in Lisbon from
        Ljubljana in 2019 and reports in three languages, mostly from waiting
        rooms and staff canteens. She thinks burnout is a policy failure rather
        than a character flaw, and writes like it. Lives in <em>Almada</em>.
      </>
    ),
    stats: [
      { value: <em>8</em>, label: "Profiles published" },
      { value: "2", label: "Years contributing" },
      { value: "870", label: "Subscribers to her beat" },
      { value: <em>3</em>, label: "Languages reported in" },
    ],
    beats: [
      "Frontline care",
      "Nursing",
      "Hospitals",
      "Profiles",
      "Migration",
      "Long shifts",
    ],
    featured: {
      kicker: "Profile · Issue 09 · Care",
      title: (
        <>
          Twenty years in <em>a hospital corridor.</em>
        </>
      ),
      dek: "A nurse on what's changed, what hasn't, and what she still does anyway, even on the shifts nobody wants to work.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 7,
      readsThisWeek: "530",
      articleId: "politics-of-staying",
      image:
        "https://images.unsplash.com/photo-1474692295473-66ba4d54e0d3?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "politics-of-staying",
        kicker: "Profile · 7 min",
        title: (
          <>
            Twenty years in <em>a hospital corridor.</em>
          </>
        ),
        dek: "A nurse on what's changed, what hasn't, and what she still does anyway.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "kiko-neves",
        kicker: "Profile",
        title: (
          <>
            The night-shift outreach team <em>that runs on tea.</em>
          </>
        ),
        dek: "Four volunteers, one van, and the map of the city only they seem to have.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "mouraria-family",
        kicker: "Interview",
        title: (
          <>
            Burnout is <em>a policy, not a feeling.</em>
          </>
        ),
        dek: "A union rep on why queer health workers leave, and what would make them stay.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "housing-law",
        kicker: "Profile",
        title: (
          <>
            The nurse who <em>learned Portuguese on the ward.</em>
          </>
        ),
        dek: "On arriving, translating, and building trust one twelve-hour shift at a time.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "last-bar",
        kicker: "Profile",
        title: (
          <>
            The pharmacist, the porter, <em>and the quiet handover.</em>
          </>
        ),
        dek: "How a hospital's queer patients get looked after by people whose job description doesn't mention it.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "visibility-politics",
        kicker: "Reported essay",
        title: (
          <>
            What the rota <em>doesn't show.</em>
          </>
        ),
        dek: "Two years shadowing the shifts that hold a ward together after everyone else clocks out.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Anika is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Care-worker memoirs, union reports, and the essays she sends to every new nurse she meets.",
    reading: [
      {
        title: (
          <>
            The Body Keeps the Score <em>· Bessel van der Kolk</em>
          </>
        ),
        tag: "book",
      },
      { title: "The nursing shortage is a choice", tag: "report, 2024" },
      {
        title: (
          <>
            Nemzeti: notes from a ward <em>· A. Kovač</em>
          </>
        ),
        tag: "zine",
      },
      { title: "On the twelve-hour shift", tag: "essay" },
      {
        title: (
          <>
            Minor Feelings <em>· Cathy Park Hong</em>
          </>
        ),
        tag: "book",
      },
    ],
    elsewhere: [
      {
        label: "anika@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:anika@queerpulse.app",
      },
      {
        label: "Bluesky",
        note: "· @anikakovac",
        href: "https://bsky.app/profile/anikakovac.bsky.social",
      },
      { label: "Member profile", note: "· in Almada", to: routes.members },
    ],
    portrait:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
  },

  sofia: {
    slug: "sofia",
    firstName: "Sofia",
    name: (
      <>
        Sofia <em>Andrade.</em>
      </>
    ),
    eyebrow: "Magazine · Editor",
    role: "Journalist & editor, cities & culture",
    pronouns: "she/her",
    bio: (
      <>
        Sofia has been writing about queer life in Lisbon since 2019, and
        editing it since 2023. She wrote this issue's cover story and edited
        half the rest: the kind of journalist who's happiest when her own
        byline isn't the point. Documentary background, interviewer's patience.
        She's also a QueerPulse member; you can find her in the community too.
      </>
    ),
    stats: [
      { value: <em>26</em>, label: "Pieces published" },
      { value: "5", label: "Years at QueerPulse" },
      { value: "2.4k", label: "Subscribers to her column" },
      { value: <em>4</em>, label: "Issue covers" },
    ],
    beats: [
      "Cities",
      "Culture",
      "Interviews",
      "Cover stories",
      "Documentary",
      "Community life",
    ],
    featured: {
      kicker: "Cover story · Issue 09 · Feature",
      title: (
        <>
          The city changed. <em>Did we?</em>
        </>
      ),
      dek: "Lisbon's queer community has spent a decade finding itself. The rent tripled, the bars closed and reopened and closed again. What survived, and what did we lose?",
      publishedDate: new Date(2026, 5, 6),
      minutes: 14,
      readsThisWeek: "3.1k",
      articleId: "city-changed",
      image:
        "https://images.unsplash.com/photo-1485030056468-3820ff9e6e90?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "city-changed",
        kicker: "Cover story · 14 min",
        title: (
          <>
            The city changed. <em>Did we?</em>
          </>
        ),
        dek: "A decade of queer Lisbon, told through the rooms it kept and the ones it couldn't.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "kiko-neves",
        kicker: "Interview",
        title: (
          <>
            Kiko Neves on <em>making work nobody asked for.</em>
          </>
        ),
        dek: "Two afternoons in the studio with the artist rewriting what a Lisbon show can be.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "mouraria-family",
        kicker: "Interview",
        title: (
          <>
            Mariza Câmara, <em>district health director.</em>
          </>
        ),
        dek: "An hour on queer health policy: what passed, and what got quietly buried.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "i-arrived",
        kicker: "Feature",
        title: (
          <>
            The dinner party that <em>became a documentary.</em>
          </>
        ),
        dek: "How a monthly supper club in Mouraria ended up as an oral-history film.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "visibility-politics",
        kicker: "Editor's essay",
        title: (
          <>
            On editing a community <em>you're part of.</em>
          </>
        ),
        dek: "The uncomfortable, necessary work of reporting on the people you go home to.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "last-bar",
        kicker: "Feature",
        title: (
          <>
            Last call at <em>the bar that raised us.</em>
          </>
        ),
        dek: "One closing night, told by the people who met their whole lives on that dancefloor.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Sofia is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Reporting she rereads, plus the documentaries she makes everyone watch before a shoot.",
    reading: [
      {
        title: (
          <>
            Just Kids <em>· Patti Smith</em>
          </>
        ),
        tag: "book",
      },
      { title: "How to edit people you love", tag: "craft essay" },
      {
        title: (
          <>
            Paris Is Burning <em>· Jennie Livingston</em>
          </>
        ),
        tag: "film",
      },
      { title: "Lisboa, década a década", tag: "Mensagem de Lisboa" },
      {
        title: (
          <>
            The Situation and the Story <em>· Vivian Gornick</em>
          </>
        ),
        tag: "book",
      },
    ],
    elsewhere: [
      {
        label: "sofia@queerpulse.app",
        note: "· pitch direct",
        href: "mailto:sofia@queerpulse.app",
      },
      {
        label: "Bluesky",
        note: "· @sofiaandrade",
        href: "https://bsky.app/profile/sofiaandrade.bsky.social",
      },
      {
        label: "Member profile",
        note: "· in Lisbon",
        to: `${routes.members}/sofia`,
      },
    ],
    portrait:
      "https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=400&auto=format&fit=crop",
  },

  "marta-reis": {
    slug: "marta-reis",
    firstName: "Marta",
    name: (
      <>
        Marta <em>Reis.</em>
      </>
    ),
    eyebrow: "Magazine · Editor in chief",
    role: "Editor in chief",
    pronouns: "she/her",
    bio: (
      <>
        Marta runs the magazine. She commissions it, edits it, writes the
        editor's note, and reads every letter that comes back. She founded
        QueerPulse Magazine in 2023 with a mailing list and a stubborn belief
        that a community deserves slow journalism about itself. She writes
        rarely and cuts ruthlessly. Lives in <em>Graça</em>, answers email at
        unreasonable hours.
      </>
    ),
    stats: [
      { value: <em>9</em>, label: "Issues shipped" },
      { value: "3", label: "Years as editor" },
      { value: "6.2k", label: "Newsletter subscribers" },
      { value: <em>40+</em>, label: "Writers commissioned" },
    ],
    beats: [
      "Editing",
      "Editorial direction",
      "Long reads",
      "Letters",
      "Commissioning",
      "The whole issue",
    ],
    featured: {
      kicker: "Editor's note · Issue 09",
      title: (
        <>
          Long reads are how we earn permission to ask{" "}
          <em>uncomfortable questions.</em>
        </>
      ),
      dek: "A note on why this issue leads with health, why it took nine months, and why the cover story almost didn't run at all.",
      publishedDate: new Date(2026, 5, 6),
      minutes: 4,
      readsThisWeek: "1.9k",
      articleId: "visibility-politics",
      image:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1000&auto=format&fit=crop",
    },
    articles: [
      {
        id: "visibility-politics",
        kicker: "Editor's note",
        title: (
          <>
            On earning permission to ask <em>uncomfortable questions.</em>
          </>
        ),
        dek: "Why Issue 09 leads with health, and why the cover almost didn't run.",
        meta: "Issue 09 · Jun 2026",
      },
      {
        id: "city-changed",
        kicker: "Editorial",
        title: (
          <>
            What a community magazine is <em>actually for.</em>
          </>
        ),
        dek: "Three years in, a stocktake of what we got right and what we're still getting wrong.",
        meta: "Issue 08 · May 2026",
      },
      {
        id: "i-arrived",
        kicker: "Letters",
        title: (
          <>
            You wrote back. <em>We changed our minds.</em>
          </>
        ),
        dek: "The reader letters that made us reopen a story we'd already published.",
        meta: "Issue 07 · Apr 2026",
      },
      {
        id: "housing-law",
        kicker: "Editor's note",
        title: (
          <>
            The piece we <em>didn't run.</em>
          </>
        ),
        dek: "On killing a story to protect the people in it, and what that cost.",
        meta: "Issue 06 · Feb 2026",
      },
      {
        id: "mouraria-family",
        kicker: "Editorial",
        title: (
          <>
            Pay the writers. <em>Then pay them again.</em>
          </>
        ),
        dek: "How a members-funded magazine decides what a queer freelancer's word is worth.",
        meta: "Issue 05 · Dec 2025",
      },
      {
        id: "kiko-neves",
        kicker: "Editor's note",
        title: (
          <>
            Issue 01, <em>in hindsight.</em>
          </>
        ),
        dek: "What we'd change about the first one, now that anyone's actually reading.",
        meta: "Issue 04 · Oct 2025",
      },
    ],
    readingTitle: (
      <>
        What Marta is <em>reading.</em>
      </>
    ),
    readingBlurb:
      "Editing bibles, other people's mastheads, and the letters section she reads first.",
    reading: [
      {
        title: (
          <>
            The Art of Editing <em>· Brian Dillon</em>
          </>
        ),
        tag: "book",
      },
      { title: "How small magazines survive", tag: "report, 2025" },
      {
        title: (
          <>
            Draft No. 4 <em>· John McPhee</em>
          </>
        ),
        tag: "book",
      },
      { title: "On commissioning across difference", tag: "essay" },
      {
        title: (
          <>
            A masthead is <em>a set of values</em>
          </>
        ),
        tag: "talk, 2024",
      },
    ],
    elsewhere: [
      {
        label: "marta@queerpulse.app",
        note: "· pitches & letters",
        href: "mailto:marta@queerpulse.app",
      },
      {
        label: "Bluesky",
        note: "· @martareis",
        href: "https://bsky.app/profile/martareis.bsky.social",
      },
    ],
    portrait:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400&auto=format&fit=crop",
  },
};

export const DEFAULT_AUTHOR_SLUG = "sara-pinheiro";

/**
 * Full-name → destination map for magazine bylines.
 *
 * Writers with a bespoke magazine author page resolve there; other credited
 * members resolve to their community profile; anyone unknown (e.g. a
 * photographer credited by name only) returns null so the byline stays plain.
 */
const AUTHOR_NAMES: Record<string, string> = {
  "Sara Pinheiro": "sara-pinheiro",
  "Jonas Ferreira": "jonas",
  "Luísa Gomes": "luisa",
  "Catarina Vaz": "catarina-vaz",
  "Tomás Mendes": "tomas-mendes",
  "Anika Kovač": "anika",
  "Sofia Andrade": "sofia",
  "Marta Reis": "marta-reis",
};

/** Credited members without a magazine author page → community profile. */
const MEMBER_NAMES: Record<string, string> = {
  "Inês Tavares": "ines",
  "Diogo Vasques": "diogo",
  "Mariana Costa": "mariana-costa",
  "Rui Fernandes": "rui-fernandes",
  "Tomás Beto": "tomas",
  "Catarina Melo": "catarina-melo",
  "André Quintela": "andre",
};

export interface ResolvedWriter {
  /** Router destination — the writer's magazine author page or member profile. */
  to: string;
  /**
   * Member-registry slug for this writer, when they also have a member
   * account — feeds `<MemberStaffBadge>` so a staff byline can carry the
   * badge. Undefined for writers who have a bespoke magazine author page but
   * no matching member entry (e.g. "Marta Reis") — never guessed from the
   * name, only looked up against the real registry.
   */
  slug?: string;
}

/**
 * Resolve a byline name to a router destination, or null when it should stay
 * plain text (unknown names, photographer/illustrator credits).
 */
export function resolveWriter(name: string): ResolvedWriter | null {
  const key = name.trim();
  const authorSlug = AUTHOR_NAMES[key];
  if (authorSlug) {
    return {
      to: `${routes.author}/${authorSlug}`,
      slug: getMember(authorSlug) ? authorSlug : undefined,
    };
  }
  const memberSlug = MEMBER_NAMES[key];
  if (memberSlug) return { to: `${routes.members}/${memberSlug}`, slug: memberSlug };
  return null;
}
