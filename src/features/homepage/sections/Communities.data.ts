// Rich "Spotlight + Index" dataset for the homepage Communities section
// (design variant G). Kept separate from `../data/communities.ts` — that
// thinner `Community[]` still backs feed / connections / useCommunities and
// must not change shape.

export type CommunityCategory =
  "social" | "arts" | "support" | "activism" | "quiet";

export type CommunityAccess = "open" | "request" | "private";
export type RoomKey = "Pulse" | "Discussions" | "Events" | "Resources";
export type FaceTint = "coral" | "jade" | "plum" | "violet";

export interface CommunityFace {
  initials: string;
  tint: FaceTint;
}

interface CommunityBase {
  /** Stable slug — selection key + link target hash. */
  anchor: string;
  category: CommunityCategory;
  railName: string;
  /** Rail subtitle. */
  sub: string;
  name: string;
  /** Coral-italic tail appended after `name` (e.g. "Lisboa"). */
  nameAccent?: string;
  desc: string;
  access: CommunityAccess;
  founded: number;
  members: number;
  /** Sort weight for "Most active". */
  activity: number;
  langsArr: string[];
  hood: string;
}

export interface FullCommunity extends CommunityBase {
  quiet?: false;
  category: Exclude<CommunityCategory, "quiet">;
  categoryLabel: string;
  tint: FaceTint;
  photo: string;
  /** Real cover image; falls back to the tinted `photo` placeholder when absent. */
  photoSrc?: string;
  quote: string;
  by: { initials: string; tint: FaceTint; name: string; role: string };
  host: { initials: string; tint: FaceTint; name: string; extra: string };
  langs: string;
  loc: string;
  verified: string | null;
  rooms: RoomKey[];
  trend: number[];
  sizeNote: string;
  steady: boolean;
  does: Array<[label: string, cadence: string]>;
  faces: CommunityFace[];
  facesMore: number;
  count: string;
  growth: string;
  live: { text: string; isLive?: boolean };
}

export interface QuietCommunity extends CommunityBase {
  quiet: true;
  category: "quiet";
}

export type SpotlightCommunity = FullCommunity | QuietCommunity;

export const spotlightCommunities: SpotlightCommunity[] = [
  {
    anchor: "queer-runners",
    category: "social",
    categoryLabel: "Social · Sport",
    tint: "jade",
    name: "Queer Runners",
    nameAccent: "Lisboa",
    railName: "Queer Runners Lisboa",
    sub: "Run the city together",
    photo: "Riverside run, last Sunday",
    desc: "Slow jogs and fast friendships. We run the city together every Sunday at everyone's pace and brunch after. Newcomers always get a buddy, and nobody runs alone.",
    quote: "Nobody has ever once asked me to prove I belong here.",
    photoSrc:
      "https://images.unsplash.com/photo-1656387978687-dea3f486f9f0?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "SL",
      tint: "coral",
      name: "Sofia L.",
      role: "member since 2023",
    },
    host: {
      initials: "RM",
      tint: "coral",
      name: "Rui M.",
      extra: "2 pace leaders",
    },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Cais do Sodré",
    hood: "Cais do Sodré",
    founded: 2021,
    access: "open",
    verified: "QueerPulse-supported",
    rooms: ["Pulse", "Events", "Resources"],
    trend: [4, 5, 5, 7, 9, 12, 16, 21],
    sizeNote: "Fastest-growing this month",
    steady: false,
    activity: 95,
    members: 214,
    does: [
      ["Sunday run along the Tejo", "weekly"],
      ["Post-run brunch & coffee", "after every run"],
      ["Race carpools & training plans", "monthly"],
    ],
    faces: [
      { initials: "RM", tint: "coral" },
      { initials: "IT", tint: "jade" },
      { initials: "TR", tint: "plum" },
      { initials: "SL", tint: "violet" },
    ],
    facesMore: 210,
    count: "214 members",
    growth: "9 joined this week",
    live: { text: "12 going Sunday" },
  },
  {
    anchor: "trans-hub",
    category: "support",
    categoryLabel: "Support",
    tint: "violet",
    name: "Trans & Non-Binary Hub",
    railName: "Trans & Non-Binary Hub",
    sub: "Docs, HRT, plain warmth",
    photo: "Name-change clinic evening",
    desc: "The city's biggest trans, non-binary and questioning space, sharing documents know-how, HRT and healthcare experience, and steady warmth from people who've walked it.",
    quote: "The first space I didn't have to explain myself in.",
    photoSrc:
      "https://images.unsplash.com/photo-1656408455261-e7e915a3285c?q=80&w=1430&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "KA",
      tint: "coral",
      name: "Kai A.",
      role: "member since 2022",
    },
    host: { initials: "DP", tint: "violet", name: "Diana P.", extra: "4 mods" },
    langs: "PT · EN · BR",
    langsArr: ["PT", "EN", "BR"],
    loc: "Anjos + online",
    hood: "Anjos",
    founded: 2019,
    access: "request",
    verified: "QueerPulse-supported",
    rooms: ["Pulse", "Discussions", "Events", "Resources"],
    trend: [40, 42, 45, 44, 47, 49, 50, 52],
    sizeNote: "Largest in Lisbon",
    steady: true,
    activity: 82,
    members: 312,
    does: [
      ["Name & documents clinic", "Thursdays"],
      ["HRT & healthcare peer Q&A", "weekly thread"],
      ["Newcomer welcome calls", "on request"],
    ],
    faces: [
      { initials: "DP", tint: "violet" },
      { initials: "KA", tint: "coral" },
      { initials: "VP", tint: "jade" },
    ],
    facesMore: 309,
    count: "312 members",
    growth: "9 joined this week",
    live: { text: "Clinic Thu 18:30" },
  },
  {
    anchor: "rainbow-arts",
    category: "arts",
    categoryLabel: "Arts",
    tint: "coral",
    name: "Rainbow Arts Collective",
    railName: "Rainbow Arts Collective",
    sub: "Make things together",
    photo: "Studio wall, members' work",
    desc: "A working collective of painters, zinemakers, filmmakers and poets. Members share pieces in progress, run crits, and open their studios for late nights of making.",
    quote: "I found real collaborators here, people who make things with me.",
    photoSrc:
      "https://images.unsplash.com/photo-1566661983838-6f38e8698883?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "MC",
      tint: "violet",
      name: "Mariana C.",
      role: "member since 2021",
    },
    host: { initials: "AQ", tint: "coral", name: "André Q.", extra: "3 mods" },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Marvila",
    hood: "Marvila",
    founded: 2020,
    access: "open",
    verified: null,
    rooms: ["Pulse", "Events", "Resources"],
    trend: [10, 11, 12, 12, 13, 13, 13, 13],
    sizeNote: "Steady & warm",
    steady: true,
    activity: 60,
    members: 128,
    does: [
      ["Open studio nights", "1st & 3rd Sat"],
      ["Portfolio crits & feedback", "fortnightly"],
      ["Shared gallery & zine swaps", "ongoing"],
    ],
    faces: [
      { initials: "AQ", tint: "coral" },
      { initials: "MC", tint: "violet" },
      { initials: "FS", tint: "plum" },
    ],
    facesMore: 125,
    count: "128 members",
    growth: "4 joined this week",
    live: { text: "3 new works today" },
  },
  {
    anchor: "qtibipoc",
    category: "support",
    categoryLabel: "Support",
    tint: "violet",
    name: "Queer & of Colour",
    railName: "Queer & of Colour",
    sub: "QTIBIPOC mutual care & joy",
    photo: "Sunday cookout, full table",
    desc: "A QTIBIPOC community built on mutual care, cooking together, and joy that doesn't need explaining. Aid and housing threads run alongside the good times.",
    quote: "Somewhere I can bring my whole self, and get fed.",
    photoSrc:
      "https://images.unsplash.com/photo-1691857930568-059f0dba3ad2?q=80&w=1462&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "FS",
      tint: "plum",
      name: "Fábio S.",
      role: "member since 2022",
    },
    host: { initials: "LK", tint: "coral", name: "Leila K.", extra: "2 mods" },
    langs: "PT · EN · FR",
    langsArr: ["PT", "EN", "FR"],
    loc: "Arroios",
    hood: "Arroios",
    founded: 2021,
    access: "request",
    verified: "QueerPulse-supported",
    rooms: ["Pulse", "Discussions", "Events"],
    trend: [6, 7, 9, 10, 12, 14, 15, 17],
    sizeNote: "Growing fast",
    steady: false,
    activity: 70,
    members: 168,
    does: [
      ["Sunday cookouts", "monthly"],
      ["Mutual-aid & housing thread", "ongoing"],
      ["Culture & film nights", "fortnightly"],
    ],
    faces: [
      { initials: "LK", tint: "coral" },
      { initials: "MC", tint: "violet" },
      { initials: "FS", tint: "plum" },
    ],
    facesMore: 165,
    count: "168 members",
    growth: "6 joined this week",
    live: { text: "12 new photos" },
  },
  {
    anchor: "queer-youth",
    category: "social",
    categoryLabel: "Social",
    tint: "jade",
    name: "Queer Youth 18–25",
    railName: "Queer Youth 18–25",
    sub: "Finding your feet",
    photo: "Study & chill co-working",
    desc: "For younger queers finding their footing in Lisbon: study sessions, cheap-eats hangs, and the kind of advice you wish someone had given you at eighteen.",
    quote: "I moved here alone at nineteen. Not anymore.",
    photoSrc:
      "https://images.unsplash.com/photo-1628873990671-ebb286caa69e?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "VP",
      tint: "jade",
      name: "Vera P.",
      role: "member since 2024",
    },
    host: { initials: "JC", tint: "coral", name: "João C.", extra: "3 mods" },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Intendente + online",
    hood: "Intendente",
    founded: 2022,
    access: "open",
    verified: null,
    rooms: ["Pulse", "Discussions", "Events"],
    trend: [8, 10, 13, 16, 19, 22, 24, 24],
    sizeNote: "Fastest-growing this month",
    steady: false,
    activity: 98,
    members: 241,
    does: [
      ["Study & chill co-working", "most days"],
      ["Cheap-eats hangs", "weekly"],
      ["First-job & uni advice", "ongoing"],
    ],
    faces: [
      { initials: "JC", tint: "coral" },
      { initials: "MC", tint: "violet" },
      { initials: "VP", tint: "jade" },
    ],
    facesMore: 238,
    count: "241 members",
    growth: "14 joined this week",
    live: { text: "Live now · 6 chatting", isLive: true },
  },
  {
    anchor: "queer-parents",
    category: "social",
    categoryLabel: "Social",
    tint: "jade",
    name: "Queer Parents",
    railName: "Queer Parents",
    sub: "Parents & chosen family",
    photo: "Playground picnic",
    desc: "Parents and chosen family swapping playgrounds, school and clinic recommendations, and the occasional survival tip, plus real weekend plans you can bring the kids to.",
    quote: "Our kids have a whole extra family now.",
    photoSrc:
      "https://images.unsplash.com/photo-1648254799751-398eba5d64d1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "BC",
      tint: "jade",
      name: "Bea C.",
      role: "member since 2021",
    },
    host: { initials: "VP", tint: "jade", name: "Vera P.", extra: "2 mods" },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Estrela",
    hood: "Estrela",
    founded: 2020,
    access: "request",
    verified: "QueerPulse-supported",
    rooms: ["Pulse", "Discussions", "Resources"],
    trend: [12, 12, 13, 13, 13, 13, 13, 13],
    sizeNote: "Steady & warm",
    steady: true,
    activity: 55,
    members: 132,
    does: [
      ["Playground picnics", "Sundays"],
      ["School & clinic recommendations", "ongoing"],
      ["Babysitting swaps", "as needed"],
    ],
    faces: [
      { initials: "VP", tint: "jade" },
      { initials: "LK", tint: "coral" },
    ],
    facesMore: 130,
    count: "132 members",
    growth: "3 joined this week",
    live: { text: "15 going Sunday" },
  },
  {
    anchor: "disabled-queers",
    category: "support",
    categoryLabel: "Support",
    tint: "violet",
    name: "Disabled Queers",
    railName: "Disabled Queers",
    sub: "Access comes first",
    photo: "Sensory-friendly hang",
    desc: "Access comes first, always: every plan is built around what people actually need, from sensory-friendly hangs to benefits and admin know-how and spoons-aware check-ins.",
    quote: "Plans are built around what I actually need. Every time.",
    photoSrc:
      "https://images.unsplash.com/photo-1783626860180-c5138d52db0a?q=80&w=1096&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "DP",
      tint: "violet",
      name: "Dinis P.",
      role: "member since 2022",
    },
    host: { initials: "NF", tint: "jade", name: "Nuno F.", extra: "2 mods" },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Graça + online",
    hood: "Graça",
    founded: 2021,
    access: "request",
    verified: "QueerPulse-supported",
    rooms: ["Pulse", "Discussions", "Resources"],
    trend: [7, 7, 8, 8, 9, 9, 9, 9],
    sizeNote: "Small & close",
    steady: true,
    activity: 50,
    members: 94,
    does: [
      ["Sensory-friendly hangs", "Saturdays"],
      ["Access & benefits know-how", "ongoing"],
      ["Spoons-aware check-ins", "weekly"],
    ],
    faces: [
      { initials: "NF", tint: "jade" },
      { initials: "BC", tint: "plum" },
    ],
    facesMore: 92,
    count: "94 members",
    growth: "5 joined this week",
    live: { text: "7 going Saturday" },
  },
  {
    anchor: "trans-mutual-aid",
    category: "activism",
    categoryLabel: "Activism",
    tint: "plum",
    name: "Trans Mutual Aid Network",
    railName: "Trans Mutual Aid Network",
    sub: "Funds, docs, housing",
    photo: "Packing solidarity boxes",
    photoSrc:
      "https://images.unsplash.com/photo-1777028541220-48d7e950bbb3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Neighbours helping neighbours, as equals. Emergency funds, paperwork buddying and housing support, organised transparently by the people who need it most.",
    quote: "When my landlord evicted me, they had a plan by morning.",
    by: {
      initials: "A",
      tint: "plum",
      name: "A member",
      role: "kept anonymous",
    },
    host: {
      initials: "TR",
      tint: "plum",
      name: "Tomás R.",
      extra: "the collective",
    },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Citywide",
    hood: "Citywide",
    founded: 2019,
    access: "request",
    verified: "QueerPulse-supported",
    rooms: ["Pulse", "Resources"],
    trend: [8, 8, 9, 8, 9, 9, 9, 9],
    sizeNote: "Small & mighty",
    steady: true,
    activity: 65,
    members: 89,
    does: [
      ["Emergency fund requests", "rolling"],
      ["Housing & paperwork buddying", "ongoing"],
      ["Box-packing & drop-offs", "monthly"],
    ],
    faces: [
      { initials: "TR", tint: "plum" },
      { initials: "DP", tint: "violet" },
    ],
    facesMore: 87,
    count: "89 members",
    growth: "€1,240 raised this month",
    live: { text: "Needs hands this week" },
  },
  {
    anchor: "queer-elders",
    category: "social",
    categoryLabel: "Social",
    tint: "jade",
    name: "Queer Elders 50+",
    railName: "Queer Elders 50+",
    sub: "Coffee, memory, mischief",
    photo: "Coffee, cards, laughing",
    desc: "The ones who made the road we walk, still very much walking it: weekly coffee, oral-history evenings, and a friendly help desk for tech and admin.",
    quote:
      "At sixty-two, I've made more queer friends this year than in my whole life.",
    photoSrc:
      "https://images.unsplash.com/photo-1603129473525-4cd6f36fe057?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    by: {
      initials: "ZM",
      tint: "jade",
      name: "Zé M.",
      role: "member since 2024",
    },
    host: { initials: "MS", tint: "plum", name: "Marta S.", extra: "2 mods" },
    langs: "PT · EN",
    langsArr: ["PT", "EN"],
    loc: "Campo de Ourique",
    hood: "Campo de Ourique",
    founded: 2022,
    access: "open",
    verified: null,
    rooms: ["Pulse", "Events", "Resources"],
    trend: [4, 5, 6, 6, 7, 7, 7, 7],
    sizeNote: "New & warm",
    steady: false,
    activity: 45,
    members: 76,
    does: [
      ["Wednesday coffee club", "weekly"],
      ["Oral-history evenings", "monthly"],
      ["Tech & admin help desk", "ongoing"],
    ],
    faces: [
      { initials: "MS", tint: "plum" },
      { initials: "ZM", tint: "jade" },
    ],
    facesMore: 74,
    count: "76 members",
    growth: "7 joined this week",
    live: { text: "Coffee Wed 16:00" },
  },
];
