import type { AvatarTint } from "../../shared/components/ui/Avatar";
import type { TFunction } from "../../shared/i18n/types";
import { memberProfiles } from "../members/data/memberProfiles";

export type Mode = "offering" | "seeking" | "both";

export interface Barter {
  id: string;
  member?: string;
  name?: string;
  initials?: string;
  tint?: AvatarTint;
  hood?: string;
  category: string;
  mode: Mode;
  offer: string;
  want: string;
  offerDetail: string;
  wantDetail: string;
  tags: string[];
  days: number;
}

export const BARTERS: Barter[] = [
  {
    id: "b1",
    member: "ines",
    category: "creative",
    mode: "both",
    offer: "Brand identity design",
    want: "Portuguese tax return help",
    offerDetail:
      "Logo, type, colour: full brand for a small project or solo practice. Up to 3 rounds of revisions.",
    wantDetail:
      "My imposto IRS is a mess. Two hours of your time, I give you a visual identity.",
    tags: ["design", "branding", "visual identity"],
    days: 3,
  },
  {
    id: "b2",
    member: "sofia",
    category: "creative",
    mode: "both",
    offer: "Short film editing (Premiere, DaVinci)",
    want: "Legal advice on self-employment contracts",
    offerDetail:
      "Rough cut to final export. Up to 15 minutes. I work fast and I listen.",
    wantDetail:
      "Freelance contract review, recibos verdes questions. Nothing complicated. I just need someone who knows.",
    tags: ["video", "editing", "post-production"],
    days: 5,
  },
  {
    id: "b3",
    member: "andre",
    category: "creative",
    mode: "offering",
    offer: "Portrait session: analog, medium format",
    want: "",
    offerDetail:
      "One roll of film, developed and scanned. For members who have never had a proper portrait. I will not make you uncomfortable.",
    wantDetail: "",
    tags: ["photography", "film", "portrait"],
    days: 1,
  },
  {
    id: "b4",
    member: "rui",
    category: "tech",
    mode: "both",
    offer: "Website build or debug (React, vanilla JS)",
    want: "Cooking lessons or a meal",
    offerDetail:
      "Two to four hours of real engineering help. Bugs, architecture, code review, building something from scratch.",
    wantDetail:
      "I can code but I cannot cook. One proper meal or two lessons with someone who actually knows what they are doing.",
    tags: ["web dev", "javascript", "react"],
    days: 8,
  },
  {
    id: "b5",
    member: "carla",
    category: "tech",
    mode: "seeking",
    offer: "",
    want: "UX feedback on a product I'm building",
    offerDetail: "",
    wantDetail:
      "I have a prototype. I need two hours with someone who will actually use it and tell me what is wrong.",
    tags: ["UX", "product", "feedback"],
    days: 2,
  },
  {
    id: "b6",
    name: "Miguel F.",
    initials: "MF",
    tint: "jade",
    hood: "Intendente",
    category: "tech",
    mode: "offering",
    offer: "Linux server setup and sysadmin",
    want: "",
    offerDetail:
      "VPS, self-hosted services, email, backups. If you want to own your own infrastructure I can help you get there.",
    wantDetail: "",
    tags: ["linux", "sysadmin", "self-hosting"],
    days: 12,
  },
  {
    id: "b7",
    name: "Beatriz M.",
    initials: "BM",
    tint: "plum",
    hood: "Graça",
    category: "legal",
    mode: "both",
    offer: "NHR and visa paperwork help (PT law)",
    want: "Massage or bodywork",
    offerDetail:
      "I have been through the NHR process, the D7 visa, the residency renewal. I know the forms.",
    wantDetail:
      "I am a lawyer with a very bad back. I want proper hands-on bodywork. At least two sessions.",
    tags: ["visas", "NHR", "immigration", "tax"],
    days: 6,
  },
  {
    id: "b8",
    name: "Tiago R.",
    initials: "TR",
    tint: "coral",
    hood: "Mouraria",
    category: "legal",
    mode: "offering",
    offer: "Contract translation PT ↔ EN",
    want: "",
    offerDetail:
      "Bilingual lawyer. I will translate and summarise any contract up to 10 pages. Plain language, fast turnaround.",
    wantDetail: "",
    tags: ["translation", "contracts", "legal"],
    days: 4,
  },
  {
    id: "b9",
    member: "mariana",
    category: "care",
    mode: "offering",
    offer: "Psychotherapy session (sliding scale barter)",
    want: "",
    offerDetail:
      "One session, exchange for something useful to me. I work in Portuguese and English. Not crisis intervention.",
    wantDetail: "",
    tags: ["therapy", "mental health", "wellbeing"],
    days: 9,
  },
  {
    id: "b10",
    name: "Catarina L.",
    initials: "CL",
    tint: "jade",
    hood: "Alfama",
    category: "care",
    mode: "both",
    offer: "Yoga and breathwork (1:1 or small group)",
    want: "Graphic design for my practice",
    offerDetail:
      "Trauma-informed, queer-affirming, body-neutral. All levels. I come to you if you have space.",
    wantDetail:
      "A simple logo and one-page PDF. Something I can send to people. Clean and understated.",
    tags: ["yoga", "breathwork", "body-neutral"],
    days: 14,
  },
  {
    id: "b11",
    name: "Pedro V.",
    initials: "PV",
    tint: "coral",
    hood: "Santos",
    category: "care",
    mode: "seeking",
    offer: "",
    want: "Haircut: someone trans-competent, not expensive",
    offerDetail: "",
    wantDetail:
      "In exchange I offer two hours of furniture assembly, moving help, or general muscle-use.",
    tags: ["haircut", "trans", "grooming"],
    days: 1,
  },
  {
    id: "b12",
    member: "tomas",
    category: "food",
    mode: "both",
    offer: "A dinner for two, cooked properly",
    want: "Photography of the dishes",
    offerDetail:
      "Seasonal, no menu in advance. I cook what is good that week. Wine included.",
    wantDetail:
      "I want proper photographs of the food, taken with a real camera. Someone who knows about light.",
    tags: ["cooking", "dinner", "food"],
    days: 7,
  },
  {
    id: "b13",
    name: "Joana S.",
    initials: "JS",
    tint: "jade",
    hood: "Príncipe Real",
    category: "food",
    mode: "offering",
    offer: "Natural wine tasting and education (up to 4 people)",
    want: "",
    offerDetail:
      "Two hours, six wines, no performance. I worked in wine for eight years. This is for people who want to actually learn.",
    wantDetail: "",
    tags: ["wine", "food", "education"],
    days: 11,
  },
  {
    id: "b14",
    name: "Kiko M.",
    initials: "KM",
    tint: "plum",
    hood: "Marvila",
    category: "body",
    mode: "both",
    offer: "Capoeira basics (up to 4 sessions)",
    want: "Web presence: something simple",
    offerDetail:
      "Not performance capoeira. Movement, music, community. No experience needed. I teach slowly.",
    wantDetail:
      "A single page with my bio, a contact form, and a photo. I do not know how to do it myself.",
    tags: ["capoeira", "movement", "body"],
    days: 3,
  },
  {
    id: "b15",
    name: "Rafa D.",
    initials: "RD",
    tint: "coral",
    hood: "Cais do Sodré",
    category: "body",
    mode: "seeking",
    offer: "",
    want: "Running buddy: 3× per week, Ribeira",
    offerDetail: "",
    wantDetail:
      "In return: I speak four languages and will tutor you in any of them for the same number of hours.",
    tags: ["running", "fitness", "outdoors"],
    days: 5,
  },
];

export const MODES: { value: "all" | Mode; labelKey: string }[] = [
  { value: "all", labelKey: "economy:barter.mode.all" },
  { value: "offering", labelKey: "economy:barter.mode.offering" },
  { value: "seeking", labelKey: "economy:barter.mode.seeking" },
];

export const CATS = [
  { value: "all", labelKey: "economy:barter.cat.all" },
  { value: "creative", labelKey: "economy:barter.cat.creative" },
  { value: "tech", labelKey: "economy:barter.cat.tech" },
  { value: "legal", labelKey: "economy:barter.cat.legal" },
  { value: "care", labelKey: "economy:barter.cat.care" },
  { value: "food", labelKey: "economy:barter.cat.food" },
  { value: "body", labelKey: "economy:barter.cat.body" },
];

export const BADGE_KEY: Record<Mode, string> = {
  offering: "economy:barter.badge.offering",
  seeking: "economy:barter.badge.seeking",
  both: "economy:barter.badge.both",
};

export function getMemberInfo(b: Barter): {
  name: string;
  initials: string;
  tint: AvatarTint;
  hood: string;
} {
  const m = b.member ? memberProfiles[b.member] : undefined;
  if (m) {
    return {
      name: `${m.first} ${m.last}`,
      initials: m.initials,
      tint: m.tint,
      hood: m.hood,
    };
  }
  return {
    name: b.name ?? "—",
    initials: b.initials ?? "?",
    tint: b.tint ?? "jade",
    hood: b.hood ?? "",
  };
}

export const PRINCIPLES = [
  {
    id: "noMoney",
    titleKey: "economy:barter.principle.noMoney.title",
    bodyKey: "economy:barter.principle.noMoney.body",
  },
  {
    id: "reputation",
    titleKey: "economy:barter.principle.reputation.title",
    bodyKey: "economy:barter.principle.reputation.body",
  },
  {
    id: "wants",
    titleKey: "economy:barter.principle.wants.title",
    bodyKey: "economy:barter.principle.wants.body",
  },
];

/** "Today" for a same-day post, else a pluralized "{count} day(s) ago" — mirrors gatherings' spotsText idiom of a datum + resolver. */
export function postedDaysText(days: number, t: TFunction): string {
  if (days === 1) return t("economy:barter.postedToday");
  return t("economy:barter.postedDaysAgo", { count: days });
}
