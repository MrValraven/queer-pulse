/**
 * i18n Pattern A — this whole page is platform-authored "About" chrome (no
 * fetched/authored-by-a-member content anywhere on it), so every field below
 * is a catalog key that AboutPage.tsx resolves with `t()`.
 */
import {
  FiBriefcase,
  FiEyeOff,
  FiGlobe,
  FiHeart,
  FiHome,
  FiKey,
  FiRepeat,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { AboutLinkTopicId } from "./aboutLinks.data";

export const WHY_PARAGRAPH_KEYS = [
  "marketing:about.why.p1",
  "marketing:about.why.p2",
  "marketing:about.why.p3",
];

export const CONTRAST_THEM_KEYS = [
  "marketing:about.contrast.them.attention",
  "marketing:about.contrast.them.algorithm",
  "marketing:about.contrast.them.signup",
  "marketing:about.contrast.them.growth",
  "marketing:about.contrast.them.value",
];

export const CONTRAST_US_KEYS = [
  "marketing:about.contrast.us.noTracking",
  "marketing:about.contrast.us.feedIsYours",
  "marketing:about.contrast.us.vouched",
  "marketing:about.contrast.us.growthPace",
  "marketing:about.contrast.us.valueStays",
];

export const WHO_PARAGRAPH_KEYS = [
  "marketing:about.who.p1",
  "marketing:about.who.p2",
];

/**
 * The six values. Each carries a decorative icon so the grid reads as a set of
 * distinct beliefs at a glance instead of six identical text blocks.
 */
export const VALUES: { icon: IconType; titleKey: string; bodyKey: string }[] = [
  {
    icon: FiHome,
    titleKey: "marketing:about.values.smallByDesign.title",
    bodyKey: "marketing:about.values.smallByDesign.body",
  },
  {
    icon: FiTool,
    titleKey: "marketing:about.values.infrastructure.title",
    bodyKey: "marketing:about.values.infrastructure.body",
  },
  {
    icon: FiRepeat,
    titleKey: "marketing:about.values.communityEconomy.title",
    bodyKey: "marketing:about.values.communityEconomy.body",
  },
  {
    icon: FiUsers,
    titleKey: "marketing:about.values.communityOwns.title",
    bodyKey: "marketing:about.values.communityOwns.body",
  },
  {
    icon: FiEyeOff,
    titleKey: "marketing:about.values.noDataEconomy.title",
    bodyKey: "marketing:about.values.noDataEconomy.body",
  },
  {
    icon: FiKey,
    titleKey: "marketing:about.values.accessNotEarned.title",
    bodyKey: "marketing:about.values.accessNotEarned.body",
  },
];

/** Intersectionality lead-in for the "Where we stand" section. */
export const STAND_PARAGRAPH_KEYS = [
  "marketing:about.stand.p1",
  "marketing:about.stand.p2",
];

export interface StandCommitment {
  titleKey: string;
  bodyKey: string;
  /** Opens `<AboutLinkModal>` on this topic rather than navigating away. */
  link?: { labelKey: string; topic: AboutLinkTopicId };
}

/**
 * A full-weight position panel. `accent` marks the one that carries the coral
 * edge; everything else renders as the plain plum panel.
 */
export interface StandPanel {
  id: string;
  titleKey: string;
  paragraphKeys: string[];
  commitments: StandCommitment[];
  accent?: boolean;
}

export const STAND_PANELS: StandPanel[] = [
  {
    id: "trans",
    titleKey: "marketing:about.stand.trans.title",
    accent: true,
    paragraphKeys: [
      "marketing:about.stand.trans.p1",
      "marketing:about.stand.trans.p2",
      "marketing:about.stand.trans.p3",
    ],
    commitments: [
      {
        titleKey: "marketing:about.stand.trans.commitment.notADebate.title",
        bodyKey: "marketing:about.stand.trans.commitment.notADebate.body",
      },
      {
        titleKey: "marketing:about.stand.trans.commitment.exclusion.title",
        bodyKey: "marketing:about.stand.trans.commitment.exclusion.body",
        link: {
          labelKey: "marketing:about.stand.trans.commitment.exclusion.link",
          topic: "guidelinesExclusion",
        },
      },
      {
        titleKey: "marketing:about.stand.trans.commitment.selfId.title",
        bodyKey: "marketing:about.stand.trans.commitment.selfId.body",
        link: {
          labelKey: "marketing:about.stand.trans.commitment.selfId.link",
          topic: "transHealthcare",
        },
      },
    ],
  },
  {
    id: "palestine",
    titleKey: "marketing:about.stand.palestine.title",
    paragraphKeys: [
      "marketing:about.stand.palestine.p1",
      "marketing:about.stand.palestine.p2",
    ],
    commitments: [
      {
        titleKey: "marketing:about.stand.commitment.speech.title",
        bodyKey: "marketing:about.stand.commitment.speech.body",
        link: {
          labelKey: "marketing:about.stand.commitment.speech.link",
          topic: "guidelinesSpeech",
        },
      },
      {
        titleKey: "marketing:about.stand.commitment.money.title",
        bodyKey: "marketing:about.stand.commitment.money.body",
      },
      {
        titleKey: "marketing:about.stand.commitment.mutualAid.title",
        bodyKey: "marketing:about.stand.commitment.mutualAid.body",
        link: {
          labelKey: "marketing:about.stand.commitment.mutualAid.link",
          topic: "governanceAllocations",
        },
      },
    ],
  },
];

/**
 * Shorter positions, rendered as cards beneath the two full panels. Each card
 * carries a decorative icon, the same way the values grid does, so the three
 * read as distinct stances rather than one wall of text.
 */
export const STAND_POSITIONS: {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
  /** Opens `<AboutLinkModal>` on this topic rather than navigating away. */
  link?: { labelKey: string; topic: AboutLinkTopicId };
}[] = [
  {
    icon: FiBriefcase,
    titleKey: "marketing:about.stand.position.sexWork.title",
    bodyKey: "marketing:about.stand.position.sexWork.body",
  },
  {
    icon: FiGlobe,
    titleKey: "marketing:about.stand.position.migration.title",
    bodyKey: "marketing:about.stand.position.migration.body",
    link: {
      labelKey: "marketing:about.stand.position.migration.link",
      topic: "migration",
    },
  },
  {
    icon: FiHeart,
    titleKey: "marketing:about.stand.position.hiv.title",
    bodyKey: "marketing:about.stand.position.hiv.body",
    link: {
      labelKey: "marketing:about.stand.position.hiv.link",
      topic: "sexualHealth",
    },
  },
];
