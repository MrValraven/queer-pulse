import {
  useQueryClient,
  useMutation,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  createGroupInviteLink,
  disableGroupInviteLink,
  dissolveGroup,
  transferGroupOwnership,
  type ConversationResponse,
} from "./messages.api";
import { conversationToView } from "./messages.adapters";
import { patchConversationInList } from "./useMessageMutations";
import type { Conversation } from "../data";

/**
 * Section 8 (Groups): ownership transfer, dissolve, and the invite-link
 * lifecycle (PRD-357, PRD-358). See `useGroupInviteMutations.ts` (the other
 * half of `useGroupManagementMutations.ts`) for the invitee-facing writes
 * (join by link, accept/decline/revoke an invite).
 *
 * Every hook here follows the exact shape of its neighbours in
 * `useMessageMutations.ts`: demo mode is a no-op (`null`/`undefined`, the
 * SERVER re-checks every capability on every call regardless, so the
 * client's can-flags are only ever a UI hint), and there is no page-level
 * demo simulation for these yet (no group-actions screen consumes them in
 * this build). Whoever wires the transfer-ownership / dissolve / invite-link
 * UI should add a demo branch there the same way `useMessageGroupActions.ts`
 * simulates add/remove/rename locally, rather than inventing a second demo
 * path here.
 *
 * Every mutation below sets `meta: { silentError: true }`: the app-wide
 * mutation-error toast is suppressed, and the CALLING COMPONENT owns the
 * error toast by resolving `groupErrorMessage(error, t, fallback)` itself,
 * so a coded refusal (e.g. `GROUP_DISSOLVED`) gets its specific copy.
 */

/** Patch a single field of one cached group row, for a write whose response
 *  carries only that field (not a full `ConversationResponse`): the
 *  invite-link create/disable calls below. A no-op if the row isn't cached
 *  yet, same fallback as `patchConversationInList`. */
function patchGroupField<K extends keyof Conversation>(
  queryClient: QueryClient,
  conversationId: string,
  key: K,
  value: Conversation[K],
): void {
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, [key]: value }
          : conversation,
      ),
  );
}

/** POST /conversations/:id/owner: owner transfers ownership; actor becomes
 *  admin. Returns the group's fresh `Conversation` view (null in demo), and
 *  live success patches it straight into every cached `["conversations"]`
 *  list via the shared `patchConversationInList`, same as `useUpdateGroup`. */
export function useTransferGroupOwnership() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<
    Conversation | null,
    Error,
    { conversationId: string; userId: string }
  >({
    mutationFn: async ({ conversationId, userId }) => {
      if (demoMode) return null;
      const dto: ConversationResponse = await transferGroupOwnership(
        conversationId,
        userId,
      );
      return conversationToView(dto, t);
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
    meta: { silentError: true },
  });
}

/** POST /conversations/:id/dissolve: owner ends the group for everyone
 *  (PRD-357). Returns the now-dissolved, read-only `Conversation` view;
 *  patches it in place the same way as `useTransferGroupOwnership` above. */
export function useDissolveGroup() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Conversation | null, Error, string>({
    mutationFn: async (conversationId) => {
      if (demoMode) return null;
      const dto = await dissolveGroup(conversationId);
      return conversationToView(dto, t);
    },
    onSuccess: (updated) => {
      if (demoMode || !updated) return;
      patchConversationInList(queryClient, updated);
    },
    meta: { silentError: true },
  });
}

/** POST /conversations/:id/invite-link: owner/admin creates or rotates the
 *  group's revocable invite link. Resolves the fresh token directly (null in
 *  demo) so the consuming screen can show/copy it with no extra cache read,
 *  and also patches it straight into the cached row's own `inviteToken`
 *  (there is no full DTO in the response to patch from otherwise). */
export function useCreateGroupInviteLink() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<string | null, Error, string>({
    mutationFn: async (conversationId) => {
      if (demoMode) return null;
      const { inviteToken } = await createGroupInviteLink(conversationId);
      return inviteToken;
    },
    onSuccess: (inviteToken, conversationId) => {
      if (demoMode || !inviteToken) return;
      patchGroupField(queryClient, conversationId, "inviteToken", inviteToken);
    },
    meta: { silentError: true },
  });
}

/** DELETE /conversations/:id/invite-link: owner/admin disables the group's
 *  invite link; patches the cached row's `inviteToken` back to `null`. No-op
 *  in demo. */
export function useDisableGroupInviteLink() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      if (demoMode) return;
      await disableGroupInviteLink(conversationId);
    },
    onSuccess: (_result, conversationId) => {
      if (demoMode) return;
      patchGroupField(queryClient, conversationId, "inviteToken", null);
    },
    meta: { silentError: true },
  });
}
