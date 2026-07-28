export type ServiceStatus = "op" | "deg" | "out";

/**
 * i18n Pattern A. `id` is a stable identifier used for uptime-chart lookups
 * and demo "partial outage" logic (`buildBars` in StatusComponents.tsx) — it
 * must never change with locale, unlike the old bare `name` string that used
 * to double as both display text and lookup key.
 */
export interface Service {
  id: string;
  nameKey: string;
  descriptionKey: string;
  status: ServiceStatus;
}

/** Catalog keys for the "Operational / Degraded / Outage" pill, by status. */
export const STATUS_LABEL_KEY: Record<ServiceStatus, string> = {
  op: "system:status.serviceStatus.operational",
  deg: "system:status.serviceStatus.degraded",
  out: "system:status.serviceStatus.outage",
};

export const SERVICES: Service[] = [
  {
    id: "authentication",
    nameKey: "system:status.services.authentication.name",
    descriptionKey: "system:status.services.authentication.desc",
    status: "op",
  },
  {
    id: "messages",
    nameKey: "system:status.services.messages.name",
    descriptionKey: "system:status.services.messages.desc",
    status: "op",
  },
  {
    id: "forum",
    nameKey: "system:status.services.forum.name",
    descriptionKey: "system:status.services.forum.desc",
    status: "op",
  },
  {
    id: "eventsCalendar",
    nameKey: "system:status.services.eventsCalendar.name",
    descriptionKey: "system:status.services.eventsCalendar.desc",
    status: "op",
  },
  {
    id: "magazine",
    nameKey: "system:status.services.magazine.name",
    descriptionKey: "system:status.services.magazine.desc",
    status: "op",
  },
  {
    id: "search",
    nameKey: "system:status.services.search.name",
    descriptionKey: "system:status.services.search.desc",
    status: "op",
  },
  {
    id: "notifications",
    nameKey: "system:status.services.notifications.name",
    descriptionKey: "system:status.services.notifications.desc",
    status: "op",
  },
  {
    id: "fileStorage",
    nameKey: "system:status.services.fileStorage.name",
    descriptionKey: "system:status.services.fileStorage.desc",
    status: "op",
  },
];

export type IncidentStatus = "resolved" | "monitoring";

/**
 * i18n Pattern A. `date` is a real `Date` (not the old hardcoded "28 May
 * 2026" string) so `IncidentsSection` can localize it with `useFormat()` —
 * these incident write-ups are platform-authored postmortems (not user
 * content), so both the date and the copy are in scope for translation.
 */
export interface Incident {
  date: Date;
  titleKey: string;
  textKey: string;
  status: IncidentStatus;
  resolved: boolean;
}

export const INCIDENTS: Incident[] = [
  {
    date: new Date(2026, 4, 28),
    titleKey: "system:status.incidents.messageLatency.title",
    textKey: "system:status.incidents.messageLatency.text",
    status: "resolved",
    resolved: true,
  },
  {
    date: new Date(2026, 3, 11),
    titleKey: "system:status.incidents.searchRebuild.title",
    textKey: "system:status.incidents.searchRebuild.text",
    status: "resolved",
    resolved: true,
  },
  {
    date: new Date(2026, 1, 2),
    titleKey: "system:status.incidents.emailDelay.title",
    textKey: "system:status.incidents.emailDelay.text",
    status: "resolved",
    resolved: true,
  },
  {
    date: new Date(2025, 11, 19),
    titleKey: "system:status.incidents.dbUpgrade.title",
    textKey: "system:status.incidents.dbUpgrade.text",
    status: "resolved",
    resolved: true,
  },
];

/** Service ids shown in the 90-day uptime chart. */
export const UPTIME_SERVICE_IDS: string[] = [
  "authentication",
  "messages",
  "forum",
  "eventsCalendar",
];
