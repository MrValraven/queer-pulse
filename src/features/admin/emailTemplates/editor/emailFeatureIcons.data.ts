import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiMapPin,
  FiMessageCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import type { EmailFeatureIcon } from "../emailTemplate.types";

/** The editor's stand-in for each hosted email icon, shown beside the picker
 *  so the admin sees which picture a feature row will wear. */
export const EMAIL_FEATURE_ICON_GLYPHS: Record<EmailFeatureIcon, IconType> = {
  communities: FiUsers,
  gatherings: FiCalendar,
  directory: FiMapPin,
  messages: FiMessageCircle,
  magazine: FiBookOpen,
  safety: FiShield,
};
