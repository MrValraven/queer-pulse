import { MEMBERS, memberName } from "../members/data/members";
import {
  formatDayHours,
  normalizeDayHours,
  normalizeHours,
  type DayHours,
  type PhotoKey,
} from "./listBusiness/listBusiness.data";

export type Tint = "coral" | "jade" | "plum";
export type HoursType =
  | "cafe"
  | "restaurant"
  | "bar"
  | "clinic"
  | "shop"
  | "gym"
  | "gallery"
  | "appointment"
  | "studio";

export interface Owner {
  name: string;
  initials: string;
  tint: Tint;
  role: string;
  bio: string;
  /** Whether the person who runs this place is a QueerPulse member. */
  inQueerPulse: boolean;
  /** First name, shown in copy. */
  first: string;
  /** The owner's public profile slug, for the "View profile" deep link. Present
   * only when they linked a public profile; absent/null otherwise (the link then
   * falls back to the members index). Resolved server-side from the owner id —
   * never a display name. */
  slug?: string | null;
}

/** The listing owner's single public reply to a review, shown beneath it.
 * Mirrors the backend's `ReviewOwnerReplyDTO` — absent/`null` until the owner
 * posts one via `PATCH /listings/:ref/reviews/:reviewId/reply`. */
export interface ReviewOwnerReply {
  text: string;
  at: string;
}

export interface Review {
  /** Stable id — the review's uuid PK live, a `<slug>-review-<n>` token in the
   * demo fixture. Targets `useReplyToReview`'s PATCH endpoint. */
  id: string;
  initials: string;
  name: string;
  tint: Tint;
  byline: string;
  stars: number;
  text: string;
  helpful: number;
  ownerReply?: ReviewOwnerReply | null;
  /** Reviewer's profile photo (member-authored reviews). Absent/null → the
   * tinted `initials` avatar is shown instead. */
  avatarUrl?: string | null;
  /** Reviewer's profile slug (member-authored reviews). When set, the name
   * links to `/members/:authorSlug`; absent/null → plain-text name (seeded or
   * non-member review). */
  authorSlug?: string | null;
}

export interface DirectoryPlace {
  /* ---- card ---- */
  slug: string;
  /** Human-readable business reference (e.g. `QPL-2026-0007`) — the id every
   * listing MUTATION path is keyed by (`/listings/:ref/...`, incl. the dispute
   * endpoint). Distinct from `slug` (the cosmetic public URL id). Absent for
   * demo places and until the detail DTO carries it; the dispute action gates
   * on its presence in live mode. */
  ref?: string | null;
  name: string;
  cat: string;
  hood: string;
  owned: boolean;
  member?: string;
  av: string;
  tint: Tint;
  desc: string;
  /* ---- detail ---- */
  tagline: string;
  pills: string[];
  rating: { score: string; count: number };
  gallery: string[];
  whatItIs: string[];
  goodFor: { label: string; yes: boolean }[];
  hoursType: HoursType;
  hoursNote: string;
  owner: Owner;
  social: {
    instagram?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  address: string;
  /** City the venue sits in — drives the location eyebrow and the JSON-LD
   * `addressRegion`. Absent on demo places (all Lisbon) → callers default to
   * Lisbon rather than mislabel a listing. */
  city?: string;
  /** IANA timezone the venue's `hours` are expressed in, so "Open now" is
   * correct regardless of the visitor's own timezone. Absent → Europe/Lisbon. */
  timezone?: string;
  /** Map pin from the listing; absent for demo places (they use BUSINESS_COORDS). */
  latitude?: number | null;
  longitude?: number | null;
  /** Safe-space verification state, threaded from the live directory card DTO.
   * Absent for demo places and submitted drafts (no live safe-space data). */
  safeSpaceStatus?: "none" | "verified" | "removed";
  /** Verification tier when `safeSpaceStatus` is "verified"; null otherwise/absent. */
  safeSpaceTier?: number | null;
  /** Real uploaded images (URL per slot, null when empty). Absent for demo
   * places, which fall back to the `gallery` caption blocks. */
  photos?: Record<PhotoKey, string | null>;
  alt?: Record<PhotoKey, string>;
  /** Real per-weekday hours keyed by `DAYS` id (`Mon`..`Sun`). Absent → the
   * templated `hoursRows(hoursType)` fallback renders instead. */
  hours?: Record<string, DayHours>;
  langs?: string[];
  /** `slug` deep-links to the Events Hub (`/events/:slug`); `id` is the DB PK,
   * present when the source event carries one. `startAt` is the raw ISO
   * start (local floating time, no timezone offset) — present on live data
   * and seeded on demo fixtures — and powers the add-to-calendar links;
   * absent means the calendar affordance is skipped gracefully. */
  upcoming?: {
    when: string;
    title: string;
    slug: string;
    id?: string;
    startAt?: string;
  }[];
  reviews: Review[];
  /** Count of members who saved this listing — backend-only field. Absent for
   * most demo places (the "hidden when absent" path); a few carry a seeded
   * value so the trust signal is visible in demo mode too. */
  savedCount?: number;
  /**
   * Safe-space trust block — present alongside `safeSpaceStatus`/
   * `safeSpaceTier` when this listing has ever been a verified/removed safe
   * space; absent for demo places, submitted drafts, and never-reviewed live
   * listings. `safeSpaceVouches` are RAW (no `initials`/`tint` — see
   * `directorySafeSpace.adapters.ts`, which derives those client-side for the
   * reused safety detail components).
   */
  safeSpaceVerifier?: string | null;
  safeSpaceReVerifiedAt?: string | null;
  safeSpaceSub?: string | null;
  safeSpacePromises?: { title: string; desc: string }[];
  safeSpaceVouches?: {
    name: string;
    byline: string;
    text: string;
    when: string;
  }[];
  safeSpaceRemoval?: {
    reason: string;
    removedDate: string;
    listedSince: string;
    flags: number;
    reasonLong: string[];
    timeline: { date: string; event: string }[];
    whatNow: string;
  } | null;
}

const C: Tint = "coral";
const J: Tint = "jade";
const P: Tint = "plum";

export const DIRECTORY_PLACES: DirectoryPlace[] = [
  {
    slug: "atelier-pulso",
    name: "Atelier Pulso",
    cat: "design",
    hood: "Príncipe Real",
    owned: true,
    member: "ines",
    av: "AP",
    tint: C,
    desc: "Graphic design studio specialising in brand identity and editorial work for cultural institutions and small presses. Open by appointment.",
    tagline:
      "A queer design studio for the people making culture in this city.",
    pills: ["Design studio", "By appointment", "€€", "Step-free entrance"],
    rating: { score: "4.9", count: 23 },
    gallery: [
      "Studio · main desk",
      "Print archive",
      "Type wall",
      "Window onto Príncipe Real",
    ],
    whatItIs: [
      "Inês runs Atelier Pulso as a one-and-a-half-person studio doing brand identity and editorial design — mostly for cultural institutions, small presses, and queer projects that need to look as serious as they are.",
      "It is genuinely open by appointment: message ahead and you can come look at the print archive, talk about a project, or just see how a real working studio runs. Riso and letterpress on site.",
    ],
    goodFor: [
      { label: "Brand identity for a queer project", yes: true },
      { label: "Editorial & book design", yes: true },
      { label: "Seeing a working print archive", yes: true },
      { label: "Quick same-day jobs", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "Open by appointment — message to arrange a time.",
    owner: {
      name: memberName("ines"),
      initials: MEMBERS.ines!.initials,
      tint: C,
      role: "Founder · designer",
      bio: "Designer for cultural institutions and small presses. Believes good design is a form of care.",
      inQueerPulse: true,
      first: "Inês",
    },
    social: {
      instagram: "@atelierpulso",
      website: "atelierpulso.pt",
      email: "ola@atelierpulso.pt",
    },
    address: "R. da Escola Politécnica 84 · Príncipe Real",
    reviews: [
      {
        id: "atelier-pulso-review-1",
        initials: MEMBERS.andre!.initials,
        name: memberName("andre"),
        tint: J,
        byline: "he/him · client",
        stars: 5,
        text: "Inês rebuilt my studio identity and somehow made it feel more like me than my old one did. Patient, fast, honest about what wasn't working.",
        helpful: 12,
      },
      {
        id: "atelier-pulso-review-2",
        initials: "LB",
        name: "Livraria Bertha",
        tint: P,
        byline: "partner",
        stars: 5,
        text: "Designed our entire signage and event series. Every queer press in Lisbon should be working with her.",
        helpful: 7,
      },
    ],
  },
  {
    slug: "queer-supper-club",
    name: "Queer Supper Club",
    cat: "food",
    hood: "Mouraria",
    owned: true,
    member: "tomas",
    av: "QS",
    tint: C,
    desc: "Monthly intimate dinners hosted by Tomás Beto — twelve seats, seasonal menu, honest cooking. The most important table in Mouraria.",
    tagline:
      "Twelve seats, one long table, and the best night out you can have sitting down.",
    pills: ["Supper club", "Monthly · ticketed", "€€€", "Dietary-friendly"],
    rating: { score: "5.0", count: 41 },
    savedCount: 27,
    gallery: [
      "The long table",
      "Open kitchen",
      "Mouraria courtyard",
      "Dessert course",
    ],
    whatItIs: [
      "Once a month Tomás Beto opens his Mouraria home and cooks a seasonal menu for twelve strangers who leave as something closer to friends. No menu choices, no separate tables — one seating, one conversation.",
      "Tickets go fast and the list is half community, half newcomers placed deliberately next to people they should meet. Tell him your dietary needs when you book and they're simply handled.",
    ],
    goodFor: [
      { label: "Meeting people without the bar", yes: true },
      { label: "A special-occasion dinner", yes: true },
      { label: "Solo diners (you'll be seated well)", yes: true },
      { label: "Walk-ins — it's ticketed only", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "Monthly seatings — book a seat for the next dinner.",
    owner: {
      name: memberName("tomas"),
      initials: MEMBERS.tomas!.initials,
      tint: C,
      role: "Chef · host",
      bio: "Chef and supper-club host. Cooks the way his avó did, for people who need a table.",
      inQueerPulse: true,
      first: "Tomás",
    },
    social: { instagram: "@queersupperclub", email: "table@queersupper.pt" },
    address: "Address shared with ticket · Mouraria",
    upcoming: [
      {
        when: "Sat 21 Jun · 20:00",
        title: "June dinner — early summer, the market decides",
        // Maps to the real demo gathering "Queer Supper Club №12" (same
        // host, Tomás) so the deep link resolves to a real event page
        // instead of gatheringDetails' silent default fallback.
        slug: "supper-club-12",
        startAt: "2026-06-21T20:00:00",
      },
      {
        when: "Sat 19 Jul · 20:00",
        title: "July dinner — stone fruit & the grill",
        // No second demo supper-club slug exists; "sober-queers-supper" is
        // the closest distinct supper-club-themed demo gathering.
        slug: "sober-queers-supper",
        startAt: "2026-07-19T20:00:00",
      },
    ],
    reviews: [
      {
        id: "queer-supper-club-review-1",
        initials: MEMBERS.carla!.initials,
        name: memberName("carla"),
        tint: C,
        byline: "she/her · regular",
        stars: 5,
        text: "I came alone to my first one terrified and left with three numbers and a full heart. Tomás seats you like he's been thinking about it all week.",
        helpful: 28,
      },
      {
        id: "queer-supper-club-review-2",
        initials: MEMBERS.kai!.initials,
        name: memberName("kai"),
        tint: J,
        byline: "they/them · 2 visits",
        stars: 5,
        text: "The food is genuinely excellent and the room is the point. Best twelve euros-an-hour my social life has ever spent.",
        helpful: 15,
      },
    ],
  },
  {
    slug: "estudio-beatriz-pinto",
    name: "Estúdio Beatriz Pinto",
    cat: "design",
    hood: "Graça",
    owned: true,
    member: "beatriz",
    av: "BP",
    tint: P,
    desc: "Ceramics studio producing functional pieces with a slow aesthetic. Workshop sessions monthly. Spare desks to share.",
    tagline:
      "A slow ceramics studio in Graça — and a couple of spare wheels for the right people.",
    pills: ["Ceramics studio", "Workshops monthly", "€€", "Step-free"],
    rating: { score: "4.8", count: 19 },
    gallery: [
      "The wheels",
      "Drying shelves",
      "Graça window light",
      "Glaze tests",
    ],
    whatItIs: [
      "Beatriz makes functional ceramics — mugs, plates, the odd commission — with an unhurried hand, and runs the studio as a quietly social place rather than a sealed workshop.",
      "Once a month she opens it for a beginners' workshop, and there are usually a couple of spare desks to rent if you have your own practice and want company while you work.",
    ],
    goodFor: [
      { label: "A first pottery workshop", yes: true },
      { label: "Renting a desk for your practice", yes: true },
      { label: "Commissioning a set", yes: true },
      { label: "Drop-in without booking", yes: false },
    ],
    hoursType: "studio",
    hoursNote: "Studio hours Tue–Sat; workshops monthly — book ahead.",
    owner: {
      name: memberName("beatriz"),
      initials: MEMBERS.beatriz!.initials,
      tint: P,
      role: "Ceramicist",
      bio: "Ceramicist in Graça. Runs the Disabled Queers access list on the side and builds access into everything.",
      inQueerPulse: true,
      first: "Beatriz",
    },
    social: {
      instagram: "@estudiobeatrizpinto",
      website: "beatrizpinto.pt",
      email: "estudio@beatrizpinto.pt",
    },
    address: "R. da Senhora do Monte 12 · Graça",
    reviews: [
      {
        id: "estudio-beatriz-pinto-review-1",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: J,
        byline: "she/her · workshop",
        stars: 5,
        text: "Did her beginners' day having never touched clay. Came home with two wonky bowls I use every day and a standing invitation to come back.",
        helpful: 9,
      },
      {
        id: "estudio-beatriz-pinto-review-2",
        initials: "BA",
        name: "Bairro Alto Studio",
        tint: J,
        byline: "desk-mate",
        stars: 4,
        text: "Rented a desk for three months. Calm, generous, good music. Only docked a star because I never wanted to leave.",
        helpful: 4,
      },
    ],
  },
  {
    slug: "opus-diversus",
    name: "Opus Diversus",
    cat: "health",
    hood: "Intendente",
    owned: false,
    av: "OD",
    tint: J,
    desc: "LGBTQ+-affirming mental health support — therapy, peer groups, crisis support. Sliding scale fees. Portuguese and English.",
    tagline:
      "Mental health support that doesn't make you explain yourself first.",
    pills: [
      "Mental health",
      "Sliding scale",
      "PT / EN",
      "Wheelchair-accessible",
    ],
    rating: { score: "4.9", count: 88 },
    gallery: ["Reception", "Therapy room", "Group room", "Intendente entrance"],
    whatItIs: [
      "Opus Diversus is an LGBTQ+-affirming mental health practice offering individual therapy, peer-support groups, and crisis support, with clinicians who are trained in — and many of whom share — queer and trans experience.",
      "Fees are sliding-scale and nobody is turned away for money. Sessions run in Portuguese and English, and the trans-care pathway is genuinely competent rather than improvised.",
    ],
    goodFor: [
      { label: "Affirming individual therapy", yes: true },
      { label: "Peer-support groups", yes: true },
      { label: "Sliding-scale / low-cost care", yes: true },
      { label: "Same-day emergency cover", yes: false },
    ],
    hoursType: "clinic",
    hoursNote: "Mon–Sat by appointment. Crisis line outside hours.",
    owner: {
      name: "The Opus Diversus team",
      initials: "OD",
      tint: J,
      role: "Partner organisation",
      bio: "A collective practice and a QueerPulse health partner — they also train our peer-support volunteers.",
      inQueerPulse: false,
      first: "the team",
    },
    social: {
      instagram: "@opusdiversus",
      website: "opusdiversus.pt",
      email: "ola@opusdiversus.pt",
      phone: "+351 21 888 0000",
    },
    address: "R. do Benformoso 140 · Intendente",
    upcoming: [
      {
        when: "Thu 12 Jun · 19:00",
        title: "Peer-support drop-in (open)",
        // Closest real demo gathering: an open, no-agenda peer meetup.
        slug: "trans-hub-meetup",
        startAt: "2026-06-12T19:00:00",
      },
    ],
    reviews: [
      {
        id: "opus-diversus-review-1",
        initials: MEMBERS.anika!.initials,
        name: memberName("anika"),
        tint: C,
        byline: "she/her · client",
        stars: 5,
        text: "First therapist I haven't had to educate. We started at the actual problem in session one. Sliding scale made it possible at all.",
        helpful: 33,
      },
      {
        id: "opus-diversus-review-2",
        initials: MEMBERS.jonas!.initials,
        name: memberName("jonas"),
        tint: J,
        byline: "he/him · group member",
        stars: 5,
        text: "The Thursday group got me through a hard winter. Held, never rushed, real clinical backup in the room.",
        helpful: 21,
      },
    ],
  },
  {
    slug: "livraria-bertha",
    name: "Livraria Bertha",
    cat: "culture",
    hood: "Príncipe Real",
    owned: true,
    av: "LB",
    tint: P,
    desc: "Queer-run independent bookshop with a strong feminist and LGBTQ+ section. Regular readings, launches, and community events.",
    tagline:
      "The bookshop that keeps the section you came for at the front, not the back.",
    pills: ["Bookshop", "Events space", "€€", "Step-free"],
    rating: { score: "4.9", count: 54 },
    gallery: [
      "Front table",
      "Queer & feminist wall",
      "Reading corner",
      "Event night",
    ],
    whatItIs: [
      "Bertha is a small queer-run independent bookshop where the feminist and LGBTQ+ titles aren't a shamefaced shelf in the corner — they're the front table, curated by people who've read them.",
      "Most weeks there's a reading, a launch, or a book club squeezed between the stacks. The staff recommendations are dangerous to your wallet and good for your soul.",
    ],
    goodFor: [
      { label: "Finding queer & feminist titles", yes: true },
      { label: "Readings and launches", yes: true },
      { label: "A staff recommendation", yes: true },
      { label: "A huge mainstream selection", yes: false },
    ],
    hoursType: "shop",
    hoursNote: "Open Tue–Sun. Event nights run later.",
    owner: {
      name: "Bertha collective",
      initials: "LB",
      tint: P,
      role: "Worker co-op",
      bio: "Run as a small worker co-operative. Several of the booksellers are QueerPulse members.",
      inQueerPulse: true,
      first: "the booksellers",
    },
    social: {
      instagram: "@livrariabertha",
      website: "livrariabertha.pt",
      email: "ola@livrariabertha.pt",
    },
    address: "R. da Imprensa Nacional 48 · Príncipe Real",
    photos: {
      wide: "https://images.unsplash.com/photo-1521123845560-14093637aa7d?q=80&w=1600&auto=format&fit=crop",
      d1: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop",
      d2: null,
      vibe: "https://images.unsplash.com/photo-1526243741027-444d633d7365?q=80&w=1200&auto=format&fit=crop",
    },
    alt: {
      wide: "Shelves of books at Livraria Bertha",
      d1: "The queer and feminist front table",
      d2: "",
      vibe: "A reading in progress among the stacks",
    },
    hours: normalizeHours({
      Tue: { open: true, from: "11:00", to: "19:00" },
      Wed: { open: true, from: "11:00", to: "19:00" },
      Thu: { open: true, from: "11:00", to: "19:00" },
      Fri: { open: true, from: "11:00", to: "21:00" },
      Sat: { open: true, from: "10:00", to: "21:00" },
      Sun: { open: true, from: "12:00", to: "18:00" },
    }),
    langs: ["pt", "en"],
    safeSpaceStatus: "verified",
    safeSpaceTier: 2,
    safeSpaceVerifier: "Mod team · 2 visits",
    safeSpaceReVerifiedAt: "12 May 2026",
    safeSpaceSub:
      "A queer-run bookshop that keeps the section you came for at the front — verified for how it treats the people who walk in, not just what's on the shelves.",
    safeSpacePromises: [
      {
        title: "Queer & feminist titles, front and centre.",
        desc: "Not a shamefaced shelf in the corner — the front table, curated by booksellers who've actually read the books.",
      },
      {
        title: "A safe room for readings & launches.",
        desc: "Staff watch the room during events and will step in on harassment without waiting to be asked.",
      },
      {
        title: "Names & pronouns honoured.",
        desc: "On a reservation, a book order, or just a chat at the till — you're called what you ask to be called.",
      },
      {
        title: "Incidents reported to moderation within 48h.",
        desc: "The collective has a direct line to QueerPulse moderation for anything that happens on-site.",
      },
    ],
    safeSpaceVouches: [
      {
        name: memberName("sofia-castano"),
        byline: "she/her · regular",
        text: "Ran a trans-lit book club here for a year. The collective gave us the back room for free and never once made it feel like a favour.",
        when: "Vouched 3 May 2026",
      },
      {
        name: memberName("nuno"),
        byline: "he/him · 4 visits",
        text: "Came for one book, stayed for a launch I didn't know was happening. Nobody's ever made me feel like I was taking up space.",
        when: "Vouched 19 Apr 2026",
      },
    ],
    upcoming: [
      {
        when: "Fri 13 Jun · 19:00",
        title: "Reading — new queer poetry in translation",
        // No dedicated demo "reading" gathering; the closest distinct
        // literary demo event is the book club.
        slug: "queer-book-club",
        startAt: "2026-06-13T19:00:00",
      },
      {
        when: "Sun 22 Jun · 17:00",
        title: 'Book club · "Stone Butch Blues"',
        // Exact match: gatheringDetails has a "Stone Butch Blues" book club.
        slug: "stone-butch-blues",
        startAt: "2026-06-22T17:00:00",
      },
    ],
    reviews: [
      {
        id: "livraria-bertha-review-1",
        initials: MEMBERS["sofia-castano"]!.initials,
        name: memberName("sofia-castano"),
        tint: P,
        byline: "she/her · regular",
        stars: 5,
        text: "I have never left empty-handed and never left poorer in spirit. The recommendations card by the till is a hazard.",
        helpful: 17,
      },
      {
        id: "livraria-bertha-review-2",
        initials: MEMBERS.nuno!.initials,
        name: memberName("nuno"),
        tint: J,
        byline: "he/him · 4 visits",
        stars: 5,
        text: "Came for one book, stayed for a launch I didn't know was happening, met half a reading group. That's Bertha.",
        helpful: 11,
      },
    ],
  },
  {
    slug: "cafe-mouraria-velha",
    name: "Café Mouraria Velha",
    cat: "food",
    hood: "Mouraria",
    owned: false,
    av: "CM",
    tint: J,
    desc: "Family-run café known among the community for warmth and a complete absence of hostility. Excellent pastéis.",
    tagline: "A sixty-year-old family café that quietly became one of ours.",
    pills: ["Café · pastelaria", "Daily", "€", "Ground floor"],
    rating: { score: "4.7", count: 36 },
    gallery: [
      "The counter",
      "Tiled interior",
      "Pastéis tray",
      "Mouraria street tables",
    ],
    whatItIs: [
      "Mouraria Velha isn't a queer business and would never call itself one — it's a family pastelaria that's been on the corner for sixty years. What it is, is reliably, unremarkably kind to everyone who walks in.",
      "The community adopted it for exactly that: no second glances, no misgendering, just a galão, a warm pastel de nata, and the dona who remembers your order. Sometimes the bar is simply that.",
    ],
    goodFor: [
      { label: "A no-stress neighbourhood coffee", yes: true },
      { label: "Bringing visiting family", yes: true },
      { label: "Cheap, excellent pastéis", yes: true },
      { label: "Late nights — closes early", yes: false },
    ],
    hoursType: "cafe",
    hoursNote: "Open daily, early. Closes by evening.",
    owner: {
      name: "The Sousa family",
      initials: "CM",
      tint: J,
      role: "Family-run",
      bio: "A family business, community-vouched rather than queer-owned. Allies in the quiet, daily way that counts.",
      inQueerPulse: false,
      first: "the family",
    },
    social: { phone: "+351 21 886 1234" },
    address: "R. do Capelão 18 · Mouraria",
    reviews: [
      {
        id: "cafe-mouraria-velha-review-1",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: J,
        byline: "she/her · local",
        stars: 5,
        text: 'Dona Fátima calls me "menina" and means it the way I need it meant. The pastéis are the best in Mouraria, fight me.',
        helpful: 14,
      },
      {
        id: "cafe-mouraria-velha-review-2",
        initials: MEMBERS.tomas!.initials,
        name: memberName("tomas"),
        tint: C,
        byline: "he/him · neighbour",
        stars: 4,
        text: "Not a queer spot, just a kind one. That's worth a lot. Half a star off only because they close before I'm hungry.",
        helpful: 6,
      },
    ],
  },
  {
    slug: "bairro-alto-studio",
    name: "Bairro Alto Studio",
    cat: "tech",
    hood: "Bairro Alto",
    owned: true,
    member: "diogo",
    av: "BA",
    tint: J,
    desc: "Music production studio available for session hire. Diogo and the team specialise in electronic and experimental work.",
    tagline: "A queer-run music studio where experimental isn't a dirty word.",
    pills: ["Music studio", "Session hire", "€€", "Lift access"],
    rating: { score: "4.8", count: 27 },
    gallery: ["The desk", "Live room", "Modular wall", "Bairro Alto rooftop"],
    whatItIs: [
      "Diogo runs a session-hire production studio leaning electronic and experimental, kitted with a serious modular wall and a live room that punches above the building it's in.",
      "Rates are fair, and community members get priority booking and a sliding scale for first records. You can hire it with or without Diogo and the team engineering.",
    ],
    goodFor: [
      { label: "Recording an electronic record", yes: true },
      { label: "Mixing & mastering", yes: true },
      { label: "First-record sliding scale", yes: true },
      { label: "Loud live bands at 3am", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "Session hire by booking, day and night slots.",
    owner: {
      name: memberName("diogo"),
      initials: MEMBERS.diogo!.initials,
      tint: J,
      role: "Producer · engineer",
      bio: "Music producer and Queer Runners regular. Specialises in electronic and experimental work.",
      inQueerPulse: true,
      first: "Diogo",
    },
    social: {
      instagram: "@bairroaltostudio",
      website: "bairroalto.studio",
      email: "book@bairroalto.studio",
    },
    address: "R. da Atalaia 90 · Bairro Alto",
    reviews: [
      {
        id: "bairro-alto-studio-review-1",
        initials: MEMBERS.kai!.initials,
        name: memberName("kai"),
        tint: J,
        byline: "they/them · artist",
        stars: 5,
        text: "Diogo got a sound out of my demos I'd been chasing for two years. The modular wall alone is worth the trip.",
        helpful: 10,
      },
      {
        id: "bairro-alto-studio-review-2",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: C,
        byline: "she/her · client",
        stars: 5,
        text: "First-record sliding scale meant I could actually afford to make the thing properly. Patient with a total beginner.",
        helpful: 8,
      },
    ],
  },
  {
    slug: "espaco-intendente",
    name: "Espaço Intendente",
    cat: "space",
    hood: "Intendente",
    owned: false,
    av: "EI",
    tint: P,
    desc: "Community coworking space, explicitly LGBTQ+-friendly. Day passes and monthly desks at accessible prices.",
    tagline:
      'A coworking space that put "LGBTQ+-friendly" in writing and meant it.',
    pills: ["Coworking", "Day passes", "€", "Wheelchair-accessible"],
    rating: { score: "4.6", count: 31 },
    gallery: ["Open floor", "Quiet room", "Kitchen", "Intendente square"],
    whatItIs: [
      "Espaço Intendente is a community coworking space — not queer-owned, but one that wrote an explicit inclusion policy, trained its staff, and de-gendered its bathrooms before anyone asked.",
      "Day passes are cheap, monthly desks are accessible, and the noticeboard is half freelance gigs and half queer events. A solid, low-drama place to actually get work done.",
    ],
    goodFor: [
      { label: "Affordable day-pass desk", yes: true },
      { label: "A quiet room for calls", yes: true },
      { label: "Meeting other queer freelancers", yes: true },
      { label: "24-hour access", yes: false },
    ],
    hoursType: "gym",
    hoursNote: "Open Mon–Sat, generous hours.",
    owner: {
      name: "Espaço Intendente",
      initials: "EI",
      tint: P,
      role: "Community space",
      bio: "An allied coworking space, community-vouched. Hosts several QueerPulse meetups.",
      inQueerPulse: false,
      first: "the space",
    },
    social: {
      instagram: "@espacointendente",
      website: "espacointendente.pt",
      email: "ola@espacointendente.pt",
      phone: "+351 21 222 3344",
    },
    address: "Largo do Intendente 8 · Intendente",
    reviews: [
      {
        id: "espaco-intendente-review-1",
        initials: MEMBERS.nuno!.initials,
        name: memberName("nuno"),
        tint: J,
        byline: "he/him · member",
        stars: 5,
        text: "Wrote the inclusion policy on the wall and actually live by it. Bathrooms de-gendered, staff trained, prices human.",
        helpful: 13,
      },
      {
        id: "espaco-intendente-review-2",
        initials: MEMBERS.carla!.initials,
        name: memberName("carla"),
        tint: C,
        byline: "she/her · day-pass",
        stars: 4,
        text: "Great for a focused day. Docked one star for the afternoon coffee situation, which is a crime against deadlines.",
        helpful: 5,
      },
    ],
  },
  {
    slug: "a-farinha",
    name: "A Farinha",
    cat: "food",
    hood: "Arroios",
    owned: true,
    av: "AF",
    tint: C,
    desc: "Queer-owned natural wine bar and small plates restaurant. Natural wine list, seasonal kitchen, generous hospitality.",
    tagline:
      "Natural wine, small plates, and a room that wants you to stay one more glass.",
    pills: ["Wine bar · small plates", "Evenings", "€€€", "Ground floor"],
    rating: { score: "4.8", count: 49 },
    savedCount: 18,
    gallery: ["The bar", "Small plates", "Wine wall", "Arroios corner"],
    whatItIs: [
      "A Farinha is a queer-owned natural wine bar and small-plates kitchen in Arroios — a short, seasonal menu, a long, opinionated wine list, and staff who actually want to talk you through it.",
      "It's the place for a second date, a celebration, or a slow Tuesday that turns into something. Tell them what you like and let them pour; they rarely miss.",
    ],
    goodFor: [
      { label: "A great second date", yes: true },
      { label: "Natural wine guidance", yes: true },
      { label: "Celebrating something", yes: true },
      { label: "A quick cheap bite", yes: false },
    ],
    hoursType: "bar",
    hoursNote: "Evenings, Tue–Sun. Closed Mondays.",
    owner: {
      name: "Marco & Renato",
      initials: "AF",
      tint: C,
      role: "Owners",
      bio: "A couple who left restaurant kitchens to open the room they wanted to drink in. One of them is a QueerPulse member.",
      inQueerPulse: true,
      first: "Marco",
    },
    social: {
      instagram: "@afarinha.lisboa",
      website: "afarinha.pt",
      email: "reservas@afarinha.pt",
      phone: "+351 21 099 8877",
    },
    address: "R. de Arroios 142 · Arroios",
    photos: {
      wide: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1600&auto=format&fit=crop",
      d1: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      d2: null,
      vibe: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1200&auto=format&fit=crop",
    },
    alt: {
      wide: "The bar at A Farinha",
      d1: "Small plates on the counter",
      d2: "",
      vibe: "A full room on a Friday night",
    },
    hours: normalizeHours({
      Tue: { open: true, from: "18:00", to: "00:00" },
      Wed: { open: true, from: "18:00", to: "00:00" },
      Thu: { open: true, from: "18:00", to: "01:00" },
      Fri: { open: true, from: "18:00", to: "02:00" },
      Sat: { open: true, from: "18:00", to: "02:00" },
      Sun: { open: true, from: "16:00", to: "23:00" },
    }),
    langs: ["pt", "en"],
    safeSpaceStatus: "verified",
    safeSpaceTier: 3,
    safeSpaceVerifier: "Mod team · 3 visits",
    safeSpaceReVerifiedAt: "27 Apr 2026",
    safeSpaceSub:
      "A queer-owned wine bar in Arroios, verified for hospitality that holds up on a packed Friday as well as a slow Tuesday.",
    safeSpacePromises: [
      {
        title: "Staff intervene, every time.",
        desc: "Marco and Renato brief every hire to step in on harassment without waiting to be asked — they'll walk a customer out before they walk you out.",
      },
      {
        title: "A table for the awkward first date.",
        desc: "Tell them it's a first meeting and they'll seat you somewhere calm and check in without hovering.",
      },
      {
        title: "Gender-neutral bathroom.",
        desc: "Single-stall, no gendered door, kept clean through a full service.",
      },
      {
        title: "Incidents reported to moderation within 48h.",
        desc: "Anything that happens here reaches the QueerPulse moderation team within two days.",
      },
    ],
    safeSpaceVouches: [
      {
        name: memberName("anika"),
        byline: "she/her · regular",
        text: "Told Renato it was a nervous first date and he sat us in the quiet corner without making a thing of it. Checked on us twice, perfectly.",
        when: "Vouched 9 Apr 2026",
      },
      {
        name: memberName("sofia-castano"),
        byline: "she/her · 3 visits",
        text: "Brought my mother here to test the waters. She relaxed within ten minutes — that's the room doing its job.",
        when: "Vouched 22 Mar 2026",
      },
    ],
    reviews: [
      {
        id: "a-farinha-review-1",
        initials: MEMBERS.anika!.initials,
        name: memberName("anika"),
        tint: C,
        byline: "she/her · regular",
        stars: 5,
        text: 'Told Renato "something orange and a bit weird" and he changed my whole opinion of wine. The plates kept coming and I let them.',
        helpful: 16,
      },
      {
        id: "a-farinha-review-2",
        initials: MEMBERS["sofia-castano"]!.initials,
        name: memberName("sofia-castano"),
        tint: P,
        byline: "she/her · 3 visits",
        stars: 5,
        text: "Brought a date, then brought my friends, then brought my mother. Passed every test. Hospitality you can feel.",
        helpful: 9,
      },
    ],
  },
  {
    slug: "studio-andre-quintela",
    name: "Studio André Quintela",
    cat: "design",
    hood: "Cais do Sodré",
    owned: true,
    member: "andre",
    av: "AQ",
    tint: J,
    desc: "Portrait photography studio. Analog film, medium format, studio on site. Priority allocation for community members.",
    tagline: "Analog portraits that see you the way you'd like to be seen.",
    pills: ["Photography", "By appointment", "€€", "Lift access"],
    rating: { score: "5.0", count: 22 },
    gallery: [
      "Shooting space",
      "Film loft",
      "Print wall",
      "Cais do Sodré light",
    ],
    whatItIs: [
      "André shoots portraits on analog film — medium format, real grain, a studio on site — and is unusually good at the thing portrait photographers claim and rarely deliver: making people feel safe enough to look like themselves.",
      "Community members get priority booking and a sliding scale, and he keeps a standing offer for free affirming portraits during transition milestones. Just ask.",
    ],
    goodFor: [
      { label: "Affirming portrait sessions", yes: true },
      { label: "Analog / medium-format film", yes: true },
      { label: "Transition milestone portraits", yes: true },
      { label: "Same-week digital turnaround", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "Portrait sessions by appointment.",
    owner: {
      name: memberName("andre"),
      initials: MEMBERS.andre!.initials,
      tint: J,
      role: "Photographer",
      bio: "Portrait photographer, all analog. Keeps a standing offer of free portraits for transition milestones.",
      inQueerPulse: true,
      first: "André",
    },
    social: {
      instagram: "@andrequintela.photo",
      website: "andrequintela.com",
      email: "studio@andrequintela.com",
    },
    address: "R. Nova do Carvalho 30 · Cais do Sodré",
    reviews: [
      {
        id: "studio-andre-quintela-review-1",
        initials: MEMBERS.kai!.initials,
        name: memberName("kai"),
        tint: J,
        byline: "they/them · sitter",
        stars: 5,
        text: "I hate being photographed. André made an hour feel like a conversation and the prints made me cry, in the good way.",
        helpful: 19,
      },
      {
        id: "studio-andre-quintela-review-2",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: C,
        byline: "she/her · milestone shoot",
        stars: 5,
        text: "Did my one-year portraits for free, no fuss, total grace. The film prints are on my wall and staying there.",
        helpful: 14,
      },
    ],
  },
  {
    slug: "clinica-da-estrela",
    name: "Clínica da Estrela",
    cat: "health",
    hood: "Estrela",
    owned: false,
    av: "CE",
    tint: P,
    desc: "General practice with two LGBTQ+-affirming GPs and a trans-competent endocrinologist. Accepts SNS referrals.",
    tagline:
      "A regular GP practice where you don't have to brace before the appointment.",
    pills: [
      "GP · endocrinology",
      "SNS referrals",
      "€€",
      "Wheelchair-accessible",
    ],
    rating: { score: "4.7", count: 63 },
    gallery: [
      "Reception",
      "Consulting room",
      "Waiting area",
      "Estrela entrance",
    ],
    whatItIs: [
      "Clínica da Estrela is an ordinary general practice that happens to have two genuinely LGBTQ+-affirming GPs and a trans-competent endocrinologist on its books — which, in this city, is anything but ordinary.",
      "It accepts SNS referrals and private appointments, and the front desk has been briefed so the first hurdle — being booked in under the right name — isn't a hurdle at all.",
    ],
    goodFor: [
      { label: "An affirming regular GP", yes: true },
      { label: "Trans-competent endocrinology", yes: true },
      { label: "SNS-referral appointments", yes: true },
      { label: "Walk-in urgent care", yes: false },
    ],
    hoursType: "clinic",
    hoursNote: "Mon–Sat by appointment. Closed Sundays.",
    owner: {
      name: "Clínica da Estrela",
      initials: "CE",
      tint: P,
      role: "Medical practice",
      bio: "An allied practice, community-vouched. The Trans Hub keeps it on the vetted-provider list.",
      inQueerPulse: false,
      first: "the practice",
    },
    social: {
      website: "clinicadaestrela.pt",
      email: "marcacoes@clinicadaestrela.pt",
      phone: "+351 21 396 5500",
    },
    address: "Calçada da Estrela 40 · Estrela",
    reviews: [
      {
        id: "clinica-da-estrela-review-1",
        initials: MEMBERS.jonas!.initials,
        name: memberName("jonas"),
        tint: J,
        byline: "he/him · patient",
        stars: 5,
        text: "Dr. Pereira treats me like an adult and the endocrinologist actually knows the protocols. Booked under the right name first try.",
        helpful: 24,
      },
      {
        id: "clinica-da-estrela-review-2",
        initials: MEMBERS.anika!.initials,
        name: memberName("anika"),
        tint: C,
        byline: "she/her · patient",
        stars: 4,
        text: "Genuinely affirming care. The wait for the endo can be a few weeks, hence four stars, but worth it.",
        helpful: 10,
      },
    ],
  },
  {
    slug: "galeria-lume",
    name: "Galeria Lume",
    cat: "culture",
    hood: "Marvila",
    owned: true,
    av: "GL",
    tint: C,
    desc: "Artist-run gallery in a Marvila warehouse. Programming focuses on queer and feminist artists, emphasis on emerging work.",
    tagline:
      "A warehouse gallery that bets on queer artists before the market does.",
    pills: ["Gallery", "Free entry", "€", "Step-free · large"],
    rating: { score: "4.8", count: 28 },
    gallery: ["Main hall", "Current show", "Project room", "Marvila exterior"],
    whatItIs: [
      "Lume is an artist-run gallery in a Marvila warehouse, programming queer and feminist work with a deliberate bias toward emerging artists who don't yet have a commercial gallery behind them.",
      "Entry is free, the openings are generous, and the project room is often someone's first-ever solo show. It works in partnership with the Rainbow Arts Collective — the collective is frequently where Lume's next show begins.",
    ],
    goodFor: [
      { label: "Seeing emerging queer art", yes: true },
      { label: "Generous, social openings", yes: true },
      { label: "A first solo show as an artist", yes: true },
      { label: "Buying blue-chip names", yes: false },
    ],
    hoursType: "gallery",
    hoursNote: "Open Wed–Sun afternoons. Openings run late.",
    owner: {
      name: "Lume collective",
      initials: "GL",
      tint: C,
      role: "Artist-run",
      bio: "Run by an artist collective; several members are on QueerPulse and overlap with Rainbow Arts.",
      inQueerPulse: true,
      first: "the collective",
    },
    social: {
      instagram: "@galerialume",
      website: "galerialume.pt",
      email: "ola@galerialume.pt",
    },
    address: "R. do Açúcar 76 · Marvila",
    upcoming: [
      {
        when: "Sat 28 Jun · 18:00",
        title: "Opening — group show, eight emerging artists",
        // Closest real demo gathering with an emerging-artists showcase feel.
        slug: "portfolio-night",
        startAt: "2026-06-28T18:00:00",
      },
    ],
    reviews: [
      {
        id: "galeria-lume-review-1",
        initials: MEMBERS.luisa!.initials,
        name: memberName("luisa"),
        tint: J,
        byline: "she/her · curator",
        stars: 5,
        text: "Lume shows the work the big institutions will be claiming to have discovered in five years. Go now and be smug later.",
        helpful: 12,
      },
      {
        id: "galeria-lume-review-2",
        initials: MEMBERS.beatriz!.initials,
        name: memberName("beatriz"),
        tint: P,
        byline: "she/her · artist",
        stars: 5,
        text: "They gave me my first solo room and treated it like it mattered. Openings feel like a community, not a market.",
        helpful: 8,
      },
    ],
  },
  {
    slug: "navalha",
    name: "Navalha",
    cat: "grooming",
    hood: "Príncipe Real",
    owned: true,
    av: "NV",
    tint: C,
    desc: "Queer-owned barbershop known for trans haircuts done right. No awkward questions. No gendered pricing.",
    tagline:
      "A barbershop where the cut you ask for is the cut you get — no negotiation.",
    pills: ["Barbershop", "Walk-in & booking", "€€", "Ground floor"],
    rating: { score: "5.0", count: 71 },
    savedCount: 41,
    gallery: [
      "The chairs",
      "Mirror wall",
      "Príncipe Real window",
      "Product shelf",
    ],
    whatItIs: [
      "Navalha is a queer-owned barbershop that built its reputation on the thing a lot of barbers fumble: giving trans and non-binary clients the haircut they actually asked for, without the interrogation or the flinch.",
      "Pricing is by service, never by gender or hair length, and the chairs are run by barbers who can talk you through a big change or just give you the usual in comfortable quiet.",
    ],
    goodFor: [
      { label: "Trans & non-binary cuts done right", yes: true },
      { label: "A first big chop, held gently", yes: true },
      { label: "Gender-neutral pricing", yes: true },
      { label: "Elaborate colour work", yes: false },
    ],
    hoursType: "shop",
    hoursNote: "Tue–Sat, walk-ins welcome, booking advised.",
    owner: {
      name: "Vasco Lima",
      initials: "NV",
      tint: C,
      role: "Owner · barber",
      bio: "Opened Navalha after years of sending friends across town for a safe cut. QueerPulse member from day one.",
      inQueerPulse: true,
      first: "Vasco",
    },
    social: {
      instagram: "@navalha.barbearia",
      email: "ola@navalha.pt",
      phone: "+351 21 347 2200",
    },
    address: "R. do Século 120 · Príncipe Real",
    reviews: [
      {
        id: "navalha-review-1",
        initials: MEMBERS.kai!.initials,
        name: memberName("kai"),
        tint: J,
        byline: "they/them · regular",
        stars: 5,
        text: "Asked for a cut I'd been too scared to ask for anywhere. Vasco just nodded and did it perfectly. I cried a little in the chair.",
        helpful: 41,
      },
      {
        id: "navalha-review-3",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: P,
        byline: "she/her · loyal regular",
        stars: 5,
        text: "Told them I wanted to look like the drawing I'd sketched of myself and somehow they got it right on the first try. This is the only barbershop I recommend to trans friends without a caveat.",
        helpful: 30,
      },
      {
        id: "navalha-review-4",
        initials: MEMBERS.carla!.initials,
        name: memberName("carla"),
        tint: C,
        byline: "she/her · quarterly",
        stars: 4,
        text: "Booked online, in the chair five minutes later, out with the best fade I've had in Lisbon. Docking one star only because a Saturday walk-in queue got long — book ahead if you can.",
        helpful: 22,
      },
      {
        id: "navalha-review-2",
        initials: MEMBERS.nuno!.initials,
        name: memberName("nuno"),
        tint: P,
        byline: "he/him · monthly",
        stars: 5,
        text: "Same price as my old place, none of the awkwardness, twice the skill. Never going anywhere else.",
        helpful: 13,
      },
      {
        id: "navalha-review-5",
        initials: MEMBERS.andre!.initials,
        name: memberName("andre"),
        tint: J,
        byline: "he/him · booked before a shoot",
        stars: 5,
        text: "Went in for a trim and mentioned I had a portrait session the next day. Vasco kept the shape, sharpened the edges, and it still looked like me in every frame.",
        helpful: 5,
      },
      {
        id: "navalha-review-6",
        initials: MEMBERS.diogo!.initials,
        name: memberName("diogo"),
        tint: J,
        byline: "he/they · first visit",
        stars: 3,
        text: "The cut itself was solid, and nobody blinked when I said \"no, shorter than that.\" Felt a little rushed near the end though — would've liked five more minutes on the beard line.",
        helpful: 2,
      },
    ],
  },
  {
    slug: "salao-mouraria",
    name: "Salão Mouraria",
    cat: "grooming",
    hood: "Mouraria",
    owned: false,
    av: "SM",
    tint: J,
    desc: "Neighbourhood salon adopted by the queer community. Bilingual, trans-welcoming, affordable.",
    tagline:
      "A neighbourhood salon that learned our names and never made it weird.",
    pills: ["Hair salon", "Affordable", "PT / EN", "Ground floor"],
    rating: { score: "4.6", count: 33 },
    gallery: [
      "Salon floor",
      "Wash station",
      "Mouraria street",
      "Waiting bench",
    ],
    whatItIs: [
      "Salão Mouraria isn't a queer business — it's a long-standing neighbourhood salon whose owner simply treats trans and queer clients with the same easy warmth as everyone else, and got recommended around until it became one of ours.",
      "It's affordable, bilingual enough, and unbothered. Not a destination so much as a reliable, kind local — which is sometimes exactly the thing.",
    ],
    goodFor: [
      { label: "An affordable trim, no fuss", yes: true },
      { label: "A trans-welcoming local salon", yes: true },
      { label: "Bilingual service", yes: true },
      { label: "High-fashion colour", yes: false },
    ],
    hoursType: "shop",
    hoursNote: "Tue–Sat. Booking by phone.",
    owner: {
      name: "Dona Lúcia",
      initials: "SM",
      tint: J,
      role: "Owner",
      bio: "Has run the salon for decades. Community-vouched ally rather than a member — and entirely lovely.",
      inQueerPulse: false,
      first: "Dona Lúcia",
    },
    social: { phone: "+351 21 885 6677" },
    address: "R. dos Lagares 9 · Mouraria",
    reviews: [
      {
        id: "salao-mouraria-review-1",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: J,
        byline: "she/her · regular",
        stars: 5,
        text: "Lúcia remembers exactly how I like it and never once made me feel like a question mark. Cheap, kind, close. Perfect.",
        helpful: 9,
      },
      {
        id: "salao-mouraria-review-2",
        initials: MEMBERS["sofia-castano"]!.initials,
        name: memberName("sofia-castano"),
        tint: C,
        byline: "she/her · 2 visits",
        stars: 4,
        text: "Lovely and affordable. Not the place for anything dramatic, but for a good honest cut from a kind person, ideal.",
        helpful: 4,
      },
    ],
  },
  {
    slug: "studio-cabelo",
    name: "Studio Cabelo",
    cat: "grooming",
    hood: "Intendente",
    owned: true,
    av: "SC",
    tint: P,
    desc: "Gender-neutral pricing on every service — never more based on hair length or gender. Clean space, good music.",
    tagline:
      "One price list, no gender column. Revolutionary how rare that still is.",
    pills: ["Hair studio", "Gender-neutral pricing", "€€", "Step-free"],
    rating: { score: "4.9", count: 38 },
    gallery: [
      "The chair",
      "Colour bar",
      "Intendente window",
      "Plants & playlist",
    ],
    whatItIs: [
      "Studio Cabelo built its whole identity on a quietly radical idea: one price list, by service, full stop. No surcharge for long hair, no men's-versus-women's column, no maths designed to charge women more.",
      "The space is clean, the music is good, and the stylists are skilled across textures and lengths. Come for the principle, stay because the cut is genuinely excellent.",
    ],
    goodFor: [
      { label: "Genuinely gender-neutral pricing", yes: true },
      { label: "Skilled cuts across all textures", yes: true },
      { label: "Colour and restyles", yes: true },
      { label: "A €10 budget trim", yes: false },
    ],
    hoursType: "shop",
    hoursNote: "Tue–Sat. Booking advised.",
    owner: {
      name: "Sara Coelho",
      initials: "SC",
      tint: P,
      role: "Owner · stylist",
      bio: "Left a salon that wouldn't drop gendered pricing and opened one that never had it. QueerPulse member.",
      inQueerPulse: true,
      first: "Sara",
    },
    social: {
      instagram: "@studiocabelo",
      website: "studiocabelo.pt",
      email: "ola@studiocabelo.pt",
    },
    address: "R. do Forno do Tijolo 22 · Intendente",
    reviews: [
      {
        id: "studio-cabelo-review-1",
        initials: MEMBERS.anika!.initials,
        name: memberName("anika"),
        tint: C,
        byline: "she/her · regular",
        stars: 5,
        text: "Paid the same as my partner for the first time in my life and the cut was better than either of us usually get. Sold forever.",
        helpful: 18,
      },
      {
        id: "studio-cabelo-review-2",
        initials: MEMBERS.kai!.initials,
        name: memberName("kai"),
        tint: J,
        byline: "they/them · client",
        stars: 5,
        text: 'No "which side of the price list are you" energy. Just good hair and good music. The bar, frankly.',
        helpful: 11,
      },
    ],
  },
  {
    slug: "academia-livre",
    name: "Academia Livre",
    cat: "fitness",
    hood: "Cais do Sodré",
    owned: false,
    av: "AL",
    tint: J,
    desc: "The most trans-inclusive gym in the city. Gender-neutral changing rooms on every floor, no body-shaming culture.",
    tagline:
      "A gym you can actually change in, designed by people who'd been driven out of others.",
    pills: ["Gym", "Memberships", "€€", "Wheelchair-accessible"],
    rating: { score: "4.7", count: 52 },
    gallery: [
      "Weights floor",
      "Gender-neutral changing",
      "Studio room",
      "Cais do Sodré entrance",
    ],
    whatItIs: [
      "Academia Livre isn't queer-owned, but it consulted trans members of the community when it refitted, and it shows: gender-neutral, private-stall changing rooms on every floor, a no-body-shaming policy with teeth, and staff trained to enforce it.",
      "It's a normal, well-equipped gym in every other respect — which is the point. The radical part is just being able to work out and shower without strategising.",
    ],
    goodFor: [
      { label: "Changing without strategising", yes: true },
      { label: "A no-shame training culture", yes: true },
      { label: "Standard well-equipped gym", yes: true },
      { label: "Boutique class-only fitness", yes: false },
    ],
    hoursType: "gym",
    hoursNote: "Open daily, early to late.",
    owner: {
      name: "Academia Livre",
      initials: "AL",
      tint: J,
      role: "Fitness club",
      bio: "An allied gym, community-vouched. Consulted trans members on its refit and listened.",
      inQueerPulse: false,
      first: "the gym",
    },
    social: {
      instagram: "@academialivre",
      website: "academialivre.pt",
      email: "ola@academialivre.pt",
      phone: "+351 21 343 9090",
    },
    address: "R. da Boavista 64 · Cais do Sodré",
    reviews: [
      {
        id: "academia-livre-review-1",
        initials: MEMBERS.jonas!.initials,
        name: memberName("jonas"),
        tint: J,
        byline: "he/him · member",
        stars: 5,
        text: "First gym in years I haven't had a panic about the changing room. Private stalls everywhere, staff who get it. Life-changing, genuinely.",
        helpful: 27,
      },
      {
        id: "academia-livre-review-2",
        initials: MEMBERS.nuno!.initials,
        name: memberName("nuno"),
        tint: P,
        byline: "he/him · member",
        stars: 4,
        text: "Solid kit, good policy, gets busy at 18:00 like every gym on earth. Four stars only for the queue at peak.",
        helpful: 7,
      },
    ],
  },
  {
    slug: "corpo-livre",
    name: "Corpo Livre",
    cat: "fitness",
    hood: "Bairro Alto",
    owned: true,
    av: "CL",
    tint: P,
    desc: "Feminist and queer-centred fitness studio. Small classes, no mirrors, no scales. Body-neutral by design.",
    tagline:
      "Fitness without the mirror, the scale, or the voice in your head.",
    pills: ["Fitness studio", "Class packs", "€€", "Step-free"],
    rating: { score: "4.9", count: 44 },
    gallery: [
      "Studio (no mirrors)",
      "Mat area",
      "Bairro Alto room",
      "Tea after class",
    ],
    whatItIs: [
      "Corpo Livre is a queer- and feminist-centred fitness studio built around small classes and a deliberate absence: no mirrors, no scales, no before-and-after talk. Movement for how it feels, not how it looks.",
      "Classes are capped low so instructors actually know you, and the culture is body-neutral by design rather than by slogan. Strength, mobility, and the radical novelty of not being watched.",
    ],
    goodFor: [
      { label: "Training without mirror anxiety", yes: true },
      { label: "Small, known classes", yes: true },
      { label: "A body-neutral culture", yes: true },
      { label: "Anonymous big-box workouts", yes: false },
    ],
    hoursType: "gym",
    hoursNote: "Class times Mon–Sat — book a spot.",
    owner: {
      name: "Mariana & Júlia",
      initials: "CL",
      tint: P,
      role: "Founders",
      bio: "Two trainers who quit body-shaming studios to build the opposite. Both QueerPulse members.",
      inQueerPulse: true,
      first: "Mariana",
    },
    social: {
      instagram: "@corpolivre.studio",
      website: "corpolivre.pt",
      email: "ola@corpolivre.pt",
    },
    address: "R. da Rosa 200 · Bairro Alto",
    reviews: [
      {
        id: "corpo-livre-review-1",
        initials: MEMBERS.rita!.initials,
        name: memberName("rita"),
        tint: C,
        byline: "she/her · regular",
        stars: 5,
        text: "No mirrors changed my entire relationship to exercise. I show up for how it feels now. The after-class tea is non-negotiable.",
        helpful: 20,
      },
      {
        id: "corpo-livre-review-2",
        initials: MEMBERS["sofia-castano"]!.initials,
        name: memberName("sofia-castano"),
        tint: J,
        byline: "she/her · class pack",
        stars: 5,
        text: "Small enough that Júlia corrects my form by name. Strong, calm, zero shame. Wish I'd found it years ago.",
        helpful: 12,
      },
    ],
  },
  {
    slug: "movimento",
    name: "Movimento",
    cat: "fitness",
    hood: "Alfama",
    owned: true,
    av: "MV",
    tint: C,
    desc: "Yoga, capoeira, and weights in a converted Alfama warehouse. Queer-run, sliding-scale memberships.",
    tagline:
      "Yoga, capoeira, and iron under one Alfama roof — pay what you can.",
    pills: ["Movement studio", "Sliding scale", "€", "Ramp access"],
    rating: { score: "4.8", count: 36 },
    gallery: [
      "Warehouse floor",
      "Capoeira roda",
      "Weights corner",
      "Alfama rooftop",
    ],
    whatItIs: [
      "Movimento is a queer-run movement space in a converted Alfama warehouse that refuses to specialise: yoga at dawn, capoeira in the evening, free weights in between, all in one generous room.",
      "Memberships are sliding-scale and nobody checks your maths, so the room ends up genuinely mixed — which is half the point. Come for one discipline, get curious about another.",
    ],
    goodFor: [
      { label: "Mixing yoga, capoeira & weights", yes: true },
      { label: "Pay-what-you-can access", yes: true },
      { label: "A genuinely mixed room", yes: true },
      { label: "Fancy machines & saunas", yes: false },
    ],
    hoursType: "gym",
    hoursNote: "Class schedule Mon–Sat; weights room open daily.",
    owner: {
      name: "Rui & Pedro",
      initials: "MV",
      tint: C,
      role: "Co-founders",
      bio: "Two friends who wanted one room for all the ways they move. Queer-run, sliding-scale on principle.",
      inQueerPulse: true,
      first: "Rui",
    },
    social: {
      instagram: "@movimento.alfama",
      website: "movimento.pt",
      email: "ola@movimento.pt",
    },
    address: "Beco do Mexias 4 · Alfama",
    upcoming: [
      {
        when: "Sun 15 Jun · 10:00",
        title: "Open capoeira roda — all levels, free",
        // Closest real demo gathering: free, all-levels group movement.
        slug: "queer-runners-run",
        startAt: "2026-06-15T10:00:00",
      },
    ],
    reviews: [
      {
        id: "movimento-review-1",
        initials: MEMBERS.kai!.initials,
        name: memberName("kai"),
        tint: J,
        byline: "they/them · member",
        stars: 5,
        text: "Where else can you do sun salutations and then deadlift in the same hour for whatever you can pay? Alfama's best-kept secret.",
        helpful: 15,
      },
      {
        id: "movimento-review-2",
        initials: MEMBERS.tomas!.initials,
        name: memberName("tomas"),
        tint: C,
        byline: "he/him · capoeira",
        stars: 5,
        text: "The roda on Sundays is pure joy and properly mixed — ages, bodies, levels. Sliding scale means everyone's actually there.",
        helpful: 8,
      },
    ],
  },
];

// Enrich every member-authored review with its author's profile slug + photo so
// the demo renders the same clickable name + avatar the live backend serves
// (see `toReviewDTO` in the backend). The review literals above are written as
// `name: memberName(slug)`, so a name→member index resolves the author without
// touching each entry. Reviews from non-members (partners, walk-ins keyed by a
// bare `initials`/`name`) simply don't match and stay unlinked, as intended.
(() => {
  const byName = new Map(
    Object.values(MEMBERS).map((member) => [
      memberName(member.slug),
      member,
    ]),
  );
  for (const place of DIRECTORY_PLACES) {
    for (const review of place.reviews) {
      const member = byName.get(review.name);
      if (!member) continue;
      review.authorSlug = member.slug;
      review.avatarUrl = member.photo ?? null;
    }
  }
})();

export function getPlace(slug: string | undefined): DirectoryPlace | undefined {
  return slug ? DIRECTORY_PLACES.find((p) => p.slug === slug) : undefined;
}

/**
 * Weekday hours templates. Index 0 = Monday … 6 = Sunday. Returns stable
 * English `dayKey` ids (i18n Pattern A) — the sole consumer,
 * `DirectorySpaceMain.tsx`, resolves `marketing:directory.days.${dayKey}`
 * via `t()`. `val` is `null` for a closed day so the consumer can render the
 * translated "Closed" chrome instead of a baked-in English string.
 */
export function hoursRows(
  type: HoursType,
): { dayKey: string; val: string | null; closed: boolean }[] {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const hoursByType: Record<HoursType, (string | null)[]> = {
    cafe: [
      null,
      "08:00 — 20:00",
      "08:00 — 20:00",
      "08:00 — 20:00",
      "08:00 — 23:00",
      "09:00 — 23:00",
      "09:00 — 18:00",
    ],
    restaurant: [
      null,
      "19:00 — 23:30",
      "19:00 — 23:30",
      "19:00 — 23:30",
      "19:00 — 24:00",
      "19:00 — 24:00",
      "13:00 — 16:00",
    ],
    bar: [
      null,
      "17:00 — 00:00",
      "17:00 — 00:00",
      "17:00 — 01:00",
      "17:00 — 02:00",
      "17:00 — 02:00",
      "16:00 — 23:00",
    ],
    clinic: [
      "09:00 — 18:00",
      "09:00 — 18:00",
      "09:00 — 18:00",
      "09:00 — 18:00",
      "09:00 — 18:00",
      "09:00 — 13:00",
      null,
    ],
    shop: [
      null,
      "11:00 — 19:00",
      "11:00 — 19:00",
      "11:00 — 19:00",
      "11:00 — 19:00",
      "11:00 — 19:00",
      null,
    ],
    gym: [
      "07:00 — 22:00",
      "07:00 — 22:00",
      "07:00 — 22:00",
      "07:00 — 22:00",
      "07:00 — 22:00",
      "09:00 — 19:00",
      "09:00 — 19:00",
    ],
    gallery: [
      null,
      null,
      "14:00 — 20:00",
      "14:00 — 20:00",
      "14:00 — 20:00",
      "12:00 — 20:00",
      "12:00 — 19:00",
    ],
    appointment: [null, null, null, null, null, null, null],
    studio: [
      null,
      "10:00 — 19:00",
      "10:00 — 19:00",
      "10:00 — 19:00",
      "10:00 — 19:00",
      "11:00 — 17:00",
      null,
    ],
  };
  return days.map((dayKey, i) => {
    const val = hoursByType[type][i] ?? null;
    return { dayKey, val, closed: val === null };
  });
}

/**
 * Rows from a listing's REAL per-weekday hours (keyed by DAYS id `Mon`..`Sun`),
 * shaped like `hoursRows` (lowercase english `dayKey`, Monday first) so the
 * detail page renders them through the same loop and day-label i18n keys.
 */
export function realHoursRows(
  hours: Record<string, DayHours>,
): { dayKey: string; val: string | null; closed: boolean }[] {
  const dayIds = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return dayIds.map((dayId, index) => {
    // `formatDayHours` renders one or two intervals ("12:00–15:00 · 19:00–02:00")
    // and returns null when the day is closed or blank.
    const value = formatDayHours(normalizeDayHours(hours[dayId]));
    return {
      dayKey: dayKeys[index]!,
      val: value,
      closed: value === null,
    };
  });
}

const DAY_IDS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** `index` is always taken mod 7, so the lookup is provably in range. */
function dayIdAt(index: number): (typeof DAY_IDS)[number] {
  return DAY_IDS[index]!;
}

function minutesOf(hourMinute: string): number {
  const parts = hourMinute.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  return hour * 60 + minute;
}

/**
 * Live open/closed state from real per-weekday hours. Returns `unknown` when no
 * hours are set (the page then hides the status chip). A window whose `to` is
 * less than or equal to `from` is treated as closing after midnight, so a late
 * bar reads correctly in the small hours of the next day.
 */
/**
 * The current wall-clock time in a venue's timezone, returned as a `Date` whose
 * LOCAL getters (`getHours`, `getDay`, …) already reflect that zone. Feeding
 * this into `openStatus` / the hours-table "today" highlight makes them read the
 * venue's clock, not the visitor's browser timezone — so a Lisbon bar open till
 * 2am doesn't show "Closed" to someone browsing from New York. Defaults to
 * Europe/Lisbon, where the directory lives.
 */
export function zonedNow(timeZone = "Europe/Lisbon"): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const hour = partValue("hour") % 24; // Intl can emit "24" at midnight
  return new Date(
    partValue("year"),
    partValue("month") - 1,
    partValue("day"),
    hour,
    partValue("minute"),
  );
}

/**
 * A user-entered website (`example.com`, `https://example.com/`, `www.…`)
 * turned into a safe absolute href. Prefixes `https://` only when no scheme is
 * already present, so a value the owner saved WITH one isn't doubled into the
 * broken `https://https://…`.
 */
export function websiteHref(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * The website reduced to a clean hostname for display — scheme, `www.`, and any
 * path stripped, so a long URL like `https://shotgun.live/en/venues/drama-bar`
 * reads simply as `shotgun.live` in the contact row (the link still points at
 * the full URL). Falls back to the trimmed input if it can't be parsed.
 */
export function websiteLabel(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

export function openStatus(
  hours: Record<string, DayHours> | undefined,
  now: Date,
): { state: "open" | "closed" | "unknown" } {
  if (!hours || Object.keys(hours).length === 0) return { state: "unknown" };
  const todayIndex = (now.getDay() + 6) % 7; // 0 = Monday
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const today = normalizeDayHours(hours[dayIdAt(todayIndex)]);
  if (today.open) {
    for (const interval of today.intervals) {
      const from = minutesOf(interval.from);
      const to = minutesOf(interval.to);
      // A same-day window is open in [from, to); an overnight window (to <= from)
      // is open from `from` until midnight tonight.
      if (to > from ? nowMinutes >= from && nowMinutes < to : nowMinutes >= from)
        return { state: "open" };
    }
  }
  // An overnight window opened yesterday may still be running past midnight.
  const yesterday = normalizeDayHours(hours[dayIdAt((todayIndex + 6) % 7)]);
  if (yesterday.open) {
    for (const interval of yesterday.intervals) {
      const from = minutesOf(interval.from);
      const to = minutesOf(interval.to);
      if (to <= from && nowMinutes < to) return { state: "open" };
    }
  }
  return { state: "closed" };
}
