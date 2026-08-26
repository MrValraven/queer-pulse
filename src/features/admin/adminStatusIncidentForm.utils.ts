import type {
  PlatformIncidentSeverity,
  PlatformIncidentState,
  PlatformStatusComponentId,
} from "../system/api/platformStatus.api";
import type {
  AdminStatusIncidentDTO,
  StatusIncidentWriteBody,
} from "./api/adminStatusIncidents.api";
import {
  datetimeLocalValueToIso,
  isoToDatetimeLocalValue,
} from "./adminDateTimeLocal";

/** Local form state. `startedAt` is the `<input type="datetime-local">` shape. */
export interface StatusIncidentFormDraft {
  title: string;
  body: string;
  affectedComponents: PlatformStatusComponentId[];
  severity: PlatformIncidentSeverity;
  status: PlatformIncidentState;
  startedAt: string;
}

/**
 * Seeds the editor. A NEW incident starts at "now, ongoing, minor": an operator
 * writing one up is almost always describing something that just began, and
 * defaulting the severity low means a mistyped form never over-declares an
 * outage on a page members read while worried.
 */
export function draftFromIncident(
  incident: AdminStatusIncidentDTO | null,
): StatusIncidentFormDraft {
  if (!incident) {
    return {
      title: "",
      body: "",
      affectedComponents: [],
      severity: "minor",
      status: "open",
      startedAt: isoToDatetimeLocalValue(new Date().toISOString()),
    };
  }
  return {
    title: incident.title,
    body: incident.body,
    affectedComponents: [...incident.affectedComponents],
    severity: incident.severity,
    status: incident.status,
    startedAt: isoToDatetimeLocalValue(incident.startedAt),
  };
}

/**
 * Draft to request body. An emptied or unparsable `startedAt` falls back to now
 * rather than being sent as null: the column is NOT NULL, and an incident with
 * no start time would be undatable on the public page.
 */
export function draftToWriteBody(
  draft: StatusIncidentFormDraft,
): StatusIncidentWriteBody {
  return {
    title: draft.title.trim(),
    body: draft.body.trim(),
    affectedComponents: draft.affectedComponents,
    severity: draft.severity,
    status: draft.status,
    startedAt:
      datetimeLocalValueToIso(draft.startedAt) ?? new Date().toISOString(),
  };
}

/** Both fields carry the message members read, so both are required. */
export function isDraftComplete(draft: StatusIncidentFormDraft): boolean {
  return draft.title.trim().length > 0 && draft.body.trim().length > 0;
}
