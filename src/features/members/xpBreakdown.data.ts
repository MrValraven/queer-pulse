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
  FiBookOpen,
  FiClock,
  FiShield,
  FiCheckSquare,
  FiAward,
} from "react-icons/fi";

export interface XpSourceMeta {
  labelKey: string;
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
  profile: { labelKey: "members:badges.xpBreakdown.sources.profile", icon: FiUser },
  communities: {
    labelKey: "members:badges.xpBreakdown.sources.communities",
    icon: FiUsers,
  },
  personas: {
    labelKey: "members:badges.xpBreakdown.sources.personas",
    icon: FiLayers,
  },
  vouches: { labelKey: "members:badges.xpBreakdown.sources.vouches", icon: FiHeart },
  connections: {
    labelKey: "members:badges.xpBreakdown.sources.connections",
    icon: FiUserPlus,
  },
  events: { labelKey: "members:badges.xpBreakdown.sources.events", icon: FiCalendar },
  posts: { labelKey: "members:badges.xpBreakdown.sources.posts", icon: FiEdit3 },
  endorsements: {
    labelKey: "members:badges.xpBreakdown.sources.endorsements",
    icon: FiThumbsUp,
  },
  workshops: {
    labelKey: "members:badges.xpBreakdown.sources.workshops",
    icon: FiBookOpen,
  },
  tenure: { labelKey: "members:badges.xpBreakdown.sources.tenure", icon: FiClock },
  verified: { labelKey: "members:badges.xpBreakdown.sources.verified", icon: FiShield },
  gettingStarted: {
    labelKey: "members:badges.xpBreakdown.sources.gettingStarted",
    icon: FiCheckSquare,
  },
  badges: { labelKey: "members:badges.xpBreakdown.sources.badges", icon: FiAward },
};

export function xpSourceMetaFor(key: string): XpSourceMeta {
  return (
    XP_SOURCE_META[key] ?? {
      labelKey: "members:badges.xpBreakdown.sources.other",
      icon: FiAward,
    }
  );
}
