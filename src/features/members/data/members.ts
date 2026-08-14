import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiEdit3,
  FiFileText,
  FiMessageCircle,
  FiMusic,
} from "react-icons/fi";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type { VisibilityMode } from "../../../shared/components/ui/VisibilityBadge";
import { routes } from "../../../app/routeMap";
import type { OpenToEntry } from "../openTo.data";
import type { WorkLink } from "../workLink.data";
import type { FeaturedCommunityRef } from "../profileCommunities.types";
import { REAL_ENTRIES } from "./realMembers";

export interface ShapingItem {
  title: string;
  note: string;
}
export interface WorkItem {
  category: string;
  title: string;
  year: string;
  image?: string;
  /** Where the card points, a platform entity or an external URL. Unlinked
   *  items render as plain cards, exactly as before. */
  link?: WorkLink;
}
/** A social / web link the member surfaces on their profile. */
export interface SocialLink {
  /** Stable client-side id for editable-list keying (minted when a row is added
   * in the editor). Optional: links loaded from the server may not carry one. */
  id?: string;
  /** Platform key (matches an option in `socialLinks.data`), e.g. "instagram", "website". */
  platform: string;
  /** The URL or @handle the member entered. */
  urlOrHandle: string;
}
export interface BoardItem {
  kind: "looking" | "offering";
  title: string;
  slug: string;
}
/** A skill or service the member offers on the barter board. */
export interface SkillItem {
  name: string;
  meta: string;
}
/** A group / reading circle / collective the member belongs to. */
export interface GroupItem {
  name: string;
  role: string;
}
/** A resolved "Also in the room" related member, carrying enough to render a
 *  card without a registry lookup. In live mode the backend returns these
 *  (from the profile's `related` cards); in demo mode the mock registry is
 *  resolved at render time from the `related` slug list instead. */
export interface RelatedMember {
  slug: string;
  first: string;
  last: string;
  role: string;
  hood: string;
  initials: string;
  tint: AvatarTint;
  /** Real profile photo URL when the related member has one. */
  avatarUrl?: string;
}
/** A recent public action, linking to where it happened. */
export interface ActivityItem {
  icon: IconType;
  title: string;
  sub: string;
  to: string;
}
export interface Member {
  /** Stable numeric id, assigned by registration order. */
  id: number;
  slug: string;
  first: string;
  last: string;
  role: string;
  /** Optional pronouns (e.g. "she/her", "they/them"), shown beside the role. */
  pronouns?: string;
  hood: string;
  tags: string[];
  visibility: VisibilityMode;
  initials: string;
  tint: AvatarTint;
  /** Profile photo URL (e.g. Unsplash). When absent, the avatar shows initials. */
  photo?: string;
  /** Saved reframe crop for `photo` (fractions of the source image), when the
   *  member cropped their avatar in the reframe editor. Absent = uncropped
   *  (today's `object-fit: cover` rendering). Only meaningful alongside a
   *  square/circle avatar box, never pass it into a non-square portrait box. */
  avatarCrop?: CropRect;
  verified: boolean;
  since: string;
  bio: string;
  now: string;
  /** What this member is open to, shared presets plus their own words.
   *  Presets are translatable and drive the directory filter; customs are the
   *  member's phrasing and are display-only. */
  openTo: OpenToEntry[];
  work: WorkItem[];
  /** Social / web links the member surfaces on their profile. Optional, most
   *  members have none; default to `[]` wherever read. */
  socials?: SocialLink[];
  /** Private "which identities feel like yours" preference (Settings → Interests).
   *  Not shown on the profile; drives content/community suggestions. */
  identities?: string[];
  /** Private "what are you looking for here" preference (Settings → Interests).
   *  Fixed taxonomy, private, distinct from the public `openTo` blurbs. */
  lookingFor?: string[];
  /** Whether `lookingFor` is shown on the profile to other viewers. Owner-only
   *  control; defaults to false (private) when absent. */
  lookingForPublic?: boolean;
  /** Whether the member's trust network (vouchers/vouched-for) is hidden
   *  from other members. Owner-only control; defaults to false (visible)
   *  when absent. Admins can still see it for safety. */
  privateNetwork?: boolean;
  /** Whether the member has opted in to being featured on the admin-curated
   *  homepage. Owner-only control; defaults to false when absent. Only
   *  meaningful when the profile's `visibility` is `"open"`. */
  featuredConsent?: boolean;
  board: BoardItem[];
  /** Member slugs of people who have vouched (cross-referenced into the registry). */
  vouchers: string[];
  voucherNames: string;
  /** Demo mode: slugs of related members, resolved against the mock registry at
   *  render time. Live mode leaves this empty and populates `relatedCards`. */
  related: string[];
  /** Live mode: pre-resolved related-member cards from the backend. When present
   *  and non-empty, "Also in the room" renders from these instead of resolving
   *  `related` slugs through the mock registry (which is empty for real members). */
  relatedCards?: RelatedMember[];
  shapings: Partial<Record<"film" | "book" | "song" | "moment", ShapingItem>>;
  /** Skills/services offered on the barter board. */
  skills: SkillItem[];
  /** Groups, reading circles and collectives the member is part of. */
  groups: GroupItem[];
  /** Communities the member has chosen to feature on their profile (owner-curated,
   *  ordered, never includes private-tier communities). Resolved refs for display. */
  featuredCommunities?: FeaturedCommunityRef[];
  /** Recent public activity across the platform. */
  activity: ActivityItem[];
}

/**
 * Prototype seed members, invented people who keep the demo populated while the
 * real community grows. Real members live in `./realMembers` and are merged in
 * below; when there are enough of them, this object is what gets deleted.
 */
const SEED_ENTRIES: Record<string, Omit<Member, "id">> = {
  "joao-ribeiro": {
    slug: "joao-ribeiro",
    first: "João",
    last: "Ribeiro",
    role: "Film critic & archivist · Cinema programming lead",
    pronouns: "he/him",
    hood: "Marvila",
    tags: [
      "Film criticism",
      "Programming",
      "Archive",
      "Documentary",
      "Portuguese cinema",
    ],
    visibility: "open",
    initials: "JR",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1044&auto=format&fit=crop",
    verified: true,
    since: "2024",
    bio: "Film critic and archivist in Marvila. I write on Portuguese and Iberian cinema for Expresso, Público and DocLisboa, and I programme the cover film each week for QueerPulse Cinema. My thesis, roughly: the room where queer people lived always precedes the film about it.",
    now: "Programming the autumn season for QueerPulse Cinema and finishing an essay on the queer silences in 1960s Portuguese cinema.",
    openTo: [
      { kind: "custom", label: "Screening proposals" },
      { kind: "custom", label: "Collection ideas" },
      { kind: "custom", label: "Archive tips" },
    ],
    socials: [
      { platform: "website", urlOrHandle: "joaoribeiro.pt" },
      { platform: "instagram", urlOrHandle: "@joao.programmes" },
    ],
    work: [
      {
        category: "Programming",
        title: "Iberian queer cinema, 1974–now, collection",
        year: "2025",
        image:
          "https://images.unsplash.com/photo-1753944847480-92f369a5f00e?q=80&w=600&auto=format&fit=crop",
        link: {
          kind: "ref",
          entity: "collection",
          slug: "iberian-queer-cinema",
        },
      },
      {
        category: "Essay",
        title: "Coded silence: reading the Portuguese archive",
        year: "2025",
        image:
          "https://images.unsplash.com/photo-1618410321132-9f4cebb2f7f5?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Programming",
        title: "Queer elders: portrait films, collection",
        year: "2024",
        image:
          "https://images.unsplash.com/photo-1711479898431-9031deb4ff0e?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Rare prints of pre-1974 Portuguese queer cinema",
        slug: "archive-prints",
      },
      {
        kind: "offering",
        title: "Programming mentorship for first-time curators",
        slug: "programming-mentorship",
      },
    ],
    vouchers: ["ines", "rui"],
    voucherNames: "Inês & Rui",
    related: ["sofia", "ines", "tomas"],
    skills: [
      { name: "Film programming", meta: "Available · seasons & collections" },
      {
        name: "Archive research",
        meta: "Trade · Portuguese & Iberian cinema",
      },
      {
        name: "Programming mentorship",
        meta: "Available · first-time curators",
      },
    ],
    groups: [
      {
        name: "QueerPulse Cinema",
        role: "Curators' council · Programming lead",
      },
      { name: "Lisbon Documentary Co-op", role: "Member" },
      { name: "Editorial Reading Circle", role: "Reading group · Member" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Programmed this week's cover film",
        sub: "The light between rooms · QueerPulse Cinema · June 2026",
        to: routes.cinema,
      },
      {
        icon: FiMessageCircle,
        title: "Wrote in the curator's notebook",
        sub: "On refusing the coming-out arc · 4 days ago",
        to: routes.cinema,
      },
      {
        icon: FiCalendar,
        title: "Hosting an archive screening",
        sub: "O Crime do Padre Amaro · Casa do Comum · 28 June",
        to: routes.event,
      },
    ],
    shapings: {
      film: {
        title: "O Crime do Padre Amaro (1967)",
        note: "The most Portuguese film in the archive. Coded silence that accumulates until the very last scene.",
      },
      book: {
        title: "The Celluloid Closet, Vito Russo",
        note: "Taught me that programming is a way of arguing with history.",
      },
      song: {
        title: "'Canção de Engate', António Variações",
        note: "The sound of a Lisbon that was learning to say our name out loud.",
      },
      moment: {
        title: "The first season I programmed, 2024",
        note: "Six films that refused the easy arc. Watching strangers stay for the second hour.",
      },
    },
  },
  ines: {
    slug: "ines",
    first: "Inês",
    last: "Tavares",
    role: "Graphic Designer · Founder, Atelier Pulso",
    hood: "Príncipe Real",
    tags: [
      "Branding",
      "Editorial",
      "Type design",
      "Art direction",
      "Risograph",
    ],
    visibility: "open",
    initials: "IT",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=1044&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: true,
    since: "2024",
    bio: "I design identities and editorial systems for cultural institutions, small presses and the occasional brave restaurant. Most of my work starts with a long conversation and a worse-for-wear notebook. I run a studio off the garden in Príncipe Real. The door's usually open.",
    now: "Wrapping a visual identity for a queer-run bookshop opening in Anjos this autumn, and slowly setting type for a riso zine about Lisbon's disappearing tascas.",
    openTo: [
      { kind: "preset", id: "collaborating" },
      { kind: "preset", id: "mentoring" },
      { kind: "preset", id: "casualMeetups" },
    ],
    socials: [
      { platform: "instagram", urlOrHandle: "@atelierpulso" },
      { platform: "website", urlOrHandle: "atelierpulso.pt" },
      { platform: "bluesky", urlOrHandle: "@ines.bsky.social" },
    ],
    work: [
      {
        category: "Identity",
        title: "Livraria Devagar, bookshop identity",
        year: "2025",
        image:
          "https://images.unsplash.com/photo-1680020556897-4495277f8efc?q=80&w=600&auto=format&fit=crop",
      },
      {
        category: "Editorial",
        title: "Tasca, a riso zine on vanishing taverns",
        year: "2025",
        image:
          "https://images.unsplash.com/photo-1731174218715-9b4d23795265?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Type",
        title: "Pulso Display, a variable serif",
        year: "2024",
        image:
          "https://images.unsplash.com/photo-1736613212084-4b7e6d94bc34?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "A collaborator for a queer zine launching in September",
        slug: "zine-collab",
      },
      {
        kind: "offering",
        title: "Portfolio reviews for junior queer designers",
        slug: "portfolio-reviews",
      },
    ],
    vouchers: ["sofia", "rui", "beatriz"],
    voucherNames: "Sofia, Rui & Beatriz",
    related: ["andre", "carla", "beatriz"],
    skills: [
      {
        name: "Brand identity sprints",
        meta: "Available · cultural orgs & small presses",
      },
      { name: "Portfolio reviews", meta: "Available · junior queer designers" },
      { name: "Risograph printing", meta: "Trade · zines & posters" },
      { name: "Type setting", meta: "Available · editorial projects" },
    ],
    groups: [
      { name: "Atelier Pulso", role: "Studio · Founder" },
      { name: "Riso Club Lisboa", role: "Print collective · Organiser" },
      { name: "Editorial Reading Circle", role: "Reading group · Member" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Featured in QueerPulse Magazine",
        sub: "Designing a queer bookshop's identity · Culture · June 2026",
        to: routes.magazine,
      },
      {
        icon: FiCalendar,
        title: "Hosting a portfolio review night",
        sub: "Atelier Pulso · 21 June",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Best riso printers in Lisbon? · 4 days ago",
        to: routes.forum,
      },
    ],
    shapings: {
      film: {
        title: "Mulholland Drive",
        note: "The first film that made me feel like my confusion was the point.",
      },
      book: {
        title: "Ways of Seeing, John Berger",
        note: "Changed how I look at everything I design.",
      },
      song: {
        title: "'Lança Perfume', Rita Lee",
        note: "My mother played it on Saturday mornings. I didn't know what it meant. I still don't. I love it.",
      },
      moment: {
        title: "My first risograph print, 2017",
        note: "Pulling a sheet from the drum and seeing it hadn't worked perfectly, and realising that was better.",
      },
    },
  },
  rui: {
    slug: "rui",
    first: "Rui",
    last: "Marçal",
    role: "Software Engineer",
    hood: "Marvila",
    tags: ["Backend", "Rust", "Infrastructure", "Open source"],
    visibility: "network",
    initials: "RM",
    tint: "plum",
    photo:
      "https://plus.unsplash.com/premium_photo-1682144187125-b55e638cf286?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: true,
    since: "2024",
    bio: "I build infrastructure for things that should last. Mostly backend, mostly Rust. I care a lot about systems that don't burn people out, technical or otherwise. Based in a warehouse in Marvila with too many plants.",
    now: "Building a low-cost infrastructure toolkit for queer-run nonprofits. Looking for a collaborator who knows their way around DevOps.",
    openTo: [
      { kind: "preset", id: "mentoring" },
      { kind: "preset", id: "clientWork" },
      { kind: "preset", id: "casualMeetups" },
    ],
    socials: [
      { platform: "github", urlOrHandle: "github.com/ruimarcal" },
      { platform: "linkedin", urlOrHandle: "linkedin.com/in/ruimarcal" },
    ],
    work: [
      {
        category: "Open source",
        title: "Fern, a lightweight job queue in Rust",
        year: "2025",
        image:
          "https://images.unsplash.com/photo-1737028512200-beec1a39e2f0?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Consulting",
        title: "Infra rebuild for a Lisbon NGO",
        year: "2024",
        image:
          "https://images.unsplash.com/photo-1762652847912-4c2761d54aa1?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Monthly mentoring for junior engineers",
        slug: "mentoring-engineers",
      },
    ],
    vouchers: ["ines", "diogo"],
    voucherNames: "Inês & Diogo",
    related: ["carla", "diogo", "ines"],
    skills: [
      {
        name: "DevOps & infra setup",
        meta: "Available · queer-run nonprofits",
      },
      { name: "Code review", meta: "Available · backend & Rust" },
      { name: "Self-hosting advice", meta: "Trade · privacy-first stacks" },
    ],
    groups: [
      { name: "Open Source Queers", role: "Community · Organiser" },
      { name: "Marvila Makers", role: "Collective · Member" },
      { name: "Sci-fi & Systems", role: "Reading group · Member" },
    ],
    activity: [
      {
        icon: FiMessageCircle,
        title: "Started a Forum thread",
        sub: "Low-cost infra for community projects · 1 week ago",
        to: routes.forum,
      },
      {
        icon: FiCalendar,
        title: "Attending a build night",
        sub: "Open Source Queers · 18 June",
        to: routes.event,
      },
      {
        icon: FiBookOpen,
        title: "Joined a reading group",
        sub: "Sci-fi & Systems · The Dispossessed",
        to: routes.readingGroups,
      },
    ],
    shapings: {
      film: {
        title: "Blade Runner 2049",
        note: "Not for the sci-fi. For the silence. For what it says about building things that outlast you.",
      },
      book: {
        title: "The Dispossessed, Ursula K. Le Guin",
        note: "The first book that made anarchism feel like an engineering problem.",
      },
      song: {
        title: "'Music For Airports', Brian Eno",
        note: "I put it on when I need to think without thinking.",
      },
      moment: {
        title: "First open source pull request merged, 2019",
        note: "A stranger on the internet said 'nice work.' I cried a little.",
      },
    },
  },
  sofia: {
    slug: "sofia",
    first: "Sofia",
    last: "Andrade",
    role: "Documentary Filmmaker",
    hood: "Alfama",
    tags: ["Directing", "Editing", "Sound", "Short docs"],
    visibility: "open",
    initials: "SA",
    tint: "jade",
    photo:
      "https://plus.unsplash.com/premium_photo-1690587673708-d6ba8a1579a5?q=80&w=679&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: true,
    since: "2023",
    bio: "I make documentaries about people who would never think to be documented. Slow, quiet, observational work, usually shot in Lisbon, occasionally somewhere with better light. I edit in a borrowed room in Alfama with a view I will never deserve.",
    now: "Post-production on a 28-minute doc about the last remaining tascas in Lisbon. Looking for a composer.",
    openTo: [
      { kind: "preset", id: "collaborating" },
      { kind: "custom", label: "Co-directing" },
      { kind: "custom", label: "Screening events" },
    ],
    work: [
      {
        category: "Documentary",
        title: "O Café das Seis, portrait of a Mouraria café",
        year: "2024",
        image:
          "https://images.unsplash.com/photo-1770462594767-c64faffea172?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Short doc",
        title: "After the Factory, Marvila changing",
        year: "2023",
        image:
          "https://images.unsplash.com/photo-1772110204334-b2e9c346515e?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "A composer for a short documentary, paid",
        slug: "composer-doc",
      },
    ],
    vouchers: ["ines", "mariana"],
    voucherNames: "Inês & Mariana",
    related: ["andre", "ines", "mariana"],
    skills: [
      {
        name: "Documentary consults",
        meta: "Available · first-time directors",
      },
      { name: "Editing", meta: "Trade · short docs" },
      { name: "Interview facilitation", meta: "Available · bilingual PT/EN" },
    ],
    groups: [
      { name: "Alfama Film Club", role: "Screening group · Organiser" },
      { name: "Lisbon Doc Collective", role: "Collective · Member" },
      { name: "Sound & Image", role: "Community · Member" },
    ],
    activity: [
      {
        icon: FiEdit3,
        title: "Published in QueerPulse Magazine",
        sub: "On filming the last tascas · Culture · May 2026",
        to: routes.magazine,
      },
      {
        icon: FiCalendar,
        title: "Screening at a community night",
        sub: "O Café das Seis · 27 June",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Composers for a short doc? · 2 days ago",
        to: routes.forum,
      },
    ],
    shapings: {
      film: {
        title: "Jeanne Dielman, 23 quai du Commerce",
        note: "Watching someone do dishes for 20 minutes and feeling everything.",
      },
      book: {
        title: "Camera Lucida, Roland Barthes",
        note: "He describes grief and calls it photography. I've never recovered.",
      },
      song: {
        title: "'Canto Moço', Sérgio Godinho",
        note: "My grandmother used to hum it. I only found out what it was after she died.",
      },
      moment: {
        title: "The first time a stranger cried watching my film",
        note: "At a screening in a borrowed café. I didn't know what to do with myself.",
      },
    },
  },
  tomas: {
    slug: "tomas",
    first: "Tomás",
    last: "Beto",
    role: "Chef · Supper Club Host",
    hood: "Mouraria",
    tags: ["Fermentation", "Seasonal menus", "Supper clubs", "Natural wine"],
    visibility: "network",
    initials: "TB",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1710787051760-1bd406b7c535?q=80&w=760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: false,
    since: "2025",
    bio: "I run a supper club out of my home in Mouraria every few weeks, twelve seats, no menu, whatever came in that week. I ferment things obsessively and think deeply about food as hospitality rather than spectacle.",
    now: "Planning the 13th edition of the Mouraria supper club. Working on a small fermentation guide for the community.",
    openTo: [
      { kind: "custom", label: "Catering collaborations" },
      { kind: "custom", label: "Recipe testing" },
      { kind: "preset", id: "casualMeetups" },
    ],
    work: [
      {
        category: "Supper club",
        title: "Queer Supper Club, 12 editions in Mouraria",
        year: "2024–25",
        image:
          "https://images.unsplash.com/photo-1772482360229-d93a8ef2de07?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [],
    vouchers: ["sofia", "beatriz"],
    voucherNames: "Sofia & Beatriz",
    related: ["beatriz", "sofia", "ines"],
    skills: [
      { name: "Supper club catering", meta: "Trade · long dinners" },
      { name: "Fermentation help", meta: "Available · in-person, Lisbon" },
      { name: "Menu development", meta: "Available · seasonal & plant-led" },
    ],
    groups: [
      { name: "Queer Supper Club", role: "Collective · Host" },
      { name: "Mouraria Neighbours", role: "Community · Member" },
      { name: "Slow Food Circle", role: "Reading group · Member" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Hosting the 13th supper club",
        sub: "Twelve seats · Mouraria · 28 June",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Where to find natural wine in Lisbon? · 3 days ago",
        to: routes.forum,
      },
      {
        icon: FiBookOpen,
        title: "Started a reading group",
        sub: "Slow Food Circle · The Omnivore's Dilemma",
        to: routes.readingGroups,
      },
    ],
    shapings: {
      film: {
        title: "Tampopo",
        note: "A film about ramen that is actually about love and obsession and why both are worth it.",
      },
      book: {
        title: "The Omnivore's Dilemma, Michael Pollan",
        note: "Made me furious in all the right ways.",
      },
      song: {
        title: "'Estranha Forma de Vida', Amália Rodrigues",
        note: "I don't agree with everything she stood for but no one has ever meant it more.",
      },
      moment: {
        title: "Feeding 60 people from a single pumpkin",
        note: "A supper club disaster that became my best meal. Scarcity focused everything.",
      },
    },
  },
  mariana: {
    slug: "mariana",
    first: "Mariana",
    last: "Loução",
    role: "Clinical Psychologist",
    hood: "Estrela",
    tags: ["LGBTQ+ care", "Therapy", "Group work", "Peer support"],
    visibility: "private",
    initials: "ML",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1614204424926-196a80bf0be8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: true,
    since: "2024",
    bio: "I work with LGBTQ+ adults navigating identity, relationships and the weight of being visible in a world that sometimes asks too much of us. My practice is in Estrela. I'm on QueerPulse because community matters for mental health, including mine.",
    now: "Running a monthly peer support group for queer professionals. Currently full but keeping a waitlist.",
    openTo: [
      { kind: "custom", label: "Peer consultations" },
      { kind: "preset", id: "referrals" },
      { kind: "custom", label: "Community mental health conversations" },
    ],
    work: [],
    board: [],
    vouchers: ["sofia"],
    voucherNames: "Sofia",
    related: ["sofia", "ines", "carla"],
    skills: [
      { name: "Peer consultations", meta: "Available · referrals welcome" },
      { name: "Group facilitation", meta: "Available · peer support" },
      { name: "Community talks", meta: "Trade · mental health & visibility" },
    ],
    groups: [
      {
        name: "Queer Professionals Peer Group",
        role: "Support group · Facilitator",
      },
      { name: "Estrela Neighbours", role: "Community · Member" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Running a monthly peer group",
        sub: "Queer professionals · waitlist open",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Finding LGBTQ+-affirming therapists · 5 days ago",
        to: routes.forum,
      },
    ],
    shapings: {
      film: {
        title: "Portrait of a Lady on Fire",
        note: "A film about looking and being looked at. I think about it in every session.",
      },
      book: {
        title: "The Body Keeps the Score, Bessel van der Kolk",
        note: "A starting point for asking better questions rather than therapy gospel.",
      },
      song: {
        title: "'Pessoa', Dead Combo",
        note: "Lisbon in 6 minutes. No words needed.",
      },
      moment: {
        title: "A group session where no one spoke for 4 minutes",
        note: "And it was the most therapeutic thing that had ever happened in that room.",
      },
    },
  },
  andre: {
    slug: "andre",
    first: "André",
    last: "Quintela",
    role: "Portrait Photographer",
    hood: "Cais do Sodré",
    tags: ["Portrait", "Analog film", "Studio", "Medium format"],
    visibility: "open",
    initials: "AQ",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1547646034-d37a03ebaba3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: false,
    since: "2025",
    bio: "I shoot portraits on film, mostly medium format, mostly natural light, mostly people who have never liked having their photograph taken. I have a studio in Cais do Sodré that smells like fixer and old wood. Come and visit.",
    now: "Offering free portrait sessions for trans and nonbinary community members. No agenda, just a good photo.",
    openTo: [
      { kind: "preset", id: "commissions" },
      { kind: "custom", label: "Collaborative zines" },
      { kind: "preset", id: "studioVisits" },
    ],
    work: [
      {
        category: "Portrait series",
        title: "Faces of the Bairro, 40 portraits in Mouraria",
        year: "2024",
        image:
          "https://images.unsplash.com/photo-1773136355382-e27d8cc9ae22?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Editorial",
        title: "Covers for Pulsar magazine, issues 3–6",
        year: "2025",
        image:
          "https://images.unsplash.com/photo-1774300622212-1d9a3be2d4f1?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Free portrait sessions for trans & nonbinary members",
        slug: "free-portraits",
      },
    ],
    vouchers: ["ines"],
    voucherNames: "Inês",
    related: ["sofia", "ines", "diogo"],
    skills: [
      { name: "Portrait sessions", meta: "Free · trans & nonbinary members" },
      { name: "Film developing lessons", meta: "Trade · analog film" },
      { name: "Editorial photography", meta: "Available · zines & covers" },
    ],
    groups: [
      { name: "Analog Lisboa", role: "Collective · Organiser" },
      { name: "Cais do Sodré Film Studio", role: "Studio · Member" },
      { name: "Portrait Exchange", role: "Barter collective · Member" },
    ],
    activity: [
      {
        icon: FiCamera,
        title: "Added work to the Art Showcase",
        sub: "Faces of the Bairro · Culture",
        to: routes.culture,
      },
      {
        icon: FiCalendar,
        title: "Free portrait day",
        sub: "For trans & nonbinary members · 15 June",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Best film labs still open in Lisbon? · 1 week ago",
        to: routes.forum,
      },
    ],
    shapings: {
      film: {
        title: "The Ballad of Sexual Dependency, Nan Goldin",
        note: "A slideshow rather than a film. Changed what I thought a portrait was allowed to be.",
      },
      book: {
        title: "Ways of Seeing, John Berger",
        note: "Keeps ending up in other people's lists. There's a reason.",
      },
      song: {
        title: "'Strange Fruit', Billie Holiday",
        note: "The most political photograph I've ever heard.",
      },
      moment: {
        title: "Finding my grandmother's Rolleiflex in a box",
        note: "Loaded it, shot a roll without knowing if it worked. It did.",
      },
    },
  },
  carla: {
    slug: "carla",
    first: "Carla",
    last: "Nogueira",
    role: "Product Manager",
    hood: "Arroios",
    tags: ["Fintech", "Product strategy", "UX", "Team building"],
    visibility: "network",
    initials: "CN",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: true,
    since: "2024",
    bio: "I've shipped products at two fintechs and one very strange startup. I'm interested in what it means to build ethically as a daily practice rather than a marketing position. I live in Arroios, walk everywhere, and am genuinely good at spotting the real problem.",
    now: "Between roles, thinking carefully about what's next. Looking for a June–August sublet while I figure it out.",
    openTo: [
      { kind: "preset", id: "clientWork" },
      { kind: "preset", id: "casualMeetups" },
      { kind: "custom", label: "Sublet leads in Arroios" },
    ],
    work: [
      {
        category: "Product",
        title: "Payments redesign at a Lisbon fintech",
        year: "2024",
        image:
          "https://images.unsplash.com/photo-1775536867092-1aa0a9cd6449?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Strategy",
        title: "Zero-to-one consumer product",
        year: "2023",
        image:
          "https://plus.unsplash.com/premium_photo-1667823753552-1159b2b9c3c7?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "A sublet in Arroios, June through August",
        slug: "sublet-arroios",
      },
    ],
    vouchers: ["rui", "ines"],
    voucherNames: "Rui & Inês",
    related: ["rui", "ines", "mariana"],
    skills: [
      { name: "Product consults", meta: "Available · informal chats" },
      { name: "UX reviews", meta: "Trade · early-stage products" },
      { name: "Roadmapping", meta: "Available · zero-to-one" },
    ],
    groups: [
      { name: "Ethical Product Lisbon", role: "Community · Member" },
      { name: "Non-fiction Circle", role: "Reading group · Member" },
      { name: "Arroios Walkers", role: "Social · Member" },
    ],
    activity: [
      {
        icon: FiMessageCircle,
        title: "Started a Forum thread",
        sub: "A sublet in Arroios, June–August? · 2 days ago",
        to: routes.forum,
      },
      {
        icon: FiCalendar,
        title: "Attending a product meetup",
        sub: "Ethical Product Lisbon · 20 June",
        to: routes.event,
      },
      {
        icon: FiBookOpen,
        title: "Joined a reading group",
        sub: "Non-fiction Circle · Invisible Cities",
        to: routes.readingGroups,
      },
    ],
    shapings: {
      film: {
        title: "The Social Network",
        note: "I know. But it was the first time I saw building a product as drama rather than engineering.",
      },
      book: {
        title: "Invisible Cities, Italo Calvino",
        note: "A product manager's secret handbook disguised as poetry.",
      },
      song: {
        title: "'Killing Me Softly', Lauryn Hill",
        note: "I listened to The Miseducation on repeat for one entire year.",
      },
      moment: {
        title: "Killing a feature I'd spent 3 months on",
        note: "Because the data said so and my gut agreed. The hardest easy decision.",
      },
    },
  },
  beatriz: {
    slug: "beatriz",
    first: "Beatriz",
    last: "Pinto",
    role: "Ceramicist",
    hood: "Graça",
    tags: ["Studio ceramics", "Glazing", "Teaching", "Functional objects"],
    visibility: "open",
    initials: "BP",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1747173790110-e53942765d2c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: false,
    since: "2025",
    bio: "I make ceramics in a studio in Graça. Functional pieces with a slow, considered aesthetic. I teach occasional workshops and am almost always covered in clay. The studio has two spare desks and good afternoon light.",
    now: "Preparing a small exhibition of functional pieces for late summer. Also testing new glaze formulas that keep going wrong in interesting ways.",
    openTo: [
      { kind: "preset", id: "studioVisits" },
      { kind: "custom", label: "Collaborations with designers" },
      { kind: "custom", label: "Workshop participants" },
    ],
    work: [
      {
        category: "Collection",
        title: "Slow Objects, functional ceramics collection",
        year: "2025",
        image:
          "https://plus.unsplash.com/premium_photo-1670523428691-401adf274515?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Workshop",
        title: "Beginners wheel-throwing, monthly",
        year: "2024–25",
        image:
          "https://plus.unsplash.com/premium_photo-1675791726816-1ac1e815f579?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Two desks to share in a bright Graça studio",
        slug: "desks-graca",
      },
    ],
    vouchers: ["tomas", "ines"],
    voucherNames: "Tomás & Inês",
    related: ["tomas", "ines", "andre"],
    skills: [
      { name: "Wheel-throwing workshops", meta: "Trade · beginners welcome" },
      { name: "Glaze testing", meta: "Available · studio swaps" },
      { name: "Two studio desks", meta: "Offering · bright Graça light" },
    ],
    groups: [
      { name: "Graça Studio Share", role: "Studio · Host" },
      { name: "Clay & Craft", role: "Collective · Member" },
      { name: "Slow Objects Circle", role: "Reading group · Member" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Opening a small exhibition",
        sub: "Slow Objects · late summer",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Shared kiln space in Lisbon? · 4 days ago",
        to: routes.forum,
      },
      {
        icon: FiBookOpen,
        title: "Joined a reading group",
        sub: "Slow Objects Circle · Zen & the Art…",
        to: routes.readingGroups,
      },
    ],
    shapings: {
      film: {
        title: "Être et Avoir",
        note: "A documentary about a one-room school. Slow and full of care. Everything I want my work to be.",
      },
      book: {
        title: "Zen and the Art of Motorcycle Maintenance, Pirsig",
        note: "I read it twice, understood it differently each time.",
      },
      song: {
        title: "'Aqui Estou Eu', José Mário Branco",
        note: "Learned it as a child at a school play. Still know every word.",
      },
      moment: {
        title: "The first pot I made that didn't crack in the kiln",
        note: "After 47 that did. That number still feels important.",
      },
    },
  },
  diogo: {
    slug: "diogo",
    first: "Diogo",
    last: "Vasques",
    role: "Music Producer",
    hood: "Bairro Alto",
    tags: ["Mixing", "Live sets", "Electronic", "Queer club nights"],
    visibility: "network",
    initials: "DV",
    tint: "jade",
    photo:
      "https://plus.unsplash.com/premium_photo-1733971878574-4d1d01489603?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: true,
    since: "2023",
    bio: "I produce electronic music and mix live sets, mostly for queer club nights but occasionally for things that don't have a name yet. I have a small studio above a café in Bairro Alto that I share with two other producers. The hours are unsociable but the music is worth it.",
    now: "Working on a new EP and scoring music for Sofia's documentary. Open to new live set commissions for late 2026.",
    openTo: [
      { kind: "preset", id: "commissions" },
      { kind: "preset", id: "collaborating" },
      { kind: "preset", id: "swaps" },
    ],
    work: [
      {
        category: "Production",
        title: "'Pulso', debut EP, self-released",
        year: "2025",
        image:
          "https://plus.unsplash.com/premium_photo-1682545693253-c9491d190b8f?q=80&w=800&auto=format&fit=crop",
        link: {
          kind: "external",
          href: "https://nightform.bandcamp.com",
        },
      },
      {
        category: "Live",
        title: "Resident DJ, Queer Thursdays at Lux",
        year: "2024–25",
        image:
          "https://plus.unsplash.com/premium_photo-1731950841187-cfbec0ed025b?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [],
    vouchers: ["rui", "sofia"],
    voucherNames: "Rui & Sofia",
    related: ["rui", "sofia", "andre"],
    skills: [
      { name: "Live set commissions", meta: "Available · queer club nights" },
      { name: "Mixing", meta: "Trade · EPs & demos" },
      { name: "Studio time swaps", meta: "Trade · Bairro Alto" },
    ],
    groups: [
      { name: "Queer Thursdays", role: "Collective · Resident" },
      { name: "Bairro Alto Studio", role: "Studio · Member" },
      { name: "Sound & Image", role: "Community · Member" },
    ],
    activity: [
      {
        icon: FiMusic,
        title: "Released a debut EP",
        sub: "'Pulso' · self-released · 2025",
        to: routes.culture,
      },
      {
        icon: FiCalendar,
        title: "Resident DJ set",
        sub: "Queer Thursdays at Lux",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the Forum",
        sub: "Scoring a documentary, rate advice? · 6 days ago",
        to: routes.forum,
      },
    ],
    shapings: {
      film: {
        title: "Paris Is Burning",
        note: "Before I knew what a ballroom was. After I knew who I was.",
      },
      book: {
        title: "Invisible Man, Ralph Ellison",
        note: "About invisibility as political condition. I return to it every year.",
      },
      song: {
        title: "'Strings of Life', Derrick May",
        note: "The first time I heard a synthesizer cry.",
      },
      moment: {
        title: "Playing to 12 people in a basement in 2019",
        note: "The best show I've ever played. No one was performing anything.",
      },
    },
  },

  // ── The wider community ───────────────────────────────────────────────────
  // Fully realised members, directory cards, connections, reviewers, magazine
  // contributors. Each is a complete profile so any surface (Connect modal,
  // profile page, directory) has real content. Kept here so a change propagates
  // everywhere.
  "sofia-rodrigues": {
    slug: "sofia-rodrigues",
    first: "Sofia",
    last: "Rodrigues",
    role: "UX Designer",
    hood: "Arroios",
    tags: [
      "Accessibility",
      "Civic tech",
      "Design systems",
      "Research",
      "Mentoring",
    ],
    visibility: "open",
    initials: "SR",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2023",
    bio: "I design public-service tools that don't make people feel stupid: forms, booking flows, the boring stuff that decides whether someone gets help. I came to UX from a screen-reader habit and never left accessibility behind. Most weeks you'll find me sketching flows at a café table in Arroios with too many post-its.",
    now: "Rebuilding the appointment booking flow for a trans health clinic so it works on a five-year-old Android.",
    openTo: [
      { kind: "preset", id: "mentoring" },
      { kind: "custom", label: "Accessibility audits" },
      { kind: "preset", id: "casualMeetups" },
    ],
    work: [
      {
        category: "Product",
        title: "Acessível, public-form toolkit",
        year: "2025",
      },
      {
        category: "Talk",
        title: "Designing for the people the design forgot",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Free portfolio reviews for queer designers",
        slug: "portfolio-reviews-sr",
      },
      {
        kind: "looking",
        title: "Researcher for a clinic-access study",
        slug: "research-partner",
      },
    ],
    vouchers: ["ines", "jordan"],
    voucherNames: "Inês & Jordan",
    related: ["rui", "maria", "tomas-mendes"],
    shapings: {
      film: {
        title: "Happy Together",
        note: "Watched it alone at 22 and finally understood that leaving could be its own kind of love.",
      },
      book: {
        title: "Design Justice",
        note: "It put words to why I'd always felt the 'average user' was a lie.",
      },
      song: {
        title: "This Must Be the Place, Talking Heads",
        note: "My grounding song; I play it before every difficult meeting.",
      },
      moment: {
        title: "First clinic launch",
        note: "Watching a stranger book their own appointment without asking for help. I cried in the waiting room.",
      },
    },
    skills: [
      { name: "Accessibility audit", meta: "Trade · for cooking lessons" },
      { name: "Portfolio review", meta: "Free · queer designers" },
      { name: "Figma prototyping", meta: "Available · weekday evenings" },
    ],
    groups: [
      { name: "Lisboa Civic Tech", role: "Collective · Member" },
      { name: "Queer in Design PT", role: "Network · Co-organiser" },
    ],
    activity: [
      {
        icon: FiEdit3,
        title: "Posted 'The form is the policy'",
        sub: "Magazine essay on civic UX",
        to: routes.magazine,
      },
      {
        icon: FiMessageCircle,
        title: "Answered 'Where to start with a11y?'",
        sub: "Forum thread",
        to: routes.forum,
      },
    ],
  },
  "tomas-mendes": {
    slug: "tomas-mendes",
    first: "Tomás",
    last: "Mendes",
    role: "Architect",
    hood: "Marvila",
    tags: ["Affordable housing", "Queer spaces", "Adaptive reuse", "Cooking"],
    visibility: "network",
    initials: "TM",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2022",
    bio: "I'm an architect obsessed with the question of who gets to stay in a neighbourhood. I work mostly on co-housing and on turning forgotten warehouses in Marvila into spaces queer collectives can actually afford. I cook for everyone who comes through the studio. It's how I think.",
    now: "Drawing up a shared-kitchen co-living scheme for a queer elders' housing pilot.",
    openTo: [
      { kind: "preset", id: "collaborating" },
      { kind: "custom", label: "Site visits" },
      { kind: "preset", id: "casualMeetups" },
    ],
    work: [
      {
        category: "Project",
        title: "Armazém 7, collective workspace conversion",
        year: "2025",
      },
      {
        category: "Project",
        title: "Casa Comum co-housing study",
        year: "2024",
      },
      {
        category: "Exhibition",
        title: "Who Stays, housing & belonging",
        year: "2023",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Pro-bono feasibility sketches for collectives",
        slug: "feasibility-sketches",
      },
    ],
    vouchers: ["beatriz", "sofia-rodrigues", "ines"],
    voucherNames: "Beatriz, Sofia & Inês",
    related: ["beatriz", "carla", "kai"],
    shapings: {
      film: {
        title: "Koyaanisqatsi",
        note: "It rewired how I see cities as something breathing rather than something built.",
      },
      book: {
        title: "The Death and Life of Great American Cities",
        note: "Jacobs taught me to trust the sidewalk over the master plan.",
      },
      song: {
        title: "Águas de Março, Elis & Tom",
        note: "The song I hum on every site at the moment the light is right.",
      },
      moment: {
        title: "Handing over the keys to Armazém 7",
        note: "Six collectives moved in the same weekend; the building felt alive within a day.",
      },
    },
    skills: [
      {
        name: "Space feasibility sketch",
        meta: "Trade · for a home-cooked meal",
      },
      { name: "Cooking lessons", meta: "Free · Sunday afternoons" },
      { name: "Lease & permit advice", meta: "Available · for collectives" },
    ],
    groups: [
      { name: "Marvila Makers", role: "Collective · Member" },
      { name: "Casa Comum", role: "Studio · Founder" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Hosting 'Cook & co-design'",
        sub: "Open studio dinner in Marvila",
        to: routes.event,
      },
      {
        icon: FiCamera,
        title: "Shared Armazém 7 before/after",
        sub: "Culture gallery",
        to: routes.culture,
      },
    ],
  },
  anika: {
    slug: "anika",
    first: "Anika",
    last: "Kovač",
    role: "Translator & Poet",
    hood: "Mouraria",
    tags: ["Translation", "Poetry", "Migration", "Bilingual events"],
    visibility: "open",
    initials: "AK",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "2024",
    bio: "I translate between Slovene, English and Portuguese for a living, and I write poems that get stuck in the gaps between those languages. Mouraria feels like home because everyone here is from somewhere else too. I'm she or they, depending on the day and the language.",
    now: "Finishing a poetry collection about queerness and migration. The working title keeps changing.",
    openTo: [
      { kind: "custom", label: "Bilingual reading series" },
      { kind: "preset", id: "swaps" },
      { kind: "preset", id: "casualMeetups" },
    ],
    work: [
      { category: "Chapbook", title: "Border Tongues", year: "2025" },
      {
        category: "Translation",
        title: "Selected poems of Svetlana V. (sl→pt)",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Co-host for a bilingual reading night",
        slug: "bilingual-reading",
      },
      {
        kind: "offering",
        title: "Translation help for queer migrant orgs",
        slug: "translation-help",
      },
    ],
    vouchers: ["ines"],
    voucherNames: "Inês",
    related: ["jordan", "kai", "sofia"],
    shapings: {
      film: {
        title: "The Edge of Heaven",
        note: "Akın made grief and migration feel like the same ache, and I needed that.",
      },
      book: {
        title: "Bluets",
        note: "Maggie Nelson showed me a single colour could hold a whole heartbreak.",
      },
      song: {
        title: "Plovi Plovi, Severina (slow version)",
        note: "A song from home I only learned to love once I'd left it.",
      },
      moment: {
        title: "Reading in three languages",
        note: "The first night an audience laughed at the same line in two tongues. I felt unsplit.",
      },
    },
    skills: [
      { name: "Translation (sl/en/pt)", meta: "Trade · for editing" },
      { name: "Poetry feedback", meta: "Free · monthly circle" },
      { name: "Reading-event hosting", meta: "Available · seeking a co-host" },
    ],
    groups: [
      { name: "Mouraria Migrant Voices", role: "Collective · Member" },
      { name: "Sister Tongues", role: "Reading group · Founder" },
    ],
    activity: [
      {
        icon: FiBookOpen,
        title: "Started a reading group",
        sub: "Queer migrant poetry, monthly",
        to: routes.readingGroups,
      },
      {
        icon: FiEdit3,
        title: "Published 'Three words for home'",
        sub: "Magazine poem",
        to: routes.magazine,
      },
    ],
  },
  jordan: {
    slug: "jordan",
    first: "Jordan",
    last: "Park",
    role: "Community Organiser",
    hood: "Graça",
    tags: ["Facilitation", "Mutual aid", "Mentoring", "Conflict resolution"],
    visibility: "open",
    initials: "JP",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2021",
    bio: "I help groups have the hard conversations without falling apart: facilitation, mediation, the slow work of trust. They/them, always. After a decade in social-sector roles I mostly spend my energy now helping the next people through the door not burn out in year one.",
    now: "Running a six-week facilitation lab for people moving into community work for the first time.",
    openTo: [
      { kind: "preset", id: "mentoring" },
      { kind: "custom", label: "Facilitating tricky meetings" },
      { kind: "preset", id: "casualMeetups" },
    ],
    work: [
      {
        category: "Programme",
        title: "First Year, onboarding for new organisers",
        year: "2025",
      },
      {
        category: "Workshop",
        title: "Holding conflict in queer groups",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Free facilitation for grassroots groups",
        slug: "facilitation-jp",
      },
      {
        kind: "offering",
        title: "1:1 mentoring for new organisers",
        slug: "mentoring-jp",
      },
    ],
    vouchers: ["maria", "ines", "andre"],
    voucherNames: "Maria, Inês & André",
    related: ["maria", "sofia-rodrigues", "anika"],
    shapings: {
      film: {
        title: "Pride",
        note: "It's the politics I believe in: unlikely solidarity that actually changes a vote.",
      },
      book: {
        title: "Emergent Strategy",
        note: "adrienne maree brown gave me permission to organise like a garden rather than a machine.",
      },
      song: {
        title: "Ella's Song, Sweet Honey in the Rock",
        note: "'We who believe in freedom cannot rest', my whole ethic in one line.",
      },
      moment: {
        title: "Mediating a near-split collective",
        note: "Two hours of held silence, and the group chose to stay together. Best work I've done.",
      },
    },
    skills: [
      { name: "Meeting facilitation", meta: "Free · grassroots groups" },
      { name: "Mediation", meta: "Available · for collectives in conflict" },
      { name: "Mentoring", meta: "Trade · for nothing, pay it forward" },
    ],
    groups: [
      { name: "Graça Mutual Aid", role: "Collective · Co-founder" },
      { name: "Facilitators' Circle PT", role: "Network · Member" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Opened the Facilitation Lab",
        sub: "Six-week cohort, free",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in 'Avoiding burnout'",
        sub: "Forum thread",
        to: routes.forum,
      },
    ],
  },
  maria: {
    slug: "maria",
    first: "Maria",
    last: "Ferreira",
    role: "Psychologist",
    hood: "Cedofeita, Porto",
    tags: ["Queer mental health", "Trans care", "Therapy", "Supervision"],
    visibility: "network",
    initials: "MF",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2022",
    bio: "I'm a clinical psychologist in Porto working mostly with queer and trans clients: the kind of care I wish had existed when I was twenty. My practice in Cedofeita is small and slow on purpose. I also supervise psychologists retraining toward affirming practice, because there still aren't enough of us.",
    now: "Building a referral network of affirming therapists across the north of Portugal.",
    openTo: [
      { kind: "preset", id: "clientWork" },
      { kind: "custom", label: "Supervising retraining psychologists" },
      { kind: "preset", id: "collaborating" },
    ],
    work: [
      {
        category: "Practice",
        title: "Consultório Cedofeita, affirming therapy",
        year: "2022",
      },
      {
        category: "Course",
        title: "Foundations of trans-affirming care",
        year: "2025",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Sliding-scale therapy slots",
        slug: "therapy-slots-mf",
      },
      {
        kind: "offering",
        title: "Supervision for affirming-care trainees",
        slug: "supervision-mf",
      },
    ],
    vouchers: ["monica", "jordan"],
    voucherNames: "Mónica & Jordan",
    related: ["monica", "jordan", "beatriz"],
    shapings: {
      film: {
        title: "A Fantastic Woman",
        note: "Marina's dignity under so much cruelty taught me what my clients carry daily.",
      },
      book: {
        title: "Trauma and Recovery",
        note: "Judith Herman is the spine of how I hold a session.",
      },
      song: {
        title: "Both Sides Now, Joni Mitchell",
        note: "I put it on after a heavy day to remember the same thing can be seen many ways.",
      },
      moment: {
        title: "A client's first euphoric session",
        note: "They came in to grieve and left talking about a future. That shift is why I do this.",
      },
    },
    skills: [
      { name: "Affirming therapy", meta: "Available · sliding scale" },
      { name: "Clinical supervision", meta: "Trade · peer exchange" },
      { name: "Referral matching", meta: "Free · north Portugal" },
    ],
    groups: [
      { name: "Porto Queer Health", role: "Network · Co-founder" },
      { name: "Affirming Therapists PT", role: "Collective · Member" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Wrote 'What affirming actually means'",
        sub: "Magazine feature",
        to: routes.magazine,
      },
      {
        icon: FiMessageCircle,
        title: "Answered 'Finding a therapist up north'",
        sub: "Forum thread",
        to: routes.forum,
      },
    ],
  },
  kai: {
    slug: "kai",
    first: "Kai",
    last: "Larsson",
    role: "Filmmaker",
    hood: "Cais do Sodré",
    tags: ["Film & Documentary", "Nightlife", "Archive", "Sound"],
    visibility: "open",
    initials: "KL",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "Apr 2026",
    bio: "I'm a filmmaker who just landed in Lisbon and fell straight into Cais do Sodré at 4am. They/them. I make documentaries about the places that disappear when the lights come up: right now, the queer dancefloors of southern Europe before they're priced out of existence.",
    now: "Shooting a documentary on queer nightlife across Lisbon, Barcelona and Naples, chasing the rooms before they close.",
    openTo: [
      { kind: "preset", id: "interviewees" },
      { kind: "custom", label: "Fixers & local guides" },
      { kind: "preset", id: "collaborating" },
    ],
    work: [
      { category: "Film", title: "Last Call (in production)", year: "2026" },
      {
        category: "Short",
        title: "Smoke Room, Malmö queer techno",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Interviewees from Lisbon's club scene",
        slug: "doc-interviewees",
      },
      {
        kind: "looking",
        title: "Porto fixer for a weekend shoot",
        slug: "porto-fixer",
      },
    ],
    vouchers: ["sofia", "tomas-mendes"],
    voucherNames: "Sofia & Tomás",
    related: ["anika", "tomas-mendes", "sofia"],
    shapings: {
      film: {
        title: "Beau Travail",
        note: "Denis taught me that bodies moving in a room can carry an entire story.",
      },
      book: {
        title: "Cruising Utopia",
        note: "Muñoz made me believe nightlife is a rehearsal for a better world.",
      },
      song: {
        title: "Mestre, DJ Marfox",
        note: "The first track that made me understand Lisbon has its own dancefloor language.",
      },
      moment: {
        title: "Filming the last night of a club",
        note: "Everyone knew it was closing; the whole room danced like a goodbye. I barely held the camera steady.",
      },
    },
    skills: [
      { name: "Documentary interview", meta: "Available · for the project" },
      { name: "Sound recording", meta: "Trade · for local intros" },
      { name: "Editing feedback", meta: "Free · for first-time filmmakers" },
    ],
    groups: [
      { name: "Lisboa Queer Film", role: "Collective · Member" },
      { name: "Night Archive", role: "Studio · Founder" },
    ],
    activity: [
      {
        icon: FiCamera,
        title: "Posted a call for interviewees",
        sub: "Queer nightlife documentary",
        to: routes.culture,
      },
      {
        icon: FiMusic,
        title: "Shared a field-recording reel",
        sub: "Cais do Sodré, 4am",
        to: routes.culture,
      },
    ],
  },
  monica: {
    slug: "monica",
    first: "Mónica",
    last: "Resende",
    role: "Physiotherapist",
    hood: "Estrela",
    tags: ["Trans-affirming bodywork", "Rehab", "Chronic pain", "Movement"],
    visibility: "private",
    initials: "MR",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2023",
    bio: "I'm a physiotherapist who does trans-affirming bodywork and post-surgical rehab, the kind of touch-based care that has to be built on consent, slowly. My room in Estrela is quiet and warm and you keep on whatever clothes you want. I believe a body in pain deserves to feel safe before it feels better.",
    now: "Putting together a movement class for people recovering from top surgery.",
    openTo: [
      { kind: "preset", id: "clientWork" },
      { kind: "custom", label: "Collaborations with surgeons & therapists" },
    ],
    work: [
      {
        category: "Practice",
        title: "Estrela Bodywork, affirming physio",
        year: "2023",
      },
      {
        category: "Workshop",
        title: "Consent-led touch for practitioners",
        year: "2025",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Post-op rehab consultations",
        slug: "rehab-mr",
      },
    ],
    vouchers: ["maria"],
    voucherNames: "Maria",
    related: ["maria", "sofia-rodrigues", "jordan"],
    shapings: {
      film: {
        title: "The Diving Bell and the Butterfly",
        note: "It taught me the body is a whole inner world, far more than an obstacle.",
      },
      book: {
        title: "Care Work",
        note: "Leah Lakshmi Piepzna-Samarasinha reframed care as something we build together rather than buy.",
      },
      song: {
        title: "Lovely Day, Bill Withers",
        note: "I play it low during sessions; shoulders drop the moment it starts.",
      },
      moment: {
        title: "A client's first pain-free morning",
        note: "After months of slow work they texted me a sunrise. I kept the photo on my wall.",
      },
    },
    skills: [
      { name: "Post-op rehab", meta: "Available · by referral" },
      { name: "Chronic pain coaching", meta: "Trade · for movement classes" },
      {
        name: "Consent-led touch training",
        meta: "Free · for queer practitioners",
      },
    ],
    groups: [
      { name: "Estrela Wellbeing Co-op", role: "Collective · Member" },
      { name: "Affirming Bodywork PT", role: "Network · Co-founder" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Opening a post-surgery movement class",
        sub: "Small group, Estrela",
        to: routes.event,
      },
      {
        icon: FiFileText,
        title: "Wrote 'Touch you can trust'",
        sub: "Magazine guide",
        to: routes.magazine,
      },
    ],
  },
  fatima: {
    slug: "fatima",
    first: "Fátima",
    last: "Mendes",
    role: "Support Coordinator",
    hood: "Arroios",
    tags: [
      "Peer support",
      "Migrant justice",
      "Crisis referral",
      "Arabic & Portuguese",
    ],
    visibility: "network",
    initials: "FM",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2022",
    bio: "I coordinate peer support and crisis referral for queer migrants and refugees arriving in Lisbon, mostly out of a small office in Arroios that smells like cardamom coffee. I came here from Casablanca eight years ago, so I know what it is to land somewhere and not have the words yet. My job is to make sure nobody has to face the asylum system alone.",
    now: "Building a multilingual safe-housing list with three other diaspora collectives.",
    openTo: [
      { kind: "custom", label: "Interpreters for Arabic and Farsi" },
      { kind: "custom", label: "Lawyers who do pro-bono asylum work" },
      { kind: "custom", label: "A bigger drop-in space in Arroios" },
    ],
    work: [
      {
        category: "Organising",
        title: "Welcome Desk, weekly drop-in for new arrivals",
        year: "2023",
      },
      {
        category: "Writing",
        title: "Know Your Rights pocket guide (4 languages)",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Volunteer interpreters, evenings",
        slug: "interpreters-eve",
      },
      {
        kind: "offering",
        title: "Peer-support training for new volunteers",
        slug: "ps-training",
      },
    ],
    vouchers: ["jonas", "carla"],
    voucherNames: "Jonas & Carla",
    related: ["catarina-vaz", "jonas", "bilal-kaya"],
    shapings: {
      film: {
        title: "Capernaum",
        note: "I watched it alone and cried for a child who could have been any of the kids who come to my desk.",
      },
      book: {
        title: "The Beekeeper of Aleppo",
        note: "It put words to the kind of grief people carry in silently from the waiting room.",
      },
      song: {
        title: "Ya Rayah, Rachid Taha",
        note: "My father sang it; now it's what plays when the drop-in finally empties out and I tidy up.",
      },
      moment: {
        title: "First asylum case I saw approved",
        note: "We hugged in the hallway of SEF and I understood why I do this.",
      },
    },
    skills: [
      {
        name: "Trauma-informed peer support",
        meta: "Available · for collectives",
      },
      { name: "Asylum-process navigation", meta: "Free · for new arrivals" },
      {
        name: "Arabic ↔ Portuguese interpreting",
        meta: "Trade · for translation favours",
      },
    ],
    groups: [
      { name: "Welcome Desk Lisboa", role: "Coordinator" },
      { name: "Diaspora Queer Collective", role: "Member" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Hosted the Arroios drop-in",
        sub: "Tuesday · 14 people",
        to: routes.event,
      },
      {
        icon: FiFileText,
        title: "Updated the Know Your Rights guide",
        sub: "Added Ukrainian translation",
        to: routes.magazine,
      },
      {
        icon: FiMessageCircle,
        title: "Answered in the support forum",
        sub: "Thread: housing for trans asylum-seekers",
        to: routes.forum,
      },
    ],
  },
  "catarina-vaz": {
    slug: "catarina-vaz",
    first: "Catarina",
    last: "Vaz",
    role: "Housing Organiser",
    hood: "Marvila",
    tags: ["Tenant unions", "Anti-eviction", "Housing co-ops", "Direct action"],
    visibility: "open",
    initials: "CV",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1521252659862-eec69941b071?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2021",
    bio: "I organise tenants in Marvila and Graça: knocking on doors, sitting with people the night before an eviction, helping neighbours realise they have more power together than alone. My dream is a proper queer housing co-op where nobody's lease depends on staying closeted to a landlord. I've been priced out of three flats myself, so this isn't theory for me.",
    now: "Drafting the bylaws for Lisbon's first explicitly queer-friendly housing co-op.",
    openTo: [
      { kind: "custom", label: "People who've run co-ops before" },
      { kind: "custom", label: "A lawyer for cooperative law" },
      { kind: "custom", label: "Anyone facing eviction who wants backup" },
    ],
    work: [
      {
        category: "Organising",
        title: "Marvila Tenants' Union, co-founder",
        year: "2021",
      },
      {
        category: "Campaign",
        title: "Stop the Renovação evictions, Graça",
        year: "2023",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Co-op members ready to commit",
        slug: "coop-members",
      },
    ],
    vouchers: ["fatima", "rui"],
    voucherNames: "Fátima & Rui",
    related: ["fatima", "nuno", "mariana-costa"],
    shapings: {
      film: {
        title: "Sorry We Missed You",
        note: "Ken Loach made me furious in exactly the way that keeps me organising.",
      },
      book: {
        title: "The Death and Life of Great American Cities",
        note: "Jane Jacobs taught me to defend the messy, lived-in street against the developers.",
      },
      song: {
        title: "Grândola, Vila Morena, Zeca Afonso",
        note: "We sang it on a balcony the night we stopped an eviction; it still gives me chills.",
      },
      moment: {
        title: "The morning forty neighbours showed up uninvited",
        note: "The bailiffs turned around and I learned what solidarity actually looks like.",
      },
    },
    skills: [
      {
        name: "Tenant rights & eviction defence",
        meta: "Free · for tenants in trouble",
      },
      { name: "Co-op governance & bylaws", meta: "Available · for new co-ops" },
      {
        name: "Door-knocking & base-building",
        meta: "Trade · I'll teach, you organise",
      },
    ],
    groups: [
      { name: "Marvila Tenants' Union", role: "Co-founder" },
      { name: "Habita! Lisboa", role: "Member" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Ran a tenants' assembly",
        sub: "Graça · standing room only",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Posted an eviction alert",
        sub: "Need bodies Thursday 7am",
        to: routes.forum,
      },
      {
        icon: FiEdit3,
        title: "Wrote up the co-op proposal",
        sub: "Draft v3, feedback welcome",
        to: routes.magazine,
      },
    ],
  },
  jonas: {
    slug: "jonas",
    first: "Jonas",
    last: "Ferreira",
    role: "Community Health Worker",
    hood: "Cais do Sodré",
    tags: ["Sexual health", "Harm reduction", "Outreach", "PrEP"],
    visibility: "network",
    initials: "JF",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2020",
    bio: "I do sexual-health and harm-reduction outreach across Cais do Sodré and Bairro Alto: testing tents, naloxone, PrEP navigation, and a lot of just listening at 3am. I trained as a nurse but found my place out on the street where the clinic walls scare people off. No judgement, ever; that's the whole job.",
    now: "Setting up a no-appointment rapid-testing night that runs after the bars close.",
    openTo: [
      { kind: "custom", label: "Volunteers comfortable with late nights" },
      { kind: "custom", label: "A nurse or two for the testing nights" },
      { kind: "custom", label: "Donations of safer-use supplies" },
    ],
    work: [
      {
        category: "Health",
        title: "Street outreach, Cais do Sodré",
        year: "2020",
      },
      {
        category: "Programme",
        title: "PrEP navigation peer line",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Free rapid HIV testing, Fridays",
        slug: "rapid-test",
      },
      {
        kind: "looking",
        title: "Late-night outreach volunteers",
        slug: "night-outreach",
      },
    ],
    vouchers: ["fatima", "beatriz"],
    voucherNames: "Fátima & Beatriz",
    related: ["fatima", "sofia-castano", "daniel-oliveira"],
    shapings: {
      film: {
        title: "120 BPM",
        note: "It showed me activism as love and rage in the same breath. That's how the work feels.",
      },
      book: {
        title: "How to Survive a Plague",
        note: "David France reminded me that the people who changed everything were ordinary and terrified.",
      },
      song: {
        title: "Smalltown Boy, Bronski Beat",
        note: "It plays in my head every time a scared kid finds the testing tent.",
      },
      moment: {
        title:
          "Handing someone their first negative result who'd avoided testing for years",
        note: "He sat down on the curb and just breathed.",
      },
    },
    skills: [
      { name: "Harm-reduction outreach", meta: "Free · always" },
      { name: "PrEP & PEP navigation", meta: "Available · confidential" },
      { name: "Naloxone training", meta: "Free · groups of 4+" },
    ],
    groups: [
      {
        name: "GAT, Grupo de Ativistas em Tratamentos",
        role: "Outreach worker",
      },
      { name: "Cais do Sodré Night Crew", role: "Coordinator" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Ran a testing night",
        sub: "Cais do Sodré · 31 tests",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Replied in the health forum",
        sub: "Thread: starting PrEP, what to expect",
        to: routes.forum,
      },
      {
        icon: FiFileText,
        title: "Updated the safer-use zine",
        sub: "New section on chemsex care",
        to: routes.magazine,
      },
    ],
  },
  "raquel-baptista": {
    slug: "raquel-baptista",
    first: "Raquel",
    last: "Baptista",
    role: "Lawyer · Pro-bono Advocate",
    hood: "Estrela",
    tags: [
      "LGBTQ+ rights",
      "Family law",
      "Anti-discrimination",
      "Pro-bono",
      "Legal aid",
    ],
    visibility: "open",
    initials: "RB",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1582896911227-c966f6e7fb93?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2021",
    bio: "I'm a lawyer who gives away the hours I was trained never to give away. Most of my pro-bono work is queer family law and discrimination: the cases people can't afford to bring and can't afford to lose. I split my time between a small practice in Estrela and a lot of other people's kitchen tables. The law is only protection if you can actually reach it, so I spend as much time explaining rights as I do defending them.",
    now: "Running a free monthly rights clinic and training a new cohort of lawyers to take LGBTQ+ cases without fumbling the parts that matter.",
    openTo: [
      { kind: "preset", id: "referrals" },
      { kind: "custom", label: "Lawyers who want to take queer cases" },
      { kind: "custom", label: "Rights talks for community groups" },
    ],
    work: [
      {
        category: "Casework",
        title: "60+ pro-bono cases, discrimination & family law",
        year: "2021–25",
      },
      {
        category: "Training",
        title: "Taking LGBTQ+ cases, a course for lawyers",
        year: "2025",
      },
      {
        category: "Guide",
        title: "Know Your Rights at Work, plain-language edition",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Free monthly LGBTQ+ rights clinic",
        slug: "rights-clinic",
      },
      {
        kind: "looking",
        title: "Lawyers to train in queer family law",
        slug: "train-lawyers",
      },
    ],
    vouchers: ["mariana", "catarina-vaz"],
    voucherNames: "Mariana & Catarina",
    related: ["catarina-melo", "rui-fernandes", "mariana"],
    shapings: {
      film: {
        title: "Philadelphia",
        note: "I watched it too young to follow the law in it, old enough to feel the injustice. Both stuck.",
      },
      book: {
        title: "Just Mercy, Bryan Stevenson",
        note: "The clearest argument I know that the law is only as just as the people willing to do the unpaid hours.",
      },
      song: {
        title: "Ne Me Quitte Pas, Jacques Brel",
        note: "What I play after a family-law hearing, when I need to feel something other than the case file.",
      },
      moment: {
        title: "First discrimination case we won",
        note: "A client kept her job and her dignity, and brought me flowers she couldn't afford. I still have the dried stems.",
      },
    },
    skills: [
      {
        name: "Pro-bono legal consults",
        meta: "Free · discrimination & family law",
      },
      {
        name: "Rights navigation",
        meta: "Available · work, housing, the state",
      },
      { name: "Lawyer training", meta: "Trade · queer-competent casework" },
    ],
    groups: [
      { name: "QueerPulse Advisory Council", role: "Legal advisor" },
      { name: "Queer Family Law Network", role: "Co-founder" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Updated the rights-at-work guide",
        sub: "New section on parental leave for queer families",
        to: routes.magazine,
      },
      {
        icon: FiCalendar,
        title: "Ran a free rights clinic",
        sub: "Estrela · drop-in",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Answered in the legal forum",
        sub: "Thread: discrimination at work, what counts?",
        to: routes.forum,
      },
    ],
  },
  rita: {
    slug: "rita",
    first: "Rita",
    last: "Varela",
    role: "Illustrator",
    hood: "Mouraria",
    tags: ["Zines", "Queer comics", "Risograph", "Workshops"],
    visibility: "open",
    initials: "RV",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1499887142886-791eca5918cd?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "2023",
    bio: "I make zines and queer comics, mostly printed on a temperamental risograph in a shared Mouraria studio that always smells of soy ink. My work is soft and a bit absurd: lesbian saints, fluorescent saudade, dogs who give good advice. I teach risograph and bookbinding workshops because watching someone print their first page never gets old.",
    now: "Finishing a 40-page riso comic about my grandmother's kitchen and coming out to her.",
    openTo: [
      { kind: "custom", label: "Writers who want their words illustrated" },
      { kind: "custom", label: "A second hand for workshop days" },
      { kind: "custom", label: "Trades, prints for almost anything" },
    ],
    work: [
      {
        category: "Comics",
        title: "Santa Solidão, riso zine, 2-colour",
        year: "2024",
      },
      {
        category: "Teaching",
        title: "Riso & Bind workshop series, Mouraria",
        year: "2025",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Risograph workshop, beginners",
        slug: "riso-101",
      },
      {
        kind: "looking",
        title: "Co-host for a queer zine fair",
        slug: "zine-fair",
      },
    ],
    vouchers: ["sofia-castano", "luisa"],
    voucherNames: "Sofia & Luísa",
    related: ["luisa", "sofia-castano", "catarina-melo"],
    shapings: {
      film: {
        title: "My Neighbour Totoro",
        note: "Miyazaki's stillness is the feeling I chase in every panel I draw.",
      },
      book: {
        title: "Fun Home",
        note: "Alison Bechdel showed me a comic could hold a whole complicated family and a coming-out at once.",
      },
      song: {
        title: "Estranha Forma de Vida, Amália Rodrigues",
        note: "Fado about loving wrongly. It's secretly the soundtrack to my whole comic.",
      },
      moment: {
        title: "Selling out my first print run at a tiny fair in Anjos",
        note: "Forty people wanted a piece of my weird brain and I floated home.",
      },
    },
    skills: [
      { name: "Risograph printing", meta: "Trade · prints for skills" },
      { name: "Illustration commissions", meta: "Available · sliding scale" },
      { name: "Bookbinding workshops", meta: "Available · groups" },
    ],
    groups: [
      { name: "Mouraria Riso Studio", role: "Co-op member" },
      { name: "Lisboa Queer Zine Fair", role: "Organiser" },
    ],
    activity: [
      {
        icon: FiEdit3,
        title: "Posted new comic pages",
        sub: "Santa Solidão · pages 12–15",
        to: routes.culture,
      },
      {
        icon: FiCalendar,
        title: "Taught a riso workshop",
        sub: "Mouraria · 8 first-timers",
        to: routes.event,
      },
      {
        icon: FiCamera,
        title: "Shared studio process shots",
        sub: "Two-colour misregistration magic",
        to: routes.culture,
      },
    ],
  },
  "sofia-castano": {
    slug: "sofia-castano",
    first: "Sofia",
    last: "Castaño",
    role: "Photographer",
    hood: "Príncipe Real",
    tags: ["Documentary", "Nightlife", "Portraits", "Spanish & Portuguese"],
    visibility: "open",
    initials: "SC",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2022",
    bio: "Galician mother, Portuguese father, raised between Vigo and Lisbon. I shoot documentary work and the queer nightlife that raised me, mostly in Príncipe Real and the basements of Cais do Sodré. I'm interested in the hour after the lights come up, when everyone's tender and honest. I shoot film because waiting for the contact sheet keeps me humble.",
    now: "Editing a year-long photo essay on Lisbon's last few queer dance floors before they're sold off.",
    openTo: [
      { kind: "custom", label: "Venues to document before they close" },
      { kind: "custom", label: "A studio space to share" },
      { kind: "custom", label: "Subjects who want honest portraits" },
    ],
    work: [
      {
        category: "Photography",
        title: "Última Pista, nightlife photo essay",
        year: "2025",
      },
      {
        category: "Exhibition",
        title: "Tender Hours, group show, Marvila",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Portrait sessions, trade or sliding scale",
        slug: "portraits-trade",
      },
    ],
    vouchers: ["rita", "jonas"],
    voucherNames: "Rita & Jonas",
    related: ["rita", "luisa", "sara-pinheiro"],
    shapings: {
      film: {
        title: "Shiva Baby",
        note: "A whole comedy of queer panic in one room. It taught me how much a single space can hold.",
      },
      book: {
        title: "On Photography",
        note: "Sontag made me distrust my own camera in a way that made me a better photographer.",
      },
      song: {
        title: "Bigmouth Strikes Again, The Smiths",
        note: "First thing I ever danced to in a queer club; I shoot to find that feeling again.",
      },
      moment: {
        title: "A drag queen asking me to photograph her without makeup",
        note: "She trusted me with the in-between and it changed how I work.",
      },
    },
    skills: [
      {
        name: "Documentary & event photography",
        meta: "Available · for community events",
      },
      { name: "Film portraits", meta: "Trade · or sliding scale" },
      { name: "Film developing", meta: "Trade · share my chemistry" },
    ],
    groups: [
      { name: "Marvila Film Collective", role: "Member" },
      { name: "Príncipe Real Night Archive", role: "Photographer" },
    ],
    activity: [
      {
        icon: FiCamera,
        title: "Published a new photo set",
        sub: "Última Pista · closing night at Trumps",
        to: routes.culture,
      },
      {
        icon: FiCalendar,
        title: "Shot a community fundraiser",
        sub: "Marvila · donated the prints",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Offered free portraits in the forum",
        sub: "For folks updating their docs",
        to: routes.forum,
      },
    ],
  },
  nuno: {
    slug: "nuno",
    first: "Nuno",
    last: "Alves",
    role: "Software Engineer",
    hood: "Marvila",
    tags: ["Frontend", "Accessibility", "Tech for good", "Mentoring"],
    visibility: "private",
    initials: "NA",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "2023",
    bio: "Frontend engineer by day, accessibility nerd by conviction. I believe a website that locks out a screen-reader user is just a broken website. I spend my evenings building tools for small queer nonprofits who can't afford a dev. I'm trans and quietly so; this profile stays private for now, and that's allowed to be okay.",
    now: "Rebuilding a trans-healthcare directory so it actually works on a cheap phone with a screen reader.",
    openTo: [
      {
        kind: "custom",
        label: "Nonprofits who need a website that won't break",
      },
      { kind: "custom", label: "A designer to pair with" },
      { kind: "custom", label: "Junior devs who want a patient mentor" },
    ],
    work: [
      {
        category: "Tech",
        title: "Accessible trans-healthcare directory",
        year: "2025",
      },
      {
        category: "Open source",
        title: "a11y component library for activist sites",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Free websites for queer nonprofits",
        slug: "free-sites",
      },
      {
        kind: "looking",
        title: "A designer to collaborate with",
        slug: "design-pair",
      },
    ],
    vouchers: ["catarina-vaz", "luisa"],
    voucherNames: "Catarina & Luísa",
    related: ["catarina-vaz", "luisa", "daniel-oliveira"],
    shapings: {
      film: {
        title: "Hackers",
        note: "Cheesy and beloved. It's the first time I saw a screen as somewhere you could be free.",
      },
      book: {
        title: "Design Justice",
        note: "Sasha Costanza-Chock gave me the language for why I build the way I build.",
      },
      song: {
        title: "Windowlicker, Aphex Twin",
        note: "Glitchy and tender; it's what's in my headphones at 1am when the code finally compiles.",
      },
      moment: {
        title: "Watching a blind user navigate something I built, smoothly",
        note: "I sat there grinning like an idiot. That's the whole point.",
      },
    },
    skills: [
      { name: "Accessible web development", meta: "Free · for nonprofits" },
      { name: "Code mentoring", meta: "Available · junior devs" },
      { name: "Accessibility audits", meta: "Trade · or free for community" },
    ],
    groups: [
      { name: "Tech for Good Lisboa", role: "Volunteer" },
      { name: "Trans Coders Collective", role: "Member" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Shipped the healthcare directory",
        sub: "Now passes WCAG AA",
        to: routes.magazine,
      },
      {
        icon: FiMessageCircle,
        title: "Helped in the tech-help forum",
        sub: "Thread: making forms screen-reader friendly",
        to: routes.forum,
      },
      {
        icon: FiCalendar,
        title: "Co-ran a beginner code night",
        sub: "Marvila · 12 learners",
        to: routes.event,
      },
    ],
  },
  luisa: {
    slug: "luisa",
    first: "Luísa",
    last: "Gomes",
    role: "Curator",
    hood: "Príncipe Real",
    tags: ["Contemporary art", "Queer archives", "Exhibitions", "Oral history"],
    visibility: "network",
    initials: "LG",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1485893086445-ed75865251e0?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2021",
    bio: "I curate contemporary shows and, more stubbornly, I build a queer archive: flyers, love letters, club photos, the things institutions never thought worth keeping. I work between a white-cube gallery in Príncipe Real and a damp storage room in Estrela full of other people's history. My job is making sure we're not erased twice: once while living, once after.",
    now: "Curating an exhibition built entirely from donated queer ephemera from the 80s and 90s.",
    openTo: [
      {
        kind: "custom",
        label: "People with old photos, flyers, letters to donate",
      },
      { kind: "preset", id: "interviewees" },
      { kind: "custom", label: "A grant writer who gets archives" },
    ],
    work: [
      {
        category: "Curation",
        title: "Antes de Nós, queer ephemera exhibition",
        year: "2026",
      },
      {
        category: "Archive",
        title: "Arquivo Cor-de-Rosa, founding curator",
        year: "2021",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Donations of queer ephemera, any era",
        slug: "ephemera-donate",
      },
      {
        kind: "looking",
        title: "Volunteers to digitise the archive",
        slug: "digitise",
      },
    ],
    vouchers: ["rita", "nuno"],
    voucherNames: "Rita & Nuno",
    related: ["rita", "sofia-castano", "catarina-melo"],
    shapings: {
      film: {
        title: "The Watermelon Woman",
        note: "Cheryl Dunye invented an archive because none existed. That's literally my job description.",
      },
      book: {
        title: "Cruising Utopia",
        note: "José Muñoz taught me to treat the archive as a place where the future is also kept.",
      },
      song: {
        title: "It's a Sin, Pet Shop Boys",
        note: "It belongs to the people whose flyers I file; I play it loud while cataloguing.",
      },
      moment: {
        title:
          "An elder handing me a shoebox of photos he'd hidden for forty years",
        note: "He said, 'Don't let them throw these away,' and I promised I wouldn't.",
      },
    },
    skills: [
      { name: "Archival cataloguing", meta: "Free · for community materials" },
      { name: "Exhibition curation", meta: "Available · collaborations" },
      { name: "Oral-history interviewing", meta: "Free · always recording" },
    ],
    groups: [
      { name: "Arquivo Cor-de-Rosa", role: "Founding curator" },
      { name: "Estrela Archive Collective", role: "Coordinator" },
    ],
    activity: [
      {
        icon: FiBookOpen,
        title: "Opened the ephemera show",
        sub: "Príncipe Real · packed vernissage",
        to: routes.culture,
      },
      {
        icon: FiFileText,
        title: "Wrote a piece on queer erasure",
        sub: "Why we keep the flyers",
        to: routes.magazine,
      },
      {
        icon: FiCalendar,
        title: "Hosted an archive reading group",
        sub: "Estrela · Cruising Utopia",
        to: routes.readingGroups,
      },
    ],
  },
  "mariana-costa": {
    slug: "mariana-costa",
    first: "Mariana",
    last: "Costa",
    role: "Journalist",
    hood: "Arroios",
    tags: ["Investigative", "LGBTQ+ rights", "Long-form", "FOI requests"],
    visibility: "open",
    initials: "MC",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2023",
    bio: "I report on the slow machinery of LGBTQ+ rights in Portugal: the bills that stall, the clinics that quietly close, the names that never make the headline. I work out of a shared desk in Arroios with too much coffee and a wall of sticky notes. If a story matters and nobody's chasing it, that's usually where you'll find me.",
    now: "Filing a months-long investigation into waiting times at gender-affirming care services across the public system.",
    openTo: [
      { kind: "custom", label: "Confidential tips" },
      { kind: "custom", label: "Co-reporting with regional journalists" },
    ],
    work: [
      {
        category: "Investigation",
        title: "The Eighteen-Month Wait",
        year: "2025",
      },
      { category: "Feature", title: "Who Funds the Backlash?", year: "2024" },
    ],
    board: [
      {
        kind: "looking",
        title: "Sources inside health administration",
        slug: "health-sources",
      },
    ],
    vouchers: ["rui-fernandes", "ines"],
    voucherNames: "Rui & Inês",
    related: ["rui-fernandes", "catarina-melo", "sofia"],
    shapings: {
      film: {
        title: "The Times of Harvey Milk",
        note: "I watched it at sixteen and understood that a reporter and an organiser can be telling the same story from two desks.",
      },
      book: {
        title: "The Journalist and the Murderer",
        note: "It taught me to distrust my own charm with a source.",
      },
      song: {
        title: "Quero-te Tanto, Linda Martini",
        note: "The track I play when a piece finally goes to the editor.",
      },
      moment: {
        title: "First leaked document",
        note: "A nurse slid me a memo across a café table in Anjos and my hands shook for an hour.",
      },
    },
    skills: [
      { name: "Public records & FOI", meta: "Files dozens of requests a year" },
      { name: "Source protection", meta: "Encrypted, methodical, careful" },
      { name: "Data cleaning", meta: "Spreadsheets into stories" },
    ],
    groups: [
      { name: "Queer Press Collective", role: "Coordinator" },
      { name: "Arroios Writers' Desk", role: "Member" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Published 'The Eighteen-Month Wait'",
        sub: "Investigation in the magazine",
        to: routes.magazine,
      },
      {
        icon: FiMessageCircle,
        title: "Hosted a tips clinic",
        sub: "How to safely talk to a reporter",
        to: routes.forum,
      },
    ],
  },
  "rui-fernandes": {
    slug: "rui-fernandes",
    first: "Rui",
    last: "Fernandes",
    role: "Activist & Writer",
    hood: "Graça",
    tags: ["Trans rights", "Essays", "Organising", "Mutual aid"],
    visibility: "open",
    initials: "RF",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2022",
    bio: "I organise around trans rights and I write essays in the gaps between meetings, usually on the 28 tram going up to Graça. My politics are unglamorous: phone trees, legal forms, someone's deadname on a hospital wristband that needs fixing. The writing is just me trying to make sense of the work out loud.",
    now: "Drafting a guide to changing your legal name and gender marker, written by people who've actually done it.",
    openTo: [
      { kind: "custom", label: "Speaking on panels" },
      { kind: "custom", label: "Pairing new organisers with mentors" },
    ],
    work: [
      { category: "Essay", title: "On Patience and Rage", year: "2025" },
      {
        category: "Pamphlet",
        title: "Your Documents, Your Rights",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Walk-through: legal gender recognition",
        slug: "name-change-help",
      },
      {
        kind: "looking",
        title: "Translators for our rights guide",
        slug: "translators-wanted",
      },
    ],
    vouchers: ["mariana-costa", "carla"],
    voucherNames: "Mariana & Carla",
    related: ["mariana-costa", "catarina-melo", "andre"],
    shapings: {
      film: {
        title: "Tangerine",
        note: "Shot on a phone, full of fury and tenderness. It gave me permission to make rough, honest things.",
      },
      book: {
        title: "Stone Butch Blues",
        note: "I read it in one weekend in a Mouraria flat and cried at the union scenes rather than the romance.",
      },
      song: {
        title: "Drone Bomb Me, Anohni",
        note: "It holds grief and politics in the same breath, which is what I'm always failing to do in essays.",
      },
      moment: {
        title: "First name-change granted",
        note: "A friend texted me a photo of their new card and I had to sit down on the kerb.",
      },
    },
    skills: [
      { name: "Campaign organising", meta: "Coalitions and phone trees" },
      { name: "Essay writing", meta: "Published in three outlets" },
      { name: "Peer document support", meta: "Forms, hearings, follow-ups" },
    ],
    groups: [
      { name: "Trans Aid Lisboa", role: "Co-founder" },
      { name: "Graça Reading Circle", role: "Member" },
    ],
    activity: [
      {
        icon: FiEdit3,
        title: "Published 'On Patience and Rage'",
        sub: "Essay in the magazine",
        to: routes.magazine,
      },
      {
        icon: FiCalendar,
        title: "Ran a documents workshop",
        sub: "Legal recognition, step by step",
        to: routes.event,
      },
    ],
  },
  "catarina-melo": {
    slug: "catarina-melo",
    first: "Catarina",
    last: "Melo",
    role: "Housing Advocate",
    hood: "Marvila",
    tags: ["Tenants' rights", "Legal aid", "Anti-eviction", "Queer housing"],
    visibility: "network",
    initials: "CM",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2023",
    bio: "I help queer tenants who are being pushed out of their homes: by landlords, by rent hikes, by the slow violence of a city selling itself off. I trained as a paralegal and now I split my time between a legal-aid desk in Marvila and people's kitchen tables. Housing is a queer issue; nobody comes out of a home they can't afford.",
    now: "Building a small fund and a buddy system so nobody faces an eviction hearing alone.",
    openTo: [
      { kind: "custom", label: "Volunteer note-takers for hearings" },
      { kind: "custom", label: "Lawyers willing to do pro bono" },
    ],
    work: [
      {
        category: "Toolkit",
        title: "If You Get an Eviction Notice",
        year: "2025",
      },
      { category: "Workshop", title: "Reading Your Lease", year: "2024" },
    ],
    board: [
      {
        kind: "offering",
        title: "Free tenants' rights clinic",
        slug: "tenant-clinic",
      },
      {
        kind: "looking",
        title: "Spare rooms for emergencies",
        slug: "emergency-rooms",
      },
    ],
    vouchers: ["rui-fernandes", "carla"],
    voucherNames: "Rui & Carla",
    related: ["rui-fernandes", "mariana-costa", "beatriz"],
    shapings: {
      film: {
        title: "Sorry to Bother You",
        note: "Absurd and furious about who the city is built for. I quote it more than I should.",
      },
      book: {
        title: "Evicted, Matthew Desmond",
        note: "It put data under what I already felt at every kitchen table.",
      },
      song: {
        title: "Vayorken, Capicua",
        note: "A Porto verse about belonging to a place that keeps trying to price you out.",
      },
      moment: {
        title: "First hearing we won",
        note: "An elderly couple kept their flat in Marvila and brought me soup for a month afterwards.",
      },
    },
    skills: [
      { name: "Tenancy law basics", meta: "Trained paralegal" },
      { name: "Casework", meta: "Tracks dozens of files at once" },
      { name: "De-escalation", meta: "Calm in landlord meetings" },
    ],
    groups: [
      { name: "Marvila Housing Action", role: "Organiser" },
      { name: "Queer Solidarity Fund", role: "Treasurer" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Opened a tenants' clinic",
        sub: "Drop-in legal advice",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Answered housing questions",
        sub: "Eviction notices thread",
        to: routes.forum,
      },
    ],
  },
  "sara-pinheiro": {
    slug: "sara-pinheiro",
    first: "Sara",
    last: "Pinheiro",
    role: "Health & Access",
    hood: "Arroios",
    tags: [
      "Disability justice",
      "Healthcare access",
      "Accessibility audits",
      "Crip joy",
    ],
    visibility: "open",
    initials: "SP",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "2024",
    bio: "I'm a disabled queer person working at the messy intersection of disability justice and healthcare access. I do accessibility audits for community spaces and help people fight for the care they're owed. Lisbon's cobblestones nearly killed my wrists, so now I keep a running map of which venues a wheelchair can actually reach.",
    now: "Auditing queer venues in Cais do Sodré and Príncipe Real and publishing honest access notes for each.",
    openTo: [
      { kind: "custom", label: "Venues wanting an access audit" },
      { kind: "custom", label: "Crip-led peer support" },
    ],
    work: [
      {
        category: "Guide",
        title: "Can I Get In? A Venue Access Map",
        year: "2025",
      },
      {
        category: "Report",
        title: "Waiting Rooms Aren't Neutral",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Accessibility audits for events",
        slug: "access-audit",
      },
    ],
    vouchers: ["catarina-melo", "daniel-oliveira"],
    voucherNames: "Catarina & Daniel",
    related: ["catarina-melo", "daniel-oliveira", "beatriz"],
    shapings: {
      film: {
        title: "Crip Camp",
        note: "The first time I saw disabled people on screen who were funny, horny and dangerous rather than brave.",
      },
      book: {
        title: "Care Work, Leah Lakshmi Piepzna-Samarasinha",
        note: "It reframed access as love rather than logistics, and I've never recovered.",
      },
      song: {
        title: "Human, Sevdaliza",
        note: "A song about bodies and being seen that I play on hard pain days.",
      },
      moment: {
        title: "First ramp we got built",
        note: "A café in Arroios put in a ramp after our audit and the owner cried more than I did.",
      },
    },
    skills: [
      { name: "Accessibility auditing", meta: "Venues, events, websites" },
      { name: "Navigating the health system", meta: "Appeals and referrals" },
      { name: "Peer facilitation", meta: "Crip-led support circles" },
    ],
    groups: [
      { name: "Crip Lisboa", role: "Co-organiser" },
      { name: "Access Now Collective", role: "Auditor" },
    ],
    activity: [
      {
        icon: FiFileText,
        title: "Published the venue access map",
        sub: "Honest notes on getting in",
        to: routes.culture,
      },
      {
        icon: FiMessageCircle,
        title: "Started a disability justice thread",
        sub: "Sharing access wins and fails",
        to: routes.forum,
      },
    ],
  },
  "bilal-kaya": {
    slug: "bilal-kaya",
    first: "Bilal",
    last: "Kaya",
    role: "Sound Designer",
    hood: "Marvila",
    tags: ["Sound design", "Film & theatre", "Club systems", "Field recording"],
    visibility: "open",
    initials: "BK",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1508341591423-4347099e1f19?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "Jun 2026",
    bio: "I'm Turkish-Portuguese and I make sound for film and theatre, and I tune club rigs so they hit your chest without shredding your ears. I grew up between Istanbul and Almada, so my ear is full of ferries, call to prayer and bad PA systems. New here, but I've already found the best spot in Marvila to record at 4am.",
    now: "Designing the sound for a queer theatre piece and rebuilding a soundsystem for a Marvila warehouse party.",
    openTo: [
      { kind: "custom", label: "Film and theatre collaborations" },
      { kind: "custom", label: "Mentoring on field recording" },
    ],
    work: [
      {
        category: "Theatre",
        title: "Sound design for 'Salt Threshold'",
        year: "2026",
      },
      {
        category: "Album",
        title: "Ferry Crossings, field recordings",
        year: "2025",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Soundsystem tuning for parties",
        slug: "rig-tuning",
      },
      {
        kind: "looking",
        title: "A quiet room to record vocals",
        slug: "vocal-room",
      },
    ],
    vouchers: ["ines-fonseca", "tomas"],
    voucherNames: "Inês & Tomás",
    related: ["ines-fonseca", "daniel-oliveira", "tomas"],
    shapings: {
      film: {
        title: "Berberian Sound Studio",
        note: "A whole film about a Foley artist losing his mind. It made my obsessive job feel almost glamorous.",
      },
      book: {
        title: "The Soundscape, R. Murray Schafer",
        note: "It taught me to listen to a street the way others read a page.",
      },
      song: {
        title: "Yüce Dağ Başında, Altın Gün",
        note: "Anatolian psych-folk that sounds like my grandmother's kitchen rewired for a dancefloor.",
      },
      moment: {
        title: "First room I tuned right",
        note: "The bass landed clean across a sweaty crowd in Marvila and a stranger hugged me by the desk.",
      },
    },
    skills: [
      { name: "Sound design", meta: "Film, theatre, installation" },
      { name: "Live system tuning", meta: "Club and warehouse rigs" },
      { name: "Field recording", meta: "Cities, ferries, rooms" },
    ],
    groups: [
      { name: "Marvila Sound Lab", role: "Resident" },
      { name: "Queer Stage Crew", role: "Member" },
    ],
    activity: [
      {
        icon: FiMusic,
        title: "Joined QueerPulse",
        sub: "New this week, say hi",
        to: routes.culture,
      },
      {
        icon: FiCamera,
        title: "Shared field recordings",
        sub: "Ferry crossings at dawn",
        to: routes.culture,
      },
    ],
  },
  "ines-fonseca": {
    slug: "ines-fonseca",
    first: "Inês",
    last: "Fonseca",
    role: "Choreographer",
    hood: "Estrela",
    tags: [
      "Contemporary dance",
      "Queer performance",
      "Improvisation",
      "Devised work",
    ],
    visibility: "network",
    initials: "IF",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    verified: false,
    since: "Jun 2026",
    bio: "I make contemporary dance about queer bodies refusing to behave: work that's tender, sweaty and a little feral. I rehearse in a borrowed studio in Estrela and improvise on the kitchen floor when I can't afford the space. Just landed in this community and looking for dancers who'd rather risk falling than stay safe.",
    now: "Developing a duet about waiting rooms and longing, set to almost no music at all.",
    openTo: [
      { kind: "custom", label: "Dancers for a new devised piece" },
      { kind: "custom", label: "Cross-disciplinary collaborators" },
    ],
    work: [
      { category: "Performance", title: "Soft Animals", year: "2025" },
      {
        category: "Residency",
        title: "Floorwork: a queer practice",
        year: "2024",
      },
    ],
    board: [
      {
        kind: "looking",
        title: "Movers for an open rehearsal",
        slug: "open-rehearsal",
      },
    ],
    vouchers: ["bilal-kaya", "beatriz"],
    voucherNames: "Bilal & Beatriz",
    related: ["bilal-kaya", "tomas", "beatriz"],
    shapings: {
      film: {
        title: "Pina",
        note: "Wenders filming Bausch's dancers in the rain rewired what I thought a body could say.",
      },
      book: {
        title: "The Argonauts, Maggie Nelson",
        note: "It reads like choreography: bodies, theory and love all moving at once.",
      },
      song: {
        title: "Fado de Cada Um, Júlio Resende",
        note: "A piano fado I warm up to; it makes my spine honest.",
      },
      moment: {
        title: "First solo, empty house",
        note: "I danced to four people in an Estrela studio and one of them was weeping and that was enough.",
      },
    },
    skills: [
      { name: "Choreography", meta: "Solos, duets, ensemble" },
      { name: "Contact improvisation", meta: "Teaches weekly jams" },
      { name: "Devising", meta: "Builds work with performers" },
    ],
    groups: [
      { name: "Estrela Movement Lab", role: "Resident artist" },
      { name: "Queer Performance Night", role: "Curator" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Joined QueerPulse",
        sub: "New this week, say hi",
        to: routes.event,
      },
      {
        icon: FiCamera,
        title: "Posted rehearsal footage",
        sub: "Floorwork from 'Soft Animals'",
        to: routes.culture,
      },
    ],
  },
  "daniel-oliveira": {
    slug: "daniel-oliveira",
    first: "Daniel",
    last: "Oliveira",
    role: "Nurse & Harm-Reduction Worker",
    hood: "Cais do Sodré",
    tags: ["Harm reduction", "Peer first-aid", "Night scene", "Drug checking"],
    visibility: "private",
    initials: "DO",
    tint: "plum",
    photo:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "May 2026",
    bio: "I'm a nurse by day and a harm-reduction worker by night, mostly in the clubs around Cais do Sodré and the warehouse parties out east. I carry naloxone, water, earplugs and zero judgement. The dancefloor is healthcare too, and I'd rather meet people where they already are than wait for them in a waiting room.",
    now: "Training a new cohort of peer first-aiders to cover the summer party season.",
    openTo: [
      { kind: "custom", label: "Volunteers for the night team" },
      { kind: "custom", label: "Venues wanting a welfare point" },
    ],
    work: [
      { category: "Programme", title: "The Night Welfare Point", year: "2026" },
      {
        category: "Guide",
        title: "Looking After Each Other Till Dawn",
        year: "2025",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Peer first-aid training",
        slug: "first-aid-training",
      },
      {
        kind: "looking",
        title: "Quiet recovery space at parties",
        slug: "chill-space",
      },
    ],
    vouchers: ["sara-pinheiro", "bilal-kaya"],
    voucherNames: "Sara & Bilal",
    related: ["sara-pinheiro", "bilal-kaya", "ines-fonseca"],
    shapings: {
      film: {
        title: "Beats",
        note: "A rave film that gets why the dancefloor matters and why someone has to keep everyone safe on it.",
      },
      book: {
        title: "How to Survive a Plague",
        note: "It showed me that care and activism in a crisis are the same muscle.",
      },
      song: {
        title: "Downtown, Honey Dijon",
        note: "The track that means the floor is happy and my night is going well.",
      },
      moment: {
        title: "First time the naloxone worked",
        note: "A stranger breathed again under the strobes and I shook for the rest of the set.",
      },
    },
    skills: [
      { name: "Emergency first response", meta: "Registered nurse" },
      { name: "Harm reduction", meta: "Drug checking and outreach" },
      { name: "Peer training", meta: "Builds volunteer night teams" },
    ],
    groups: [
      { name: "Night Welfare Crew", role: "Lead" },
      { name: "Cais do Sodré Safer Nights", role: "Volunteer" },
    ],
    activity: [
      {
        icon: FiCalendar,
        title: "Joined QueerPulse",
        sub: "New this week, say hi",
        to: routes.event,
      },
      {
        icon: FiMessageCircle,
        title: "Started a harm-reduction thread",
        sub: "Naloxone, earplugs, looking out",
        to: routes.forum,
      },
    ],
  },

  ana: {
    slug: "ana",
    first: "Ana",
    last: "Reis",
    role: "Librarian · Forum moderator",
    pronouns: "she/her",
    hood: "Alvalade",
    tags: ["Moderation", "Community care", "Archiving", "Reading groups"],
    visibility: "network",
    initials: "AR",
    tint: "coral",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
    verified: true,
    since: "2024",
    bio: "I'm a librarian by trade and one of the people who keeps the forum a kind place to be, part-time, on a small honorarium, accountable to the council like the rest of the team. Moderation, for me, is mostly cataloguing of a different sort: keeping the useful things findable and making sure nobody gets lost or shouted down on the way in.",
    now: "Moderating the forum a few hours a week, and keeping the community resource guide tidy so new arrivals can actually find what they need.",
    openTo: [
      { kind: "custom", label: "Reporting something quietly" },
      { kind: "custom", label: "Help finding a resource" },
      { kind: "custom", label: "Reading recommendations" },
    ],
    work: [
      {
        category: "Stewardship",
        title: "Keeper of the master resource guide",
        year: "2024–",
      },
      {
        category: "Reading",
        title: "Queer Lisbon reading group",
        year: "2025",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "A calm second pair of eyes on a forum dispute",
        slug: "mod-help",
      },
    ],
    vouchers: ["mariana", "jordan"],
    voucherNames: "Mariana & Jordan",
    related: ["mariana", "jordan", "anika"],
    shapings: {
      film: {
        title: "The Hours",
        note: "Three lives, one thread, held together by care. I rewatch it when a week has been heavy.",
      },
      book: {
        title: "The Library Book, Susan Orlean",
        note: "A reminder that a library is a community holding itself together in public.",
      },
      song: {
        title: "Casa, Mariza",
        note: "Home as a feeling you can carry. I play it on the walk back from a long shift.",
      },
      moment: {
        title: "Talking two members back from the brink of a flame war",
        note: "They ended up co-hosting a reading group. That is the whole job, really.",
      },
    },
    skills: [
      { name: "Forum moderation", meta: "Available · report something to me" },
      { name: "Resource cataloguing", meta: "Keeps the guides findable" },
      { name: "Reading recommendations", meta: "Free · queer literature" },
    ],
    groups: [
      { name: "QueerPulse Moderation Team", role: "Moderator (part-time)" },
      { name: "Queer Lisbon Reading Group", role: "Host" },
    ],
    activity: [
      {
        icon: FiMessageCircle,
        title: "Posted the Q3 micro-grants call",
        sub: "On behalf of the team · Forum",
        to: routes.forum,
      },
      {
        icon: FiBookOpen,
        title: "Tidied the master resource guide",
        sub: "Monthly update · Forum",
        to: routes.forum,
      },
    ],
  },

  // ── The logged-in user (self) ─────────────────────────────────────────────
  tiago: {
    slug: "tiago",
    first: "Tiago",
    last: "Costa",
    role: "Fullstack Developer",
    pronouns: "he/they",
    hood: "Arroios",
    tags: ["React - testing", "TypeScript", "Node.js", "Poetry"],
    visibility: "open",
    initials: "TC",
    tint: "jade",
    verified: true,
    since: "2025",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    bio: "test bio description for logged in user (tiago)",
    now: "Building things for the web, writing poetry, and organising events for the queer and non-monogamy communities in Lisbon.",
    openTo: [
      { kind: "preset", id: "collaborating" },
      { kind: "custom", label: "Community events" },
      { kind: "preset", id: "mentoring" },
    ],
    identities: ["Gay", "Bisexual", "Queer"],
    lookingFor: [
      "Community & friendship",
      "Professional networking",
      "Gatherings & events",
      "Creative collaboration",
      "Reading & culture",
    ],
    lookingForPublic: true,
    work: [
      {
        category: "Fullstack Developer",
        title:
          "Broadvoice, real-time VoIP systems (React, Node, NestJS, Apache Kafka)",
        year: "2022–2025",
        image:
          "https://plus.unsplash.com/premium_photo-1732115973557-47e5c91ba6e9?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Fullstack Developer",
        title:
          "AAUE, Universidade de Évora, web platforms & a custom CMS (Vue, React, Node)",
        year: "2020–2022",
        image:
          "https://plus.unsplash.com/premium_photo-1737392496893-07869d657a6e?q=80&w=800&auto=format&fit=crop",
      },
      {
        category: "Poetry",
        title: "Four poems published in the Ofélia books",
        year: "2024",
        image:
          "https://plus.unsplash.com/premium_photo-1759762964086-184095920575?q=80&w=800&auto=format&fit=crop",
      },
    ],
    board: [
      {
        kind: "offering",
        title: "Web development & mentorship for community projects",
        slug: "web-dev-help",
      },
    ],
    vouchers: ["ines", "rui"],
    voucherNames: "Inês & Rui",
    related: ["rui", "ines", "andre"],
    skills: [
      { name: "Web development", meta: "Available · React, TypeScript, Node" },
      {
        name: "API design & development",
        meta: "Trade · backend & infrastructure",
      },
      { name: "DJ sets", meta: "Hot Mess Express · queer parties" },
    ],
    groups: [
      { name: "Hot Mess Express", role: "DJ duo · with Camila" },
      { name: "Queer Community Events", role: "Organiser" },
      { name: "Non-Monogamy Network", role: "Organiser" },
    ],
    activity: [
      {
        icon: FiBookOpen,
        title: "Published in the Ofélia books",
        sub: "Four poems · 2024",
        to: routes.magazine,
      },
      {
        icon: FiMusic,
        title: "DJ set as Hot Mess Express",
        sub: "Queer party · with Camila",
        to: routes.event,
      },
      {
        icon: FiCalendar,
        title: "Organised a community gathering",
        sub: "Queer + non-monogamy meetup",
        to: routes.event,
      },
    ],
    shapings: {
      film: {
        title: "Star Wars",
        note: "An odd, deep love for the lore. Worldbuilding is my favourite kind of magic.",
      },
      book: {
        title: "The Player's Handbook (D&D 5e)",
        note: "I'm a College of Lore bard: a bit of everything about everything.",
      },
      song: {
        title: "João Borsch & modinhas alentejanas",
        note: "Portuguese music, from lesser-known indie to the songs my region raised me on.",
      },
      moment: {
        title: "Seeing people safe to be themselves",
        note: "Pride parades, heavy metal concerts. I get teary knowing they'll never be alone.",
      },
    },
  },
};

/**
 * The canonical member registry, the single source of truth for every recurring
 * person on the platform (names, avatars, tints, roles, bios, vouchers, …).
 * Pages should read from here (via the helpers below) rather than re-typing a
 * member's details inline, so a change here propagates everywhere.
 *
 * Real members are spread last, so a real entry always wins over a seed one
 * sharing its slug, and new real people get the next ids in registration order.
 */
const ENTRIES: Record<string, Omit<Member, "id">> = {
  ...SEED_ENTRIES,
  ...REAL_ENTRIES,
};

/** The registry, keyed by slug, with a stable numeric `id` assigned by order. */
export const MEMBERS: Record<string, Member> = Object.fromEntries(
  Object.entries(ENTRIES).map(([slug, m], i) => [slug, { id: i + 1, ...m }]),
);

export const defaultProfileSlug = "ines";

/** Slug of the currently logged-in user ("self"). All self-surfaces, the nav
 * account chip, the feed greeting, "My profile", edit-profile, badges, read
 * their identity from here so the logged-in user is shown consistently. */
export const currentUserSlug = "tiago";
/** The currently logged-in user object. */
export const currentUser: Member = MEMBERS[currentUserSlug]!;
/** Email for the logged-in user, derived from their slug. Self-surfaces that
 * echo "we sent this to <you>" (cancel flow, invoices, subscriptions) read it
 * from here so the address always matches the signed-in account. */
export const currentUserEmail = `${currentUserSlug}@queerpulse.app`;

export type MemberSlug = keyof typeof ENTRIES;

/** Look up a member by slug. */
export function getMember(slug: string): Member | undefined {
  return MEMBERS[slug];
}

/** Full display name for a member object. */
export function fullName(member: Pick<Member, "first" | "last">): string {
  return `${member.first} ${member.last}`;
}

/** Full display name by slug (falls back to the slug if unknown). */
export function memberName(slug: string): string {
  const member = MEMBERS[slug];
  return member ? fullName(member) : slug;
}

/** Avatar props (initials + tint) for a member by slug. */
export function memberAvatar(
  slug: string,
): { initials: string; tint: Member["tint"]; photo?: string } | undefined {
  const member = MEMBERS[slug];
  return member
    ? { initials: member.initials, tint: member.tint, photo: member.photo }
    : undefined;
}
