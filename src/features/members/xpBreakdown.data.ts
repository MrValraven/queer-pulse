import type { IconType } from "react-icons";
import {
  FiUser,
  FiUsers,
  FiLayers,
  FiHeart,
  FiUserPlus,
  FiCalendar,
  FiEdit3,
  FiThumbsUp,
  FiClock,
  FiShield,
  FiCheckSquare,
  FiAward,
  FiTool,
  FiHome,
  FiBookOpen,
  FiMessageCircle,
  FiLifeBuoy,
} from "react-icons/fi";

export interface XpSourceMeta {
  labelKey: string;
  /** One plain sentence explaining what this source is, for a detailed
   *  breakdown view (e.g. `XpBreakdownModal`) rather than a compact list. */
  descKey: string;
  icon: IconType;
}

/**
 * i18n label-key indirection: `key` is the stable id the backend returns in
 * `RecognitionDTO.xpBreakdown` (mirrors `XpSourceKey` in the backend's
 * `recognition.scoring.ts`) — the UI label resolves via
 * `t(XP_SOURCE_META[key].labelKey)` at render, never stored pre-translated.
 * `xpSourceMetaFor` falls back to a generic entry for any future backend key
 * this map hasn't caught up with yet.
 */
export const XP_SOURCE_META: Record<string, XpSourceMeta> = {
  profile: {
    labelKey: "members:badges.xpBreakdown.sources.profile",
    descKey: "members:badges.xpBreakdown.sources.profileDesc",
    icon: FiUser,
  },
  communities: {
    labelKey: "members:badges.xpBreakdown.sources.communities",
    descKey: "members:badges.xpBreakdown.sources.communitiesDesc",
    icon: FiUsers,
  },
  personas: {
    labelKey: "members:badges.xpBreakdown.sources.personas",
    descKey: "members:badges.xpBreakdown.sources.personasDesc",
    icon: FiLayers,
  },
  vouches: {
    labelKey: "members:badges.xpBreakdown.sources.vouches",
    descKey: "members:badges.xpBreakdown.sources.vouchesDesc",
    icon: FiHeart,
  },
  connections: {
    labelKey: "members:badges.xpBreakdown.sources.connections",
    descKey: "members:badges.xpBreakdown.sources.connectionsDesc",
    icon: FiUserPlus,
  },
  events: {
    labelKey: "members:badges.xpBreakdown.sources.events",
    descKey: "members:badges.xpBreakdown.sources.eventsDesc",
    icon: FiCalendar,
  },
  posts: {
    labelKey: "members:badges.xpBreakdown.sources.posts",
    descKey: "members:badges.xpBreakdown.sources.postsDesc",
    icon: FiEdit3,
  },
  endorsements: {
    labelKey: "members:badges.xpBreakdown.sources.endorsements",
    descKey: "members:badges.xpBreakdown.sources.endorsementsDesc",
    icon: FiThumbsUp,
  },
  tenure: {
    labelKey: "members:badges.xpBreakdown.sources.tenure",
    descKey: "members:badges.xpBreakdown.sources.tenureDesc",
    icon: FiClock,
  },
  verified: {
    labelKey: "members:badges.xpBreakdown.sources.verified",
    descKey: "members:badges.xpBreakdown.sources.verifiedDesc",
    icon: FiShield,
  },
  gettingStarted: {
    labelKey: "members:badges.xpBreakdown.sources.gettingStarted",
    descKey: "members:badges.xpBreakdown.sources.gettingStartedDesc",
    icon: FiCheckSquare,
  },
  volunteering: {
    labelKey: "members:badges.xpBreakdown.sources.volunteering",
    descKey: "members:badges.xpBreakdown.sources.volunteeringDesc",
    icon: FiTool,
  },
  hosting: {
    labelKey: "members:badges.xpBreakdown.sources.hosting",
    descKey: "members:badges.xpBreakdown.sources.hostingDesc",
    icon: FiHome,
  },
  magazine: {
    labelKey: "members:badges.xpBreakdown.sources.magazine",
    descKey: "members:badges.xpBreakdown.sources.magazineDesc",
    icon: FiBookOpen,
  },
  answers: {
    labelKey: "members:badges.xpBreakdown.sources.answers",
    descKey: "members:badges.xpBreakdown.sources.answersDesc",
    icon: FiMessageCircle,
  },
  resources: {
    labelKey: "members:badges.xpBreakdown.sources.resources",
    descKey: "members:badges.xpBreakdown.sources.resourcesDesc",
    icon: FiLifeBuoy,
  },
  badges: {
    labelKey: "members:badges.xpBreakdown.sources.badges",
    descKey: "members:badges.xpBreakdown.sources.badgesDesc",
    icon: FiAward,
  },
};

export function xpSourceMetaFor(key: string): XpSourceMeta {
  return (
    XP_SOURCE_META[key] ?? {
      labelKey: "members:badges.xpBreakdown.sources.other",
      descKey: "members:badges.xpBreakdown.sources.otherDesc",
      icon: FiAward,
    }
  );
}
