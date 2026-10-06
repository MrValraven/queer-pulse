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
 */
const savedBySlug = new Map<string, VolunteerOpportunity>();

/** Router state for a navigation that should pick up the handed-off save. */
export interface EditedOpportunityState {
  editedSlug: string;
}

export function rememberEditedOpportunity(
  opportunity: VolunteerOpportunity,
): EditedOpportunityState {
  savedBySlug.set(opportunity.slug, opportunity);
  return { editedSlug: opportunity.slug };
}

/** The handed-off save for `slug`, when the router state names that slug. */
export function editedOpportunityFor(
  slug: string | undefined,
  routerState: unknown,
): VolunteerOpportunity | undefined {
  const editedSlug = (routerState as Partial<EditedOpportunityState> | null)
    ?.editedSlug;
  if (!slug || editedSlug !== slug) return undefined;
  return savedBySlug.get(slug);
}
