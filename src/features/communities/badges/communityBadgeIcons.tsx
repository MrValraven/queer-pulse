import type { IconType } from "react-icons";
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiClock,
  FiCoffee,
  FiCompass,
  FiFeather,
  FiFilm,
  FiFlag,
  FiHeadphones,
  FiHeart,
  FiLifeBuoy,
  FiMapPin,
  FiMessageCircle,
  FiMic,
  FiMoon,
  FiMusic,
  FiPenTool,
  FiSmile,
  FiStar,
  FiSun,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import {
  isCommunityBadgeIconKey,
  type CommunityBadgeIconKey,
} from "./communityBadges.catalog";

/** Key to icon for the 24 community badge icon keys (contract section 2). */
export const COMMUNITY_BADGE_ICONS: Record<CommunityBadgeIconKey, IconType> = {
  award: FiAward,
  star: FiStar,
  heart: FiHeart,
  sun: FiSun,
  moon: FiMoon,
  zap: FiZap,
  feather: FiFeather,
  coffee: FiCoffee,
  music: FiMusic,
  headphones: FiHeadphones,
  mic: FiMic,
  book_open: FiBookOpen,
  camera: FiCamera,
  film: FiFilm,
  pen_tool: FiPenTool,
  smile: FiSmile,
  compass: FiCompass,
  map_pin: FiMapPin,
  flag: FiFlag,
  calendar: FiCalendar,
  clock: FiClock,
  users: FiUsers,
  message_circle: FiMessageCircle,
  life_buoy: FiLifeBuoy,
};

/** An unknown key draws an award, so a newer backend never breaks the page. */
export function communityBadgeIcon(iconKey: string): IconType {
  return isCommunityBadgeIconKey(iconKey)
    ? COMMUNITY_BADGE_ICONS[iconKey]
    : FiAward;
}
