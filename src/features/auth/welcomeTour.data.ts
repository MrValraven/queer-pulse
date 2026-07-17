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

export const VOUCH = {
  initials: "IT",
  name: memberName("ines"),
  role: "Graphic Designer · Príncipe Real",
  note: "Knew you'd be a great fit. Looking forward to seeing you at the next gathering — I might finally have someone to talk type with.",
};

/**
 * Lisbon neighbourhood names are proper nouns (and read identically in both
 * catalogs), but route through keys anyway for consistency with the dropdown's
 * two genuinely-chrome phrases ("Elsewhere in Lisbon", "New to Lisbon…") —
 * see `gatherings.data.ts`'s `HOOD_KEYS` for the same pattern.
 */
export const NEIGHBOURHOOD_KEYS = [
  "auth:tour.neighbourhood.principeReal",
  "auth:tour.neighbourhood.mouraria",
  "auth:tour.neighbourhood.bairroAlto",
  "auth:tour.neighbourhood.caisDoSodre",
  "auth:tour.neighbourhood.arroios",
  "auth:tour.neighbourhood.alfama",
  "auth:tour.neighbourhood.graca",
  "auth:tour.neighbourhood.marvila",
  "auth:tour.neighbourhood.estrela",
  "auth:tour.neighbourhood.intendente",
  "auth:tour.neighbourhood.elsewhere",
  "auth:tour.neighbourhood.newToLisbon",
];

export const VISIBILITY_OPTIONS = [
  {
    value: "open",
    titleKey: "auth:tour.visibility.open.title",
    descKey: "auth:tour.visibility.open.desc",
  },
  {
    value: "network",
    titleKey: "auth:tour.visibility.network.title",
    descKey: "auth:tour.visibility.network.desc",
  },
  {
    value: "private",
    titleKey: "auth:tour.visibility.private.title",
    descKey: "auth:tour.visibility.private.desc",
  },
];

export const INTERESTS: { icon: IconType; value: string; labelKey: string }[] =
  [
    { icon: FiPenTool, value: "Design", labelKey: "auth:tour.interest.design" },
    { icon: FiMonitor, value: "Tech", labelKey: "auth:tour.interest.tech" },
    { icon: FiFilm, value: "Film", labelKey: "auth:tour.interest.film" },
    { icon: FiMusic, value: "Music", labelKey: "auth:tour.interest.music" },
    {
      icon: FaHandFist,
      value: "Activism",
      labelKey: "auth:tour.interest.activism",
    },
    {
      icon: FaLeaf,
      value: "Wellbeing",
      labelKey: "auth:tour.interest.wellbeing",
    },
    { icon: FaUtensils, value: "Food", labelKey: "auth:tour.interest.food" },
    {
      icon: FiActivity,
      value: "Sports",
      labelKey: "auth:tour.interest.sports",
    },
    {
      icon: FiBookOpen,
      value: "Writing",
      labelKey: "auth:tour.interest.writing",
    },
    { icon: FiTool, value: "Craft", labelKey: "auth:tour.interest.craft" },
    {
      icon: FaLandmark,
      value: "Policy",
      labelKey: "auth:tour.interest.policy",
    },
    {
      icon: FiGlobe,
      value: "Community",
      labelKey: "auth:tour.interest.community",
    },
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
  nameKey: string;
  descKey: string;
  href: string;
}[] = [
  {
    icon: FiUsers,
    nameKey: "auth:tour.exploreCard.members.name",
    descKey: "auth:tour.exploreCard.members.desc",
    href: "QueerPulse Homepage.html#discovery",
  },
  {
    icon: FiCalendar,
    nameKey: "auth:tour.exploreCard.gatherings.name",
    descKey: "auth:tour.exploreCard.gatherings.desc",
    href: "QueerPulse Homepage.html#gather",
  },
  {
    icon: FaHandshake,
    nameKey: "auth:tour.exploreCard.communities.name",
    descKey: "auth:tour.exploreCard.communities.desc",
    href: "QueerPulse Communities.html",
  },
  {
    icon: FiPenTool,
    nameKey: "auth:tour.exploreCard.culture.name",
    descKey: "auth:tour.exploreCard.culture.desc",
    href: "QueerPulse Culture.html",
  },
  {
    icon: FiBriefcase,
    nameKey: "auth:tour.exploreCard.economy.name",
    descKey: "auth:tour.exploreCard.economy.desc",
    href: "QueerPulse Economy.html",
  },
  {
    icon: FaSeedling,
    nameKey: "auth:tour.exploreCard.queer101.name",
    descKey: "auth:tour.exploreCard.queer101.desc",
    href: "QueerPulse 101.html",
  },
  {
    icon: FaHandFist,
    nameKey: "auth:tour.exploreCard.volunteer.name",
    descKey: "auth:tour.exploreCard.volunteer.desc",
    href: "QueerPulse Volunteer.html",
  },
  {
    icon: FiMapPin,
    nameKey: "auth:tour.exploreCard.arriving.name",
    descKey: "auth:tour.exploreCard.arriving.desc",
    href: "QueerPulse Arriving.html",
  },
  {
    icon: FaHospital,
    nameKey: "auth:tour.exploreCard.sexualHealth.name",
    descKey: "auth:tour.exploreCard.sexualHealth.desc",
    href: "QueerPulse Sexual Health.html",
  },
  {
    icon: FiCheckCircle,
    nameKey: "auth:tour.exploreCard.safeSpaces.name",
    descKey: "auth:tour.exploreCard.safeSpaces.desc",
    href: "QueerPulse Safe Spaces.html",
  },
  {
    icon: FaLeaf,
    nameKey: "auth:tour.exploreCard.sober.name",
    descKey: "auth:tour.exploreCard.sober.desc",
    href: "QueerPulse Sober.html",
  },
];
