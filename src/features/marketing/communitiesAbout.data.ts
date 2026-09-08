import {
  FiSearch,
  FiUsers,
  FiStar,
  FiKey,
  FiHeart,
  FiSlash,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface CommunityStep {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
}

export interface CommunityTrustPoint {
  icon: IconType;
  labelKey: string;
}

/** The three-beat journey (Find → Welcome → Belong) the explainer is built on. */
export const COMMUNITY_STEPS: CommunityStep[] = [
  {
    icon: FiSearch,
    titleKey: "marketing:communitiesAbout.how.find.title",
    bodyKey: "marketing:communitiesAbout.how.find.body",
  },
  {
    icon: FiUsers,
    titleKey: "marketing:communitiesAbout.how.welcome.title",
    bodyKey: "marketing:communitiesAbout.how.welcome.body",
  },
  {
    icon: FiStar,
    titleKey: "marketing:communitiesAbout.how.belong.title",
    bodyKey: "marketing:communitiesAbout.how.belong.body",
  },
];

/** One-line reassurances shown as a strip under the steps. */
export const COMMUNITY_TRUST_POINTS: CommunityTrustPoint[] = [
  { icon: FiKey, labelKey: "marketing:communitiesAbout.trust.invite" },
  { icon: FiHeart, labelKey: "marketing:communitiesAbout.trust.keeper" },
  { icon: FiSlash, labelKey: "marketing:communitiesAbout.trust.noAlgorithm" },
];
