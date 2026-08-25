import type { EditSuggestionDTO } from "./api/editSuggestions.api";

/** Demo-only edit-suggestion inbox. Moderator/Admin endpoint 403s for anyone
 * else, so this fabricated data must never appear as platform truth in live
 * mode (mirrors `ADMIN_LISTINGS_QUEUE` in `adminListings.data.ts`). */
export const ADMIN_EDIT_SUGGESTIONS: EditSuggestionDTO[] = [
  {
    id: "edit-sugg-0004",
    listingRef: "QPL-2026-0005",
    listingName: "Café Aurora",
    field: "hours",
    message:
      "They're closed on Mondays now, not just late. I walked over last Monday at 10am and the shutter was down.",
    status: "pending",
    submittedBy: {
      slug: "ines",
      firstName: "Inês",
      lastName: "Marques",
      avatarUrl: null,
    },
    createdAt: "2026-07-29T16:20:00.000Z",
  },
  {
    id: "edit-sugg-0003",
    listingRef: "QPL-2026-0005",
    listingName: "Café Aurora",
    field: "phone",
    message: "The listed number rings out. Their new one is +351 21 887 4401.",
    status: "pending",
    submittedBy: {
      slug: "rui",
      firstName: "Rui",
      lastName: "Tavares",
      avatarUrl: null,
    },
    createdAt: "2026-07-29T09:05:00.000Z",
  },
  {
    id: "edit-sugg-0002",
    listingRef: "QPL-2026-0006",
    listingName: "Casa Viva",
    field: "website",
    message:
      "casaviva.pt redirects to a squatted domain page now. Might be worth pulling the link until they sort it.",
    status: "accepted",
    submittedBy: {
      slug: "tiago",
      firstName: "Tiago",
      lastName: "Costa",
      avatarUrl: null,
    },
    createdAt: "2026-07-27T11:40:00.000Z",
  },
  {
    id: "edit-sugg-0001",
    listingRef: "QPL-2026-0007",
    listingName: "Maison Du Tiago",
    field: "description",
    message:
      'Small nit: the blurb still says "natural-wine room" twice in one sentence, reads odd.',
    status: "dismissed",
    submittedBy: null,
    createdAt: "2026-07-26T08:00:00.000Z",
  },
];
