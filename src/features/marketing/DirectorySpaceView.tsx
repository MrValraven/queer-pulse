import { useRef } from "react";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySpaceHeader } from "./DirectorySpaceHeader";
import { DirectoryOperatingBanner } from "./DirectoryOperatingBanner";
import { DirectoryGallery } from "./DirectoryGallery";
import { DirectorySpaceMain } from "./DirectorySpaceMain";
import { DirectorySpaceAside } from "./DirectorySpaceAside";
import { DirectorySpaceTrust } from "./DirectorySpaceTrust";
import { DirectoryAffirmingBaseline } from "./DirectoryAffirmingBaseline";
import { DirectoryVisitCardProvider } from "./DirectoryVisitCardProvider";
import { useDirectoryVisitPlacement } from "./useDirectoryVisitPlacement";
import s from "./DirectorySpacePage.module.css";

/**
 * The public directory detail body: identity, operating state, gallery, then a
 * two-column grid. Shared by the real page (`DirectorySpacePage`) and the admin
 * previews (`ListingPreviewDrawer`, `ListingEditorPreviewModal`), so all of
 * them show the identical live view. `preview` makes it read-only: no review
 * form, no messaging.
 *
 * The two columns carry different readers. The main column answers the
 * member's questions in the order they ask them (see `DirectorySpaceMain`);
 * the aside opens with the visit card on a two-column page, then the trust
 * layer behind the listing. On a phone the grid collapses and the main
 * column's order becomes the whole page, which is what that order was chosen
 * for.
 *
 * The visit card (map, address, contact routes, call to action) is the one
 * block that changes column. Beside a long main column the rail had little to
 * hold, so wherever the grid is two columns the card opens the rail, level
 * with the start of the main column; wherever it is one column it sits in the
 * main column right after the hours. Exactly one copy is mounted at a time
 * because it carries a live map (see `useDirectoryVisitPlacement`), and the
 * state that has to survive a move sits in `DirectoryVisitCardProvider`,
 * around both columns.
 */
export function DirectorySpaceView({
  place,
  preview = false,
  ownerRef,
}: {
  place: DirectoryPlace;
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Threaded to `DirectorySpaceMain` to show owner-reply compose controls;
   * never passed by the moderation preview, so that path stays read-only. */
  ownerRef?: string;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const visitPlacement = useDirectoryVisitPlacement(pageRef);

  return (
    <>
      {/* Name/identity first, then the photos: the place introduces itself
          before it shows off. Both are full-width above the two-column body. */}
      <DirectorySpaceHeader place={place} preview={preview} />
      {/* Before the photos, and before anything the visitor could act on: if
          this business is closed or has moved, that is the first thing the
          page owes them. Renders nothing for an open listing. Shown in the
          moderation preview too, since a moderator needs to see it as well. */}
      <DirectoryOperatingBanner place={place} />
      <DirectoryGallery place={place} />
      <div ref={pageRef} className={s.page}>
        <DirectoryVisitCardProvider place={place}>
          <div className={s.grid}>
            <DirectorySpaceMain
              place={place}
              preview={preview}
              ownerRef={ownerRef}
              visitPlacement={visitPlacement}
            />
            <DirectorySpaceAside
              place={place}
              preview={preview}
              ownerRef={ownerRef}
              visitPlacement={visitPlacement}
            />
          </div>
        </DirectoryVisitCardProvider>
        {/* Read-only moderation preview never shows the interactive "add a
            vouch" trigger, matching how the review form/contact CTAs above
            are already gated off for `preview`. */}
        {!preview && <DirectorySpaceTrust place={place} />}
        {/* The commitment every listing here made, stated once for the whole
            directory. Takes no listing and reads no per-listing field on
            purpose: it is a house rule that applies to every listing alike.
            Shown in the moderation preview too, since it is not interactive.

            Last on the page by design: everything above answers questions
            about THIS place, and the visitor reaches the house rule once they
            are done reading the listing, so it closes the page rather than
            interrupting it. */}
        <DirectoryAffirmingBaseline />
      </div>
    </>
  );
}
