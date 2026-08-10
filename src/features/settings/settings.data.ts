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
  FiPlayCircle,
  FiSettings,
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
  | "uploads"
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
      // Sits here, next to `visibility`, rather than under Personalisation:
      // this pane holds the per-identity discoverability switches, and
      // "Shape what you see" is the wrong frame for a control that decides who
      // can find YOU. Deciding what others can see of you is a privacy choice.
      {
        id: "interests",
        icon: FiHeart,
        labelKey: "settings:nav.item.interests",
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
  // Prototype simulations are a dev-only affordance: gate the whole group
  // behind Vite's DEV flag so it never renders in a production build. This also
  // keeps `simulations` out of the valid-pane list in SettingsPage, so a stray
  // `?pane=simulations` in prod falls back to the default pane.
  ...(import.meta.env.DEV
    ? [
        {
          groupKey: "settings:nav.group.prototype",
          items: [
            {
              id: "simulations" as const,
              icon: FiPlayCircle,
              labelKey: "settings:nav.item.simulations",
            },
          ],
        },
      ]
    : []),
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
