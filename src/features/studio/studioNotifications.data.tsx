import type { ReactNode } from "react";
import { FiHeart, FiClock, FiMonitor } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { Formatters } from "../../shared/i18n/format";
import type { TranslateOptions } from "../../shared/i18n/types";

export type NotifType = "reply" | "release" | "live";

/** Small euro-coin glyph for the "recap / round-up" system rows. */
const euroIcon: ReactNode = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={17}
    height={17}
    aria-hidden="true"
  >
    <circle cx={12} cy={12} r={9} />
    <path d="M15 9.5a4 4 0 1 0 0 5" />
    <path d="M7 11h6M7 13.5h5" />
  </svg>
);

export type NotifIcon =
  | { kind: "av"; initials: string; jade?: boolean }
  | { kind: "sys"; node: ReactNode }
  | { kind: "live"; node: ReactNode };

export type NotifAction = { labelKey: string };

/**
 * A `studioShowcase` catalog key plus its interpolation values. Euro figures
 * sit in `euroValues` as numbers so they format in the active locale.
 */
export type NotifText = {
  key: string;
  values?: TranslateOptions;
  euroValues?: Record<string, number>;
};

/** The interpolation values of a {@link NotifText}, euros formatted ("€2" / "2 €"). */
export function notifValues(
  text: NotifText,
  fmt: Formatters,
): TranslateOptions | undefined {
  if (!text.euroValues) return text.values;
  const values: TranslateOptions = { ...text.values };
  for (const [token, amount] of Object.entries(text.euroValues)) {
    const fractionDigits = Number.isInteger(amount) ? 0 : 2;
    values[token] = fmt.currency(amount, "EUR", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }
  return values;
}

export type NotifItem = {
  id: string;
  type: NotifType;
  to: string;
  unread: boolean;
  day: "today" | "week";
  time: NotifText;
  icon: NotifIcon;
  /** Rendered through `<Translation>`; the value may carry `<strong>` and `<em>` runs. */
  title: NotifText;
  replyKey?: string;
  meta: NotifText;
  action?: NotifAction;
};

// Newest first: "now", then minutes, hours, then the weekdays.
export const NOTIFICATIONS: NotifItem[] = [
  {
    id: "wednesday-set",
    type: "live",
    to: routes.studioLive,
    unread: true,
    day: "today",
    time: { key: "studioShowcase:notifications.time.now" },
    icon: { kind: "live", node: <FiMonitor /> },
    title: {
      key: "studioShowcase:notifications.items.wednesdaySetLive.title",
      values: { curator: "Sara Marques" },
    },
    meta: {
      key: "studioShowcase:notifications.items.wednesdaySetLive.meta",
      values: { listeners: 312, count: 3 },
    },
    action: { labelKey: "studio:notifications.action.joinRoom" },
  },
  {
    id: "mariana-reply",
    type: "reply",
    to: routes.studioLibrary,
    unread: true,
    day: "today",
    time: {
      key: "studioShowcase:notifications.time.minutes",
      values: { minutes: 22 },
    },
    icon: { kind: "av", initials: "MS" },
    title: {
      key: "studioShowcase:notifications.items.tipReply.title",
      values: { name: "Mariana Sol" },
      euroValues: { amount: 2 },
    },
    replyKey: "studioShowcase:notifications.items.marianaReply.reply",
    meta: {
      key: "studioShowcase:notifications.items.onTrack",
      values: { track: "Carta para a santa" },
    },
  },
  {
    id: "akin-single",
    type: "release",
    to: routes.studioAlbum,
    unread: true,
    day: "today",
    time: {
      key: "studioShowcase:notifications.time.hours",
      values: { hours: 3 },
    },
    icon: { kind: "av", initials: "AD", jade: true },
    title: {
      key: "studioShowcase:notifications.items.newSingle.title",
      values: { name: "Akin Diallo", track: "Salt water, slowly (live)" },
    },
    meta: {
      key: "studioShowcase:notifications.items.newSingle.meta",
      euroValues: { amount: 3 },
    },
  },
  {
    id: "okoye-collection",
    type: "release",
    to: routes.studioCollection,
    unread: false,
    day: "today",
    time: {
      key: "studioShowcase:notifications.time.hours",
      values: { hours: 6 },
    },
    icon: { kind: "av", initials: "DO" },
    title: {
      key: "studioShowcase:notifications.items.collectionAdd.title",
      values: { name: "D. Okoye", collection: "Songs for insomnia" },
    },
    meta: {
      key: "studioShowcase:notifications.items.collectionAdd.meta",
      values: { track: "Carta para a santa", count: 2 },
    },
  },
  {
    id: "pedro-reply",
    type: "reply",
    to: routes.studioLibrary,
    unread: false,
    day: "week",
    time: { key: "studioShowcase:notifications.time.weekday.tue" },
    icon: { kind: "av", initials: "PL", jade: true },
    title: {
      key: "studioShowcase:notifications.items.tipReply.title",
      values: { name: "Pedro Limão" },
      euroValues: { amount: 5 },
    },
    replyKey: "studioShowcase:notifications.items.pedroReply.reply",
    meta: {
      key: "studioShowcase:notifications.items.onTrackDaysAgo",
      values: { track: "Pedro on the 25", count: 5 },
    },
  },
  {
    id: "monthly-recap",
    type: "release",
    to: routes.studioReceipt,
    unread: false,
    day: "week",
    time: { key: "studioShowcase:notifications.time.weekday.mon" },
    icon: { kind: "sys", node: euroIcon },
    title: {
      key: "studioShowcase:notifications.items.monthlyRecap.title",
      values: { count: 9 },
      euroValues: { amount: 31 },
    },
    meta: {
      key: "studioShowcase:notifications.items.monthlyRecap.meta",
      euroValues: { sustainer: 7, direct: 24 },
    },
  },
  {
    id: "mariana-premiere",
    type: "live",
    to: routes.studioLive,
    unread: false,
    day: "week",
    time: { key: "studioShowcase:notifications.time.weekday.mon" },
    icon: { kind: "live", node: <FiClock /> },
    title: {
      key: "studioShowcase:notifications.items.premiereSet.title",
      values: { name: "Mariana Sol", album: "Cidade dos santos", count: 11 },
    },
    meta: { key: "studioShowcase:notifications.items.premiereSet.meta" },
    action: { labelKey: "studio:notifications.action.rsvp" },
  },
  {
    id: "solidarity-fund",
    type: "release",
    to: "/studio/solidarity-fund",
    unread: false,
    day: "week",
    time: { key: "studioShowcase:notifications.time.weekday.sun" },
    icon: { kind: "sys", node: <FiHeart /> },
    title: { key: "studioShowcase:notifications.items.solidarityFund.title" },
    meta: {
      key: "studioShowcase:notifications.items.solidarityFund.meta",
      euroValues: { amount: 1.8 },
    },
  },
];

export type Filter = "all" | NotifType;

export const FILTERS: { key: Filter; labelKey: string }[] = [
  { key: "all", labelKey: "studio:notifications.filter.all" },
  { key: "reply", labelKey: "studio:notifications.filter.reply" },
  { key: "release", labelKey: "studio:notifications.filter.release" },
  { key: "live", labelKey: "studio:notifications.filter.live" },
];
