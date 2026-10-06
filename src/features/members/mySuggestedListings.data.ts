import type { MySuggestedListingDTO } from "./api/mySuggestedListings.api";

/**
 * Demo fixture for "Your suggestions" on the member's own profile: fabricated
 * places standing in for what `GET /listings/suggestions/mine` returns. Never
 * surfaces in live mode; the hook reads it only when `demoMode` is on.
 *
 * One row per state the section draws: waiting for review, sent back with a
 * question, published and since claimed by its business, claimed by its
 * business and not public (so its review state stays with that business), and
 * published while the platform still holds it (a place that has since shut
 * for good).
 */
export const DEMO_MY_SUGGESTED_LISTINGS: MySuggestedListingDTO[] = [
  {
    ref: "QPL-2026-0142",
    name: "Tasca do Largo",
    city: "Lisbon",
    state: "in_review",
    holder: "platform",
    publicSlug: null,
    isPermanentlyClosed: false,
    suggestedAt: "2026-09-28T19:20:00.000Z",
  },
  {
    ref: "QPL-2026-0131",
    name: "Oficina Arco-Íris",
    city: "Porto",
    state: "needs_info",
    holder: "platform",
    publicSlug: null,
    isPermanentlyClosed: false,
    suggestedAt: "2026-09-14T10:05:00.000Z",
  },
  {
    ref: "QPL-2026-0098",
    name: "Café Mouraria Velha",
    city: "Lisbon",
    state: "published",
    holder: "claimed",
    publicSlug: "cafe-mouraria-velha",
    isPermanentlyClosed: false,
    suggestedAt: "2026-07-02T15:40:00.000Z",
  },
  {
    ref: "QPL-2026-0077",
    name: "Estúdio Maré",
    city: "Setúbal",
    state: "with_business",
    holder: "claimed",
    publicSlug: null,
    isPermanentlyClosed: false,
    suggestedAt: "2026-06-11T17:25:00.000Z",
  },
  {
    ref: "QPL-2026-0061",
    name: "Livraria Bertha",
    city: "Lisbon",
    state: "published",
    holder: "platform",
    publicSlug: "livraria-bertha",
    isPermanentlyClosed: true,
    suggestedAt: "2026-05-19T09:10:00.000Z",
  },
];
