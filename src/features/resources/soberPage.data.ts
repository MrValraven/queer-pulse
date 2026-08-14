import type { IconType } from "react-icons";
import { FiCoffee, FiMapPin } from "react-icons/fi";
import { memberName } from "../members/data/members";

export type EventType = "Social" | "Support" | "Outdoors" | "Culture";

export interface SoberMeta {
  icon?: IconType;
  text: string;
}

export interface SoberEvent {
  id: number;
  d: string;
  m: string;
  type: EventType;
  name: string;
  meta: SoberMeta[];
  going?: boolean;
}

/**
 * i18n Pattern A. Reason chips are platform-authored chrome. `EVENTS` below
 * keep organizer-authored `name`/`meta` in English (content, per the scope
 * rule); `typeLabel` used to be repeated per-event chrome baked into the mock
 * — lifted out to `TYPE_LABEL_KEY` since it's really a function of `type`.
 */
export const REASON_KEYS = [
  "resources:sober.reason.recovery",
  "resources:sober.reason.soberCurious",
  "resources:sober.reason.medication",
  "resources:sober.reason.health",
  "resources:sober.reason.religious",
  "resources:sober.reason.preference",
  "resources:sober.reason.justDont",
];

export const TYPE_LABEL_KEY: Record<EventType, string> = {
  Social: "resources:sober.type.alcoholFree",
  Support: "resources:sober.type.supportGroup",
  Outdoors: "resources:sober.type.alcoholFree",
  Culture: "resources:sober.type.alcoholFree",
};

export const EVENTS: SoberEvent[] = [
  {
    id: 1,
    d: "08",
    m: "Jun",
    type: "Social",
    name: "Morning walk: Monsanto Forest Park",
    meta: [
      { icon: FiMapPin, text: "Monsanto" },
      { text: "9:00am" },
      { text: "14 going" },
    ],
    going: true,
  },
  {
    id: 2,
    d: "14",
    m: "Jun",
    type: "Culture",
    name: "Book club meetup: Giovanni's Room",
    meta: [
      { icon: FiCoffee, text: "Linha d'Água café, Príncipe Real" },
      { text: "18:30" },
      { text: "11 going" },
    ],
  },
  {
    id: 3,
    d: "21",
    m: "Jun",
    type: "Support",
    name: "Sober & Queer: weekly peer support",
    meta: [
      { icon: FiMapPin, text: "Online (private link sent on RSVP)" },
      { text: "19:00" },
      { text: "Recurring" },
    ],
  },
  {
    id: 4,
    d: "28",
    m: "Jun",
    type: "Outdoors",
    name: "Pride picnic: alcohol-free zone",
    meta: [
      { icon: FiMapPin, text: "Jardim da Estrela" },
      { text: "14:00–18:00" },
      { text: "38 going" },
    ],
  },
  {
    id: 5,
    d: "05",
    m: "Jul",
    type: "Social",
    name: "Film night: Portrait of a Lady on Fire",
    meta: [
      { icon: FiMapPin, text: "Member's flat, Mouraria" },
      { text: "20:00" },
      { text: "8 spots left" },
    ],
  },
];

export const TYPE_CLASS: Record<EventType, string> = {
  Social: "typeSocial",
  Support: "typeSupport",
  Outdoors: "typeOutdoors",
  Culture: "typeCulture",
};

export const STATS = [
  {
    numberKey: "resources:sober.stat.rate.n",
    labelKey: "resources:sober.stat.rate.label",
  },
  {
    numberKey: "resources:sober.stat.fewSpaces.n",
    labelKey: "resources:sober.stat.fewSpaces.label",
  },
  {
    numberKey: "resources:sober.stat.changes.n",
    labelKey: "resources:sober.stat.changes.label",
  },
];

export const VENUES = [
  {
    neighbourhood: "Príncipe Real",
    name: "Linha d'Água",
    description: "A calm, queer-owned café. Excellent coffee and non-alcoholic options. Community notice board, good for a long conversation or quiet work. Fully accessible.",
    tags: ["Queer-owned", "No alcohol", "Accessible"],
  },
  {
    neighbourhood: "Cais do Sodré",
    name: "Copenhagen Coffee Lab",
    description: "Speciality coffee, relaxed atmosphere, queer-staffed. A go-to for a first meeting or first date that doesn't involve alcohol. Gender-neutral bathroom.",
    tags: ["No alcohol", "Gender-neutral bathroom"],
  },
  {
    neighbourhood: "Bairro Alto",
    name: "ZDB: Zé dos Bois",
    description: "Arts venue with exhibitions, performances, and events. Alcohol is served but never the focus. Many events are entirely sober in practice. Consistently queer-safe.",
    tags: ["Alcohol present", "Never the focus", "Arts-led"],
  },
  {
    neighbourhood: "Mouraria",
    name: "Chapitô",
    description: "Restaurant and cultural space with terrace views. Good non-alcoholic drinks menu, not just water and Coke. Staff don't push alcohol. Popular for community dinners.",
    tags: ["Good NA menu", "Community dinners"],
  },
];

export const VOICES = [
  {
    quote:
      '"I thought getting sober would mean losing the community. It turned out I found a deeper one, people who show up because they want to, not because the bar is there."',
    avatar: "ML",
    avatarBackground: "rgba(232,119,90,.15)",
    avatarColor: "var(--accent-ink)",
    name: memberName("mariana"),
    role: "3 years sober · Clinical Psychologist",
  },
  {
    quote:
      "\"I don't drink for health reasons, not recovery. But the reaction is often the same. Having spaces where it just isn't the question is a relief I can't fully describe.\"",
    avatar: "RP",
    avatarBackground: "rgba(74,140,111,.15)",
    avatarColor: "var(--jade)",
    name: "Rafael Pinto",
    role: "Illustrator · Graça",
  },
  {
    quote:
      "\"The morning walk group changed things for me. I'd been so isolated, not because I didn't want connection, but because every social option seemed to start at midnight in a bar.\"",
    avatar: "CF",
    avatarBackground: "rgba(45,27,61,.1)",
    avatarColor: "var(--plum)",
    name: "Catarina Faria",
    role: "Architect · Estrela",
  },
];

export const RECOVERY_OPTS = [
  {
    titleKey: "resources:sober.recovery.peerGroup.title",
    descriptionKey: "resources:sober.recovery.peerGroup.desc",
    linkLabelKey: "resources:sober.recovery.peerGroup.linkLabel",
    linkKey: "COMMUNITIES",
  },
  {
    titleKey: "resources:sober.recovery.oneToOne.title",
    descriptionKey: "resources:sober.recovery.oneToOne.desc",
    linkLabelKey: "resources:sober.recovery.oneToOne.linkLabel",
    linkKey: "MENTORSHIP",
  },
  {
    titleKey: "resources:sober.recovery.therapists.title",
    descriptionKey: "resources:sober.recovery.therapists.desc",
    linkLabelKey: "resources:sober.recovery.therapists.linkLabel",
    linkKey: "WELLBEING",
  },
  {
    titleKey: "resources:sober.recovery.external.title",
    descriptionKey: "resources:sober.recovery.external.desc",
    linkLabelKey: "resources:sober.recovery.external.linkLabel",
    linkKey: "RESOURCES",
  },
];
