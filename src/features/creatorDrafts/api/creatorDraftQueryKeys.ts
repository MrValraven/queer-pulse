import type {
  CreatorDraftSlot,
  StoredCreatorDraftKind,
} from "./creatorDrafts.types";

/** Root of every creator draft query; sign-out removes the whole root. */
export const CREATOR_DRAFT_QUERY_ROOT = "creator-draft";

/** The cache key of one draft slot; `demoMode` keeps demo and live apart. */
export function creatorDraftQueryKey(
  slot: CreatorDraftSlot,
  demoMode: boolean,
): readonly [
  typeof CREATOR_DRAFT_QUERY_ROOT,
  StoredCreatorDraftKind,
  string,
  boolean,
] {
  return [
    CREATOR_DRAFT_QUERY_ROOT,
    slot.kind,
    slot.listingRef ?? "",
    demoMode,
  ] as const;
}
