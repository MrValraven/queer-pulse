import type { ListingClaimDTO } from "./api/listingClaims.api";

/** Demo-only listing-claim queue. Moderator/Admin endpoint 403s for anyone
 * else, so this fabricated data must never appear as platform truth in live
 * mode (mirrors `ADMIN_EDIT_SUGGESTIONS` in `editSuggestions.data.ts`). */
export const ADMIN_LISTING_CLAIMS: ListingClaimDTO[] = [
  {
    id: "listing-claim-0002",
    listingRef: "QPL-2026-0009",
    listingName: "Drama Bar",
    claimant: {
      slug: "rui",
      firstName: "Rui",
      lastName: "Tavares",
      avatarUrl: null,
    },
    note: "I run the bar, this listing's been sitting unclaimed since someone added it last year. Happy to hop on a call to verify.",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2026-08-15T18:40:00.000Z",
  },
  {
    id: "listing-claim-0001",
    listingRef: "QPL-2026-0006",
    listingName: "Casa Viva",
    claimant: {
      slug: "ines",
      firstName: "Inês",
      lastName: "Marques",
      avatarUrl: null,
    },
    note: null,
    status: "approved",
    reviewedBy: "admin-demo",
    reviewedAt: "2026-08-10T09:15:00.000Z",
    createdAt: "2026-08-09T14:05:00.000Z",
  },
];
