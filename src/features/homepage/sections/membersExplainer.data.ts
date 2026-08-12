import { FiHeart, FiShield, FiUnlock } from "react-icons/fi";
import type { IconType } from "react-icons";

/** One "why members-only" pillar shown in the explainer modal. */
export interface MemberPillar {
  id: string;
  Icon: IconType;
  titleKey: string;
  bodyKey: string;
}

/** The three reasons the member directory is invite-only, in display order. */
export const MEMBER_PILLARS: MemberPillar[] = [
  {
    id: "vouched",
    Icon: FiHeart,
    titleKey: "homepage:membersExplainer.pillars.vouched.title",
    bodyKey: "homepage:membersExplainer.pillars.vouched.body",
  },
  {
    id: "inside",
    Icon: FiUnlock,
    titleKey: "homepage:membersExplainer.pillars.inside.title",
    bodyKey: "homepage:membersExplainer.pillars.inside.body",
  },
  {
    id: "safe",
    Icon: FiShield,
    titleKey: "homepage:membersExplainer.pillars.safe.title",
    bodyKey: "homepage:membersExplainer.pillars.safe.body",
  },
];
