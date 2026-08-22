import { useEffect, useRef } from "react";
import type { AdminVerificationRequestDTO } from "./api/adminVerifications.api";

/**
 * The Review-queue segment's next-in-queue mechanism, pulled out of
 * `ReviewQueueSegment` to keep that component under this repo's per-function
 * line budget (same reason as `useReviewQueueSelection`).
 *
 * Returns the `onDecided` handler for `VerificationRequestDrawer`: once a
 * request is decided it opens the row that followed it in the list AS IT
 * STOOD when the drawer was opened (`openOrderRef`, frozen on open rather
 * than re-read live, so a background refetch mid-review can't reshuffle what
 * "next" means underneath the reviewer), or closes the drawer when the
 * decided request was the last one.
 */
export function useReviewQueueNextInQueue({
  rows,
  selectedRequestId,
  onSelectRequest,
}: {
  rows: AdminVerificationRequestDTO[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string | null) => void;
}) {
  // The list order as it stood the moment the drawer opened for the request
  // currently inside it — deliberately NOT re-synced on every `rows` change,
  // only when `selectedRequestId` itself changes (a fresh open). This is
  // what `handleRequestDecided` below reads "next" from.
  const openOrderRef = useRef<string[]>([]);
  useEffect(() => {
    if (selectedRequestId) {
      openOrderRef.current = rows.map((row) => row.id);
    }
    // Intentionally omits `rows`: this snapshots the queue order once, when
    // a request is opened, not on every background refetch while it's open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequestId]);

  return function handleRequestDecided(decidedRequestId: string) {
    const order = openOrderRef.current;
    const index = order.indexOf(decidedRequestId);
    const nextId = index >= 0 ? (order[index + 1] ?? null) : null;
    onSelectRequest(nextId);
  };
}
