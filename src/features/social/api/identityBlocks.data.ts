// src/features/social/api/identityBlocks.data.ts
import type { QueryClient } from "@tanstack/react-query";
import { daysAgoAt } from "../../messages/demoTimeline.data";
import type { IdentityBlockDTO } from "./identityBlocks.api";

/**
 * Demo identity blocks (PRD-376). One seeded row, a directory listing the
 * demo viewer blocked a week ago, so `BlockedIdentitiesSection` has
 * something to list and unblock with no network. Shaped exactly like
 * `IdentityBlockDTO` so `useIdentityBlocks`' demo cache entry needs no
 * adapter.
 */
export const DEMO_IDENTITY_BLOCKS: IdentityBlockDTO[] = [
  {
    id: "demo-identity-block-tasca-do-largo",
    identity: {
      id: "demo-identity-tasca-do-largo",
      kind: "listing",
      displayName: "Tasca do Largo",
      handle: "tasca-do-largo",
      avatarUrl: null,
    },
    createdAt: daysAgoAt(7, 12, 0),
  },
];

/** Query key for the member's identity block list. Carries `demoMode` so a
 *  mode switch never reads the other mode's cached rows, mirroring
 *  `blockedUsersQueryKey` (`settings/api/useBlockedUsers.ts`). Lives here
 *  (not in `useIdentityBlocks.ts`) so `useConversations.ts` can read the
 *  demo block list for its own filter (I-2) without an import cycle: this
 *  file has no dependency on the messages feature's API layer. */
export function identityBlocksQueryKey(demoMode: boolean) {
  return ["identity-blocks", demoMode] as const;
}

/** Demo mode's current identity-block list: whatever is already in the
 *  cache, or this seed when nothing has written to it yet this session.
 *  Both `useIdentityBlocks`'s own `queryFn` and `useConversations`' demo
 *  list filter read through this one function, so there is exactly one
 *  place that decides what "currently blocked, in demo" means. */
export function readDemoIdentityBlocks(
  queryClient: QueryClient,
): IdentityBlockDTO[] {
  return (
    queryClient.getQueryData<IdentityBlockDTO[]>(
      identityBlocksQueryKey(true),
    ) ?? DEMO_IDENTITY_BLOCKS
  );
}
