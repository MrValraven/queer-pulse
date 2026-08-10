import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import { isContentSection } from "./subprofile-kinds";

// Mirrors `subprofiles.data.ts`'s `MIN_BIO`/`MIN_CONTENT_ITEMS` (contract C5)
// as local literals rather than importing that demo-only module into a path
// that also runs live (see the `queerpulse-demo-persona-leak` pattern).
const MIN_BIO_LENGTH = 80;
const MIN_CONTENT_ITEMS = 3;

/** The fields this estimate reads, on either view model it accepts — the
 *  owner's own `SubprofileView` (dashboard card ring, editor) or the public
 *  `PublicSubprofileView` (owner-previewing-own-draft banner). Both shapes
 *  declare these six fields identically (same types), so a plain union of
 *  the two `Pick`s is enough; no discriminant/narrowing is needed inside the
 *  function body. */
type DraftReadinessInput =
  | Pick<
      SubprofileView,
      | "linkVisibility"
      | "displayName"
      | "handle"
      | "avatarUrl"
      | "bio"
      | "sections"
    >
  | Pick<
      PublicSubprofileView,
      | "linkVisibility"
      | "displayName"
      | "handle"
      | "avatarUrl"
      | "bio"
      | "sections"
    >;

/**
 * A best-effort "how close is this to publishable" summary — the SINGLE
 * client-side readiness estimate, shared by `SubprofileDraftBanner` on the
 * public persona page (owner-preview-own-draft, Phase 1b) AND the dashboard
 * card's `SideReadinessRing` (Phase 2), which needs a fast per-card number
 * for every draft row without a per-card 422 round trip. A count only, never
 * *which* requirements are unmet — that detail lives in the editor's
 * `PublishChecklist`, fed by the real 422 `{unmet}` body (live) /
 * `validatePublishDemo` (demo), both of which see the raw DTO neither the
 * persona page nor the dashboard card gets. Deliberately narrower than the
 * editor's 5-requirement checklist: the "no blocked language" requirement
 * needs a server round trip to verify and isn't client-checkable from either
 * view model, so it's left out rather than guessed at.
 *
 * A linked persona only needs a non-empty display name to publish (contract
 * C5), so it reports a 1-requirement checklist instead of the full set.
 */
export function estimateDraftReadiness(
  data: DraftReadinessInput,
): { readyCount: number; totalCount: number } {
  if (data.linkVisibility === "linked") {
    return { readyCount: data.displayName.trim() ? 1 : 0, totalCount: 1 };
  }

  const contentItemCount = data.sections
    .filter((section) => isContentSection(section.section))
    .reduce((total, section) => total + section.items.length, 0);

  const clientCheckableRequirements = [
    Boolean(data.handle),
    Boolean(data.avatarUrl),
    data.bio.trim().length >= MIN_BIO_LENGTH,
    contentItemCount >= MIN_CONTENT_ITEMS,
  ];

  return {
    readyCount: clientCheckableRequirements.filter(Boolean).length,
    totalCount: clientCheckableRequirements.length,
  };
}
