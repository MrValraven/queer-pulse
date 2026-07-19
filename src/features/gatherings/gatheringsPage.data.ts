import type { IconType } from "react-icons";
import { FiCalendar, FiCamera, FiHeart, FiTag } from "react-icons/fi";
import { gatheringPath, type SpotsLabel } from "./data";

/**
 * i18n Pattern A — the data file holds catalog *keys*, the component resolves
 * them with `t()`. Everything here is platform-authored chrome (a static nav
 * grid, a decorative neighbourhood rail), so it is translated; the mock event
 * records below keep their organizer-authored fields in English.
 */
export const WAYS: {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
  to: string;
  ctaKey: string;
}[] = [
  {
    icon: FiTag,
    titleKey: "gatherings:landing.ways.browse.title",
    bodyKey: "gatherings:landing.ways.browse.body",
    to: "/events",
    ctaKey: "gatherings:landing.ways.browse.cta",
  },
  {
    icon: FiCalendar,
    titleKey: "gatherings:landing.ways.calendar.title",
    bodyKey: "gatherings:landing.ways.calendar.body",
    to: "/calendar",
    ctaKey: "gatherings:landing.ways.calendar.cta",
  },
  {
    icon: FiHeart,
    titleKey: "gatherings:landing.ways.host.title",
    bodyKey: "gatherings:landing.ways.host.body",
    to: "/host",
    ctaKey: "gatherings:landing.ways.host.cta",
  },
  {
    icon: FiCamera,
    titleKey: "gatherings:landing.ways.recap.title",
    bodyKey: "gatherings:landing.ways.recap.body",
    to: "/gathering-recap",
    ctaKey: "gatherings:landing.ways.recap.cta",
  },
];

/**
 * Mock event records. `type`, `title` and `hood` are organizer-authored — in
 * live mode they arrive from `GET /events` and are never translated. The date
 * is held as a `Date` so the component can format it through `useFormat()`,
 * and the seat-count line reuses the shared `SpotsLabel` shape from `./data`
 * because in live mode the phrase is chrome and only the number comes over the
 * wire.
 */
export const FEATURED: {
  date: Date;
  type: string;
  title: string;
  hood: string;
  spots: SpotsLabel;
  to: string;
}[] = [
  {
    date: new Date(2026, 5, 6),
    type: "Supper Club",
    title: "Queer Supper Club №12",
    hood: "Mouraria",
    spots: { key: "gatherings:spots.seatsLeft", values: { count: 8 } },
    to: gatheringPath("supper-club-12"),
  },
  {
    date: new Date(2026, 5, 14),
    type: "Mixer",
    title: "Portfolio Night: Designers & Photographers",
    hood: "Príncipe Real",
    spots: { key: "gatherings:spots.going", values: { count: 32 } },
    to: "/event",
  },
  {
    date: new Date(2026, 5, 21),
    type: "Workshop",
    title: "Riso printing for beginners",
    hood: "Marvila",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 4 } },
    to: "/event",
  },
];

/**
 * Lisbon neighbourhood names are proper nouns and read identically in both
 * catalogs — they route through keys anyway so the rail stays uniform and the
 * one non-place entry ("Online") has somewhere to live.
 */
export const HOOD_KEYS = [
  "gatherings:hood.principeReal",
  "gatherings:hood.alfama",
  "gatherings:hood.marvila",
  "gatherings:hood.mouraria",
  "gatherings:hood.graca",
  "gatherings:hood.caisDoSodre",
  "gatherings:hood.arroios",
  "gatherings:hood.bairroAlto",
];
