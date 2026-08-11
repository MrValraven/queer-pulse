import type { LinkVisibility, SubprofileSection } from "./api/subprofiles.api";
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

/** The primitive facts every readiness read is built from. Extracting them
 *  keeps the saved-view estimate (`estimateDraftReadiness`) and the live-editor
 *  estimate (`estimateEditorReadiness`) computing the SAME signal set, so the
 *  ring can't disagree with itself depending on which source fed it. */
interface ReadinessFacts {
  linkVisibility: LinkVisibility;
  handle: string | null | undefined;
  hasAvatar: boolean;
  bioTrimmedLength: number;
  contentItemCount: number;
  hasCover: boolean;
  hasAvailability: boolean;
  socialLinkCount: number;
}

function readinessFromFacts(facts: ReadinessFacts): {
  readyCount: number;
  totalCount: number;
} {
  const signals = [
    facts.hasAvatar,
    facts.bioTrimmedLength >= MIN_BIO_LENGTH,
    facts.contentItemCount >= MIN_CONTENT_ITEMS,
    // Polish signals — optional to publish, but they're part of "where you
    // stand", and mirror the `POLISH_NUDGES` list shown alongside the ring.
    facts.hasCover,
    facts.hasAvailability,
    facts.socialLinkCount > 0,
  ];

  // A standalone (unlinked) persona also needs its own `handle`; a linked one
  // nests under the owner's profile and doesn't, so `handle` only counts for
  // unlinked personas.
  if (facts.linkVisibility !== "linked") {
    signals.push(Boolean(facts.handle));
  }

  return {
    readyCount: signals.filter(Boolean).length,
    totalCount: signals.length,
  };
}

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

  return readinessFromFacts({
    linkVisibility: data.linkVisibility,
    handle: data.handle,
    hasAvatar: Boolean(data.avatarUrl),
    bioTrimmedLength: data.bio.trim().length,
    contentItemCount,
    hasCover: Boolean(data.coverUrl),
    hasAvailability: Boolean(data.availability),
    socialLinkCount: data.socialLinks.length,
  });
}

/**
 * The SAME readiness read as {@link estimateDraftReadiness}, but from the live,
 * unsaved editor working-state instead of the saved persona — so the publish
 * ring (in the Publish pane and the rail's "Get it live" row) tracks edits the
 * moment they're made rather than reflecting the last-saved server row. Fed the
 * meta fields plus the working section/social rows off `SubprofileEditorContext`
 * (typed structurally to avoid a context→readiness import cycle). Content items
 * are counted by non-blank title so a freshly-appended empty draft row (or an
 * image-only section) doesn't inflate the count past what a save would persist.
 */
export function estimateEditorReadiness(editor: {
  meta: {
    link: LinkVisibility;
    handle: string;
    avatarUrl: string;
    bio: string;
    coverUrl: string;
    availability: string;
  };
  sectionRows: Record<string, { title: string }[]>;
  socialRows: { urlOrHandle: string }[];
}): { readyCount: number; totalCount: number } {
  const { meta, sectionRows, socialRows } = editor;
  const contentItemCount = Object.entries(sectionRows)
    .filter(([section]) => isContentSection(section as SubprofileSection))
    .reduce(
      (total, [, rows]) =>
        total + rows.filter((row) => row.title.trim()).length,
      0,
    );

  return readinessFromFacts({
    linkVisibility: meta.link,
    handle: meta.handle,
    hasAvatar: Boolean(meta.avatarUrl),
    bioTrimmedLength: meta.bio.trim().length,
    contentItemCount,
    hasCover: Boolean(meta.coverUrl),
    hasAvailability: Boolean(meta.availability),
    socialLinkCount: socialRows.filter((row) => row.urlOrHandle.trim()).length,
  });
}
