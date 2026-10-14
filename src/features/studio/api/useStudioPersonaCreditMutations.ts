import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioTrackView } from "./studio.adapters";
import type { StudioCreditRole } from "./studio.types";
import {
  invalidateCreditedSurfaces,
  isSettledCreditError,
  withOwnerRow,
  withoutOwnerRow,
} from "./studioCreditCache";
import {
  toPersonaCreditOwnerRows,
  type StudioPersonaCreditOwnerRowView,
} from "./studioDiscovery.adapters";
import {
  createStudioTrackPersonaCredit,
  deleteStudioTrackPersonaCredit,
} from "./studioDiscovery.api";
import { onStudioAccessLost, studioKeys } from "./studioQueryKeys";

const SILENT = { silentError: true } as const;

/** The demo's credit endpoints, over the session's credit ledger (which
 *  holds the dismissed declined rows too). Demo only, so it loads on use. */
const demoCreditEndpoints = () => import("./studioDemoCreditReads");

export interface AddStudioPersonaCreditVariables {
  trackId: string;
  releaseId: string;
  handle: string;
  role: StudioCreditRole;
}

export interface RemoveStudioPersonaCreditVariables {
  trackId: string;
  releaseId: string;
  creditId: string;
}

/** POST /studio/tracks/:id/persona-credits. The row lands as Pending. */
export function useAddStudioPersonaCredit() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    meta: SILENT,
    mutationFn: async ({
      trackId,
      releaseId,
      handle,
      role,
    }: AddStudioPersonaCreditVariables): Promise<StudioPersonaCreditOwnerRowView> => {
      const created = demoMode
        ? (await demoCreditEndpoints()).demoStudioAddTrackPersonaCredit(
            trackId,
            releaseId,
            { handle, role },
          )
        : await createStudioTrackPersonaCredit(trackId, { handle, role });
      const [row] = toPersonaCreditOwnerRows([created]);
      if (!row) throw new Error("Unreadable persona credit");
      return row;
    },
    onSuccess: (row, { trackId }) => {
      queryClient.setQueryData<StudioPersonaCreditOwnerRowView[]>(
        studioKeys.personaCredits(demoMode, trackId),
        (rows) => withOwnerRow(rows ?? [], row),
      );
    },
    onError: (error) => onStudioAccessLost(queryClient, error),
    // One member can hold both the release's persona and the credited one,
    // so the new request can land in their own inbox.
    onSettled: () => {
      for (const queryKey of [
        studioKeys.creditInbox(demoMode),
        studioKeys.creditPendingCount(demoMode),
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

/** DELETE from the release side: a pending or accepted row goes; a declined
 *  row is dismissed and leaves the list. The row leaves the cache in
 *  onSuccess, so a confirm dialog hosted in the row stays mounted while the
 *  request runs. */
export function useRemoveStudioPersonaCredit() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  // The row leaves the editor, and an accepted credit's chip leaves the
  // cached track page with it.
  function forgetRow({
    trackId,
    creditId,
  }: RemoveStudioPersonaCreditVariables) {
    const rowsKey = studioKeys.personaCredits(demoMode, trackId);
    const rows =
      queryClient.getQueryData<StudioPersonaCreditOwnerRowView[]>(rowsKey) ??
      [];
    const removed = rows.find((row) => row.id === creditId);
    queryClient.setQueryData(rowsKey, withoutOwnerRow(rows, creditId));
    if (!removed) return;
    queryClient.setQueryData<StudioTrackView>(
      studioKeys.track(demoMode, trackId),
      (track) =>
        track
          ? {
              ...track,
              personaCredits: track.personaCredits.filter(
                (credit) =>
                  credit.persona.id !== removed.persona.id ||
                  credit.role !== removed.role,
              ),
            }
          : track,
    );
  }

  return useMutation({
    meta: SILENT,
    mutationFn: async ({
      trackId,
      creditId,
    }: RemoveStudioPersonaCreditVariables): Promise<void> => {
      if (demoMode) {
        (await demoCreditEndpoints()).demoStudioRemoveTrackPersonaCredit(
          trackId,
          creditId,
        );
        return;
      }
      await deleteStudioTrackPersonaCredit(trackId, creditId);
    },
    onSuccess: (_result, variables) => forgetRow(variables),
    onError: (error, variables) => {
      onStudioAccessLost(queryClient, error);
      if (isSettledCreditError(error)) forgetRow(variables);
    },
    onSettled: (_result, _error, { trackId, releaseId }) =>
      invalidateCreditedSurfaces(queryClient, trackId, releaseId, demoMode),
  });
}
