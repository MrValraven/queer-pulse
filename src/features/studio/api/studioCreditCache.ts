import type { QueryClient } from "@tanstack/react-query";
import { isStudioNotFound, studioErrorCodeOf } from "./studio.api";
import type {
  StudioCreditInboxRowView,
  StudioCreditInboxView,
  StudioPersonaCreditOwnerRowView,
} from "./studioDiscovery.adapters";
import { studioKeys } from "./studioQueryKeys";

// Pure cache updates for the credit writes, shared by live and demo.

export function withOwnerRow(
  rows: StudioPersonaCreditOwnerRowView[],
  row: StudioPersonaCreditOwnerRowView,
): StudioPersonaCreditOwnerRowView[] {
  return [...rows.filter((existing) => existing.id !== row.id), row];
}

export function withoutOwnerRow(
  rows: StudioPersonaCreditOwnerRowView[],
  creditId: string,
): StudioPersonaCreditOwnerRowView[] {
  return rows.filter((row) => row.id !== creditId);
}

export function inboxAfterAccept(
  inbox: StudioCreditInboxView,
  acceptedRow: StudioCreditInboxRowView,
): StudioCreditInboxView {
  return {
    requests: inbox.requests.filter((row) => row.id !== acceptedRow.id),
    accepted: [
      acceptedRow,
      ...inbox.accepted.filter((row) => row.id !== acceptedRow.id),
    ],
  };
}

export function inboxWithout(
  inbox: StudioCreditInboxView,
  creditId: string,
): StudioCreditInboxView {
  return {
    requests: inbox.requests.filter((row) => row.id !== creditId),
    accepted: inbox.accepted.filter((row) => row.id !== creditId),
  };
}

/** The server says the credit is gone or was settled elsewhere (another
 *  co-owner answered first, or the inbox would now hide it and accept
 *  answers 404): the row leaves the list. */
export function isSettledCreditError(error: unknown): boolean {
  const code = studioErrorCodeOf(error);
  return (
    isStudioNotFound(error) ||
    code === "studio_credit_not_pending" ||
    code === "studio_credit_not_accepted"
  );
}

/** Lowers the cached pending count by one and stops at zero. */
export function decrementPendingCount(
  queryClient: QueryClient,
  demoMode: boolean,
): void {
  queryClient.setQueryData<number>(
    studioKeys.creditPendingCount(demoMode),
    (count) => Math.max(0, (count ?? 0) - 1),
  );
}

/** Every read an accepted or removed credit changes. The track page's
 *  chips, the album page's Credits summary, every cached Appears on (the
 *  writer does not know which persona page is cached), the track's owner
 *  rows, the credits inbox and its pending count (one member can hold both
 *  the requesting and the credited persona). The demo reads its credit
 *  ledger, so its mounted views refetch the same way. */
export function invalidateCreditedSurfaces(
  queryClient: QueryClient,
  trackId: string,
  releaseId: string,
  demoMode = false,
): void {
  for (const queryKey of [
    studioKeys.track(demoMode, trackId),
    studioKeys.release(demoMode, releaseId),
    studioKeys.appearsOnAll(demoMode),
    studioKeys.personaCredits(demoMode, trackId),
    studioKeys.creditInbox(demoMode),
    studioKeys.creditPendingCount(demoMode),
    // Related artists are drawn from shared credits.
    ["studio", "relatedArtists", demoMode],
  ]) {
    void queryClient.invalidateQueries({ queryKey });
  }
}
