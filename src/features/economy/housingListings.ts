import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { MEMBERS, memberName } from "../members/data/members";
import type { VerificationLevel } from "./api/verification.api";
import { neighbourhoodCentroid } from "./housingNeighbourhoods";

export type Tint = "coral" | "jade" | "plum";

/**
 * A listing's map location, honouring address privacy. `approx` is the
 * neighbourhood-centroid pin shown to everyone; `precise` + `addressLine` are
 * the exact home, present only when `precision === "exact"` (you're the owner or
 * a connected member). Pre-connection the UI shows the approximate pin with a
 * "exact address shared after you connect" note.
 */
export interface HousingLocation {
  approxLatitude: number | null;
  approxLongitude: number | null;
  preciseLatitude: number | null;
  preciseLongitude: number | null;
  addressLine: string | null;
  precision: "area" | "exact";
}

export interface Poster {
  initials: string;
  name: string;
  fullName: string;
  tint: AvatarTint;
  /** Empty when we have no join date on file (live listings): the line is
   *  omitted rather than rendered blank. */
  memberSince: string;
  /**
   * A MEASURED reply time, e.g. "within a day". Optional and absent in live
   * mode: the listing DTO carries no response metric, and promising one the
   * platform cannot back would contradict the honest-signals rule the
   * verification badges follow. Demo fixtures author it directly.
   */
  responseTime?: string;
  bio: string;
  /** The lister's real identity-verification level. Optional in demo fixtures
   * (absent → no badge, the honest default when we have no verification data). */
  verificationLevel?: VerificationLevel;
}

export interface HousingListing {
  slug: string;
  type: string;
  typeColor: string;
  typeText: string;
  tint: Tint;
  title: string;
  hood: string;
  beds: string;
  avail: string;
  description: string;
  price: string;
  period: string;
  image?: string;
  poster: Poster;
  /* detail */
  gallery: string[];
  longDesc: string[];
  features: string[];
  facts: { label: string; value: string }[];
  idealFor: string[];
  location: HousingLocation;
  /** Transparency (P2.6): step-free/lift/access line. Optional in demo fixtures
   * that predate the field (absent → the section is simply not rendered). */
  accessibilityInfo?: string;
  /** Whether bills are included in the rent — surfaced as a price-clarity line. */
  billsIncluded?: boolean;
  /** Who's offering the home. Absent/`member` → no badge; `agent` → broker badge. */
  listerKind?: "member" | "agent";
  /** Whether the backend derived this listing as "verified" (id-verified lister
   * + live + low risk). Absent/false → no chip. Never self-asserted. */
  verified?: boolean;
  /** The backend's stable machine reason behind `verified` (granting condition
   * or first failing gate). Carried through for an honest tooltip/debugging. */
  verifiedReason?: string;
  /** Bedroom count (0 = studio); absent when the lister didn't set one. Powers
   * the beds filter and the fact row. */
  bedrooms?: number;
  /** Optional 360°/virtual-tour link (https). Absent → no tour section. */
  virtualTourUrl?: string;
}

// Area-level location for a demo listing: the neighbourhood pin, no exact point
// (the privacy-forward default — you aren't connected to the lister in demo).
function areaLocation(hood: string): HousingLocation {
  const centroid = neighbourhoodCentroid(hood);
  return {
    approxLatitude: centroid?.latitude ?? null,
    approxLongitude: centroid?.longitude ?? null,
    preciseLatitude: null,
    preciseLongitude: null,
    addressLine: null,
    precision: "area",
  };
}

export const HOUSING_LISTINGS: HousingListing[] = [
  {
    slug: "principe-real-sunny-onebed",
    type: "sublet",
    typeColor: "rgba(var(--accent-rgb),.1)",
    typeText: "var(--accent-ink)",
    tint: "coral",
    title: "Sunny one-bed in Príncipe Real, July & August",
    hood: "Misericórdia",
    beds: "1 bed",
    avail: "1 Jul",
    description:
      "Beautiful first-floor flat with a view of the garden square. Fully furnished, excellent light. Available while I travel for two months.",
    price: "€1,100",
    period: "month",
    image:
      "https://images.unsplash.com/photo-1665249934445-1de680641f50?q=80&w=600&auto=format&fit=crop",
    poster: {
      initials: MEMBERS.ines!.initials,
      name: "Inês T.",
      fullName: memberName("ines"),
      tint: "coral",
      memberSince: "Member since 2023",
      responseTime: "within a few hours",
      bio: "Designer in Príncipe Real, runs Atelier Pulso. Subletting while away on a residency.",
      verificationLevel: "id_verified",
    },
    gallery: [
      "Living room · garden view",
      "Bedroom",
      "Kitchen",
      "The square below",
    ],
    longDesc: [
      "A bright first-floor one-bed right on the garden square, in one of the calmest corners of Príncipe Real. South-facing, so the living room gets sun most of the day, and the bedroom looks onto the courtyard at the back, quiet at night.",
      "It's fully furnished and ready to live in: everything from the coffee machine to good bedding is here. I'm away on a two-month residency and would much rather a community member had it than a holiday-let stranger. Queer household. The neighbours are genuinely lovely.",
    ],
    features: [
      "Fully furnished",
      "Great light",
      "Garden-square view",
      "Fast wifi",
      "Washing machine",
      "Quiet at night",
    ],
    facts: [
      { label: "Price", value: "€1,100 / month" },
      { label: "Deposit", value: "One month" },
      { label: "Minimum stay", value: "2 months (Jul–Aug)" },
      { label: "Furnished", value: "Yes, fully" },
      { label: "Bills", value: "Included up to €60" },
      { label: "Flatmates", value: "None, whole flat" },
      { label: "Pets", value: "Cats okay" },
      { label: "Available from", value: "1 July" },
    ],
    idealFor: [
      "Someone here for the summer who wants their own calm space",
      "A remote worker who needs good light and quiet",
      "Anyone who would treat a much-loved flat with care",
    ],
    accessibilityInfo:
      "First floor, no lift: one flight of stairs from the street. Step-free once inside.",
    billsIncluded: true,
    bedrooms: 1,
    // Verified: this fixture's lister is id_verified and the listing is clean —
    // exactly the state the backend derives the chip from.
    verified: true,
    verifiedReason: "id_verified_live_low_risk",
    // Demo-only "connected" state: precise pin + address are visible, to show
    // the post-connection view. Every other fixture stays area-level.
    location: {
      approxLatitude: 38.7176,
      approxLongitude: -9.1503,
      preciseLatitude: 38.7169,
      preciseLongitude: -9.1487,
      addressLine: "Rua da Escola Politécnica 42, 1250-102 Lisboa",
      precision: "exact",
    },
  },
  {
    slug: "arroios-room-share",
    type: "room",
    typeColor: "rgba(var(--jade-rgb),.1)",
    typeText: "var(--jade)",
    tint: "jade",
    title: "Room in shared flat, Arroios, long-term",
    hood: "Arroios",
    beds: "1 room",
    avail: "Now",
    description:
      "Quiet three-bed flat shared with two queer women. Big room, own bathroom, good wifi. Looking for someone who keeps to themselves but is up for the occasional dinner.",
    price: "€750",
    period: "month",
    image:
      "https://images.unsplash.com/photo-1543709525-e8764409abff?q=80&w=800&auto=format&fit=crop",
    poster: {
      initials: MEMBERS.carla!.initials,
      name: "Carla N.",
      fullName: memberName("carla"),
      tint: "coral",
      memberSince: "Member since 2022",
      responseTime: "within a day",
      bio: "Product manager, lives in Arroios with one flatmate. Looking for a third for the long term.",
    },
    gallery: [
      "The room",
      "Ensuite bathroom",
      "Shared kitchen",
      "Arroios street",
    ],
    longDesc: [
      "The big room in our quiet three-bed in Arroios is opening up. Our flatmate is moving in with their partner. It has its own bathroom, a double bed, a desk, and good morning light. We're two queer women in our early thirties, both work normal hours.",
      "We're after someone for the long term who keeps mostly to themselves but is up for the occasional shared dinner. No party house, no drama: just a calm, kind home. References both ways.",
    ],
    features: [
      "Ensuite bathroom",
      "Double bed",
      "Desk",
      "Fast wifi",
      "Shared kitchen",
      "Long-term",
    ],
    facts: [
      { label: "Price", value: "€750 / month" },
      { label: "Deposit", value: "One month" },
      { label: "Minimum stay", value: "12 months" },
      { label: "Furnished", value: "Yes" },
      { label: "Bills", value: "~€40/month, split" },
      { label: "Flatmates", value: "Two queer women, early 30s" },
      { label: "Pets", value: "No (allergies)" },
      { label: "Available from", value: "Now" },
    ],
    idealFor: [
      "Someone settling in Lisbon for the long term",
      "A quiet, considerate flatmate who still wants community",
      "People who work regular hours and value a calm home",
    ],
    accessibilityInfo:
      "Second floor with a lift. Bathroom doorway is narrow. Ask us for measurements.",
    billsIncluded: false,
    bedrooms: 1,
    location: areaLocation("Arroios"),
  },
  {
    slug: "graca-studio-shortterm",
    type: "short",
    typeColor: "rgba(var(--plum-rgb),.08)",
    typeText: "var(--plum)",
    tint: "plum",
    title: "Studio in Graça, 2 weeks minimum",
    hood: "São Vicente",
    beds: "Studio",
    avail: "15 Jun",
    description:
      "Small but well-designed studio in a converted building in Graça. Perfect for someone newly arrived or between places. The building has a rooftop with views.",
    price: "€85",
    period: "night",
    image:
      "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?q=80&w=800&auto=format&fit=crop",
    poster: {
      initials: MEMBERS.beatriz!.initials,
      name: "Beatriz P.",
      fullName: memberName("beatriz"),
      tint: "plum",
      memberSince: "Member since 2021",
      responseTime: "within a few hours",
      bio: "Ceramicist in Graça. Keeps this studio as a soft-landing space for people arriving in the city.",
    },
    gallery: [
      "Studio interior",
      "Kitchenette",
      "Building rooftop",
      "Graça lookout",
    ],
    longDesc: [
      "A small but genuinely well-designed studio in a converted building near the Graça miradouro. Everything you need and nothing you don't: a proper bed, a compact kitchenette, a good shower, and a desk by the window.",
      "I keep it as a short-stay landing pad, perfect for someone newly arrived in Lisbon or between places. Two weeks minimum. The building has a shared rooftop with one of the best views in the neighbourhood.",
    ],
    features: [
      "Well-designed",
      "Kitchenette",
      "Rooftop access",
      "Wifi",
      "Central Graça",
      "Self-check-in",
    ],
    facts: [
      { label: "Price", value: "€85 / night" },
      { label: "Deposit", value: "€150, refundable" },
      { label: "Minimum stay", value: "2 weeks" },
      { label: "Furnished", value: "Yes" },
      { label: "Bills", value: "Included" },
      { label: "Flatmates", value: "None, private studio" },
      { label: "Pets", value: "No" },
      { label: "Available from", value: "15 June" },
    ],
    idealFor: [
      "Someone newly arrived who needs a soft landing",
      "People between flats who want a calm base",
      "Short stays where having your own space matters",
    ],
    accessibilityInfo:
      "Ground floor, step-free entrance. Wet-room shower, no bath. Rooftop is up two flights.",
    billsIncluded: true,
    bedrooms: 0,
    listerKind: "agent",
    location: areaLocation("São Vicente"),
  },
  {
    slug: "marvila-warehouse-room",
    type: "room",
    typeColor: "rgba(var(--jade-rgb),.1)",
    typeText: "var(--jade)",
    tint: "jade",
    title: "Room in Marvila warehouse flat, creative people",
    hood: "Marvila",
    beds: "1 room",
    avail: "1 Jul",
    description:
      "Large warehouse converted to four bedrooms. Three of us currently live here: a musician, an engineer, and a photographer. Looking for a fourth.",
    price: "€800",
    period: "month",
    image:
      "https://images.unsplash.com/photo-1587842044997-8b6714110fa6?q=80&w=800&auto=format&fit=crop",
    poster: {
      initials: MEMBERS.diogo!.initials,
      name: "Diogo V.",
      fullName: memberName("diogo"),
      tint: "jade",
      memberSince: "Member since 2022",
      responseTime: "within a day",
      bio: "Music producer in a Marvila warehouse share. Runs Bairro Alto Studio. Looking for a fourth housemate.",
    },
    gallery: [
      "The room",
      "Communal space",
      "Warehouse kitchen",
      "Marvila exterior",
    ],
    longDesc: [
      "Our converted warehouse in Marvila has a room opening up. It's big: high ceilings, huge windows, room for a studio setup if you have one. The communal space is the heart of the place: a long table, a proper sound system, and a lot of plants.",
      "Three of us live here now: a musician, an engineer, and a photographer. We're sociable but not chaotic; people do their own thing and come together for the occasional dinner or studio night. Looking for a creative fourth who'll add to that.",
    ],
    features: [
      "High ceilings",
      "Huge windows",
      "Studio space",
      "Sound system",
      "Big communal area",
      "Bike storage",
    ],
    facts: [
      { label: "Price", value: "€800 / month" },
      { label: "Deposit", value: "One month" },
      { label: "Minimum stay", value: "6 months" },
      { label: "Furnished", value: "Room unfurnished" },
      { label: "Bills", value: "~€50/month, split four ways" },
      { label: "Flatmates", value: "Three creatives, late 20s–30s" },
      { label: "Pets", value: "Negotiable" },
      { label: "Available from", value: "1 July" },
    ],
    idealFor: [
      "A creative who wants space to make things",
      "Someone sociable but self-sufficient",
      "People who would use a shared sound system more than complain about it",
    ],
    accessibilityInfo:
      "Warehouse conversion, all on one level. Wide doorways; step at the main entrance.",
    billsIncluded: false,
    bedrooms: 1,
    location: areaLocation("Marvila"),
  },
  {
    slug: "cais-do-sodre-full-flat",
    type: "studio",
    typeColor: "rgba(var(--violet-rgb),.1)",
    typeText: "var(--violet)",
    tint: "plum",
    title: "Full flat in Cais do Sodré, 3 months",
    hood: "Misericórdia",
    beds: "1 bed",
    avail: "Aug",
    description:
      "My own flat while I go on residency. One bed, good light, close to everything. Priority to LGBTQ+ tenants. References exchanged.",
    price: "€1,350",
    period: "month",
    image:
      "https://images.unsplash.com/photo-1587842060723-d99f4f34ff83?q=80&w=800&auto=format&fit=crop",
    poster: {
      initials: MEMBERS.sofia!.initials,
      name: "Sofia A.",
      fullName: memberName("sofia"),
      tint: "jade",
      memberSince: "Member since 2021",
      responseTime: "within a day",
      bio: "Documentary filmmaker. Subletting her own flat for three months during a residency abroad.",
    },
    gallery: ["Living room", "Bedroom", "Kitchen", "Cais do Sodré at night"],
    longDesc: [
      "My one-bed in Cais do Sodré is free for three months while I'm away on a residency. It's a real home to live in, full of books, good light, a proper kitchen, and everything where it should be. Central enough to walk most places, quiet enough to sleep.",
      "I want it lived in and looked after by someone from the community. Priority to LGBTQ+ tenants. References exchanged both ways, and a relaxed handover before I leave.",
    ],
    features: [
      "Whole flat",
      "Lots of books",
      "Great light",
      "Proper kitchen",
      "Very central",
      "Quiet bedroom",
    ],
    facts: [
      { label: "Price", value: "€1,350 / month" },
      { label: "Deposit", value: "One month" },
      { label: "Minimum stay", value: "3 months" },
      { label: "Furnished", value: "Yes, fully" },
      { label: "Bills", value: "Included up to €70" },
      { label: "Flatmates", value: "None, whole flat" },
      { label: "Pets", value: "No" },
      { label: "Available from", value: "August" },
    ],
    idealFor: [
      "Someone who wants a real home to settle into",
      "LGBTQ+ tenants (priority)",
      "People who treat books and plants as housemates",
    ],
    accessibilityInfo:
      "Third floor with a small lift (fits one person). Step-free once you're on the floor.",
    billsIncluded: true,
    bedrooms: 1,
    location: areaLocation("Misericórdia"),
  },
  {
    slug: "mouraria-two-bed",
    type: "sublet",
    typeColor: "rgba(var(--accent-rgb),.1)",
    typeText: "var(--accent-ink)",
    tint: "coral",
    title: "Two-bedroom in Mouraria, June & July",
    hood: "Santa Maria Maior",
    beds: "2 beds",
    avail: "1 Jun",
    description:
      "Traditional building, recently renovated. Two bedrooms, could work for a couple or two friends. Very central, heart of Mouraria.",
    price: "€950",
    period: "month",
    image:
      "https://images.unsplash.com/photo-1605086554166-da2bd45804da?q=80&w=800&auto=format&fit=crop",
    poster: {
      initials: MEMBERS.tomas!.initials,
      name: "Tomás B.",
      fullName: memberName("tomas"),
      tint: "coral",
      memberSince: "Member since 2022",
      responseTime: "within a few hours",
      bio: "Chef and supper-club host in Mouraria. Subletting the family flat for the summer.",
    },
    gallery: [
      "Living area",
      "Main bedroom",
      "Second bedroom",
      "Mouraria alley",
    ],
    longDesc: [
      "A two-bedroom in a traditional Mouraria building, recently renovated but with the soul kept intact: tiled hallway, tall windows, a tiny balcony over the alley. Two real bedrooms, so it works for a couple or two friends sharing.",
      "It's the family flat and I'm subletting it for June and July while we're away. Heart of Mouraria, so you're steps from everything, including the best pastéis in the neighbourhood. I'll point you to all of it.",
    ],
    features: [
      "Two bedrooms",
      "Recently renovated",
      "Balcony",
      "Tiled hallway",
      "Very central",
      "Furnished",
    ],
    facts: [
      { label: "Price", value: "€950 / month" },
      { label: "Deposit", value: "One month" },
      { label: "Minimum stay", value: "2 months (Jun–Jul)" },
      { label: "Furnished", value: "Yes" },
      { label: "Bills", value: "Included up to €50" },
      { label: "Flatmates", value: "None, whole flat" },
      { label: "Pets", value: "Small pets okay" },
      { label: "Available from", value: "1 June" },
    ],
    idealFor: [
      "A couple or two friends sharing for the summer",
      "Anyone who wants to be in the heart of Mouraria",
      "People who want a local to point them to the good stuff",
    ],
    accessibilityInfo:
      "Traditional building, no lift: two flights up. Not step-free; narrow tiled hallway.",
    billsIncluded: true,
    bedrooms: 2,
    location: areaLocation("Santa Maria Maior"),
  },
];

export function getListing(
  slug: string | undefined,
): HousingListing | undefined {
  return slug ? HOUSING_LISTINGS.find((l) => l.slug === slug) : undefined;
}
