import type { AdminListingDraftDTO } from "./api/adminListingDrafts.api";

/** An ISO timestamp `days` (and `hours`) before page load, so the demo always
 *  shows a mix of fresh and stalled drafts however long ago it was built. */
function daysAgo(days: number, hours = 0): string {
  return new Date(
    Date.now() - (days * 24 + hours) * 60 * 60 * 1000,
  ).toISOString();
}

/** Demo-only unfinished listing drafts. The endpoint is Admin-only and 403s
 *  for anyone else, so this fabricated data must never appear as platform
 *  truth in live mode (mirrors `ADMIN_LISTING_CLAIMS`). */
export const ADMIN_LISTING_DRAFTS: AdminListingDraftDTO[] = [
  {
    id: "listing-draft-0004",
    name: "Tasca da Graça",
    hood: "Graça",
    path: "claim",
    step: 4,
    owner: {
      userId: "demo-user-marta",
      slug: "marta",
      firstName: "Marta",
      lastName: "Fonseca",
      avatarUrl: null,
    },
    createdAt: daysAgo(2, 5),
    updatedAt: daysAgo(0, 3),
  },
  {
    id: "listing-draft-0003",
    name: "Estúdio Lilás",
    hood: "Arroios",
    path: "claim",
    step: 2,
    owner: {
      userId: "demo-user-joana",
      slug: "joana",
      firstName: "Joana",
      lastName: "Pires",
      avatarUrl: null,
    },
    createdAt: daysAgo(19),
    updatedAt: daysAgo(12),
  },
  {
    id: "listing-draft-0002",
    name: "",
    hood: "",
    path: "suggest",
    step: 1,
    owner: {
      userId: "demo-user-tiago",
      slug: "tiago",
      firstName: "Tiago",
      lastName: "Almeida",
      avatarUrl: null,
    },
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
  {
    id: "listing-draft-0001",
    name: "Barbearia Norte",
    hood: "Intendente",
    path: "claim",
    step: 5,
    owner: null,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(31),
  },
];
