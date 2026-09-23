// src/features/social/api/useIdentityBlocks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { MAILBOXES_QUERY_KEY_PREFIX } from "../../../shared/api/mailboxViewer";
import type { IdentityKind } from "../../../shared/contracts/contracts";
import { UNREAD_COUNT_KEY } from "../../messages/api/useConversations";
import {
  blockIdentity,
  getIdentityBlocks,
  unblockIdentity,
  type IdentityBlockDTO,
} from "./identityBlocks.api";
import {
  DEMO_IDENTITY_BLOCKS,
  identityBlocksQueryKey,
  readDemoIdentityBlocks,
} from "./identityBlocks.data";

// Re-exported for the existing surface: both live in `identityBlocks.data.ts`
// (not here) so `useConversations.ts` can read the demo block list for its
// own filter (I-2) with no import cycle back through this file.
export { identityBlocksQueryKey, readDemoIdentityBlocks };

const EMPTY_IDENTITY_BLOCKS: IdentityBlockDTO[] = [];

export interface IdentityBlocksResult {
  identityBlocks: IdentityBlockDTO[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  isLoading: boolean;
  /** True when the live fetch failed. */
  hasFailed: boolean;
  refetch: () => void;
}

/**
 * The member's identity block list (a business, persona or company;
 * `/identity-blocks`), for `BlockedIdentitiesSection`. Demo mode's `queryFn`
 * reads `readDemoIdentityBlocks` (the cache if something already wrote to
 * it, the seed otherwise), so a refetch always answers with the current
 * state. The query itself never goes stale and is never garbage-collected
 * (`staleTime`/`gcTime: Infinity`), so a block made from a thread with no
 * `BlockedIdentitiesSection` mounted to observe it survives a remount any
 * time later in the session. Every mutation below writes back into that same
 * cache entry with no network, so the list reflects a block or unblock
 * instantly. Live mode reads `GET /identity-blocks`.
 */
export function useIdentityBlocks(): IdentityBlocksResult {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const query = useQuery<IdentityBlockDTO[]>({
    queryKey: identityBlocksQueryKey(demoMode),
    queryFn: () =>
      demoMode
        ? Promise.resolve(readDemoIdentityBlocks(queryClient))
        : getIdentityBlocks().then((page) => page.items),
    staleTime: demoMode ? Infinity : undefined,
    gcTime: demoMode ? Infinity : undefined,
  });
  return {
    identityBlocks: query.data ?? EMPTY_IDENTITY_BLOCKS,
    isLoading: query.isPending,
    hasFailed: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** Every mutation below shares this invalidation: the conversation list, the
 *  unread badge and each mailbox's own unread count, because a block or
 *  unblock closes or reopens every thread between the member and that
 *  identity, for both sides. Demo mode skips its OWN `identity-blocks` entry
 *  here: the mutations below already write the new list straight into that
 *  cache entry with `setQueryData`, and `readDemoIdentityBlocks` reads that
 *  same entry back, so this invalidation would only trigger a redundant
 *  refetch of the value already sitting there. */
function invalidateAfterIdentityBlockChange(
  queryClient: ReturnType<typeof useQueryClient>,
  demoMode: boolean,
) {
  void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
  void queryClient.invalidateQueries({
    queryKey: MAILBOXES_QUERY_KEY_PREFIX,
  });
  if (!demoMode) {
    void queryClient.invalidateQueries({
      queryKey: identityBlocksQueryKey(false),
    });
  }
}

/** The identity being blocked, enough to render a demo row with no network. */
export interface IdentityBlockTarget {
  identityId: string;
  kind: IdentityKind;
  /** Full display name, shown on the block list exactly as given. */
  displayName: string;
  handle?: string | null;
  avatarUrl?: string | null;
}

/** Block a business, persona or company: `POST /identity-blocks/:identityId`,
 *  idempotent server-side. Used by `useIdentityBlockAction` (from inside a
 *  thread) and directly reachable from nowhere else today. */
export function useBlockIdentity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<IdentityBlockDTO, Error, IdentityBlockTarget>({
    // The caller (`useIdentityBlockAction`) always shows its own error
    // toast; this silences the global handler's duplicate (it still logs).
    meta: { silentError: true },
    mutationFn: async (target) => {
      if (demoMode) {
        const block: IdentityBlockDTO = {
          id: `demo-identity-block-${target.identityId}`,
          identity: {
            id: target.identityId,
            kind: target.kind,
            displayName: target.displayName,
            handle: target.handle ?? null,
            avatarUrl: target.avatarUrl ?? null,
          },
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<IdentityBlockDTO[]>(
          identityBlocksQueryKey(true),
          (current) => [
            block,
            ...(current ?? DEMO_IDENTITY_BLOCKS).filter(
              (entry) => entry.identity.id !== target.identityId,
            ),
          ],
        );
        return block;
      }
      return blockIdentity(target.identityId);
    },
    onSuccess: () => invalidateAfterIdentityBlockChange(queryClient, demoMode),
  });
}

/** Unblock a business, persona or company: `DELETE
 *  /identity-blocks/:identityId`, idempotent server-side. Takes the
 *  identity's own id (`IdentityBlockDTO.identity.id`), the value the block
 *  row's own `id` never carries. Used by `BlockedIdentitiesSection`'s
 *  Unblock button and by `useIdentityBlockAction`'s Undo action. */
export function useUnblockIdentity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    // The caller (`BlockedIdentitiesSection`, `useIdentityBlockAction`'s
    // Undo) always shows its own error toast; this silences the global
    // handler's duplicate (it still logs).
    meta: { silentError: true },
    mutationFn: async (identityId) => {
      if (demoMode) {
        queryClient.setQueryData<IdentityBlockDTO[]>(
          identityBlocksQueryKey(true),
          (current) =>
            (current ?? DEMO_IDENTITY_BLOCKS).filter(
              (entry) => entry.identity.id !== identityId,
            ),
        );
        return;
      }
      await unblockIdentity(identityId);
    },
    onSuccess: () => invalidateAfterIdentityBlockChange(queryClient, demoMode),
  });
}
