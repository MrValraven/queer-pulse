import type { HousingViewingDTO } from "./api/housingViewings.api";
import type {
  HousingListingReviewsDTO,
  HousingViewingReviewPairDTO,
} from "./api/housingReviews.api";

/** Days-from-now ISO helper so the demo slots always read as upcoming. */
function inDays(days: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

/**
 * Demo viewings from the signed-in prototype member's perspective — one in each
 * meaningful state so the surface reads honestly without a backend:
 *  · a request you sent, waiting on the lister,
 *  · a request TO you (as lister) awaiting your response,
 *  · an accepted viewing (which is what unlocks a precise address), and
 *  · a completed viewing ready for a blind review.
 */
export const DEMO_HOUSING_VIEWINGS: HousingViewingDTO[] = [
  {
    id: "demo-viewing-sent",
    listingRef: "QPH-2026-0002",
    listingSlug: "arroios-room-share",
    listingTitle: "Room in shared flat — Arroios, long-term",
    role: "requester",
    counterparty: { slug: "carla-n", firstName: "Carla", lastName: "N." },
    mode: "video",
    status: "requested",
    proposedBy: "requester",
    youProposedLast: true,
    proposedSlots: [inDays(2, 18), inDays(3, 19)],
    acceptedSlot: null,
    note: "Would love a quick video walk-through before I visit in person.",
    responseNote: null,
    createdAt: inDays(-1, 12),
    updatedAt: inDays(-1, 12),
  },
  {
    id: "demo-viewing-incoming",
    listingRef: "QPH-2026-0009",
    listingSlug: "your-marvila-room",
    listingTitle: "Room in your Marvila warehouse flat",
    role: "lister",
    counterparty: { slug: "diogo-v", firstName: "Diogo", lastName: "V." },
    mode: "in_person",
    status: "requested",
    proposedBy: "requester",
    youProposedLast: false,
    proposedSlots: [inDays(4, 17), inDays(5, 11)],
    acceptedSlot: null,
    note: "I'm around most evenings — happy to come by whenever suits you.",
    responseNote: null,
    createdAt: inDays(-1, 9),
    updatedAt: inDays(-1, 9),
  },
  {
    id: "demo-viewing-accepted",
    listingRef: "QPH-2026-0006",
    listingSlug: "mouraria-two-bed",
    listingTitle: "Two-bedroom in Mouraria — June & July",
    role: "requester",
    counterparty: { slug: "tomas-b", firstName: "Tomás", lastName: "B." },
    mode: "in_person",
    status: "accepted",
    proposedBy: "requester",
    youProposedLast: true,
    proposedSlots: [inDays(6, 18)],
    acceptedSlot: inDays(6, 18),
    note: "Thank you! Looking forward to seeing it.",
    responseNote: "See you then — I'll send the exact address.",
    createdAt: inDays(-3, 15),
    updatedAt: inDays(-2, 10),
  },
  {
    id: "demo-viewing-completed",
    listingRef: "QPH-2026-0005",
    listingSlug: "cais-do-sodre-full-flat",
    listingTitle: "Full flat in Cais do Sodré — 3 months",
    role: "requester",
    counterparty: { slug: "sofia-a", firstName: "Sofia", lastName: "A." },
    mode: "video",
    status: "completed",
    proposedBy: "requester",
    youProposedLast: true,
    proposedSlots: [inDays(-5, 19)],
    acceptedSlot: inDays(-5, 19),
    note: "Thanks for the tour!",
    responseNote: null,
    createdAt: inDays(-8, 12),
    updatedAt: inDays(-5, 20),
  },
];

/** Demo public reviews for a listing — a small revealed set with an average,
 * so the listing display has something honest to show in the prototype. */
export function demoListingReviews(slug: string): HousingListingReviewsDTO {
  const byListing: Record<string, HousingListingReviewsDTO> = {
    "principe-real-sunny-onebed": {
      averageRating: 4.5,
      count: 2,
      reviews: [
        {
          id: "demo-review-1",
          author: { slug: "carla-n", firstName: "Carla", lastName: "N." },
          authorRole: "requester",
          rating: 5,
          text: "Inês was warm and completely upfront — the flat was exactly as described and the video call beforehand put me at ease.",
          submittedAt: inDays(-20, 14),
        },
        {
          id: "demo-review-2",
          author: { slug: "diogo-v", firstName: "Diogo", lastName: "V." },
          authorRole: "requester",
          rating: 4,
          text: "Lovely space and an honest host. Stairs are real but she said so up front.",
          submittedAt: inDays(-30, 10),
        },
      ],
    },
  };
  return byListing[slug] ?? { averageRating: null, count: 0, reviews: [] };
}

/** Demo blind-review pair for a completed viewing — the counterparty has
 * already left theirs, so it unlocks the moment you submit yours. */
export function demoViewingReviewPair(
  viewingId: string,
): HousingViewingReviewPairDTO {
  return {
    viewingId,
    canReview: viewingId === "demo-viewing-completed",
    youReviewed: false,
    yourReview: null,
    counterpartySubmitted: viewingId === "demo-viewing-completed",
    counterpartyReview: null,
    revealsAt: null,
  };
}
