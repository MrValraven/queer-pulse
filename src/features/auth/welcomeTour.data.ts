/**
 * Static content for the faithful "QueerPulse Welcome" guided tour
 * (ported from the original `QueerPulse Welcome.html` design prototype).
 */
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiFilm,
  FiGlobe,
  FiMapPin,
  FiMonitor,
  FiMusic,
  FiPenTool,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import {
  FaHandFist,
  FaHandshake,
  FaHospital,
  FaLandmark,
  FaLeaf,
  FaSeedling,
  FaUtensils,
} from "react-icons/fa6";
import { memberName } from "../members/data/members";

export const TOUR_STEP_FILLS = ["17%", "34%", "50%", "67%", "84%", "100%"];

export const TOUR_STEP_LABELS = [
  "Step 1 of 6",
  "Step 2 of 6",
  "Step 3 of 6",
  "Step 4 of 6",
  "Step 5 of 6",
  "You're in!",
];

export const VOUCH = {
  initials: "IT",
  name: memberName("ines"),
  role: "Graphic Designer · Príncipe Real",
  note: "Knew you'd be a great fit. Looking forward to seeing you at the next gathering — I might finally have someone to talk type with.",
};

export const NEIGHBOURHOODS = [
  "Príncipe Real",
  "Mouraria",
  "Bairro Alto",
  "Cais do Sodré",
  "Arroios",
  "Alfama",
  "Graça",
  "Marvila",
  "Estrela",
  "Intendente",
  "Elsewhere in Lisbon",
  "New to Lisbon — still finding my feet",
];

export const VISIBILITY_OPTIONS = [
  {
    value: "open",
    title: "Open to connect",
    desc: "Anyone in the network can see your profile and say hello",
  },
  {
    value: "network",
    title: "Network only",
    desc: "Reachable through mutual connections",
  },
  {
    value: "private",
    title: "Keep it quiet for now",
    desc: "I'll reach out when I'm ready",
  },
];

export const INTERESTS: { icon: IconType; label: string }[] = [
  { icon: FiPenTool, label: "Design" },
  { icon: FiMonitor, label: "Tech" },
  { icon: FiFilm, label: "Film" },
  { icon: FiMusic, label: "Music" },
  { icon: FaHandFist, label: "Activism" },
  { icon: FaLeaf, label: "Wellbeing" },
  { icon: FaUtensils, label: "Food" },
  { icon: FiActivity, label: "Sports" },
  { icon: FiBookOpen, label: "Writing" },
  { icon: FiTool, label: "Craft" },
  { icon: FaLandmark, label: "Policy" },
  { icon: FiGlobe, label: "Community" },
];

export const TOUR_COMMUNITIES = [
  {
    name: "Trans & Non-Binary Hub",
    desc: "Healthcare, legal guides, peer support, and community.",
  },
  {
    name: "Queer Parent Network",
    desc: "For LGBTQ+ parents, co-parents, and people navigating parenthood.",
  },
  {
    name: "Queer & of Colour",
    desc: "An intersectional space — race and queerness aren't separate.",
  },
  {
    name: "Queer Elders (50+)",
    desc: "For members 50 and over. Wisdom, memory, community.",
  },
  {
    name: "Queer Youth (18–25)",
    desc: "Career, city navigation, peer support for younger members.",
  },
  {
    name: "Disabled Queers",
    desc: "Disability, chronic illness, and queerness — both identities belong.",
  },
  {
    name: "Queer Mental Health Peer Support",
    desc: "Moderated, confidential. Shared experience, no advice unless asked.",
  },
  {
    name: "Rainbow Arts Collective",
    desc: "Visual artists, photographers, makers. Monthly crits + group shows.",
  },
];

export const CONNECTIONS = [
  {
    initials: "ML",
    name: memberName("mariana"),
    role: "Clinical Psychologist · Estrela",
    reason: "Runs the community peer support group",
    tint: "jade" as const,
  },
  {
    initials: "SA",
    name: memberName("sofia"),
    role: "Documentary Filmmaker · Alfama",
    reason: "Always happy to introduce people around",
    tint: "jade" as const,
  },
  {
    initials: "TB",
    name: memberName("tomas"),
    role: "Chef · Supper Club Host · Mouraria",
    reason: "His supper clubs are where connections start",
    tint: "coral" as const,
  },
];

/** Explore cards — `href` uses original prototype filenames, resolved via linkToPath(). */
export const EXPLORE_CARDS: {
  icon: IconType;
  name: string;
  desc: string;
  href: string;
}[] = [
  {
    icon: FiUsers,
    name: "Members",
    desc: "Browse and say hello to people in the network",
    href: "QueerPulse Homepage.html#discovery",
  },
  {
    icon: FiCalendar,
    name: "Gatherings",
    desc: "RSVP to something happening near you",
    href: "QueerPulse Homepage.html#gather",
  },
  {
    icon: FaHandshake,
    name: "Communities",
    desc: "Find an ongoing group to join",
    href: "QueerPulse Communities.html",
  },
  {
    icon: FiPenTool,
    name: "Culture",
    desc: "Book club, art showcase, commission board, radio",
    href: "QueerPulse Culture.html",
  },
  {
    icon: FiBriefcase,
    name: "Economy",
    desc: "Incubator, freelance tools, salary transparency",
    href: "QueerPulse Economy.html",
  },
  {
    icon: FaSeedling,
    name: "Queer 101",
    desc: "Still exploring your identity? A quiet place to start",
    href: "QueerPulse 101.html",
  },
  {
    icon: FaHandFist,
    name: "Volunteer",
    desc: "Find a way to give back to the local community",
    href: "QueerPulse Volunteer.html",
  },
  {
    icon: FiMapPin,
    name: "New to Lisbon?",
    desc: "A guide to settling into the queer scene here",
    href: "QueerPulse Arriving.html",
  },
  {
    icon: FaHospital,
    name: "Sexual health",
    desc: "Testing, PrEP, HIV resources — queer-specific & direct",
    href: "QueerPulse Sexual Health.html",
  },
  {
    icon: FiCheckCircle,
    name: "Safe spaces",
    desc: "Community-verified venues — earned, not self-declared",
    href: "QueerPulse Safe Spaces.html",
  },
  {
    icon: FaLeaf,
    name: "Sober & social",
    desc: "A full social life, without alcohol at the centre",
    href: "QueerPulse Sober.html",
  },
];
