import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  useConnections,
  type ConnectionsState,
} from "../../../app/providers/useConnections";
import { useSocial } from "../../../app/providers/useSocial";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { reasonFor } from "../../../shared/api/errorMessage";
import {
  removeConnection,
  respondConnection,
  sendConnection,
  type ConnectionAction,
} from "./connections.api";

/**
 * Identifies which connection an action targets. Demo mode keys everything by
 * member `slug` (the providers' key); live mode needs the backend connection
 * `id` for PATCH /connections/:id and DELETE. Cards carry the slug always, and
 * the id whenever it came from the API — so both modes are covered.
 */
export interface ConnectionRef {
  slug: string;
  id?: string;
}

/**
 * Connection mutations, branching on demo mode.
 *
 * Demo mode drives the existing local providers (ConnectionsProvider /
 * SocialProvider) so the mock UI updates exactly as before — no network, no
 * breakage without a backend.
 *
 * Live mode calls the matching endpoint, then invalidates the connections list
 * (and the members directory, since accepting/blocking changes a member's card
 * state there too). Errors bubble to the caller so it can toast/retry.
 */
export function useConnectionActions() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { connected, incoming, sent, accept, decline, withdraw, sendRequest, restore } =
    useConnections();
  const { toggleBlock } = useSocial();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["connections"] });
    void queryClient.invalidateQueries({ queryKey: ["members"] });
  }, [queryClient]);

  // Snapshot the provider's relationship state before an optimistic move so a
  // failed live-mode PATCH can roll it back (demo never reaches the network, so
  // it never rolls back). Without this a rejected accept/decline left the member
  // showing as connected locally AND surfaced as an unhandled promise rejection.
  const snapshot = useCallback(
    (): ConnectionsState => ({ connected, incoming, sent }),
    [connected, incoming, sent],
  );

  const rollback = useCallback(
    (prev: ConnectionsState, error: unknown) => {
      restore(prev);
      showToast(reasonFor(error) ?? t("connect:toast.actionFailed"), "error");
    },
    [restore, showToast, t],
  );

  const patch = useCallback(
    async (ref: ConnectionRef, action: ConnectionAction) => {
      if (demoMode || !ref.id) return;
      await respondConnection(ref.id, action);
      invalidate();
    },
    [demoMode, invalidate],
  );

  /** Accept an incoming request. */
  const acceptRequest = useCallback(
    async (ref: ConnectionRef) => {
      const prev = snapshot();
      accept(ref.slug); // demo + optimistic local move
      try {
        await patch(ref, "accept");
      } catch (error) {
        rollback(prev, error);
      }
    },
    [accept, patch, snapshot, rollback],
  );

  /** Politely decline an incoming request. */
  const declineRequest = useCallback(
    async (ref: ConnectionRef) => {
      const prev = snapshot();
      decline(ref.slug);
      try {
        await patch(ref, "decline");
      } catch (error) {
        rollback(prev, error);
      }
    },
    [decline, patch, snapshot, rollback],
  );

  /** Withdraw a request you sent (delete the pending outgoing connection). */
  const withdrawRequest = useCallback(
    async (ref: ConnectionRef) => {
      withdraw(ref.slug);
      if (demoMode || !ref.id) return;
      await removeConnection(ref.id);
      invalidate();
    },
    [withdraw, demoMode, invalidate],
  );

  // Blocks now route through the dedicated /blocks resource owned by
  // SocialProvider (live: POST/DELETE /blocks/:slug + connection tear-down
  // invalidation; demo: local toggle). The legacy PATCH /connections/:id
  // action:block path is deprecated and no longer called.

  /** Block a member. */
  const block = useCallback(
    (ref: ConnectionRef) => {
      toggleBlock(ref.slug);
    },
    [toggleBlock],
  );

  /** Unblock a member. */
  const unblock = useCallback(
    (ref: ConnectionRef) => {
      toggleBlock(ref.slug);
    },
    [toggleBlock],
  );

  /** Remove an accepted connection. */
  const remove = useCallback(
    async (ref: ConnectionRef) => {
      if (demoMode || !ref.id) return;
      await removeConnection(ref.id);
      invalidate();
    },
    [demoMode, invalidate],
  );

  /** Send a new connection request to a member. */
  const send = useCallback(
    async (toSlug: string, message?: string, reason?: string) => {
      sendRequest(toSlug); // demo + optimistic local "sent"
      if (demoMode) return;
      await sendConnection({ toSlug, message, reason });
      invalidate();
    },
    [sendRequest, demoMode, invalidate],
  );

  return {
    acceptRequest,
    declineRequest,
    withdrawRequest,
    block,
    unblock,
    remove,
    send,
  };
}
