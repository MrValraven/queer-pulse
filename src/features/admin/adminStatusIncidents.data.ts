import type { AdminStatusIncidentDTO } from "./api/adminStatusIncidents.api";

/**
 * Demo fallback for the status-incident desk. Deliberately EMPTY, like
 * `ADMIN_ORG_TIERS_DEMO`: this pane writes to a real, publicly readable
 * surface, and inventing plausible incidents for the demo build would put
 * fabricated outage history in front of anyone exploring it. The honest empty
 * state is what a reviewer sees, alongside the "demo mode writes nothing"
 * notice on the page.
 */
export const ADMIN_STATUS_INCIDENTS_DEMO: AdminStatusIncidentDTO[] = [];
