// Static copy for the Events list page. The events themselves come from
// `calendarEvents` in ./data.
//
// i18n Pattern A — the eyebrow/subtitle are platform-authored chrome, so this
// file holds catalog *keys*; the page resolves them with `t()`.
//
// The org filter categories that used to live here are gone (LOC-17). They
// matched an event's `orgColor`, a colour the DEMO registry assigns and the
// API never sends, so on a live board the chips filtered on a value that was
// not there. Browse now filters on real columns (date, neighbourhood, type,
// cost, free text) server-side — see `hub/browseFilters.ts`.

export const eventsHeader = {
  eyebrowKey: "gatherings:events.eyebrow",
  subtitleKey: "gatherings:events.subtitle",
};
