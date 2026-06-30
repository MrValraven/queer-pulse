import type { IconType } from "react-icons";
import { FiBarChart2, FiSlash, FiCheckSquare } from "react-icons/fi";

export const AMOUNTS = [
  { value: "€5", note: "a coffee" },
  { value: "€15", note: "most chosen", featured: true },
  { value: "€40", note: "sustains a member" },
  { value: "€100", note: "funds a gathering" },
];

export const ALLOCATION = [
  {
    pct: "52%",
    label: "Direct mutual aid",
    body: "Emergency housing, crisis support, and micro-grants paid straight to members in need.",
  },
  {
    pct: "24%",
    label: "Gatherings & spaces",
    body: "Venue hire, sliding-scale tickets, and the newcomer events that keep the door open.",
  },
  {
    pct: "16%",
    label: "Platform & safety",
    body: "Moderation, the crisis chat line, and keeping the lights on — no ads, no data sold.",
  },
  {
    pct: "8%",
    label: "The magazine & studio",
    body: "Paying queer writers, artists, and musicians fairly for the work they make here.",
  },
];

export const TRUST: { icon: IconType; title: string; body: string }[] = [
  {
    icon: FiBarChart2,
    title: "Every euro is reported",
    body: "Quarterly figures published in the open — see exactly where it went.",
  },
  {
    icon: FiSlash,
    title: "No ads, no data sold",
    body: "We are funded by members, not advertisers. Your support is the whole model.",
  },
  {
    icon: FiCheckSquare,
    title: "Members decide",
    body: "The community council votes on how the solidarity fund is spent each quarter.",
  },
];
