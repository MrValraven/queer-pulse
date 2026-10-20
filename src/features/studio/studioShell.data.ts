import type { IconType } from "react-icons";
import { FiBookOpen, FiCompass, FiDisc, FiRadio } from "react-icons/fi";
import { RiHome5Line } from "react-icons/ri";
import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A. `labelKey` is chrome (a static nav grid); the component
 * resolves it with `t()`. `label` stays only as a stable React `key`.
 */
export interface RailLink {
  label: string;
  labelKey: string;
  to: string;
  end?: boolean;
  /** Drawn before the label, decorative (the label names the link). */
  icon?: IconType;
}

export const RAIL_MAIN: RailLink[] = [
  {
    label: "Home",
    labelKey: "studio:rail.main.home",
    to: routes.studio,
    end: true,
    icon: RiHome5Line,
  },
  {
    label: "The Wednesday set",
    labelKey: "studio:rail.main.wednesdaySet",
    to: routes.studioSet,
    icon: FiDisc,
  },
  {
    label: "Browse",
    labelKey: "studio:rail.main.browse",
    to: routes.studioSearch,
    icon: FiCompass,
  },
  {
    label: "Sheet music",
    labelKey: "studio:rail.main.sheetMusic",
    to: "/studio/sheet-store",
    icon: FiBookOpen,
  },
  {
    label: "Live broadcasts",
    labelKey: "studio:rail.main.liveBroadcasts",
    to: routes.studioLive,
    icon: FiRadio,
  },
];

/** Mock signed-in member's avatar initials (content, so it stays out of the catalog). */
export const CURRENT_MEMBER_INITIALS = "RM";

/** Studio's flat monthly sustain price, a number so it can go through `useFormat().currency()`. */
export const SUSTAIN_PRICE = 7;

/** Real `Date` the mock member became a sustainer, formatted via `useFormat()`. */
export const SUSTAINER_SINCE_DATE = new Date(2026, 1, 1);

/** This year's mock giving totals as numbers; the sentence lives in the catalog. */
export const YEARLY_GIVING = { amount: 312, artistCount: 47 };
