import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryReportControl } from "./DirectoryReportControl";
import { DirectorySuggestEditControl } from "./DirectorySuggestEditControl";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: neither control renders (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Passed through to `DirectorySuggestEditControl`, which hides itself for
   * owners (they use "Edit this listing" instead). */
  ownerRef?: string;
}

/**
 * The aside's trailing footer affordances — "Report this listing" and
 * "Suggest an edit" — extracted from `DirectorySpaceAside` (which was pushing
 * past the 200-line cap) the same way `DirectoryActionBar`/`DirectoryLanguages`/
 * `DirectoryAccess` were already split out of that file. Moderators previewing
 * a listing (e.g. from the moderation queue) shouldn't see either affordance
 * on their own preview.
 */
export function DirectoryAsideFooter({ place, preview = false, ownerRef }: Props) {
  if (preview) return null;

  return (
    <>
      <DirectoryReportControl place={place} />
      <DirectorySuggestEditControl place={place} ownerRef={ownerRef} />
    </>
  );
}
