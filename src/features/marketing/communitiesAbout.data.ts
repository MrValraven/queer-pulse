import { FiSearch, FiUsers, FiStar } from "react-icons/fi";
import type { IconType } from "react-icons";

export interface CommunityStep {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
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
