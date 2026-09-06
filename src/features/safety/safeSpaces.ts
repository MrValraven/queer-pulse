import { memberName } from "../members/data/members";

export type Category = "Bar" | "Club" | "Cafe" | "Health" | "Services" | "Arts";
export type Tint = "coral" | "jade" | "plum";

export interface Vouch {
  initials: string;
  name: string;
  tint: Tint;
  byline: string;
  text: string;
  when: string;
}
export interface Promise {
  title: string;
  desc: string;
}
export interface GlanceRow {
  label: string;
  value: string;
  accent?: boolean;
}

export interface VerifiedSpace {
  status: "verified";
  slug: string;
  category: Category;
  typeLabel: string;
  name: string;
  neighbourhood: string;
  description: string;
  tags: string[];
  rating: string;
  reviews: string;
  /* detail */
  eyebrow: string;
  sub: string;
  metaPills: { label: string; accent?: boolean }[];
  /** Trust tier as a number; the label is composed at render so it localizes. */
  tier: number;
  /**
   * True while an open review stands against this badge. `status` stays
   * `"verified"` (it is the discriminant against a REMOVED space, and a
   * suspended space is not a removed one), so this is the only field that says
   * whether the badge currently speaks. Never carries a flag count or names
   * anyone. Optional: the demo fixtures below are all unsuspended.
   */
  isBadgeSuspended?: boolean;
  /** The badge still stands and is past its yearly check. Not a suspension. */
  isBadgeDueForReReview?: boolean;
  reVerified: string;
  verifier: string;
  promises: Promise[];
  vouches: Vouch[];
  glance: GlanceRow[];
  address: string;
}

export interface RemovedSpace {
  status: "removed";
  slug: string;
  category: Category;
  typeLabel: string;
  name: string;
  neighbourhood: string;
  /** Short headline reason shown on cards. */
  reason: string;
  removedDate: string;
  listedSince: string;
  flags: number;
  /** Full explanation. */
  reasonLong: string[];
  timeline: { date: string; event: string }[];
  whatNow: string;
}

const J: Tint = "jade";
const C: Tint = "coral";
const P: Tint = "plum";

export const VERIFIED_SPACES: VerifiedSpace[] = [
  {
    status: "verified",
    slug: "purex",
    category: "Bar",
    typeLabel: "Bar",
    name: "Purex",
    neighbourhood: "Intendente",
    description:
      "One of Lisbon's longest-running queer bars. Genuinely inclusive, with no single type of person dominating the scene. Staff are known to be directly supportive if anything goes wrong. Gender-neutral bathrooms, accessible entrance.",
    tags: ["Gender-neutral bathrooms", "Accessible", "Trans-welcoming"],
    rating: "4.9",
    reviews: "54 reviews",
    eyebrow: "Bar · Intendente · Lisbon",
    sub: "A long-running queer bar that never let one crowd take it over. Mixed, easy, and staffed by people who step in before you have to ask.",
    metaPills: [
      { label: "Open late, Wed–Sun" },
      { label: "Gender-neutral bathrooms", accent: true },
      { label: "Step-free entrance", accent: true },
    ],
    tier: 1,
    reVerified: "2 May 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "Staff intervene, every time.",
        desc: "Bar staff are briefed to step in on harassment without waiting to be asked. They will remove a customer before they remove you.",
      },
      {
        title: "Gender-neutral, single-stall bathrooms.",
        desc: "No gendered doors, no queue politics, locks that work. Cleaned through the night.",
      },
      {
        title: "Quick exit on request.",
        desc: "Ask any bartender for the side door to Rua dos Anjos. They will walk you out and call you a taxi.",
      },
      {
        title: "Incidents reported to moderation within 48h.",
        desc: "Anything that happens here reaches the QueerPulse moderation team within two days.",
      },
    ],
    vouches: [
      {
        initials: "KL",
        name: memberName("kai"),
        tint: J,
        byline: "Member 2 years · vouched 4×",
        text: "A guy started filming people on the dancefloor. I pointed him out to the bar and he was gone in ninety seconds, no drama, no making me explain. That's the whole point of this place.",
        when: "Vouched 18 Apr 2026",
      },
      {
        initials: "RV",
        name: memberName("rita"),
        tint: C,
        byline: "Regular",
        text: "It's the one bar I'll go to alone and still feel held. The bathrooms are genuinely fine and the staff clock when someone's not okay.",
        when: "Vouched 2 Mar 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Bar · Wed–Sun" },
      { label: "Open today", value: "21:00 to 03:00", accent: true },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Yes" },
      { label: "Bathroom", value: "Gender-neutral" },
      { label: "Last verified", value: "2 May 2026" },
    ],
    address: "R. de São Lázaro 11 · Intendente",
  },
  {
    status: "verified",
    slug: "trumps",
    category: "Bar",
    typeLabel: "Bar",
    name: "Trumps",
    neighbourhood: "Rato",
    description:
      "Old-school Lisbon gay bar with a loyal community. Welcoming to lesbians, bi, and non-binary people as much as gay men. Drag nights on Fridays. Some accessibility limitations (stairs to main bar).",
    tags: ["Drag nights", "Long-standing", "Stairs noted"],
    rating: "4.7",
    reviews: "38 reviews",
    eyebrow: "Bar · Rato · Lisbon",
    sub: "A Lisbon institution that grew up well: once a gay-men's bar, now a home for the whole community. Friday drag is legendary; the stairs are real.",
    metaPills: [
      { label: "Drag Fridays" },
      { label: "Stairs to main bar", accent: true },
    ],
    tier: 2,
    reVerified: "11 Apr 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "Welcoming beyond gay men.",
        desc: "Lesbian, bi, trans and non-binary people are explicitly welcome. Staff and regulars set that tone.",
      },
      {
        title: "Door staff trained on harassment.",
        desc: "Security will act on a complaint and bar a repeat offender.",
      },
      {
        title: "Access limits stated plainly.",
        desc: "Stairs down to the main bar; no lift. Step-free street-level area available. Ask at the door.",
      },
      {
        title: "Incidents reported to moderation within 48h.",
        desc: "The management has a direct line to QueerPulse moderation.",
      },
    ],
    vouches: [
      {
        initials: "NA",
        name: memberName("nuno"),
        tint: P,
        byline: "Member 3 years",
        text: "I'm bi and married to a woman and I've never once felt like the odd one out here. The Friday queens look after newcomers.",
        when: "Vouched 9 Mar 2026",
      },
      {
        initials: "SC",
        name: memberName("sofia-castano"),
        tint: C,
        byline: "Regular",
        text: "Docked nothing for safety. Only flagged the stairs so wheelchair-using friends know in advance. Staff carried my friend's chair without being asked.",
        when: "Vouched 21 Feb 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Bar · Tue–Sun" },
      { label: "Open today", value: "22:00 to 04:00", accent: true },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Partial (stairs to main bar)" },
      { label: "Bathroom", value: "Gendered + one neutral" },
      { label: "Last verified", value: "11 Apr 2026" },
    ],
    address: "R. da Imprensa Nacional 104B · Rato",
  },
  {
    status: "verified",
    slug: "lux-fragil",
    category: "Club",
    typeLabel: "Club",
    name: "Lux Frágil",
    neighbourhood: "Santa Apolónia",
    description:
      "Lisbon's most celebrated club has a consistent track record with the queer community. Multiple floors, good lighting in bathrooms, security staff who take complaints seriously. Queer nights occur regularly. Check their calendar.",
    tags: ["Queer nights", "Reviewed security", "Multiple floors"],
    rating: "4.6",
    reviews: "47 reviews",
    eyebrow: "Club · Santa Apolónia · Lisbon",
    sub: "The big one, and a careful one. Security here actually takes complaints seriously, the bathrooms are lit, and queer nights are a core part of the programming.",
    metaPills: [
      { label: "Regular queer nights" },
      { label: "Trained security", accent: true },
      { label: "Multiple floors" },
    ],
    tier: 1,
    reVerified: "28 Mar 2026",
    verifier: "Mod team · 3 visits",
    promises: [
      {
        title: "Security take complaints seriously.",
        desc: "Report someone to any staff member and it is acted on. We tested this twice during verification.",
      },
      {
        title: "Well-lit bathrooms, monitored.",
        desc: "Good lighting and regular staff sweeps, which makes a real difference in a club this size.",
      },
      {
        title: "A quiet floor to step away.",
        desc: "The upstairs bar is calmer and staffed, a place to land if a night gets too much.",
      },
      {
        title: "Incidents reported to moderation within 48h.",
        desc: "Management shares incident reports with QueerPulse moderation.",
      },
    ],
    vouches: [
      {
        initials: "KL",
        name: memberName("kai"),
        tint: J,
        byline: "Member 2 years",
        text: "Reported a creep on the main floor at 3am expecting nothing. A staff member walked me to find him and handled it. In a club this famous, that's not nothing.",
        when: "Vouched 14 Mar 2026",
      },
      {
        initials: "AK",
        name: memberName("anika"),
        tint: C,
        byline: "Member 4 years",
        text: "The lit bathrooms sound like a small thing until you've needed them. Felt safe here at every queer night I've been to.",
        when: "Vouched 1 Mar 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Club · Thu–Sat" },
      { label: "Open today", value: "23:59 to 06:00", accent: true },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Yes (lift to all floors)" },
      { label: "Bathroom", value: "Gendered, well-lit" },
      { label: "Last verified", value: "28 Mar 2026" },
    ],
    address: "Av. Infante Dom Henrique, Armazém A · Santa Apolónia",
  },
  {
    status: "verified",
    slug: "linha-dagua",
    category: "Cafe",
    typeLabel: "Café",
    name: "Linha d'Água",
    neighbourhood: "Príncipe Real",
    description:
      "A calm, queer-owned café. Good for laptop work or a quiet coffee. Community notice board on the wall. Staff know many regulars by name. Fully accessible. One of the few alcohol-free-friendly options in the neighbourhood.",
    tags: ["Queer-owned", "Sober-friendly", "Accessible", "Community board"],
    rating: "4.9",
    reviews: "29 reviews",
    eyebrow: "Café · Príncipe Real · Lisbon",
    sub: "A queer-owned, sober-friendly café built for the long stay: laptop mornings, quiet first dates, a community board that actually gets read. Fully step-free.",
    metaPills: [
      { label: "Queer-owned" },
      { label: "Sober-friendly", accent: true },
      { label: "Fully accessible", accent: true },
    ],
    tier: 1,
    reVerified: "6 May 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "Names & pronouns honoured.",
        desc: "Show your QueerPulse card and staff use that name on your cup. Legal name never asked.",
      },
      {
        title: "A safe table to wait at.",
        desc: "Meeting a stranger from a date or a sale? Tell staff. They keep an eye and will intervene if it goes wrong.",
      },
      {
        title: "Fully step-free + accessible bathroom.",
        desc: "Level entrance, wide aisles, a genuine accessible single-stall bathroom.",
      },
      {
        title: "Sober by default.",
        desc: "No alcohol, no pressure: a rare quiet option in a nightlife neighbourhood.",
      },
    ],
    vouches: [
      {
        initials: "JF",
        name: memberName("jonas"),
        tint: J,
        byline: "Member 3 years",
        text: "I run my recovery meet-ups out of the corner here. Staff hold the table, keep it sober, never make it weird. Quietly one of the safest rooms in the city.",
        when: "Vouched 28 Apr 2026",
      },
      {
        initials: "RV",
        name: memberName("rita"),
        tint: C,
        byline: "Regular",
        text: "Did all my scary first dates here on purpose. The staff clock it and hover just enough. Cup always says Rita, never the other name.",
        when: "Vouched 12 Apr 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Café · 7 days" },
      { label: "Open today", value: "08:00 to 19:00", accent: true },
      { label: "Languages", value: "PT · EN · ES" },
      { label: "Step-free", value: "Yes (level entrance)" },
      { label: "Bathroom", value: "Accessible, gender-neutral" },
      { label: "Last verified", value: "6 May 2026" },
    ],
    address: "R. da Escola Politécnica 56 · Príncipe Real",
  },
  {
    status: "verified",
    slug: "checkpointlx",
    category: "Health",
    typeLabel: "Healthcare",
    name: "CheckpointLx",
    neighbourhood: "Intendente",
    description:
      "Community-run sexual health service. Staff are experienced with queer and trans clients. No judgment, no assumptions about bodies or practices. Free and anonymous. See the sexual health page for full details.",
    tags: ["Trans-experienced staff", "Free", "Anonymous"],
    rating: "4.9",
    reviews: "84 reviews",
    eyebrow: "Healthcare · Intendente · Lisbon",
    sub: "Community-run sexual health, free and anonymous, staffed by people who have heard it all and judge none of it. No assumptions about your body or your life.",
    metaPills: [
      { label: "Free & anonymous", accent: true },
      { label: "Trans-experienced staff", accent: true },
      { label: "Walk-in & booking" },
    ],
    tier: 1,
    reVerified: "19 May 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "No assumptions about bodies or practices.",
        desc: "Intake is designed by and for queer people. You are asked only what is relevant.",
      },
      {
        title: "Free and genuinely anonymous.",
        desc: "No ID required, no name on file unless you want one. Results given the way you choose.",
      },
      {
        title: "Trans-experienced clinicians.",
        desc: "Staff are trained in trans health and will not make your appointment about your gender.",
      },
      {
        title: "Warm hand-off to further care.",
        desc: "If you need more, they personally connect you to vetted, affirming services.",
      },
    ],
    vouches: [
      {
        initials: "AK",
        name: memberName("anika"),
        tint: C,
        byline: "Member 4 years",
        text: "First place I ever got tested where nobody flinched, nobody assumed, nobody used the wrong word. Free, fast, kind. I send everyone here.",
        when: "Vouched 3 May 2026",
      },
      {
        initials: "KL",
        name: memberName("kai"),
        tint: J,
        byline: "Member 2 years",
        text: "They handed me the intake form already gender-neutral. Small thing, enormous relief. Safest clinic experience of my life.",
        when: "Vouched 20 Apr 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Sexual health · free" },
      { label: "Open today", value: "17:00 to 21:00", accent: true },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Yes" },
      { label: "Cost", value: "Free · anonymous" },
      { label: "Last verified", value: "19 May 2026" },
    ],
    address: "R. de São Lázaro 88 · Intendente",
  },
  {
    status: "verified",
    slug: "barbearia-mouraria",
    category: "Services",
    typeLabel: "Services",
    name: "Barbearia Mouraria",
    neighbourhood: "Mouraria",
    description:
      "A barbershop with community roots. Explicitly welcoming to trans and non-binary people. Staff are experienced with all hair types and won't make your visit about your identity. No gendered pricing.",
    tags: ["Trans-welcoming", "No gendered pricing", "Walk-in welcome"],
    rating: "4.8",
    reviews: "22 reviews",
    eyebrow: "Barbershop · Mouraria · Lisbon",
    sub: "A neighbourhood barbershop that quietly does the thing so many fumble: the cut you ask for, no interrogation, no gendered price list, no flinch.",
    metaPills: [
      { label: "No gendered pricing", accent: true },
      { label: "Walk-in welcome" },
      { label: "Trans-experienced", accent: true },
    ],
    tier: 2,
    reVerified: "24 Apr 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "The cut you ask for, full stop.",
        desc: 'No "are you sure", no negotiation. Barbers are experienced across all hair types and textures.',
      },
      {
        title: "No gendered pricing.",
        desc: "Price is by service, the same whatever your gender or hair length.",
      },
      {
        title: "Your visit is not about your identity.",
        desc: "Staff will not make small talk into an interrogation. You are simply a client here.",
      },
      {
        title: "A held first chop.",
        desc: "Doing something big? Say so. They will go slow and check in.",
      },
    ],
    vouches: [
      {
        initials: "KL",
        name: memberName("kai"),
        tint: J,
        byline: "Member 2 years",
        text: "Walked in terrified, asked for a cut I'd been too scared to ask for anywhere else. The barber just nodded and did it. I welled up in the chair.",
        when: "Vouched 16 Apr 2026",
      },
      {
        initials: "NA",
        name: memberName("nuno"),
        tint: P,
        byline: "Regular",
        text: "Same price as anywhere, none of the awkwardness, twice the skill. Genuinely safe: never once misgendered, never once a weird question.",
        when: "Vouched 30 Mar 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Barbershop" },
      { label: "Open today", value: "10:00 to 19:00", accent: true },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Yes (ground floor)" },
      { label: "Pricing", value: "By service, gender-neutral" },
      { label: "Last verified", value: "24 Apr 2026" },
    ],
    address: "R. dos Cavaleiros 40 · Mouraria",
  },
  {
    status: "verified",
    slug: "zdb",
    category: "Arts",
    typeLabel: "Arts",
    name: "ZDB (Zé dos Bois)",
    neighbourhood: "Bairro Alto",
    description:
      "Arts venue with a long history of hosting queer artists and events. Programming is consistently intersectional. Welcomes community events, hosts several regular queer club nights, and has always been a safe space for queerness in Lisbon.",
    tags: ["Queer programming", "Community events", "Accessible"],
    rating: "4.8",
    reviews: "41 reviews",
    eyebrow: "Arts venue · Bairro Alto · Lisbon",
    sub: "Decades of putting queer artists on the main stage rather than the after-hours slot. Intersectional by instinct, and a reliable safe room since long before there were badges.",
    metaPills: [
      { label: "Queer programming" },
      { label: "Hosts community events", accent: true },
      { label: "Step-free main hall", accent: true },
    ],
    tier: 1,
    reVerified: "15 Apr 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "Queer events are core to the calendar.",
        desc: "Programming is intersectional on purpose and queer nights are part of the main calendar.",
      },
      {
        title: "Staff trained to hold a room.",
        desc: "Front-of-house will step in on harassment and knows the difference between edgy art and an unsafe crowd.",
      },
      {
        title: "Free space for community events.",
        desc: "They lend the room to community organisers. Several QueerPulse events have run here.",
      },
      {
        title: "Incidents reported to moderation within 48h.",
        desc: "The venue keeps an open channel with QueerPulse moderation.",
      },
    ],
    vouches: [
      {
        initials: "LG",
        name: memberName("luisa"),
        tint: P,
        byline: "Curator · vouched 3×",
        text: "I've put on queer shows here for years. They protect the work and the audience equally. When a crowd got hostile once, staff shut down the hostility and stood by the artist.",
        when: "Vouched 8 Apr 2026",
      },
      {
        initials: "RV",
        name: memberName("rita"),
        tint: C,
        byline: "Member 2 years",
        text: "The one venue where I've never had to brace at the door. Old, scrappy, and completely ours.",
        when: "Vouched 25 Mar 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Arts venue" },
      {
        label: "Open today",
        value: "Event nights · check listings",
        accent: true,
      },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Main hall yes; upper floor no" },
      { label: "Bathroom", value: "Gender-neutral" },
      { label: "Last verified", value: "15 Apr 2026" },
    ],
    address: "R. da Barroca 59 · Bairro Alto",
  },
  {
    status: "verified",
    slug: "copenhagen-coffee-lab",
    category: "Cafe",
    typeLabel: "Café",
    name: "Copenhagen Coffee Lab",
    neighbourhood: "Cais do Sodré",
    description:
      "Queer-staffed, relaxed, and consistently respectful. Gender-neutral bathroom. A go-to for community members who want somewhere quiet and welcoming for a first date or a meeting. No alcohol, sober-friendly.",
    tags: ["Sober-friendly", "Queer staff", "Gender-neutral bathroom"],
    rating: "4.7",
    reviews: "18 reviews",
    eyebrow: "Café · Cais do Sodré · Lisbon",
    sub: "Calm, queer-staffed, and reliably respectful: the go-to for a low-stakes first date or a daytime meeting in a loud part of town. Sober by default.",
    metaPills: [
      { label: "Queer-staffed" },
      { label: "Sober-friendly", accent: true },
      { label: "Gender-neutral bathroom", accent: true },
    ],
    tier: 2,
    reVerified: "9 May 2026",
    verifier: "Mod team · 2 visits",
    promises: [
      {
        title: "Respect as standard.",
        desc: "Queer staff, correct names, zero second glances. The baseline a lot of cafés still miss.",
      },
      {
        title: "Gender-neutral bathroom.",
        desc: "Single-stall, no gendered door, clean.",
      },
      {
        title: "A calm room for a hard meeting.",
        desc: "Quiet enough for a first date or a difficult conversation; staff keep an eye if asked.",
      },
      {
        title: "Sober-friendly.",
        desc: "No alcohol and no pressure: easy to suggest to anyone who needs that.",
      },
    ],
    vouches: [
      {
        initials: "SC",
        name: memberName("sofia-castano"),
        tint: C,
        byline: "Member 2 years",
        text: 'My default "meet a stranger safely in daylight" spot. Staff are queer, kind, and quietly attentive. Never had a bad moment here.',
        when: "Vouched 2 May 2026",
      },
      {
        initials: "JF",
        name: memberName("jonas"),
        tint: J,
        byline: "Regular",
        text: "Sober and central is a rare combination near Cais do Sodré. This is the one I trust.",
        when: "Vouched 14 Apr 2026",
      },
    ],
    glance: [
      { label: "Type", value: "Café · 7 days" },
      { label: "Open today", value: "08:00 to 18:00", accent: true },
      { label: "Languages", value: "PT · EN" },
      { label: "Step-free", value: "Yes" },
      { label: "Bathroom", value: "Gender-neutral" },
      { label: "Last verified", value: "9 May 2026" },
    ],
    address: "R. Nova da Piedade 10 · Cais do Sodré",
  },
];

export const REMOVED_SPACES: RemovedSpace[] = [
  {
    status: "removed",
    slug: "bar-atlas",
    category: "Bar",
    typeLabel: "Bar",
    name: "Bar Atlas",
    neighbourhood: "Santos",
    reason:
      "Door staff refused entry to a trans member, then management defended it.",
    removedDate: "8 May 2026",
    listedSince: "March 2024",
    flags: 5,
    reasonLong: [
      'In April 2026 a verified member was refused entry after a doorman challenged whether the photo on their ID "matched". A second member witnessed it. Both filed reports the same night.',
      "What moved this from a flag to a removal was the response. When moderators raised it, the owner defended the doorman and declined to retrain the door team or apologise. A verified space can survive a bad night; it cannot survive management that stands behind one.",
    ],
    timeline: [
      {
        date: "18 Apr 2026",
        event: "First incident reported by two members independently.",
      },
      {
        date: "19 Apr 2026",
        event: "Badge suspended pending review (3-flag threshold passed).",
      },
      {
        date: "2 May 2026",
        event:
          "Moderators met the owner; no commitment to retrain or apologise.",
      },
      {
        date: "8 May 2026",
        event: "Listing permanently removed. Owner notified in writing.",
      },
    ],
    whatNow:
      "Bar Atlas is no longer a verified safe space and the venue may not display the badge. If you have a recent experience here, good or bad, you can still file a report; the record stays open in case the venue applies to be re-reviewed in future, which requires demonstrable change.",
  },
  {
    status: "removed",
    slug: "clube-vertigo",
    category: "Club",
    typeLabel: "Club",
    name: "Clube Vértigo",
    neighbourhood: "Cais do Sodré",
    reason: "A pattern of selective, racialised door policy at queer nights.",
    removedDate: "21 Mar 2026",
    listedSince: "June 2023",
    flags: 7,
    reasonLong: [
      "Over three months, seven members, most of them queer people of colour, reported being turned away or held at the door of Clube Vértigo on nights it advertised as queer-friendly, while others walked straight in.",
      "The Queer & of Colour community raised it collectively. The pattern was consistent enough, and the venue's explanation thin enough, that the panel removed the listing. Safety that is conditional on how you look is not safety.",
    ],
    timeline: [
      {
        date: "6 Jan 2026",
        event: "First of seven reports logged over the quarter.",
      },
      {
        date: "24 Feb 2026",
        event:
          "Badge suspended after collective flag from the Queer & of Colour community.",
      },
      {
        date: "12 Mar 2026",
        event:
          "Review panel reviewed all seven reports and the venue response.",
      },
      { date: "21 Mar 2026", event: "Listing permanently removed." },
    ],
    whatNow:
      "Clube Vértigo is delisted. We shared an anonymised summary of the reports with the venue. Re-review would require a published, audited door policy and a clean record over a full season. They have not applied.",
  },
  {
    status: "removed",
    slug: "cafe-norte",
    category: "Cafe",
    typeLabel: "Café",
    name: "Café Norte",
    neighbourhood: "Saldanha",
    reason: "New owners; repeated misgendering and no response to three flags.",
    removedDate: "2 Feb 2026",
    listedSince: "September 2022",
    flags: 3,
    reasonLong: [
      "Café Norte changed hands in late 2025. The original owners had earned the badge; the new ones inherited it, and our rule that new ownership triggers an early re-review existed for exactly this.",
      "Three members reported repeated, careless misgendering and a generally colder room. We reached out twice to offer the free staff training every listed venue gets. Both messages went unanswered. Without engagement, the listing could not stand.",
    ],
    timeline: [
      {
        date: "Nov 2025",
        event:
          "Ownership change flagged; early re-review opened automatically.",
      },
      {
        date: "Dec 2025",
        event: "Three member reports of repeated misgendering.",
      },
      {
        date: "Jan 2026",
        event: "Two offers of free staff training sent; no response.",
      },
      {
        date: "2 Feb 2026",
        event: "Listing removed pending engagement from new ownership.",
      },
    ],
    whatNow:
      "This is a soft removal that can be reversed, and it passes no verdict on individuals. If the new owners take up the training and a fresh round of visits meets the criteria, Café Norte can be re-listed. The door is open; they need to walk through it.",
  },
];

export type AnySpace =
  | { kind: "verified"; data: VerifiedSpace }
  | { kind: "removed"; data: RemovedSpace };

export function getSpace(slug: string | undefined): AnySpace | undefined {
  if (!slug) return undefined;
  const v = VERIFIED_SPACES.find((s) => s.slug === slug);
  if (v) return { kind: "verified", data: v };
  const r = REMOVED_SPACES.find((s) => s.slug === slug);
  if (r) return { kind: "removed", data: r };
  return undefined;
}

/**
 * Demo-mode stats for the safe-spaces directory header, derived from the mock
 * arrays the same way the live backend derives them from real rows. `reviews`
 * sums each verified space's review count out of its "N reviews" string.
 */
/**
 * The newest badge date in the demo registry, as the `YYYY-MM-DD` the live
 * `stats.lastReVerifiedAt` carries. Stated once here rather than parsed out of
 * the fixtures' `reVerified` strings, which are hand-written English display
 * text ("19 May 2026") and would need an English-only date parser to read.
 * Like every demo fixture it is deliberately dated into the past.
 */
const DEMO_LAST_RE_VERIFIED_AT = "2026-05-19";

export function demoStats(): {
  verified: number;
  reviews: number;
  removed: number;
  lastReVerifiedAt: string | null;
} {
  const reviews = VERIFIED_SPACES.reduce(
    (total, space) => total + (parseInt(space.reviews, 10) || 0),
    0,
  );
  return {
    verified: VERIFIED_SPACES.length,
    reviews,
    removed: REMOVED_SPACES.length,
    lastReVerifiedAt: DEMO_LAST_RE_VERIFIED_AT,
  };
}
