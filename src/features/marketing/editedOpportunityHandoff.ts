import type { VolunteerOpportunity } from "./volunteerOpportunities";

/**
 * The edit flow's freshly saved opportunity, handed to the detail page so it
 * shows the save at once (load-bearing in demo mode, which has no server to
 * refetch from).
 *
 * It travels through this module because the view-model holds React elements
 * (`<b>` stat values, the translating chrome from `volunteerChrome.tsx`), and
 * `history.pushState` structured-clones router state, which throws a
 * `DataCloneError` on an element. Router state carries only the serialisable
 * `{ editedSlug }` marker; the detail page reads the entry here when that
 * marker names its own slug.
 *
 * Reads leave the entry in place: React may run a state initialiser twice in
 * development, and a destructive read would hand the second run nothing. The
 * next save of the same slug overwrites it.
 *
 * Because the entry outlives the visit, a history-back to the detail page
 * finds it again. `isEditedOpportunityCurrent` decides whether it still
 * applies, so in live mode it bridges only until the server's copy catches up.
 */
export interface EditedOpportunityEntry {
  opportunity: VolunteerOpportunity;
  /** `Date.now()` at the save, compared with the query's `dataUpdatedAt`. */
  savedAt: number;
}

const savedBySlug = new Map<string, EditedOpportunityEntry>();

/** Router state for a navigation that should pick up the handed-off save. */
export interface EditedOpportunityState {
  editedSlug: string;
}

export function rememberEditedOpportunity(
  opportunity: VolunteerOpportunity,
): EditedOpportunityState {
  savedBySlug.set(opportunity.slug, { opportunity, savedAt: Date.now() });
  return { editedSlug: opportunity.slug };
}

/** The handed-off save for `slug`, when the router state names that slug. */
export function editedOpportunityFor(
  slug: string | undefined,
  routerState: unknown,
): EditedOpportunityEntry | undefined {
  const editedSlug = (routerState as Partial<EditedOpportunityState> | null)
    ?.editedSlug;
  if (!slug || editedSlug !== slug) return undefined;
  return savedBySlug.get(slug);
}

/**
 * Whether the handed-off save should still cover the detail query's copy.
 *
 * Demo mode has no server copy to wait for, so the save always applies there.
 * In live mode the save mutation invalidates the detail, so the query
 * refetches; the handoff covers the copy only while that copy predates the
 * save. Once a fetch lands after the save, the server's copy shows, and a
 * later history-back to this entry shows the cached server copy (refetched
 * on mount when stale) with the remembered save left unused.
 */
export function isEditedOpportunityCurrent(
  entry: EditedOpportunityEntry | undefined,
  { isDemoMode, dataUpdatedAt }: { isDemoMode: boolean; dataUpdatedAt: number },
): entry is EditedOpportunityEntry {
  if (!entry) return false;
  return isDemoMode || dataUpdatedAt < entry.savedAt;
}
