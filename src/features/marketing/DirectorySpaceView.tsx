import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryGallery } from "./DirectoryGallery";
import { DirectorySpaceMain } from "./DirectorySpaceMain";
import { DirectorySpaceAside } from "./DirectorySpaceAside";
import { DirectorySpaceTrust } from "./DirectorySpaceTrust";
import s from "./DirectorySpacePage.module.css";

/**
 * The public directory detail body: cover gallery + two-column grid. Shared by
 * the real page (`DirectorySpacePage`) and the admin moderation preview
 * (`ListingPreviewDrawer`), so both show the identical live view. `preview`
 * makes it read-only: no review form, inert contact/back CTAs.
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
      <DirectoryGallery place={place} />
      <div className={s.page}>
        <div className={s.grid}>
          <DirectorySpaceMain place={place} preview={preview} ownerRef={ownerRef} />
          <DirectorySpaceAside place={place} preview={preview} ownerRef={ownerRef} />
        </div>
        {/* Read-only moderation preview never shows the interactive "add a
            vouch" trigger, matching how the review form/contact CTAs above
            are already gated off for `preview`. */}
        {!preview && <DirectorySpaceTrust place={place} />}
      </div>
    </>
  );
}
