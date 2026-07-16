import { orgColors } from "./data";

// Static copy + filter categories for the Events list page.
// The events themselves come from `calendarEvents` in ./data.
//
// i18n Pattern A — the eyebrow/subtitle and every category label are
// platform-authored chrome, so this file holds catalog *keys*; `EventsPage`
// resolves them with `t()`. `dot`/`colors` stay untouched — they're styling.

export const eventsHeader = {
  eyebrowKey: "gatherings:events.eyebrow",
  subtitleKey: "gatherings:events.subtitle",
};

export interface EventCategory {
  key: string;
  labelKey: string;
  /** Dot colour for the filter chip. */
  dot: string;
  /** Event `orgColor` values this category matches. Omitted for "All". */
  colors?: string[];
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    key: "all",
    labelKey: "gatherings:events.categoryAll",
    dot: orgColors.queerpulse,
  },
  {
    key: "queerpulse",
    labelKey: "gatherings:events.categoryQueerpulse",
    dot: orgColors.queerpulse,
    colors: [orgColors.queerpulse],
  },
  {
    key: "community",
    labelKey: "gatherings:events.categoryCommunity",
    dot: orgColors.community,
    colors: [orgColors.community],
  },
  {
    key: "partners",
    labelKey: "gatherings:events.categoryPartners",
    dot: orgColors.ilga,
    colors: [orgColors.ilga, orgColors.partner],
  },
];
