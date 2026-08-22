import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBell,
  FiDroplet,
  FiEdit2,
  FiEye,
  FiHeart,
  FiImage,
  FiLock,
  FiMessageCircle,
  FiSettings,
  FiSliders,
  FiUserX,
} from "react-icons/fi";
import { SECTION_LABEL_KEYS } from "./editProfileNav.data";

export type PaneId =
  | "notifications"
  | "language"
  | "data"
  | "visibility"
  | "profile"
  | "profile-theme"
  | "accessibility"
  | "interests"
  | "blockedUsers"
  | "account"
  | "uploads"
  | "delete";

export type NavItem = {
  id: PaneId;
  icon: IconType;
  labelKey: string;
  danger?: boolean;
};

/**
 * i18n Pattern A — group/item labels are catalog keys; `SettingsPage.tsx`
 * resolves them with `t()`. `id`/`PaneId` stay stable identifiers (the
 * `?pane=` query param persists these), never translated strings.
 */
export const NAV: { groupKey: string; items: NavItem[] }[] = [
  {
    groupKey: "settings:nav.group.preferences",
    items: [
      {
        id: "notifications",
        icon: FiBell,
        labelKey: "settings:nav.item.notifications",
      },
      {
        id: "language",
        icon: FiMessageCircle,
        labelKey: "settings:nav.item.language",
      },
    ],
  },
  {
    groupKey: "settings:nav.group.privacyData",
    items: [
      { id: "data", icon: FiLock, labelKey: "settings:nav.item.data" },
      {
        id: "visibility",
        icon: FiEye,
        labelKey: "settings:nav.item.visibility",
      },
      // Sits here, next to `visibility`, rather than under Personalisation:
      // this pane holds the per-identity discoverability switches, and
      // "Shape what you see" is the wrong frame for a control that decides who
      // can find YOU. Deciding what others can see of you is a privacy choice.
      {
        id: "interests",
        icon: FiHeart,
        labelKey: "settings:nav.item.interests",
      },
      // A safety primitive, not a content preference, but lives in this
      // group alongside `visibility`/`data`: it's still a "who can reach me"
      // control, and there's no dedicated Safety group in this nav.
      {
        id: "blockedUsers",
        icon: FiUserX,
        labelKey: "settings:nav.item.blockedUsers",
      },
    ],
  },
  {
    groupKey: "settings:nav.group.account",
    items: [
      { id: "profile", icon: FiEdit2, labelKey: "settings:nav.item.profile" },
      {
        id: "account",
        icon: FiSettings,
        labelKey: "settings:nav.item.account",
      },
      { id: "uploads", icon: FiImage, labelKey: "settings:nav.item.uploads" },
    ],
  },
  {
    groupKey: "settings:nav.group.personalisation",
    items: [
      {
        id: "profile-theme",
        icon: FiDroplet,
        labelKey: "settings:nav.item.profileTheme",
      },
      {
        id: "accessibility",
        icon: FiSliders,
        labelKey: "settings:nav.item.accessibility",
      },
    ],
  },
  {
    groupKey: "settings:nav.group.dangerZone",
    items: [
      {
        id: "delete",
        icon: FiAlertTriangle,
        labelKey: "settings:nav.item.deleteAccount",
        danger: true,
      },
    ],
  },
];

/**
 * Resolves a `SettingsPage.tsx` change-tracking key (see `markChanged`) to the
 * i18n key whose text already names that field elsewhere in the app, for the
 * save bar's "what changed" disclosure (`SettingsSaveBar.tsx`). Reuses
 * existing labels — the profile pane's own section nav, the Visibility
 * pane's toggle labels — rather than duplicating copy; only the two Interests
 * fields (whose only existing labels are full questions, not list-friendly)
 * get a dedicated key.
 */
export function changeLabelKey(key: string): string {
  const sectionKey = SECTION_LABEL_KEYS[key];
  if (sectionKey) return sectionKey;
  switch (key) {
    case "visibility.audience":
      return "settings:visibility.section.whoCanSee";
    case "visibility.privateNetwork":
      return "settings:visibility.privateNetwork.label";
    case "visibility.featuredConsent":
      return "settings:visibility.featuredConsent.label";
    case "interests.identities":
      return "settings:changes.interests.identities";
    case "interests.lookingFor":
      return "settings:changes.interests.lookingFor";
    case "theme.appearance":
      return "settings:nav.item.profileTheme";
    // Kept for any stale key still in flight. The accessibility pane no longer
    // marks the page dirty: its two real preferences save on flip and the rest
    // are inert, so nothing there is ever pending a save.
    case "accessibility.preferences":
      return "settings:nav.item.accessibility";
    default:
      return key;
  }
}

export const TERMS = [
  { nameKey: "settings:terms.queer.name", defKey: "settings:terms.queer.def" },
  {
    nameKey: "settings:terms.cisgender.name",
    defKey: "settings:terms.cisgender.def",
  },
  {
    nameKey: "settings:terms.nonBinary.name",
    defKey: "settings:terms.nonBinary.def",
  },
  {
    nameKey: "settings:terms.twoSpirit.name",
    defKey: "settings:terms.twoSpirit.def",
  },
];
