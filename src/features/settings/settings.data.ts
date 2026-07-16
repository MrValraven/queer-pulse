import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBell,
  FiDroplet,
  FiEdit2,
  FiEye,
  FiHeart,
  FiLock,
  FiMessageCircle,
  FiPlayCircle,
  FiSettings,
  FiShield,
  FiSliders,
} from "react-icons/fi";

export type PaneId =
  | "notifications"
  | "language"
  | "data"
  | "visibility"
  | "profile"
  | "profile-theme"
  | "accessibility"
  | "interests"
  | "account"
  | "safety"
  | "simulations"
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
      { id: "safety", icon: FiShield, labelKey: "settings:nav.item.safety" },
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
      {
        id: "interests",
        icon: FiHeart,
        labelKey: "settings:nav.item.interests",
      },
    ],
  },
  {
    groupKey: "settings:nav.group.prototype",
    items: [
      {
        id: "simulations",
        icon: FiPlayCircle,
        labelKey: "settings:nav.item.simulations",
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
