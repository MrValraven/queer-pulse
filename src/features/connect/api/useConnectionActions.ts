import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnections } from "../../../app/providers/ConnectionsProvider";
import { useSocial } from "../../../app/providers/SocialProvider";
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
  const { accept, decline, withdraw, sendRequest } = useConnections();
  const { toggleBlock } = useSocial();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["connections"] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
  }, [queryClient]);

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
      accept(ref.slug); // demo + optimistic local move
      await patch(ref, "accept");
    },
    [accept, patch],
  );

  /** Politely decline an incoming request. */
  const declineRequest = useCallback(
    async (ref: ConnectionRef) => {
      decline(ref.slug);
      await patch(ref, "decline");
    },
    [decline, patch],
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
    async (toSlug: string, message?: string) => {
      sendRequest(toSlug); // demo + optimistic local "sent"
      if (demoMode) return;
      await sendConnection({ toSlug, message });
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
