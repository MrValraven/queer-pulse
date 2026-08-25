import {
  FiHome,
  FiHeart,
  FiShield,
  FiSearch,
  FiUsers,
  FiStar,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface CommunityBlock {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
}

export const COMMUNITY_PILLARS: CommunityBlock[] = [
  {
    icon: FiHome,
    titleKey: "marketing:communitiesAbout.what.rooms.title",
    bodyKey: "marketing:communitiesAbout.what.rooms.body",
  },
  {
    icon: FiHeart,
    titleKey: "marketing:communitiesAbout.what.kept.title",
    bodyKey: "marketing:communitiesAbout.what.kept.body",
  },
  {
    icon: FiShield,
    titleKey: "marketing:communitiesAbout.what.safe.title",
    bodyKey: "marketing:communitiesAbout.what.safe.body",
  },
];

export const COMMUNITY_STEPS: CommunityBlock[] = [
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
