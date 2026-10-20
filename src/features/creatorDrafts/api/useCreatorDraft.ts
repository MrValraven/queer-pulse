import {
  queryOptions,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { creatorDraftQueryKey } from "./creatorDraftQueryKeys";
import { getCreatorDraft, isCreatorDraftFeatureOff } from "./creatorDrafts.api";
import type {
  CreatorDraftResponse,
  CreatorDraftSlot,
  StoredCreatorDraftKind,
} from "./creatorDrafts.types";

/** One slot's server draft as the editors read it. */
export interface CreatorDraftRead {
  draft: CreatorDraftResponse | null;
  /** True until the first read settles (success or error). */
  isLoading: boolean;
  isError: boolean;
  /** A fresh GET that also replaces the cached copy. */
  readFresh: () => Promise<CreatorDraftResponse | null>;
}

/** The live kinds whose feature-off 404 a read met, per query client. */
const featureOffKinds = new WeakMap<QueryClient, Set<StoredCreatorDraftKind>>();

/** True once a live read of this kind met the feature-off 404: autosave sends nothing for it. */
export function isCreatorDraftKindOff(
  queryClient: QueryClient,
  kind: StoredCreatorDraftKind,
): boolean {
  return featureOffKinds.get(queryClient)?.has(kind) ?? false;
}

function markCreatorDraftKindOff(
  queryClient: QueryClient,
  kind: StoredCreatorDraftKind,
): void {
  const kinds = featureOffKinds.get(queryClient) ?? new Set();
  kinds.add(kind);
  featureOffKinds.set(queryClient, kinds);
}

/** Reads a slot from the demo store or the wire; a feature-off 404 reads as an empty slot. */
async function readCreatorDraftSlot(
  slot: CreatorDraftSlot,
  demoMode: boolean,
  queryClient: QueryClient,
): Promise<CreatorDraftResponse | null> {
  if (demoMode) {
    const { demoGetCreatorDraft } = await import("./creatorDrafts.demoStore");
    return demoGetCreatorDraft(slot);
  }
  try {
    return await getCreatorDraft(slot);
  } catch (error) {
    if (!isCreatorDraftFeatureOff(error)) throw error;
    markCreatorDraftKindOff(queryClient, slot.kind);
    return null;
  }
}

/** The query of one slot, shared by the read hook and the autosave engine. */
export function creatorDraftQueryOptions(
  slot: CreatorDraftSlot,
  demoMode: boolean,
) {
  return queryOptions({
    queryKey: creatorDraftQueryKey(slot, demoMode),
    queryFn: ({ client }) => readCreatorDraftSlot(slot, demoMode, client),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: (failureCount: number, error: Error) =>
      failureCount < 1 && !isCreatorDraftFeatureOff(error),
    refetchOnWindowFocus: false,
    meta: { silentError: true },
  });
}

/** The creator's server draft for one slot; the react-query cache is the only client copy. */
export function useCreatorDraft(
  slot: CreatorDraftSlot,
  options?: { isEnabled?: boolean },
): CreatorDraftRead {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { kind, listingRef } = slot;
  const query = useQuery({
    ...creatorDraftQueryOptions({ kind, listingRef }, demoMode),
    enabled: options?.isEnabled ?? true,
  });
  const readFresh = useCallback(
    () =>
      queryClient.fetchQuery({
        ...creatorDraftQueryOptions({ kind, listingRef }, demoMode),
        staleTime: 0,
      }),
    [queryClient, kind, listingRef, demoMode],
  );
  return {
    draft: query.data ?? null,
    isLoading: query.isPending && query.fetchStatus !== "idle",
    isError: query.isError,
    readFresh,
  };
}
