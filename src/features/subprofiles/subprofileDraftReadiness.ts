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
 *  declare these fields identically (same types), so a plain union of the two
 *  `Pick`s is enough; no discriminant/narrowing is needed inside the function
 *  body. */
type DraftReadinessInput =
  | Pick<
      SubprofileView,
      | "linkVisibility"
      | "handle"
      | "avatarUrl"
      | "bio"
      | "coverUrl"
      | "availability"
      | "socialLinks"
      | "sections"
    >
  | Pick<
      PublicSubprofileView,
      | "linkVisibility"
      | "handle"
      | "avatarUrl"
      | "bio"
      | "coverUrl"
      | "availability"
      | "socialLinks"
      | "sections"
    >;

/**
 * A best-effort "how complete is this persona" summary — the SINGLE
 * client-side readiness estimate, shared by `SubprofileDraftBanner` on the
 * public persona page (owner-preview-own-draft, Phase 1b), the dashboard
 * card's `SideReadinessRing`, and the editor's publish pane / rail. It needs a
 * fast per-card number for every draft row without a per-card 422 round trip.
 * A count only, never *which* requirements are unmet — the blocking detail
 * lives in the editor's `PublishChecklist`, fed by the real 422 `{unmet}` body
 * (live) / `validatePublishDemo` (demo). This is deliberately NOT the publish
 * gate (the checklist decides that — see `publishPanel.estimateNote`); it's an
 * honest "where you stand" read, so it folds in both the client-checkable
 * publish requirements AND the optional polish signals (`POLISH_NUDGES`:
 * cover, socials, availability). That keeps the ring in step with the polish
 * list: while a nudge is outstanding the ring sits below 100, and it only
 * reaches 100 once nothing's left to add — so the number always reflects the
 * real state rather than snapping to a full ring the moment publishing is
 * technically possible.
 *
 * The server-only "no blocked language" requirement isn't client-checkable
 * from either view model, so it's left out rather than guessed at.
 *
 * A standalone (unlinked) persona also needs its own `handle`; a linked
 * persona nests under the owner's profile and doesn't, so `handle` only counts
 * for unlinked personas.
 */
export function estimateDraftReadiness(
  data: DraftReadinessInput,
): { readyCount: number; totalCount: number } {
  const contentItemCount = data.sections
    .filter((section) => isContentSection(section.section))
    .reduce((total, section) => total + section.items.length, 0);

  const signals = [
    Boolean(data.avatarUrl),
    data.bio.trim().length >= MIN_BIO_LENGTH,
    contentItemCount >= MIN_CONTENT_ITEMS,
    // Polish signals — optional to publish, but they're part of "where you
    // stand", and mirror the `POLISH_NUDGES` list shown alongside the ring.
    Boolean(data.coverUrl),
    Boolean(data.availability),
    data.socialLinks.length > 0,
  ];

  if (data.linkVisibility !== "linked") {
    signals.push(Boolean(data.handle));
  }

  return {
    readyCount: signals.filter(Boolean).length,
    totalCount: signals.length,
  };
}
