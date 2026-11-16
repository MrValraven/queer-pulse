import type { ChipOption } from "../../shared/components/ui";
import type { ListingClaimDTO } from "./api/listingClaims.api";
import type { ListingClaimFilter } from "./ListingClaimRows";

/** One status chip. Pending carries the queue depth; Approved and Declined
 *  carry how many were decided on this page; All carries no count. Every chip
 *  stays pickable at zero, since each opens a line that names its status. */
export function filterChip(
  value: ListingClaimFilter,
  {
    label,
    count,
    formatCount,
  }: {
    label: string;
    count: number | undefined;
    formatCount: (count: number) => string;
  },
): ChipOption {
  if (value === "all" || count === undefined) {
    return { value, label, isUnavailable: false };
  }
  return {
    value,
    label,
    count,
    ariaLabel: `${label}, ${formatCount(count)}`,
    isUnavailable: false,
  };
}

/** The loaded queue with this page's decisions laid over it. A decided claim
 *  the refetched queue no longer returns is appended, so it stays on the
 *  Approved, Declined and All chips. */
export function mergeDecidedClaims(
  rows: ListingClaimDTO[],
  decidedClaims: Record<string, ListingClaimDTO>,
): ListingClaimDTO[] {
  const loadedIds = new Set(rows.map((row) => row.id));
  const decidedOffQueue = Object.values(decidedClaims).filter(
    (claim) => !loadedIds.has(claim.id),
  );
  return [
    ...rows.map((row) => decidedClaims[row.id] ?? row),
    ...decidedOffQueue,
  ];
}
