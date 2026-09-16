import {
  useQueryClient,
  useMutation,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  acceptGroupInvite,
  declineGroupInvite,
  joinGroupByToken,
  revokeGroupInvite,
  type GroupInviteSummary,
} from "./messages.api";
import { conversationToView } from "./messages.adapters";
import { GROUP_INVITES_KEY } from "./useGroupInvites";
import type { Conversation } from "../data";

/**
 * Section 8 (Groups): the invitee-facing writes, join by link, accept/
 * decline an invite, plus the owner/admin's revoke. See
 * `useGroupOwnershipMutations.ts` (the other half of
 * `useGroupManagementMutations.ts`) for transfer ownership, dissolve and the
 * invite-link lifecycle.
 *
 * Demo mode has a real (local-cache-only) branch for every hook here: no
 * backend call is made, but the Requests tab / join-preview caches are
 * patched the same way a live response would settle them, so a demo session
 * can accept, decline and join without a page-level simulation of its own.
 *
 * Every mutation below sets `meta: { silentError: true }` (see
 * `shared/api/errorHandling.ts`): the app-wide mutation-error toast is
 * suppressed, and the CALLING COMPONENT owns the error toast by resolving
 * `groupErrorMessage(error, t, fallback)` itself, so a coded refusal (e.g.
 * `INVITE_NOT_FOUND`, `GROUP_FULL`) gets its specific copy instead of a
 * generic one.
 */

/** POST /conversations/join/:token: the caller seats themself via an invite
 *  link (voluntary, the "who can add me" preference is never consulted).
 *  Resolves the newly-joined group's `Conversation` view (null in demo). The
 *  joined thread is BRAND NEW to this caller's cached inbox, so success
 *  invalidates `["conversations"]` wholesale rather than trying to patch a
 *  row that isn't there yet, exactly as `useStartConversation`/
 *  `useCreateGroup` (in `useMessageMutations.ts`) already do for the same
 *  reason. Also invalidates `["group-join-preview"]` (`useGroupJoinPreview`'s
 *  key) in both modes, so a join-link landing page still open in another tab
 *  re-fetches and flips from "Join" to "Open chat". */
export function useJoinGroupByToken() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Conversation | null, Error, string>({
    mutationFn: async (token) => {
      if (demoMode) return null;
      const dto = await joinGroupByToken(token);
      return conversationToView(dto, t);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["group-join-preview"] });
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    meta: { silentError: true },
  });
}

/** POST /conversations/group-invites/:inviteId/accept: the invitee seats
 *  themself. Same brand-new-row reasoning as `useJoinGroupByToken` above,
 *  plus the accepted invite must drop out of the Requests tab's pending
 *  list (`GROUP_INVITES_KEY`, from `useGroupInvites.ts`). Demo: drops the
 *  invite from the cached demo list directly, no group to actually join. */
export function useAcceptGroupInvite() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Conversation | null, Error, string>({
    mutationFn: async (inviteId) => {
      if (demoMode) return null;
      const dto = await acceptGroupInvite(inviteId);
      return conversationToView(dto, t);
    },
    onSuccess: (joined, inviteId) => {
      if (demoMode) {
        removeCachedGroupInvite(queryClient, inviteId);
        return;
      }
      if (!joined) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: [GROUP_INVITES_KEY] });
    },
    onError: () => {
      // INVITE_NOT_FOUND (already answered/revoked elsewhere): the stale row
      // still needs to drop out of this caller's Requests tab.
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [GROUP_INVITES_KEY] });
    },
    meta: { silentError: true },
  });
}

/** POST /conversations/group-invites/:inviteId/decline: the invitee turns
 *  the invite down. No group DTO to patch; only the Requests tab list
 *  changes. Demo: drops the invite from the cached demo list directly. */
export function useDeclineGroupInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (inviteId) => {
      if (demoMode) return;
      await declineGroupInvite(inviteId);
    },
    onSuccess: (_result, inviteId) => {
      if (demoMode) {
        removeCachedGroupInvite(queryClient, inviteId);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: [GROUP_INVITES_KEY] });
    },
    onError: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [GROUP_INVITES_KEY] });
    },
    meta: { silentError: true },
  });
}

/** Drops one invite out of the cached Requests-tab list for demo mode, the
 *  same shape `useGroupInvites` seeds it with (`[GROUP_INVITES_KEY, true]`,
 *  `demoMode` always `true` there). Mirrors `patchConversationInList`'s
 *  in-place `setQueryData` pattern instead of refetching a list that has no
 *  backend to refetch from in demo. */
function removeCachedGroupInvite(
  queryClient: QueryClient,
  inviteId: string,
): void {
  queryClient.setQueryData<GroupInviteSummary[]>(
    [GROUP_INVITES_KEY, true],
    (rows) => rows?.filter((row) => row.id !== inviteId),
  );
}

/** DELETE /conversations/:id/invites/:inviteId: owner/admin revokes a
 *  pending invite before it's answered. Patches the cached row's own
 *  `pendingInvites` in place (no full `Conversation` in the 204 response for
 *  `patchConversationInList` to take), instead of refetching the whole inbox
 *  for a one-array change. */
export function useRevokeGroupInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { conversationId: string; inviteId: string }>(
    {
      mutationFn: async ({ conversationId, inviteId }) => {
        if (demoMode) return;
        await revokeGroupInvite(conversationId, inviteId);
      },
      onSuccess: (_result, { conversationId, inviteId }) => {
        if (demoMode) return;
        queryClient.setQueriesData<Conversation[]>(
          { queryKey: ["conversations"] },
          (previous) =>
            previous?.map((conversation) =>
              conversation.id === conversationId && conversation.pendingInvites
                ? {
                    ...conversation,
                    pendingInvites: conversation.pendingInvites.filter(
                      (invite) => invite.id !== inviteId,
                    ),
                  }
                : conversation,
            ),
        );
      },
      meta: { silentError: true },
    },
  );
}
