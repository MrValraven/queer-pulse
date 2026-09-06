import { HOODS } from "./createGathering.data";
import type { GatheringDetail } from "./data";
import type { GatheringFormSeed } from "./useGatheringForm";
import { normalizeAccessibilityAnswers } from "../marketing/listBusiness/listingAccessibility.data";

/**
 * The "Online" neighbourhood's canonical stored value.
 *
 * `GatheringDetail.hood` is a DISPLAY string and is now translated for an
 * online gathering (DES-130), so a duplicate cannot read it back into the
 * wizard's `hood` select — in PT it would match no option and the copy would
 * silently lose the fact that it happens online. `isOnline` is the fact; this
 * is the value the select stores for it.
 */
const ONLINE_HOOD =
  HOODS.find((hood) => hood.value === "Online")?.value ?? "Online";

/**
 * An existing gathering → the create wizard's starting state (PRD-190).
 *
 * WHAT IS DEPENDENT ON WHO IS COPYING. `address`, `arrivalNotes` and
 * `onlineUrl` are disclosed by the server only to organisers and confirmed
 * attendees, so on a detail fetched by anyone else they arrive as `null` and
 * simply come through empty. In practice the only surface offering this is the
 * manage dashboard, where the viewer is by definition an organiser.
 *
 * WHAT IS NOT COPIED: the date, the time, and the two publish confirmations —
 * see `GatheringFormSeed`.
 */
export function gatheringToFormSeed(
  gathering: GatheringDetail,
): GatheringFormSeed {
  const isOnline = gathering.isOnline === true;
  return {
    type: gathering.type,
    // Not the title verbatim: two gatherings with the identical name are
    // indistinguishable in every list, in search, and in the host's own
    // dashboard. The host is dropped into the wizard's first step with the
    // name to edit, which is where a duplicate wants their attention anyway.
    title: gathering.title,
    description: gathering.body,
    hood: isOnline ? ONLINE_HOOD : (gathering.neighbourhood ?? ""),
    venue: isOnline ? "" : (gathering.venue ?? ""),
    venueListingId: isOnline ? null : (gathering.venueListingId ?? null),
    venueListing: isOnline ? null : (gathering.venueListing ?? null),
    address: gathering.address ?? "",
    directions: gathering.arrivalNotes ?? "",
    onlineUrl: gathering.onlineUrl ?? "",
    capacity: gathering.capacity != null ? String(gathering.capacity) : "",
    language: gathering.language ?? "",
    cost: gathering.cost ?? "",
    // Through the normalizer, not a cast: `GatheringDetail` types these as the
    // wire `EventAccessibilityAnswers` (a loose string map), and the wizard
    // needs the complete six-question `AccessibilityAnswerMap`. Normalizing
    // fills any question the source gathering never answered with a real
    // `unknown` rather than leaving a hole the review step would misread.
    accessibilityAnswers: normalizeAccessibilityAnswers(
      gathering.accessibilityAnswers,
    ),
    accessNotes: gathering.accessibilityNote ?? "",
    audienceScope: gathering.visibility ?? "members",
    communitySlug: gathering.communitySlug ?? "",
  };
}
