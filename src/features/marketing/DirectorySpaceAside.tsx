import { type DirectoryPlace } from "./directoryPlaces";
import { type VisitPlacement } from "./useDirectoryVisitPlacement";
import { DirectoryVisitSection } from "./DirectoryVisitSection";
import { DirectoryAsideExtras } from "./DirectoryAsideExtras";
import { DirectoryAsideFooter } from "./DirectoryAsideFooter";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the footer controls don't render (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Gates the claim link and `DirectoryContestControl` off for owners (they
   * use "Edit this listing" instead); never passed by the moderation preview. */
  ownerRef?: string;
  /** Which column mounts the visit card (see `useDirectoryVisitPlacement`).
   * This rail renders it only for `"rail"`: a two-column grid. */
  visitPlacement?: VisitPlacement;
}

/**
 * The rail: where the place is and how to reach it, then who else has been
 * here, what is happening here next, and the ways to challenge or report any
 * of it.
 *
 * The visit card (`DirectoryVisitSection`: map, address, contact routes, call
 * to action) opens the rail whenever the grid is two columns. Beside a main
 * column that runs from the amenities to the last review, the rail was nearly
 * empty, and the practical answers belong where the eye lands next to the
 * owner's words. When the grid is one column the card sits in the main column
 * after the hours, so a phone reader meets it one screen in.
 *
 * The order after it follows the same logic. "Upcoming here" can still change
 * a plan, so it leads; the report, suggest-an-edit and claim paths close the
 * rail out. Owner attribution lives in the page header as a one-line byline
 * (`DirectoryOwnerByline`), which is why no card here is about the person
 * behind the listing.
 *
 * The visit card is too tall to pin, so it stays in flow; the shorter block
 * under it (`DirectoryAsideExtras` plus `DirectoryAsideFooter`) mounts inside
 * its own `.sideSticky` wrapper, which pins to `top: 90px` while the grid is
 * two columns, so the reader keeps "Upcoming here" and the report/claim links
 * in reach while they are still reading the main column (see `.side` in
 * DirectorySpacePage.module.css). `hasStickyContent` mirrors the two
 * components' own render conditions so the wrapper mounts only when it would
 * hold something, keeping `.side` a true empty element (and `.grid:has(>
 * .side:empty)` working) whenever neither one has anything to show.
 */
export function DirectorySpaceAside({
  place,
  preview = false,
  ownerRef,
  visitPlacement = "main",
}: Props) {
  const { demoMode } = useDemoMode();
  const hasUpcoming = Boolean(place.upcoming && place.upcoming.length > 0);
  // Mirrors DirectoryAsideExtras' own conditions (an upcoming-gatherings card,
  // or the demo-only "members here lately" roster) and DirectoryAsideFooter's
  // (`preview || ownerRef` renders nothing). Kept here so the wrapper below
  // mounts only when one of them has something to show, keeping `.side` a
  // true empty element when neither one does.
  const hasStickyContent = hasUpcoming || demoMode || (!preview && !ownerRef);
  const stickyClassName =
    visitPlacement === "rail"
      ? `${s.sideSticky} ${s.sideStickyPinned}`
      : s.sideSticky;

  return (
    <aside className={s.side}>
      {visitPlacement === "rail" && (
        <DirectoryVisitSection
          place={place}
          preview={preview}
          ownerRef={ownerRef}
          shouldReachHoursEnd
        />
      )}
      {hasStickyContent && (
        <div className={stickyClassName}>
          <DirectoryAsideExtras place={place} preview={preview} />
          <DirectoryAsideFooter
            place={place}
            preview={preview}
            ownerRef={ownerRef}
          />
        </div>
      )}
    </aside>
  );
}
