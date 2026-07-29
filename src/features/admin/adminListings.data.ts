import type { ListingQueueRow } from "./api/adminListings.api";

/** Demo-only moderation queue. Moderator/Admin endpoint 403s for anyone else,
 * so this fabricated data must never appear as platform truth in live mode. */
export const ADMIN_LISTINGS_QUEUE: ListingQueueRow[] = [
  {
    ref: "QPL-2026-0007",
    slug: "maison-du-tiago",
    name: "Maison Du Tiago",
    hood: "Príncipe Real",
    status: "review",
    submitterName: "Tiago Costa",
    submitterSlug: "tiago",
    createdAt: "2026-07-28T10:00:00.000Z",
  },
  {
    ref: "QPL-2026-0006",
    slug: "casa-viva",
    name: "Casa Viva",
    hood: "Arroios",
    status: "question",
    submitterName: "Inês Marques",
    submitterSlug: "ines",
    createdAt: "2026-07-27T14:30:00.000Z",
  },
  {
    ref: "QPL-2026-0005",
    slug: "cafe-aurora",
    name: "Café Aurora",
    hood: "Graça",
    status: "live",
    submitterName: "Rui Tavares",
    submitterSlug: "rui",
    createdAt: "2026-07-25T09:15:00.000Z",
  },
];
