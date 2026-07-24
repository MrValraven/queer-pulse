import type { IconType } from "react-icons";
import { FiCalendar, FiCamera, FiHeart, FiTag } from "react-icons/fi";
import { DEMO_GATHERING_SLUGS, gatheringRecapPath } from "./data";

/**
 * i18n Pattern A — the data file holds catalog *keys*, the component resolves
 * them with `t()`. Everything here is platform-authored chrome: a static "ways
 * to gather" nav grid and a decorative neighbourhood rail. The upcoming-events
 * strip is NOT here — it comes live from `useEvents()` (demo/live), never mock
 * records baked into the page.
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
    to: gatheringRecapPath(DEMO_GATHERING_SLUGS.recap),
    ctaKey: "gatherings:landing.ways.recap.cta",
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
