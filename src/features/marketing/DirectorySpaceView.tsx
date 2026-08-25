import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySpaceHeader } from "./DirectorySpaceHeader";
import { DirectoryOperatingBanner } from "./DirectoryOperatingBanner";
import { DirectoryGallery } from "./DirectoryGallery";
import { DirectorySpaceMain } from "./DirectorySpaceMain";
import { DirectorySpaceAside } from "./DirectorySpaceAside";
import { DirectorySpaceTrust } from "./DirectorySpaceTrust";
import { DirectoryAffirmingBaseline } from "./DirectoryAffirmingBaseline";
import s from "./DirectorySpacePage.module.css";

/**
 * The public directory detail body: identity, operating state, gallery, then a
 * two-column grid. Shared by the real page (`DirectorySpacePage`) and the admin
 * moderation preview (`ListingPreviewDrawer`), so both show the identical live
 * view. `preview` makes it read-only: no review form, inert contact/back CTAs.
 *
 * The two columns carry different readers. The main column answers the
 * member's questions in the order they ask them (see `DirectorySpaceMain`);
 * the aside holds the trust layer behind the listing, including who runs it.
 * On a phone the grid collapses and the main column's order becomes the whole
 * page, which is what that order was chosen for.
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
  return (
    <>
      {/* Name/identity first, then the photos — the place introduces itself
          before it shows off. Both are full-width above the two-column body. */}
      <DirectorySpaceHeader place={place} preview={preview} />
      {/* Before the photos, and before anything the visitor could act on: if
          this business is closed or has moved, that is the first thing the
          page owes them. Renders nothing for an open listing. Shown in the
          moderation preview too, since a moderator needs to see it as well. */}
      <DirectoryOperatingBanner place={place} />
      <DirectoryGallery place={place} />
      <div className={s.page}>
        <div className={s.grid}>
          <DirectorySpaceMain
            place={place}
            preview={preview}
            ownerRef={ownerRef}
          />
          <DirectorySpaceAside
            place={place}
            preview={preview}
            ownerRef={ownerRef}
          />
        </div>
        {/* The commitment every listing here made, stated once for the whole
            directory. Takes no listing and reads no per-listing field on
            purpose: it is a house rule, not a badge one place earned. Shown in
            the moderation preview too, since it is not interactive. */}
        <DirectoryAffirmingBaseline />
        {/* Read-only moderation preview never shows the interactive "add a
            vouch" trigger, matching how the review form/contact CTAs above
            are already gated off for `preview`. */}
        {!preview && <DirectorySpaceTrust place={place} />}
      </div>
    </>
  );
}
