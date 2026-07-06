import type { ReactNode } from "react";
import {
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiHeart,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import communityImg from "../../../assets/pillars/community.jpg";
import cultureImg from "../../../assets/pillars/culture.jpg";
import livelihoodImg from "../../../assets/pillars/livelihood.jpg";
import wellbeingImg from "../../../assets/pillars/wellbeing.jpg";
import safetyImg from "../../../assets/pillars/safety.jpg";
import activismImg from "../../../assets/pillars/activism.jpg";

export type PillarKey =
  "community" | "culture" | "livelihood" | "wellbeing" | "safety" | "activism";

export interface PillarLink {
  label: string;
  to: string;
}

export interface Pillar {
  key: PillarKey;
  icon: ReactNode;
  name: string;
  /** Full description (single-row tiles clamp this to 3 lines). */
  desc: string;
  /** Shorter line used on the large featured tile (Community). */
  featured?: string;
  /** Sub-features — each a gateway into that part of the platform. */
  tags: PillarLink[];
  /** The pillar's own hub (the whole tile links here). */
  to: string;
  /** Per-pillar accent, as a design-token var — drives the tile's edge + tag hover. */
  accent: string;
  image: string;
  alt: string;
}

/**
 * The six pillars for the "A world, not a feature list" section (bottom of the
 * marketing homepage). Photos are bundled locally in `src/assets/pillars` —
 * placeholder imagery from Wikimedia Commons (CC BY / BY-SA / CC0), darkened
 * for the plum text-overlay. Swap for licensed or original shots before launch.
 */
export const pillars: Pillar[] = [
  {
    key: "community",
    icon: <FiUsers />,
    name: "Community",
    desc: "Gatherings, groups, forum, and connections — the social fabric of queer Lisbon, online and in person.",
    featured:
      "The social fabric of queer Lisbon — a room with the door held open, online and in person.",
    tags: [
      { label: "Gatherings", to: routes.gatherings },
      { label: "Forum", to: routes.forum },
      { label: "Communities", to: routes.communities },
    ],
    to: routes.communities,
    accent: "var(--accent)",
    image: communityImg,
    alt: "People celebrating around a rainbow-painted taxi at a Pride parade",
  },
  {
    key: "culture",
    icon: <FiBookOpen />,
    name: "Culture",
    desc: "The magazine, stories, reading groups, and library — a living record of queer Lisbon, written from the inside.",
    tags: [
      { label: "Magazine", to: routes.magazine },
      { label: "Stories", to: routes.story },
      { label: "Library", to: routes.library },
    ],
    to: routes.magazine,
    accent: "var(--violet)",
    image: cultureImg,
    alt: "Drag performers walking a Pride parade route in daylight",
  },
  {
    key: "livelihood",
    icon: <FiBriefcase />,
    name: "Livelihood",
    desc: "Jobs, skills exchange, micro-grants, and barter — a queer economy built on trust, not platform fees.",
    tags: [
      { label: "Jobs", to: routes.jobs },
      { label: "Skills", to: routes.skills },
      { label: "Micro-grants", to: routes.microGrants },
    ],
    to: routes.jobs,
    accent: "var(--jade)",
    image: livelihoodImg,
    alt: "Two people planning work together over laptops and notebooks",
  },
  {
    key: "wellbeing",
    icon: <FiHeart />,
    name: "Wellbeing",
    desc: "Mental health, sexual health, trans healthcare — queer-affirming professionals, community-vetted.",
    tags: [
      { label: "Mental health", to: routes.mentalHealth },
      { label: "Trans hub", to: routes.transHub },
      { label: "Sexual health", to: routes.sexualHealth },
    ],
    to: routes.wellbeing,
    accent: "var(--amber)",
    image: wellbeingImg,
    alt: "Two men sharing a tender kiss",
  },
  {
    key: "safety",
    icon: <FiShield />,
    name: "Safety",
    desc: "Legal guides, hate crime reporting, harm reduction, and emergency contacts — know your rights.",
    tags: [
      { label: "Legal", to: routes.legal },
      { label: "Rights", to: routes.hateCrime },
      { label: "Emergency", to: routes.emergency },
    ],
    to: routes.safety,
    accent: "var(--danger)",
    image: safetyImg,
    alt: "Demonstrators holding signs reading trans rights are human rights",
  },
  {
    key: "activism",
    icon: <FiActivity />,
    name: "Activism",
    desc: "Changemakers, volunteers, and transparent governance — building a better city from the inside out.",
    tags: [
      { label: "Changemakers", to: routes.changemakers },
      { label: "Volunteer", to: routes.volunteer },
      { label: "Governance", to: routes.governance },
    ],
    to: routes.activism,
    accent: "var(--plum)",
    image: activismImg,
    alt: "Marchers carrying a large trans-flag banner through a city street",
  },
];
