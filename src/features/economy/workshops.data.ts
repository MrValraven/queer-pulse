// Advanced, multi-week workshops surfaced on the Skills & learning page. Unlike
// the peer-to-peer skill offers, these are structured courses with a fixed
// cohort, a session-by-session plan, sliding-scale pricing and a booking flow.
// Members can also add their own via the "List a workshop" flow — new entries
// share this exact shape (see WorkshopsProvider + AddWorkshopModal).

import type { AvatarTint, ImageSlotTint } from "../../shared/components/ui";

/** One evening/afternoon of a workshop. */
export interface WorkshopSession {
  /** Session number, e.g. "01". Rendered with the last digit in coral italic. */
  n: string;
  title: string;
  description: string;
  date: string;
  length: string;
  /** Already happened — dimmed in the table. */
  done?: boolean;
}

/** A "what's included / what to bring" line. */
export interface WorkshopNeed {
  label: string;
  detail: string;
  /** Covered by the fee — rendered on a jade-tinted surface. */
  included?: boolean;
  /** Small uppercase tag, e.g. "included" or "your 50 copies". */
  tag?: string;
}

/** A rung on the sliding scale. */
export interface WorkshopTier {
  label: string;
  amount: string;
  /** Reduced/solidarity rates render in jade. */
  sliding?: boolean;
}

export interface WorkshopTutor {
  name: string;
  initials: string;
  tint: AvatarTint;
  role: string;
  /** Links to the member's profile when they're on the platform. */
  memberSlug?: string;
}

/**
 * The stored values behind the composed display strings.
 *
 * `format`, `price`, `priceSub` and `tiers[].amount` on `Workshop` are all
 * *rendered text* — translated and currency-formatted for whoever is looking —
 * so they can't be fed back into the edit form without re-parsing prose. This
 * mirrors `CreateWorkshopDto` field-for-field and is what `workshopToDraft`
 * reads, so editing a workshop round-trips exactly what listing it wrote.
 */
export interface WorkshopSource {
  weeks: number;
  size: number;
  price: number;
  /** ISO 4217, e.g. "EUR". */
  currency: string;
  venue: string;
}

export interface Workshop {
  id: string;
  /** Category — matches the SkillsPage filter values. */
  category: string;
  /** Headline, split so the second half renders in coral italic. */
  title: string;
  titleEm: string;
  /** One-line format summary, e.g. "Workshop · 6 weeks · group of 8". */
  format: string;
  /** "In-person" | "Online" | "Hybrid" — shown in jade in the eyebrow. */
  mode: string;
  /** Hero subtitle / card blurb. */
  blurb: string;
  heroPlaceholder: string;
  heroTint: ImageSlotTint;
  spotsFilled: number;
  spotsTotal: number;
  /** Headline price, e.g. "€180". */
  price: string;
  priceSub: string;
  startDate: string;
  cancellation: string;
  tiers: WorkshopTier[];
  /** "What you'll actually do" — one paragraph per entry. */
  about: string[];
  sessions: WorkshopSession[];
  needs: WorkshopNeed[];
  pastWork: string[];
  tutor: WorkshopTutor;
  location: { name: string; address: string; access: string };
  tags: string[];
  /** Member-added (via List a workshop) — badged as "New". */
  added?: boolean;
  /** The editable values behind the display strings — seeds the edit form. */
  source: WorkshopSource;
  /**
   * True when the viewer hosts this workshop. PATCH/DELETE are host-only on the
   * backend, so this decides whether the edit/delete controls render at all —
   * the UI should never offer an action that is going to 403. Mirrors
   * `JobDetailDTO.isPoster`.
   */
  isHost?: boolean;
}

export const WORKSHOPS: Workshop[] = [
  {
    id: "risograph-zine",
    category: "creative",
    title: "Risograph from",
    titleEm: "nothing to a zine.",
    format: "Workshop · 6 weeks · group of 8",
    mode: "In-person",
    blurb:
      "Six Tuesday evenings at Editora Anjos. Eight people. Every session you make something. By week six you've designed, separated, printed, bound, and given away your first risograph zine.",
    heroPlaceholder: "Risograph machine · in use",
    heroTint: "coral",
    spotsFilled: 5,
    spotsTotal: 8,
    price: "€180",
    priceSub: "six weeks · solidarity rate available",
    startDate: "Tue 24 Jun",
    cancellation: "Full refund · before 17 Jun",
    tiers: [
      { label: "Standard rate", amount: "€180" },
      { label: "Reduced", amount: "€120", sliding: true },
      { label: "Solidarity · 1 slot", amount: "€60", sliding: true },
    ],
    about: [
      "Six structured 3-hour sessions, every Tuesday from 19:00 to 22:00. Each session is one third lecture, two thirds hands on the machine. You leave each week with something physical: a print, a test sheet, eventually the bound zine.",
      "Group cap is eight people so that everyone gets real machine time. No watching over someone's shoulder. If you've never printed anything, you'll be fine. If you're an experienced designer who's just never done riso, you'll also be fine.",
    ],
    sessions: [
      {
        n: "01",
        title: "What riso is, what it isn't · first prints",
        description: "Tour, machine demo, your first single-colour print. You leave with five A4 sheets of your own.",
        date: "Tue 24 Jun",
        length: "3 hr",
      },
      {
        n: "02",
        title: "Colour separation · the riso way",
        description: "The unique way riso treats colour. You separate a 2-colour image and pull a 30-print edition by hand.",
        date: "Tue 1 Jul",
        length: "3 hr",
      },
      {
        n: "03",
        title: "Layout for risograph · what doesn't translate",
        description: "InDesign / Figma to riso. Half-tones, line weight, white space. You'll throw out your first attempt.",
        date: "Tue 8 Jul",
        length: "3 hr",
      },
      {
        n: "04",
        title: "Bringing your zine",
        description: "You arrive with your draft. We critique, edit, and you re-export. Print your first cover.",
        date: "Tue 15 Jul",
        length: "3 hr",
      },
      {
        n: "05",
        title: "Printing the run · 50 copies each",
        description: "The longest night. We split into two stations and pull editions in parallel. Bring snacks.",
        date: "Tue 22 Jul",
        length: "3 hr",
      },
      {
        n: "06",
        title: "Binding, trimming, distribution",
        description: "Saddle-stitch by hand, trim to size, the math of distribution. Closing party at Café Beirão.",
        date: "Tue 29 Jul",
        length: "3+ hr",
      },
    ],
    needs: [
      {
        label: "Riso time",
        detail: "Generous. ~6h on the machine over six weeks.",
        included: true,
        tag: "included",
      },
      {
        label: "Paper for prints",
        detail:
          "Bond paper for tests + a quality stock for your final edition.",
        included: true,
        tag: "included",
      },
      {
        label: "Ink & masters",
        detail: "Up to 3 colour separations across the workshop.",
        included: true,
        tag: "included",
      },
      {
        label: "The bound zine",
        detail:
          "50 saddle-stitched copies of your zine, yours to keep / sell / give.",
        included: true,
        tag: "your 50 copies",
      },
      {
        label: "A laptop",
        detail:
          "For laying out your zine. We use InDesign and Figma; either works.",
      },
      {
        label: "An idea",
        detail:
          "16–32 pages of something you want to make. Even a vague one is fine.",
      },
    ],
    pastWork: [
      "Past zine 01 · Anjos walking notes",
      "Past zine 02 · 24h diary",
      "Past zine 03 · trans rights timeline",
    ],
    tutor: {
      name: "Tó Cunha",
      initials: "TC",
      tint: "coral",
      role: "Editora Anjos · 9 years printing · QueerPulse magazine",
    },
    location: {
      name: "Editora Anjos",
      address: "R. António Pedro 42, 1150-046 Lisboa · Anjos",
      access:
        "Step-free entrance. Bathroom is single-stall, gender-free. 7-minute walk from Anjos metro.",
    },
    tags: ["Print", "Zines", "Design"],
    source: {
      weeks: 6,
      size: 8,
      price: 180,
      currency: "EUR",
      venue: "Editora Anjos",
    },
  },
  {
    id: "advanced-wheel-throwing",
    category: "craft",
    title: "Wheel-throwing,",
    titleEm: "past the basics.",
    format: "Workshop · 5 weeks · group of 6",
    mode: "In-person",
    blurb:
      "You can centre clay and pull a wall. Now learn to throw tall, throw thin, and glaze like you mean it. Five Thursday evenings in the Graça studio for people who've thrown before.",
    heroPlaceholder: "Wheel + tall vessel in progress",
    heroTint: "plum",
    spotsFilled: 3,
    spotsTotal: 6,
    price: "€150",
    priceSub: "five weeks · clay & firing included",
    startDate: "Thu 26 Jun",
    cancellation: "Full refund · before 19 Jun",
    tiers: [
      { label: "Standard rate", amount: "€150" },
      { label: "Reduced", amount: "€100", sliding: true },
      { label: "Solidarity · 1 slot", amount: "€50", sliding: true },
    ],
    about: [
      "Five 3-hour sessions, Thursdays 18:30 to 21:30. This isn't a first class: you should already be able to centre and pull a basic cylinder. We spend the whole course on the things that go wrong once you get ambitious: height, weight, and glaze.",
      "Six people, six wheels, one kiln. You'll throw a full set of pieces across the weeks and glaze them together on the last night. Everything you make comes home with you.",
    ],
    sessions: [
      {
        n: "01",
        title: "Throwing tall · walls that don't collapse",
        description: "Compression, water discipline, and how to add height without thinning the base to nothing.",
        date: "Thu 26 Jun",
        length: "3 hr",
      },
      {
        n: "02",
        title: "Throwing thin · trimming a proper foot",
        description: "Getting weight out of the wall and turning a clean foot ring on the leather-hard pot.",
        date: "Thu 3 Jul",
        length: "3 hr",
      },
      {
        n: "03",
        title: "Handles, spouts & lids that fit",
        description: "The parts that separate a mug from a mistake. Pulling handles, cutting spouts, throwing lids to size.",
        date: "Thu 10 Jul",
        length: "3 hr",
      },
      {
        n: "04",
        title: "Glaze chemistry, without the fear",
        description: "How glazes actually behave. Layering, wax resist, and mixing two studio glazes into something yours.",
        date: "Thu 17 Jul",
        length: "3 hr",
      },
      {
        n: "05",
        title: "Glazing your set · loading the kiln",
        description: "We glaze the whole cohort's work, load together, and talk about what to expect from the firing.",
        date: "Thu 24 Jul",
        length: "3 hr",
      },
    ],
    needs: [
      {
        label: "Clay",
        detail:
          "Stoneware for the whole course: throw as much as you can use.",
        included: true,
        tag: "included",
      },
      {
        label: "Firing",
        detail: "Bisque and glaze firings for everything you finish.",
        included: true,
        tag: "included",
      },
      {
        label: "Studio glazes",
        detail: "The full studio glaze wall is open to you on session five.",
        included: true,
        tag: "included",
      },
      {
        label: "An apron",
        detail: "Bring something you don't mind getting clay all over.",
      },
      {
        label: "Short nails",
        detail: "Trust us. Long nails and throwing don't get along.",
      },
      {
        label: "A prior class",
        detail:
          "You should have thrown before, even once. This picks up after the basics.",
      },
    ],
    pastWork: [
      "Past work · tall bud vases",
      "Past work · faceted mug set",
      "Past work · layered-glaze bowls",
    ],
    tutor: {
      name: "Beatriz Pinto",
      initials: "BP",
      tint: "plum",
      role: "Graça studio · potter & teacher",
      memberSlug: "beatriz",
    },
    location: {
      name: "Estúdio Graça",
      address: "Calçada do Monte 18, 1170-250 Lisboa · Graça",
      access:
        "One step at the entrance. Ask and we'll ramp it. Gender-free bathroom. 5-minute walk from Graça tram.",
    },
    tags: ["Ceramics", "Glaze", "Hands-on"],
    source: {
      weeks: 5,
      size: 6,
      price: 150,
      currency: "EUR",
      venue: "Estúdio Graça",
    },
  },
  {
    id: "finish-a-track",
    category: "creative",
    title: "Finish a track,",
    titleEm: "actually finish it.",
    format: "Workshop · 4 weeks · group of 8",
    mode: "Hybrid",
    blurb:
      "Everyone has forty unfinished projects. Over four weeks you'll take one idea from loop to a mastered, released track, and put it out. In-person in Bairro Alto, with online check-ins between sessions.",
    heroPlaceholder: "Studio · Ableton session on screen",
    heroTint: "jade",
    spotsFilled: 6,
    spotsTotal: 8,
    price: "€120",
    priceSub: "four weeks · sliding scale · no gear needed",
    startDate: "Mon 30 Jun",
    cancellation: "Full refund · before 23 Jun",
    tiers: [
      { label: "Standard rate", amount: "€120" },
      { label: "Reduced", amount: "€80", sliding: true },
      { label: "Solidarity · 2 slots", amount: "€40", sliding: true },
    ],
    about: [
      "Four Monday sessions, 19:00 to 22:00, plus a short online listening round mid-week. We work in Ableton but the ideas carry to any DAW. You bring one unfinished loop; you leave with one finished, released track.",
      "The whole course is built around the thing nobody teaches: finishing. Arrangement, knowing when to stop, mixing enough, mastering enough, and the small terror of pressing publish. Complete beginners who've made at least one loop are welcome.",
    ],
    sessions: [
      {
        n: "01",
        title: "From loop to arrangement",
        description: "Pick the one idea. Build it into a full arrangement with an intro, a turn, and an ending.",
        date: "Mon 30 Jun",
        length: "3 hr",
      },
      {
        n: "02",
        title: "Sound design & the second half",
        description: "Making the back half of the track earn its place. Variation, tension, and knowing when it's enough.",
        date: "Mon 7 Jul",
        length: "3 hr",
      },
      {
        n: "03",
        title: "Mixing to translate",
        description: "A practical mix that sounds right on phone speakers and headphones. Gain-staging, EQ, the essentials.",
        date: "Mon 14 Jul",
        length: "3 hr",
      },
      {
        n: "04",
        title: "Master, release, listen back",
        description: "A gentle master, export, and we release together on the night. Then we play every track, start to finish.",
        date: "Mon 21 Jul",
        length: "3 hr",
      },
    ],
    needs: [
      {
        label: "Studio time",
        detail:
          "The Bairro Alto room, monitors, and interface across all four weeks.",
        included: true,
        tag: "included",
      },
      {
        label: "Ableton Live",
        detail: "Loaner licences for the course if you don't have one.",
        included: true,
        tag: "included",
      },
      {
        label: "A release",
        detail:
          "We help you put the finished track out: Bandcamp, SoundCloud, wherever.",
        included: true,
        tag: "your track",
      },
      {
        label: "Headphones",
        detail: "Bring your own if you have a pair you trust. We have spares.",
      },
      {
        label: "One loop",
        detail:
          "8–16 bars of something you started and abandoned. That's the seed.",
      },
    ],
    pastWork: [
      "Released · ambient EP opener",
      "Released · club edit, 128bpm",
      "Released · lo-fi bedroom pop",
    ],
    tutor: {
      name: "Diogo Vasques",
      initials: "DV",
      tint: "jade",
      role: "Producer · Bairro Alto · runs the studio nights",
      memberSlug: "diogo",
    },
    location: {
      name: "Estúdio Bairro",
      address: "R. da Rosa 210, 1200-387 Lisboa · Bairro Alto",
      access:
        "Step-free from the street. Gender-free bathroom. Sessions also stream for anyone who can't make it in person.",
    },
    tags: ["Ableton", "Production", "Release"],
    source: {
      weeks: 4,
      size: 8,
      price: 120,
      currency: "EUR",
      venue: "Estúdio Bairro",
    },
  },
];
