import type { IconType } from "react-icons";
import {
  FiActivity,
  FiBookOpen,
  FiCoffee,
  FiCompass,
  FiGlobe,
  FiHeart,
  FiHome,
  FiInfo,
  FiLayout,
  FiMapPin,
  FiMonitor,
  FiMusic,
  FiPenTool,
  FiScissors,
  FiShield,
  FiShoppingBag,
  FiTag,
  FiVideo,
} from "react-icons/fi";
import type {
  ListingAttributeGroupId,
  OTHER_ATTRIBUTE_GROUP_ID,
} from "./listingAttributes.data";

/**
 * The small icon beside each group name in a listing's "What's here" tag
 * rows. It gives the eye a landmark while scanning a long list of groups, so
 * a reader looking for food or pricing finds the row by shape before reading.
 * Keyed by the same ids as `LISTING_ATTRIBUTE_GROUP_LABEL_KEYS`, so a new
 * group is a compile error here until it gets an icon.
 */
const LISTING_ATTRIBUTE_GROUP_ICONS: Record<
  ListingAttributeGroupId | typeof OTHER_ATTRIBUTE_GROUP_ID,
  IconType
> = {
  around: FiMapPin,
  food: FiCoffee,
  nightlife: FiMusic,
  culture: FiBookOpen,
  space: FiLayout,
  grooming: FiScissors,
  fitness: FiActivity,
  health: FiHeart,
  design: FiPenTool,
  tech: FiMonitor,
  tours: FiCompass,
  "home-services": FiHome,
  onlineOffering: FiGlobe,
  onlineFood: FiCoffee,
  onlineOrdering: FiShoppingBag,
  onlineSessions: FiVideo,
  pricing: FiTag,
  other: FiInfo,
};

/** The icon for the "Inclusion practices" row, which is no attribute group. */
export const INCLUSION_PRACTICES_ICON: IconType = FiShield;

/** A group's icon. Group ids come from the server, so an id this build does
 *  not know (a newer server's) is looked up as an own key only and reads with
 *  the neutral info icon. */
export function attributeGroupIcon(groupId: string): IconType {
  return Object.hasOwn(LISTING_ATTRIBUTE_GROUP_ICONS, groupId)
    ? LISTING_ATTRIBUTE_GROUP_ICONS[
        groupId as keyof typeof LISTING_ATTRIBUTE_GROUP_ICONS
      ]
    : FiInfo;
}
