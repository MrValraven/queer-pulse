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
  labelKey: string;
  to: string;
}

export interface Pillar {
  key: PillarKey;
  icon: ReactNode;
  nameKey: string;
  /** Full description (single-row tiles clamp this to 3 lines). */
  descKey: string;
  /** Shorter line used on the large featured tile (Community). */
  featuredKey?: string;
  /** Sub-features — each a gateway into that part of the platform. */
  tags: PillarLink[];
  /** The pillar's own hub (the whole tile links here). */
  to: string;
  /** Per-pillar accent, as a design-token var — drives the tile's edge + tag hover. */
  accent: string;
  image: string;
  altKey: string;
}

/**
 * The six pillars for the "A world, not a feature list" section (bottom of the
 * marketing homepage). Photos are bundled locally in `src/assets/pillars` —
 * placeholder imagery from Wikimedia Commons (CC BY / BY-SA / CC0), darkened
 * for the plum text-overlay. Swap for licensed or original shots before launch.
 *
 * i18n Pattern A — every string field here is platform-authored chrome
 * (identical in demo and live mode), so name/desc/featured/alt/tag labels all
 * hold catalog keys; `Pillars.tsx` resolves them with `t()`.
 */
export const pillars: Pillar[] = [
  {
    key: "community",
    icon: <FiUsers />,
    nameKey: "homepage:pillars.community.name",
    descKey: "homepage:pillars.community.desc",
    featuredKey: "homepage:pillars.community.featured",
    tags: [
      { labelKey: "homepage:pillars.tag.gatherings", to: routes.gatherings },
      { labelKey: "homepage:pillars.tag.forum", to: routes.forum },
      { labelKey: "homepage:pillars.tag.communities", to: routes.communities },
    ],
    to: routes.communities,
    accent: "var(--accent)",
    image: communityImg,
    altKey: "homepage:pillars.community.alt",
  },
  {
    key: "culture",
    icon: <FiBookOpen />,
    nameKey: "homepage:pillars.culture.name",
    descKey: "homepage:pillars.culture.desc",
    tags: [
      { labelKey: "homepage:pillars.tag.magazine", to: routes.magazine },
      { labelKey: "homepage:pillars.tag.stories", to: routes.story },
      { labelKey: "homepage:pillars.tag.library", to: routes.library },
    ],
    to: routes.magazine,
    accent: "var(--violet)",
    image: cultureImg,
    altKey: "homepage:pillars.culture.alt",
  },
  {
    key: "livelihood",
    icon: <FiBriefcase />,
    nameKey: "homepage:pillars.livelihood.name",
    descKey: "homepage:pillars.livelihood.desc",
    tags: [
      { labelKey: "homepage:pillars.tag.jobs", to: routes.jobs },
      { labelKey: "homepage:pillars.tag.skills", to: routes.skills },
      { labelKey: "homepage:pillars.tag.microGrants", to: routes.microGrants },
    ],
    to: routes.jobs,
    accent: "var(--jade)",
    image: livelihoodImg,
    altKey: "homepage:pillars.livelihood.alt",
  },
  {
    key: "wellbeing",
    icon: <FiHeart />,
    nameKey: "homepage:pillars.wellbeing.name",
    descKey: "homepage:pillars.wellbeing.desc",
    tags: [
      {
        labelKey: "homepage:pillars.tag.mentalHealth",
        to: routes.mentalHealth,
      },
      { labelKey: "homepage:pillars.tag.transHub", to: routes.transHub },
      {
        labelKey: "homepage:pillars.tag.sexualHealth",
        to: routes.sexualHealth,
      },
    ],
    to: routes.wellbeing,
    accent: "var(--amber)",
    image: wellbeingImg,
    altKey: "homepage:pillars.wellbeing.alt",
  },
  {
    key: "safety",
    icon: <FiShield />,
    nameKey: "homepage:pillars.safety.name",
    descKey: "homepage:pillars.safety.desc",
    tags: [
      { labelKey: "homepage:pillars.tag.legal", to: routes.legal },
      { labelKey: "homepage:pillars.tag.rights", to: routes.hateCrime },
      { labelKey: "homepage:pillars.tag.emergency", to: routes.emergency },
    ],
    to: routes.safety,
    accent: "var(--danger)",
    image: safetyImg,
    altKey: "homepage:pillars.safety.alt",
  },
  {
    key: "activism",
    icon: <FiActivity />,
    nameKey: "homepage:pillars.activism.name",
    descKey: "homepage:pillars.activism.desc",
    tags: [
      {
        labelKey: "homepage:pillars.tag.changemakers",
        to: routes.changemakers,
      },
      { labelKey: "homepage:pillars.tag.volunteer", to: routes.volunteer },
      { labelKey: "homepage:pillars.tag.governance", to: routes.governance },
    ],
    to: routes.activism,
    accent: "var(--plum)",
    image: activismImg,
    altKey: "homepage:pillars.activism.alt",
  },
];
