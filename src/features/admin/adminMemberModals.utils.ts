export type RestrictDurationId = "24h" | "7d" | "30d" | "permanent";

export type RestrictReasonId =
  "harassment" | "misgendering" | "hostile" | "other";

/** FE duration id → the backend's `duration` string. `permanent` sends no
 *  duration, which the backend reads as a permanent ban. */
export const RESTRICT_DURATION_TO_API: Record<
  RestrictDurationId,
  string | undefined
> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  permanent: undefined,
};

/** FE reason id → a shared reason-catalogue code the backend accepts
 *  (`@IsIn(REASON_CODES)`). "Misgendering / deadnaming" maps to the catalogue's
 *  `discrimination` ("Discrimination or misgendering"); "hostile" to
 *  `harassment`. */
export const RESTRICT_REASON_TO_CODE: Record<RestrictReasonId, string> = {
  harassment: "harassment",
  misgendering: "discrimination",
  hostile: "harassment",
  other: "other",
};

/** The values the drawer needs to compose either the demo toast (labels) or the
 *  live `POST /admin/members/:id/restrict` body (ids). */
export interface RestrictSelection {
  durationId: RestrictDurationId;
  scopeId: "community" | "platform";
  reasonId: RestrictReasonId;
  note: string;
  durationLabel: string;
  scopeLabel: string;
}
