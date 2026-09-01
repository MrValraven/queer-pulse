import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryHoursSection } from "./DirectoryHoursSection";
import { DirectoryVisitSection } from "./DirectoryVisitSection";
import { DirectoryAboutSection } from "./DirectoryAboutSection";
import { DirectoryServicesSection } from "./DirectoryServicesSection";
import { DirectoryAccessSection } from "./DirectoryAccessSection";
import { DirectoryQuestionsSection } from "./DirectoryQuestionsSection";
import { DirectoryReviewsSection } from "./DirectoryReviewsSection";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: hide the interactive review form and the navigation
   *  call to action (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * See `DirectorySpacePage`. Threaded down to show owner-reply compose
   * controls; undefined (non-owner, or preview) keeps reviews read-only. */
  ownerRef?: string;
}

/**
 * The detail page's main column, in the order a member actually decides in.
 *
 * The page used to serve two readers at equal weight, and the owner won: their
 * story, bio and portrait held a whole card while the answers a visitor came
 * for were scattered around it. This column now answers the visitor's
 * questions in the order they ask them, and the owner's story became the trust
 * layer in the aside underneath.
 *
 * 1. Is it open? The live status chip, the weekly grid, the dated
 *    exceptions and the freshness stamp, all unchanged and now first.
 * 2. Where is it, and how do I reach it? The map, address, every contact
 *    route and the primary call to action, moved up out of the aside.
 * 3. What is it? The owner's description and their amenity list, then what
 *    it costs: the itemised services behind the header's price band.
 * 4. Can I get in? Accessibility and languages, promoted out of two grey
 *    rows at the bottom of a sidebar card into a section of their own.
 * 5. What is still unclear? The public questions members put to the business,
 *    and the answers that came back. Sits between the listing's own words and
 *    other members' verdicts, because that is where an unanswered detail
 *    surfaces.
 * 6. What do people say? The reviews, the longest block and the last one,
 *    because nobody scrolls past it to find the address any more.
 *
 * On a phone this order IS the page: one column, top to bottom, exactly as
 * listed. That is what the order was chosen for.
 */
export function DirectorySpaceMain({
  place,
  preview = false,
  ownerRef,
}: Props) {
  return (
    <div>
      <DirectoryHoursSection place={place} />
      <DirectoryVisitSection
        place={place}
        preview={preview}
        ownerRef={ownerRef}
      />
      <DirectoryAboutSection place={place} />
      <DirectoryServicesSection place={place} />
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
