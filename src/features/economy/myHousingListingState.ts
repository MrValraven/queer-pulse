import type { MyHousingListingRow } from "./myHousingListings.data";

/**
 * PRD-444: true when the listing is off the board because the nightly expiry
 * sweep hid it, and the owner never said they found someone.
 *
 * The backend stores this as a marker the sweep writes alongside `filledAt`
 * and serves it as `isHiddenBySweep`, which this reads first. An owner who
 * marks an already-expired listing filled, or a sweep fill a moderator
 * re-approved with a fresh window, both read correctly from the marker.
 *
 * When an older backend omits the flag, this falls back to the timestamp rule:
 * the sweep stamps `filledAt` at or after `expiresAt`, while an owner's own
 * "Mark filled" usually lands inside the window.
 */
export function isHiddenByExpiry(
  row: Pick<MyHousingListingRow, "filledAt" | "expiresAt" | "isHiddenBySweep">,
): boolean {
  if (row.isHiddenBySweep !== undefined) return row.isHiddenBySweep;
  if (row.filledAt === null) return false;
  const filledTime = new Date(row.filledAt).getTime();
  const expiresTime = new Date(row.expiresAt).getTime();
  if (Number.isNaN(filledTime) || Number.isNaN(expiresTime)) return false;
  return filledTime >= expiresTime;
}
