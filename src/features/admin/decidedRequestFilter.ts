import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * The buckets the Decided tab can be narrowed to. They follow the question a
 * reviewer comes back with: "who still has a link waiting on them?" An
 * approval counts as claimed only once its invite reads `used`; anything else
 * (active, expired, revoked, or no invite minted) still has a person on the
 * other side who has not arrived yet.
 */
export type DecidedRequestFilter = "all" | "unclaimed" | "claimed" | "declined";

/** Display order of the filter chips. `all` leads, so it is the default. */
export const DECIDED_REQUEST_FILTERS: readonly DecidedRequestFilter[] = [
  "all",
  "unclaimed",
  "claimed",
  "declined",
];

type DecidedRequestFields = Pick<JoinRequestView, "status" | "inviteStatus">;

/** Narrows a chip's raw string value back to a filter, so the change handler
 *  needs no cast. */
export function isDecidedRequestFilter(
  value: string,
): value is DecidedRequestFilter {
  return (DECIDED_REQUEST_FILTERS as readonly string[]).includes(value);
}

/** Whether one decided request belongs in the given bucket. */
export function matchesDecidedRequestFilter(
  row: DecidedRequestFields,
  filter: DecidedRequestFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unclaimed":
      return row.status === "approved" && row.inviteStatus !== "used";
    case "claimed":
      return row.status === "approved" && row.inviteStatus === "used";
    case "declined":
      return row.status === "declined";
  }
}

/** How many of the loaded rows fall in each bucket, for the chip counts. The
 *  caller passes every loaded row, before the text search narrows them, so a
 *  count never shrinks while someone is typing. */
export function countDecidedRequestFilters(
  rows: readonly DecidedRequestFields[],
): Record<DecidedRequestFilter, number> {
  const counts: Record<DecidedRequestFilter, number> = {
    all: 0,
    unclaimed: 0,
    claimed: 0,
    declined: 0,
  };
  for (const row of rows) {
    for (const filter of DECIDED_REQUEST_FILTERS) {
      if (matchesDecidedRequestFilter(row, filter)) counts[filter] += 1;
    }
  }
  return counts;
}
