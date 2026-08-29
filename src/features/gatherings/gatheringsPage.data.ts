import type { IconType } from "react-icons";
import { FiCalendar, FiHeart, FiTag } from "react-icons/fi";

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
];
