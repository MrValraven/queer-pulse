import { memberName } from "../members/data/members";

export type EventType = "Social" | "Support" | "Outdoors" | "Culture";

export interface SoberEvent {
  id: number;
  d: string;
  m: string;
  type: EventType;
  typeLabel: string;
  name: string;
  meta: string[];
  going?: boolean;
}

export const REASONS = [
  "In recovery",
  "Sober-curious",
  "Medication",
  "Health reasons",
  "Religious practice",
  "Personal preference",
  "Just don't feel like it",
];

export const EVENTS: SoberEvent[] = [
  { id: 1, d: "08", m: "Jun", type: "Social", typeLabel: "Alcohol-free", name: "Morning walk — Monsanto Forest Park", meta: ["🌲 Monsanto", "9:00am", "14 going"], going: true },
  { id: 2, d: "14", m: "Jun", type: "Culture", typeLabel: "Alcohol-free", name: "Book club meetup — Giovanni's Room", meta: ["☕ Linha d'Água café, Príncipe Real", "18:30", "11 going"] },
  { id: 3, d: "21", m: "Jun", type: "Support", typeLabel: "Support group", name: "Sober & Queer — weekly peer support", meta: ["📍 Online (private link sent on RSVP)", "19:00", "Recurring"] },
  { id: 4, d: "28", m: "Jun", type: "Outdoors", typeLabel: "Alcohol-free", name: "Pride picnic — alcohol-free zone", meta: ["🌳 Jardim da Estrela", "14:00–18:00", "38 going"] },
  { id: 5, d: "05", m: "Jul", type: "Social", typeLabel: "Alcohol-free", name: "Film night — Portrait of a Lady on Fire", meta: ["📍 Member's flat, Mouraria", "20:00", "8 spots left"] },
];

export const TYPE_CLASS: Record<EventType, string> = {
  Social: "typeSocial",
  Support: "typeSupport",
  Outdoors: "typeOutdoors",
  Culture: "typeCulture",
};

export const STATS = [
  { n: "2–3×", l: "LGBTQ+ people are 2–3x more likely to experience alcohol dependency than the general population (Public Health England, 2017)" },
  { n: "Very few", l: "queer social spaces are alcohol-free or actively sober-welcoming — despite the need" },
  { n: "This changes", l: "when community spaces deliberately include sober options — and when sober people don't have to be invisible" },
];

export const VENUES = [
  { hood: "Príncipe Real", name: "Linha d'Água", desc: "A calm, queer-owned café. Excellent coffee and non-alcoholic options. Community notice board, good for a long conversation or quiet work. Fully accessible.", tags: ["Queer-owned", "No alcohol", "Accessible"] },
  { hood: "Cais do Sodré", name: "Copenhagen Coffee Lab", desc: "Speciality coffee, relaxed atmosphere, queer-staffed. A go-to for a first meeting or first date that doesn't involve alcohol. Gender-neutral bathroom.", tags: ["No alcohol", "Gender-neutral bathroom"] },
  { hood: "Bairro Alto", name: "ZDB — Zé dos Bois", desc: "Arts venue with exhibitions, performances, and events. Alcohol is served but never the focus — many events are entirely sober in practice. Consistently queer-safe.", tags: ["Alcohol present", "Never the focus", "Arts-led"] },
  { hood: "Mouraria", name: "Chapitô", desc: "Restaurant and cultural space with terrace views. Good non-alcoholic drinks menu, not just water and Coke. Staff don't push alcohol. Popular for community dinners.", tags: ["Good NA menu", "Community dinners"] },
];

export const VOICES = [
  { quote: '"I thought getting sober would mean losing the community. It turned out I found a deeper one — people who show up because they want to, not because the bar is there."', av: "ML", avBg: "rgba(232,119,90,.15)", avCol: "var(--accent-ink)", name: memberName('mariana'), role: "3 years sober · Clinical Psychologist" },
  { quote: '"I don\'t drink for health reasons, not recovery — but the reaction is often the same. Having spaces where it just isn\'t the question is a relief I can\'t fully describe."', av: "RP", avBg: "rgba(74,140,111,.15)", avCol: "var(--jade)", name: "Rafael Pinto", role: "Illustrator · Graça" },
  { quote: '"The morning walk group changed things for me. I\'d been so isolated — not because I didn\'t want connection, but because every social option seemed to start at midnight in a bar."', av: "CF", avBg: "rgba(45,27,61,.1)", avCol: "var(--plum)", name: "Catarina Faria", role: "Architect · Estrela" },
];

export const RECOVERY_OPTS = [
  { title: "Sober & Queer peer group", desc: "A private, moderated space within QueerPulse for people in recovery. Weekly online meeting, text channel, and occasional in-person gatherings. No particular programme — all approaches welcome.", linkLabel: "Join the group →", linkKey: "COMMUNITIES" },
  { title: "One-to-one — talk to a peer", desc: "Request a conversation with a community member who has offered to talk to people navigating sobriety. No counsellors — just someone who's been through something similar.", linkLabel: "Find a peer →", linkKey: "MENTORSHIP" },
  { title: "Queer-affirming therapists", desc: "The wellbeing directory includes therapists who specialise in addiction and queer identity — because those two things aren't separate.", linkLabel: "Find a therapist →", linkKey: "WELLBEING" },
  { title: "External resources", desc: "APDES (harm reduction), AAPT (AA Portugal), SMART Recovery Portugal — for when community support isn't enough on its own.", linkLabel: "See resources →", linkKey: "RESOURCES" },
];
