import { type DirectoryPlace } from "./directoryPlaces";
import { type VisitPlacement } from "./useDirectoryVisitPlacement";
import { DirectoryHoursSection } from "./DirectoryHoursSection";
import { DirectoryVisitSection } from "./DirectoryVisitSection";
import { DirectoryAboutSection } from "./DirectoryAboutSection";
import { DirectoryServicesSection } from "./DirectoryServicesSection";
import { DirectoryMenuSection } from "./DirectoryMenuSection";
import { DirectoryAccessSection } from "./DirectoryAccessSection";
import { DirectoryQuestionsSection } from "./DirectoryQuestionsSection";
import { DirectoryReviewsSection } from "./DirectoryReviewsSection";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: hide the interactive review form and the messaging
   *  route (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * See `DirectorySpacePage`. Threaded down to show owner-reply compose
   * controls; undefined (non-owner, or preview) keeps reviews read-only. */
  ownerRef?: string;
  /** Which column mounts the visit card (see `useDirectoryVisitPlacement`).
   * This column renders it only for `"main"`, the default, which is also what
   * a caller rendering this column on its own gets. */
  visitPlacement?: VisitPlacement;
}

/**
 * The detail page's main column, in the order a member actually decides in.
 *
 * The page used to serve two readers at equal weight, and the owner won: their
 * story, bio and portrait held a whole card while the answers a visitor came
 * for were scattered around it. This column now answers the visitor's
 * questions in the order they ask them, picking up where the owner's own words
 * in the header leave off.
 *
 * 1. What is it? The owner's amenity list, "What this place offers". Their
 *    description sits in the header right above the gallery, and this list
 *    is its continuation, so nothing comes between the two.
 * 2. Is it open? The live status chip, the weekly grid, the dated
 *    exceptions and the freshness stamp.
 * 3. Where is it, and how do I reach it? The map, address, every contact
 *    route and the primary call to action. Here only while the grid is one
 *    column (phones, the moderation drawer); beside a two-column grid the same
 *    card opens the rail instead (see `DirectorySpaceAside`).
 * 4. What does it cost? The itemised services or the menu behind the
 *    header's price band.
 * 5. Can I get in? Accessibility and languages, promoted out of two grey
 *    rows at the bottom of a sidebar card into a section of their own.
 * 6. What is still unclear? The public questions members put to the business,
 *    and the answers that came back. Sits between the listing's own words and
 *    other members' verdicts, because that is where an unanswered detail
 *    surfaces.
 * 7. What do people say? The reviews, the longest block and the last one,
 *    because nobody scrolls past it to find the address any more.
 *
 * On a phone this order IS the page: one column, top to bottom, exactly as
 * listed. That is what the order was chosen for.
 */
export function DirectorySpaceMain({
  place,
  preview = false,
  ownerRef,
  visitPlacement = "main",
}: Props) {
  return (
    <div>
      <DirectoryAboutSection place={place} />
      <DirectoryHoursSection place={place} />
      {visitPlacement === "main" && (
        <DirectoryVisitSection
          place={place}
          preview={preview}
          ownerRef={ownerRef}
        />
      )}
      {place.pricingMode === "menu" ? (
        <DirectoryMenuSection place={place} />
      ) : (
        <DirectoryServicesSection place={place} />
      )}
      <DirectoryAccessSection place={place} />
      <DirectoryQuestionsSection
        place={place}
        preview={preview}
        ownerRef={ownerRef}
      />
      <DirectoryReviewsSection
        place={place}
        preview={preview}
        ownerRef={ownerRef}
      />
    </div>
  );
}
