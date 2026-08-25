import { useEffect, useState } from "react";
import { StagedLoader } from "../../shared/components/feedback/StagedLoader";

/**
 * The three stages a directory detail page actually goes through. Each one is a
 * real wait, in this order: the listing read, the commit of the detail tree,
 * then the photo fetch, which is by far the longest and the only one the
 * visitor used to see happen on a half-painted page.
 */
const STEP_KEYS = [
  "marketing:directory.detail.loader.steps.fetchingListing",
  "marketing:directory.detail.loader.steps.preparingDetails",
  "marketing:directory.detail.loader.steps.loadingPhotos",
];

interface Props {
  /** The listing read is still in flight. */
  isFetchingListing: boolean;
  /** The read settled with a listing (as opposed to a 404 or an error). */
  hasPlace: boolean;
  /** Every gallery photo has decoded, failed, or hit the preload hard cap. */
  arePhotosReady: boolean;
}

/**
 * Holds the directory detail page's reveal until its photos are decoded,
 * reporting which stage it is on.
 *
 * Rendered from a stable position in `DirectorySpacePage`'s tree — outside the
 * loading/error/not-found branching — so switching branches doesn't unmount it
 * and restart its grace period. The overlay itself portals to `document.body`,
 * so where it sits in the tree costs nothing.
 */
export function DirectorySpaceLoader({
  isFetchingListing,
  hasPlace,
  arePhotosReady,
}: Props) {
  // The listing arriving and the detail tree being on screen are one frame
  // apart. Marking that frame keeps the checklist honest: until React has
  // committed, nothing is waiting on photos yet.
  const [hasCommittedDetails, setHasCommittedDetails] = useState(false);
  useEffect(() => {
    if (isFetchingListing || !hasPlace) return;
    const frame = requestAnimationFrame(() => setHasCommittedDetails(true));
    return () => cancelAnimationFrame(frame);
  }, [isFetchingListing, hasPlace]);

  // A read that settled with no listing (404, or a network error) drops the
  // overlay immediately — the not-found and retry states are the answer, and
  // there are no photos left to wait for.
  const isActive = isFetchingListing || (hasPlace && !arePhotosReady);
  const activeIndex = isFetchingListing ? 0 : hasCommittedDetails ? 2 : 1;

  return (
    <StagedLoader
      isActive={isActive}
      steps={STEP_KEYS}
      activeIndex={activeIndex}
      titleKey="marketing:directory.detail.loader.title"
      captionKey="marketing:directory.detail.loader.caption"
      ariaLabelKey="marketing:directory.detail.loader.ariaLabel"
    />
  );
}
