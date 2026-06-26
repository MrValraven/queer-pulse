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
import type { VisibilityMode } from "../../../shared/components/ui/VisibilityBadge";
import { routes } from "../../../app/routeMap";

export interface ShapingItem {
  title: string;
  note: string;
}
export interface WorkItem {
  category: string;
  title: string;
  year: string;
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
  hood: string;
  tags: string[];
  visibility: VisibilityMode;
  initials: string;
  tint: AvatarTint;
  /** Profile photo URL (e.g. Unsplash). When absent, the avatar shows initials. */
  photo?: string;
  verified: boolean;
  since: string;
  bio: string;
  now: string;
  openTo: string[];
  work: WorkItem[];
  board: BoardItem[];
  /** Member slugs of people who have vouched (cross-referenced into the registry). */
  vouchers: string[];
  voucherNames: string;
  related: string[];
  shapings: Partial<Record<"film" | "book" | "song" | "moment", ShapingItem>>;
  /** Skills/services offered on the barter board. */
  skills: SkillItem[];
  /** Groups, reading circles and collectives the member is part of. */
  groups: GroupItem[];
  /** Recent public activity across the platform. */
  activity: ActivityItem[];
}

/** Build a lightweight member (identity only) with empty profile detail. */
function lite(
  slug: string,
  first: string,
  last: string,
  initials: string,
  tint: AvatarTint,
  role = "",
  hood = "Lisbon",
): Omit<Member, "id"> {
  return {
    slug,
    first,
    last,
    initials,
    tint,
    role,
    hood,
    tags: [],
    visibility: "network",
    verified: false,
    since: "",
    bio: "",
    now: "",
    openTo: [],
    work: [],
    board: [],
    vouchers: [],
    voucherNames: "",
    related: [],
    shapings: {},
    skills: [],
    groups: [],
    activity: [],
  };
}

/**
 * The canonical member registry — the single source of truth for every recurring
 * person on the platform (names, avatars, tints, roles, bios, vouchers, …).
 * Pages should read from here (via the helpers below) rather than re-typing a
 * member's details inline, so a change here propagates everywhere.
 */
const ENTRIES: Record<string, Omit<Member, "id">> = {
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
    bio: "I design identities and editorial systems for cultural institutions, small presses and the occasional brave restaurant. Most of my work starts with a long conversation and a worse-for-wear notebook. I run a studio off the garden in Príncipe Real — the door's usually open.",
    now: "Wrapping a visual identity for a queer-run bookshop opening in Anjos this autumn, and slowly setting type for a riso zine about Lisbon's disappearing tascas.",
    openTo: ["Collaborations", "Mentoring juniors", "Coffee in the garden"],
    work: [
      {
        category: "Identity",
        title: "Livraria Devagar — bookshop identity",
        year: "2025",
      },
      {
        category: "Editorial",
        title: "Tasca — a riso zine on vanishing taverns",
        year: "2025",
      },
      {
        category: "Type",
        title: "Pulso Display — a variable serif",
        year: "2024",
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
      { name: "Brand identity sprints", meta: "Available · cultural orgs & small presses" },
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
      { icon: FiFileText, title: "Featured in QueerPulse Magazine", sub: "Designing a queer bookshop's identity · Culture · June 2026", to: routes.magazine },
      { icon: FiCalendar, title: "Hosting a portfolio review night", sub: "Atelier Pulso · 21 June", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Best riso printers in Lisbon? · 4 days ago", to: routes.forum },
    ],
    shapings: {
      film: {
        title: "Mulholland Drive",
        note: "The first film that made me feel like my confusion was the point.",
      },
      book: {
        title: "Ways of Seeing — John Berger",
        note: "Changed how I look at everything I design.",
      },
      song: {
        title: "'Lança Perfume' — Rita Lee",
        note: "My mother played it on Saturday mornings. I didn't know what it meant. I still don't. I love it.",
      },
      moment: {
        title: "My first risograph print, 2017",
        note: "Pulling a sheet from the drum and seeing it hadn't worked perfectly — and realising that was better.",
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
    bio: "I build infrastructure for things that should last. Mostly backend, mostly Rust. I care a lot about systems that don't burn people out — technical or otherwise. Based in a warehouse in Marvila with too many plants.",
    now: "Building a low-cost infrastructure toolkit for queer-run nonprofits. Looking for a collaborator who knows their way around DevOps.",
    openTo: [
      "Mentoring junior engineers",
      "Infrastructure consulting",
      "After-work drinks",
    ],
    work: [
      {
        category: "Open source",
        title: "Fern — a lightweight job queue in Rust",
        year: "2025",
      },
      {
        category: "Consulting",
        title: "Infra rebuild for a Lisbon NGO",
        year: "2024",
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
      { name: "DevOps & infra setup", meta: "Available · queer-run nonprofits" },
      { name: "Code review", meta: "Available · backend & Rust" },
      { name: "Self-hosting advice", meta: "Trade · privacy-first stacks" },
    ],
    groups: [
      { name: "Open Source Queers", role: "Community · Organiser" },
      { name: "Marvila Makers", role: "Collective · Member" },
      { name: "Sci-fi & Systems", role: "Reading group · Member" },
    ],
    activity: [
      { icon: FiMessageCircle, title: "Started a Forum thread", sub: "Low-cost infra for community projects · 1 week ago", to: routes.forum },
      { icon: FiCalendar, title: "Attending a build night", sub: "Open Source Queers · 18 June", to: routes.event },
      { icon: FiBookOpen, title: "Joined a reading group", sub: "Sci-fi & Systems · The Dispossessed", to: routes.readingGroups },
    ],
    shapings: {
      film: {
        title: "Blade Runner 2049",
        note: "Not for the sci-fi. For the silence. For what it says about building things that outlast you.",
      },
      book: {
        title: "The Dispossessed — Ursula K. Le Guin",
        note: "The first book that made anarchism feel like an engineering problem.",
      },
      song: {
        title: "'Music For Airports' — Brian Eno",
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
    bio: "I make documentaries about people who would never think to be documented. Slow, quiet, observational work — usually shot in Lisbon, occasionally somewhere with better light. I edit in a borrowed room in Alfama with a view I will never deserve.",
    now: "Post-production on a 28-minute doc about the last remaining tascas in Lisbon. Looking for a composer.",
    openTo: ["Collaboration", "Co-directing", "Screening events"],
    work: [
      {
        category: "Documentary",
        title: "O Café das Seis — portrait of a Mouraria café",
        year: "2024",
      },
      {
        category: "Short doc",
        title: "After the Factory — Marvila changing",
        year: "2023",
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
      { name: "Documentary consults", meta: "Available · first-time directors" },
      { name: "Editing", meta: "Trade · short docs" },
      { name: "Interview facilitation", meta: "Available · bilingual PT/EN" },
    ],
    groups: [
      { name: "Alfama Film Club", role: "Screening group · Organiser" },
      { name: "Lisbon Doc Collective", role: "Collective · Member" },
      { name: "Sound & Image", role: "Community · Member" },
    ],
    activity: [
      { icon: FiEdit3, title: "Published in QueerPulse Magazine", sub: "On filming the last tascas · Culture · May 2026", to: routes.magazine },
      { icon: FiCalendar, title: "Screening at a community night", sub: "O Café das Seis · 27 June", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Composers for a short doc? · 2 days ago", to: routes.forum },
    ],
    shapings: {
      film: {
        title: "Jeanne Dielman, 23 quai du Commerce",
        note: "Watching someone do dishes for 20 minutes and feeling everything.",
      },
      book: {
        title: "Camera Lucida — Roland Barthes",
        note: "He describes grief and calls it photography. I've never recovered.",
      },
      song: {
        title: "'Canto Moço' — Sérgio Godinho",
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
    bio: "I run a supper club out of my home in Mouraria every few weeks — twelve seats, no menu, whatever came in that week. I ferment things obsessively and think deeply about food as hospitality, not spectacle.",
    now: "Planning the 13th edition of the Mouraria supper club. Working on a small fermentation guide for the community.",
    openTo: ["Catering collaborations", "Recipe testing", "Long dinners"],
    work: [
      {
        category: "Supper club",
        title: "Queer Supper Club — 12 editions in Mouraria",
        year: "2024–25",
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
      { icon: FiCalendar, title: "Hosting the 13th supper club", sub: "Twelve seats · Mouraria · 28 June", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Where to find natural wine in Lisbon? · 3 days ago", to: routes.forum },
      { icon: FiBookOpen, title: "Started a reading group", sub: "Slow Food Circle · The Omnivore's Dilemma", to: routes.readingGroups },
    ],
    shapings: {
      film: {
        title: "Tampopo",
        note: "A film about ramen that is actually about love and obsession and why both are worth it.",
      },
      book: {
        title: "The Omnivore's Dilemma — Michael Pollan",
        note: "Made me furious in all the right ways.",
      },
      song: {
        title: "'Estranha Forma de Vida' — Amália Rodrigues",
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
    bio: "I work with LGBTQ+ adults navigating identity, relationships and the weight of being visible in a world that sometimes asks too much of us. My practice is in Estrela. I'm on QueerPulse because community matters for mental health — including mine.",
    now: "Running a monthly peer support group for queer professionals. Currently full but keeping a waitlist.",
    openTo: [
      "Peer consultations",
      "Referrals",
      "Community mental health conversations",
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
      { name: "Queer Professionals Peer Group", role: "Support group · Facilitator" },
      { name: "Estrela Neighbours", role: "Community · Member" },
    ],
    activity: [
      { icon: FiCalendar, title: "Running a monthly peer group", sub: "Queer professionals · waitlist open", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Finding LGBTQ+-affirming therapists · 5 days ago", to: routes.forum },
    ],
    shapings: {
      film: {
        title: "Portrait of a Lady on Fire",
        note: "A film about looking and being looked at. I think about it in every session.",
      },
      book: {
        title: "The Body Keeps the Score — Bessel van der Kolk",
        note: "Not as therapy gospel — as a starting point for asking better questions.",
      },
      song: {
        title: "'Pessoa' — Dead Combo",
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
    tags: ["Portrait", "Analog film", "Darkroom", "Medium format"],
    visibility: "open",
    initials: "AQ",
    tint: "jade",
    photo:
      "https://images.unsplash.com/photo-1547646034-d37a03ebaba3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    verified: false,
    since: "2025",
    bio: "I shoot portraits on film — mostly medium format, mostly natural light, mostly people who have never liked having their photograph taken. I have a darkroom in Cais do Sodré that smells like fixer and old wood. Come and visit.",
    now: "Offering free portrait sessions for trans and nonbinary community members. No agenda, just a good photo.",
    openTo: [
      "Portrait commissions",
      "Collaborative zines",
      "Darkroom visitors",
    ],
    work: [
      {
        category: "Portrait series",
        title: "Faces of the Bairro — 40 portraits in Mouraria",
        year: "2024",
      },
      {
        category: "Editorial",
        title: "Covers for Pulsar magazine, issues 3–6",
        year: "2025",
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
      { name: "Darkroom lessons", meta: "Trade · analog film" },
      { name: "Editorial photography", meta: "Available · zines & covers" },
    ],
    groups: [
      { name: "Analog Lisboa", role: "Collective · Organiser" },
      { name: "Cais do Sodré Darkroom", role: "Studio · Member" },
      { name: "Portrait Exchange", role: "Barter collective · Member" },
    ],
    activity: [
      { icon: FiCamera, title: "Added work to the Art Showcase", sub: "Faces of the Bairro · Culture", to: routes.culture },
      { icon: FiCalendar, title: "Free portrait day", sub: "For trans & nonbinary members · 15 June", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Best film labs still open in Lisbon? · 1 week ago", to: routes.forum },
    ],
    shapings: {
      film: {
        title: "The Ballad of Sexual Dependency — Nan Goldin",
        note: "Not a film — a slideshow. Changed what I thought a portrait was allowed to be.",
      },
      book: {
        title: "Ways of Seeing — John Berger",
        note: "Keeps ending up in other people's lists. There's a reason.",
      },
      song: {
        title: "'Strange Fruit' — Billie Holiday",
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
    bio: "I've shipped products at two fintechs and one very strange startup. I'm interested in what it means to build ethically — not as a marketing position but as a daily practice. I live in Arroios, walk everywhere, and am genuinely good at spotting the real problem.",
    now: "Between roles, thinking carefully about what's next. Looking for a June–August sublet while I figure it out.",
    openTo: ["Product consulting", "Informal chats", "Sublet leads in Arroios"],
    work: [
      {
        category: "Product",
        title: "Payments redesign at a Lisbon fintech",
        year: "2024",
      },
      {
        category: "Strategy",
        title: "Zero-to-one consumer product",
        year: "2023",
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
      { icon: FiMessageCircle, title: "Started a Forum thread", sub: "A sublet in Arroios, June–August? · 2 days ago", to: routes.forum },
      { icon: FiCalendar, title: "Attending a product meetup", sub: "Ethical Product Lisbon · 20 June", to: routes.event },
      { icon: FiBookOpen, title: "Joined a reading group", sub: "Non-fiction Circle · Invisible Cities", to: routes.readingGroups },
    ],
    shapings: {
      film: {
        title: "The Social Network",
        note: "I know. But it was the first time I saw building a product as drama, not engineering.",
      },
      book: {
        title: "Invisible Cities — Italo Calvino",
        note: "A product manager's secret handbook disguised as poetry.",
      },
      song: {
        title: "'Killing Me Softly' — Lauryn Hill",
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
    bio: "I make ceramics in a studio in Graça — functional pieces with a slow, considered aesthetic. I teach occasional workshops and am almost always covered in clay. The studio has two spare desks and good afternoon light.",
    now: "Preparing a small exhibition of functional pieces for late summer. Also testing new glaze formulas that keep going wrong in interesting ways.",
    openTo: [
      "Studio visitors",
      "Collaborations with designers",
      "Workshop participants",
    ],
    work: [
      {
        category: "Collection",
        title: "Slow Objects — functional ceramics collection",
        year: "2025",
      },
      {
        category: "Workshop",
        title: "Beginners wheel-throwing, monthly",
        year: "2024–25",
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
      { icon: FiCalendar, title: "Opening a small exhibition", sub: "Slow Objects · late summer", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Shared kiln space in Lisbon? · 4 days ago", to: routes.forum },
      { icon: FiBookOpen, title: "Joined a reading group", sub: "Slow Objects Circle · Zen & the Art…", to: routes.readingGroups },
    ],
    shapings: {
      film: {
        title: "Être et Avoir",
        note: "A documentary about a one-room school. Slow and full of care. Everything I want my work to be.",
      },
      book: {
        title: "Zen and the Art of Motorcycle Maintenance — Pirsig",
        note: "I read it twice, understood it differently each time.",
      },
      song: {
        title: "'Aqui Estou Eu' — José Mário Branco",
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
    bio: "I produce electronic music and mix live sets — mostly for queer club nights but occasionally for things that don't have a name yet. I have a small studio above a café in Bairro Alto that I share with two other producers. The hours are unsociable but the music is worth it.",
    now: "Working on a new EP and scoring music for Sofia's documentary. Open to new live set commissions for late 2026.",
    openTo: ["Live set commissions", "Collaborations", "Skill swaps"],
    work: [
      {
        category: "Production",
        title: "'Pulso' — debut EP, self-released",
        year: "2025",
      },
      {
        category: "Live",
        title: "Resident DJ, Queer Thursdays at Lux",
        year: "2024–25",
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
      { icon: FiMusic, title: "Released a debut EP", sub: "'Pulso' · self-released · 2025", to: routes.culture },
      { icon: FiCalendar, title: "Resident DJ set", sub: "Queer Thursdays at Lux", to: routes.event },
      { icon: FiMessageCircle, title: "Replied in the Forum", sub: "Scoring a documentary — rate advice? · 6 days ago", to: routes.forum },
    ],
    shapings: {
      film: {
        title: "Paris Is Burning",
        note: "Before I knew what a ballroom was. After I knew who I was.",
      },
      book: {
        title: "Invisible Man — Ralph Ellison",
        note: "About invisibility as political condition. I return to it every year.",
      },
      song: {
        title: "'Strings of Life' — Derrick May",
        note: "The first time I heard a synthesizer cry.",
      },
      moment: {
        title: "Playing to 12 people in a basement in 2019",
        note: "The best show I've ever played. No one was performing anything.",
      },
    },
  },

  // ── Lightweight members ───────────────────────────────────────────────────
  // The wider community — directory cards, connections, reviewers, magazine
  // contributors. Identity (name + avatar) only; profile detail can be filled
  // in later. Kept here so a name/avatar change propagates everywhere.
  "sofia-rodrigues": lite(
    "sofia-rodrigues",
    "Sofia",
    "Rodrigues",
    "SR",
    "jade",
    "UX Designer",
  ),
  "tomas-mendes": lite(
    "tomas-mendes",
    "Tomás",
    "Mendes",
    "TM",
    "jade",
    "Architect",
  ),
  anika: lite("anika", "Anika", "Kovač", "AK", "coral", "Translator & Poet"),
  jordan: lite("jordan", "Jordan", "Park", "JP", "plum", "Community Organiser"),
  maria: lite(
    "maria",
    "Maria",
    "Ferreira",
    "MF",
    "coral",
    "Psychologist",
    "Porto",
  ),
  kai: lite("kai", "Kai", "Larsson", "KL", "plum", "Filmmaker"),
  monica: lite("monica", "Mónica", "Resende", "MR", "coral", "Physiotherapist"),
  fatima: lite(
    "fatima",
    "Fátima",
    "Mendes",
    "FM",
    "coral",
    "Support Coordinator",
  ),
  "catarina-vaz": lite(
    "catarina-vaz",
    "Catarina",
    "Vaz",
    "CV",
    "plum",
    "Housing Organiser",
  ),
  jonas: lite(
    "jonas",
    "Jonas",
    "Ferreira",
    "JF",
    "jade",
    "Community Health Worker",
  ),
  rita: lite("rita", "Rita", "Varela", "RV", "plum", "Illustrator"),
  "sofia-castano": lite(
    "sofia-castano",
    "Sofia",
    "Castaño",
    "SC",
    "jade",
    "Photographer",
  ),
  nuno: lite("nuno", "Nuno", "Alves", "NA", "plum", "Software Engineer"),
  luisa: lite("luisa", "Luísa", "Gomes", "LG", "jade", "Curator"),
  "mariana-costa": lite(
    "mariana-costa",
    "Mariana",
    "Costa",
    "MC",
    "jade",
    "Journalist",
  ),
  "rui-fernandes": lite(
    "rui-fernandes",
    "Rui",
    "Fernandes",
    "RF",
    "jade",
    "Activist & Writer",
  ),
  "catarina-melo": lite(
    "catarina-melo",
    "Catarina",
    "Melo",
    "CM",
    "coral",
    "Housing Advocate",
  ),
  "sara-pinheiro": lite(
    "sara-pinheiro",
    "Sara",
    "Pinheiro",
    "SP",
    "jade",
    "Health & Access",
  ),
};

/** The registry, keyed by slug, with a stable numeric `id` assigned by order. */
export const MEMBERS: Record<string, Member> = Object.fromEntries(
  Object.entries(ENTRIES).map(([slug, m], i) => [slug, { id: i + 1, ...m }]),
) as Record<string, Member>;

export const defaultProfileSlug = "ines";

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
