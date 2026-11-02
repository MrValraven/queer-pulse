import type { MemberRole } from "../auth/api/auth.api";

/** The views on the directory admin page (`/admin/listings`). */
export type ListingViewTab =
  "queue" | "editSuggestions" | "claims" | "drafts" | "partners";

/** What a Moderator or a `directory_moderator` grant holder can open. */
const REVIEW_VIEWS: readonly ListingViewTab[] = [
  "queue",
  "editSuggestions",
  "claims",
];

/** Unfinished drafts and directory partners are Admin only: their routes are
 *  `@Roles(Admin)`, so nobody else is offered a tab the API refuses. */
const ADMIN_VIEWS: readonly ListingViewTab[] = [
  ...REVIEW_VIEWS,
  "drafts",
  "partners",
];

/** The views this viewer may open, in switcher order. Demo mode shows every
 *  view. */
export function listingViewsFor({
  role,
  isDemoMode,
}: {
  role: MemberRole | null;
  isDemoMode: boolean;
}): ListingViewTab[] {
  return isDemoMode || role === "admin" ? [...ADMIN_VIEWS] : [...REVIEW_VIEWS];
}
