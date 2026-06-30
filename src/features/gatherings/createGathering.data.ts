import type { IconType } from "react-icons";
import {
  FiBook,
  FiCoffee,
  FiFeather,
  FiFilm,
  FiMessageCircle,
  FiStar,
  FiUsers,
} from "react-icons/fi";

export const TOTAL_STEPS = 5;

export const PILL_LABELS = [
  "Type",
  "Date & place",
  "Capacity",
  "Pricing",
  "Review",
];

export const TIPS = [
  "Choose the format that comes most naturally to you. The best gatherings are the ones hosts actually enjoy running.",
  "The neighbourhood is shown on the listing. The full address is only shared with confirmed attendees.",
  "Be honest about accessibility. Attendees plan around it. Only tick what you can genuinely confirm.",
  "QueerPulse takes 0% of ticket revenue. Every euro goes to you. The sliding scale is required — it makes the community more accessible.",
  "Once you publish, you can still edit the listing. You cannot reduce capacity below the number of existing RSVPs.",
];

export const TYPES: { icon: IconType; name: string; sub: string }[] = [
  { icon: FiCoffee, name: "Supper club", sub: "Shared meal, hosted" },
  { icon: FiBook, name: "Workshop / talk", sub: "Teach or share something" },
  { icon: FiFilm, name: "Screening", sub: "Film, music, performance" },
  { icon: FiFeather, name: "Studio visit", sub: "Open your space" },
  { icon: FiUsers, name: "Walk or outdoor", sub: "Movement, outdoor" },
  { icon: FiMessageCircle, name: "Discussion", sub: "Reading group, debate" },
  { icon: FiUsers, name: "Skills exchange", sub: "Mutual learning" },
  { icon: FiStar, name: "Other", sub: "Something else entirely" },
];

export const HOODS = [
  "Mouraria",
  "Intendente",
  "Alfama",
  "Graça",
  "Príncipe Real",
  "Bairro Alto",
  "Cais do Sodré",
  "Santos",
  "Marvila",
  "Arroios",
  "Online",
  "Other in Lisbon",
];
export const LANGS = [
  "PT / EN bilingual",
  "Portuguese only",
  "English only",
  "Other",
];
export const ACCESS_OPTIONS = [
  "Step-free access throughout",
  "Accessible toilet",
  "Seating available throughout",
  "Low sensory / quiet option available",
  "Dietary requirements can be accommodated",
];

export const CONFIRM_CHECKS = [
  "This gathering follows the QueerPulse Code of Care.",
  "The sliding scale (if ticketed) is genuine — the free tier will be honoured.",
  "The accessibility information I've provided is accurate to the best of my knowledge.",
];
