import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  decrementPendingCount,
  inboxAfterAccept,
  inboxWithout,
  invalidateCreditedSurfaces,
  isSettledCreditError,
} from "./studioCreditCache";
import {
  toCreditInboxRowView,
  type StudioCreditInboxRowView,
  type StudioCreditInboxView,
} from "./studioDiscovery.adapters";
import {
  acceptStudioCredit,
  declineStudioCredit,
  deleteStudioCredit,
} from "./studioDiscovery.api";
import { onStudioAccessLost, studioKeys } from "./studioQueryKeys";

const SILENT = { silentError: true } as const;

/** The demo's credit endpoints, over the session's credit ledger. Demo
 *  only, so it loads on use. */
const demoCreditEndpoints = () => import("./studioDemoCreditReads");

interface InboxRowVariables {
  row: StudioCreditInboxRowView;
}

// Every inbox write patches the cache in onSuccess, so a confirm dialog
// hosted in the row stays mounted while the request runs.
function useInboxCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const patchInbox = (
    update: (inbox: StudioCreditInboxView) => StudioCreditInboxView,
  ) =>
    queryClient.setQueryData<StudioCreditInboxView>(
      studioKeys.creditInbox(demoMode),
      (inbox) => (inbox ? update(inbox) : inbox),
    );
  // The demo reads the credit ledger, so a refetch there agrees too.
  const refreshCount = () => {
    void queryClient.invalidateQueries({
      queryKey: studioKeys.creditPendingCount(demoMode),
    });
  };
  // A request someone else already answered leaves the list and the count.
  const dropSettledRequest = (
    error: unknown,
    row: StudioCreditInboxRowView,
  ) => {
    onStudioAccessLost(queryClient, error);
    if (!isSettledCreditError(error)) return;
    patchInbox((inbox) => inboxWithout(inbox, row.id));
    if (row.status === "pending") decrementPendingCount(queryClient, demoMode);
  };
  return {
    demoMode,
    queryClient,
    patchInbox,
    refreshCount,
    dropSettledRequest,
  };
}

/** POST /studio/credits/:id/accept. The row moves to Accepted, and the
 *  track, the album summary and Appears on refresh, where the credit now
 *  shows. */
export function useAcceptStudioCredit() {
  const { demoMode, queryClient, patchInbox, dropSettledRequest } =
    useInboxCache();
  return useMutation({
    meta: SILENT,
    mutationFn: async ({ row }: InboxRowVariables) => {
      const answer = demoMode
        ? (await demoCreditEndpoints()).demoStudioAcceptCredit(row.id)
        : await acceptStudioCredit(row.id);
      const accepted = toCreditInboxRowView(answer);
      if (!accepted) throw new Error("Unreadable credit");
      return accepted;
    },
    onSuccess: (accepted) => {
      patchInbox((inbox) => inboxAfterAccept(inbox, accepted));
      decrementPendingCount(queryClient, demoMode);
    },
    onError: (error, { row }) => dropSettledRequest(error, row),
    // The pending count is one of the credited surfaces.
    onSettled: (_result, _error, { row }) =>
      invalidateCreditedSurfaces(
        queryClient,
        row.track.id,
        row.release.id,
        demoMode,
      ),
  });
}

/** POST /studio/credits/:id/decline. Nothing is sent to the requester. */
export function useDeclineStudioCredit() {
  const {
    demoMode,
    queryClient,
    patchInbox,
    refreshCount,
    dropSettledRequest,
  } = useInboxCache();
  return useMutation({
    meta: SILENT,
    mutationFn: async ({ row }: InboxRowVariables): Promise<void> => {
      if (demoMode) {
        (await demoCreditEndpoints()).demoStudioDeclineCredit(row.id);
        return;
      }
      await declineStudioCredit(row.id);
    },
    onSuccess: (_result, { row }) => {
      patchInbox((inbox) => inboxWithout(inbox, row.id));
      decrementPendingCount(queryClient, demoMode);
    },
    onError: (error, { row }) => dropSettledRequest(error, row),
    // The requester's editor rows show the row as declined.
    onSettled: (_result, _error, { row }) => {
      refreshCount();
      void queryClient.invalidateQueries({
        queryKey: studioKeys.personaCredits(demoMode, row.track.id),
      });
    },
  });
}

/** DELETE /studio/credits/:id for an accepted credit; the track, the album
 *  summary and Appears on refresh, which drop it. */
export function useRemoveAcceptedStudioCredit() {
  const { demoMode, queryClient, patchInbox, dropSettledRequest } =
    useInboxCache();
  return useMutation({
    meta: SILENT,
    mutationFn: async ({ row }: InboxRowVariables): Promise<void> => {
      if (demoMode) {
        (await demoCreditEndpoints()).demoStudioRemoveAcceptedCredit(row.id);
        return;
      }
      await deleteStudioCredit(row.id);
    },
    onSuccess: (_result, { row }) =>
      patchInbox((inbox) => inboxWithout(inbox, row.id)),
    onError: (error, { row }) => dropSettledRequest(error, row),
    onSettled: (_result, _error, { row }) =>
      invalidateCreditedSurfaces(
        queryClient,
        row.track.id,
        row.release.id,
        demoMode,
      ),
  });
}
