import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryAsideOwner } from "./DirectoryAsideOwner";
import { DirectoryAsideExtras } from "./DirectoryAsideExtras";
import { DirectoryAsideFooter } from "./DirectoryAsideFooter";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the footer controls don't render (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Gates the claim link and `DirectoryContestControl` off for owners (they
   * use "Edit this listing" instead); never passed by the moderation preview. */
  ownerRef?: string;
}

/**
 * The trust layer: who else has been here, what is happening here next, who
 * runs the place, and the ways to challenge or report any of it.
 *
 * This rail used to open with the map, the address and every contact route.
 * Those are the answers a member came for, so they moved into the main column
 * (`DirectoryVisitSection`) where a phone reader meets them early instead of
 * after the whole review list. What is left is genuinely secondary: context
 * about the people behind the listing.
 *
 * The order within the rail follows the same logic. "Upcoming here" can still
 * change a plan, so it leads; the owner's card sits under it; the report and
 * suggest-an-edit paths close it out.
 */
export function DirectorySpaceAside({
  place,
  preview = false,
  ownerRef,
}: Props) {
  return (
    <aside className={s.side}>
      <DirectoryAsideExtras place={place} preview={preview} />
      <DirectoryAsideOwner
        place={place}
        preview={preview}
        ownerRef={ownerRef}
      />
      <DirectoryAsideFooter
        place={place}
        preview={preview}
        ownerRef={ownerRef}
      />
    </aside>
  );
}
