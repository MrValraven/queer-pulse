// Demo seed for "Meet the team" (QUEERPULSE-BUSINESS-TEAM-CONTRACT-2026-10-19.md).
// Wire-shaped: the demo store in `listingTeam.demo.ts` answers from copies of it.
import type {
  ListingTeamInitiatedBy,
  ListingTeamListingDTO,
  ListingTeamPersonaDTO,
  ListingTeamStatus,
} from "./listingTeam.types";

/** A listing the store knows, plus the ref the business-side routes take. */
export type DemoTeamListing = ListingTeamListingDTO & { ref: string };

/** Every state a row can hold; the four ended states never reach a list. */
export type DemoTeamRowStatus =
  ListingTeamStatus | "declined" | "cancelled" | "removed" | "left";

/** One `listing_team_members` row as the demo store keeps it. */
export interface DemoTeamRow {
  id: string;
  listingId: string;
  subprofileId: string;
  status: DemoTeamRowStatus;
  initiatedBy: ListingTeamInitiatedBy;
  roleLabel: string | null;
  position: number | null;
  createdAt: string;
  answeredAt: string | null;
}

/** Live listings, each with a matching directory place (Task 4). */
export const DEMO_TEAM_LISTINGS: DemoTeamListing[] = [
  {
    id: "demo-listing-tinta-viva",
    ref: "QPL-DEMO-0201",
    slug: "tinta-viva",
    name: "Tinta Viva",
    cat: "grooming",
    coverPhoto: null,
    tint: "jade",
    av: "TV",
  },
  {
    id: "demo-listing-navalha",
    ref: "QPL-DEMO-0202",
    slug: "navalha",
    name: "Navalha",
    cat: "grooming",
    coverPhoto: null,
    tint: "coral",
    av: "NV",
  },
  {
    id: "demo-listing-studio-cabelo",
    ref: "QPL-DEMO-0203",
    slug: "studio-cabelo",
    name: "Studio Cabelo",
    cat: "grooming",
    coverPhoto: null,
    tint: "plum",
    av: "SC",
  },
];

/**
 * A listing hidden from the directory: it has no directory place, so the
 * store answers `isListingLive: false` for it, leaves it out of the public
 * reads and refuses invites from it. No seeded row points at it; tests seed
 * rows through `replaceListingTeamDemoRows`.
 */
export const DEMO_TEAM_HIDDEN_LISTING: DemoTeamListing = {
  id: "demo-listing-traco-norte",
  ref: "QPL-DEMO-0204",
  slug: "traco-norte",
  name: "Traço Norte",
  cat: "grooming",
  coverPhoto: null,
  tint: "jade",
  av: "TN",
};

/** The Tinta Viva artists are unlinked, so they carry no owner name. */
export const DEMO_TEAM_PERSONAS: ListingTeamPersonaDTO[] = [
  {
    id: "sp-rita-rosa-brava",
    handle: "rosa-brava",
    displayName: "Rosa Brava",
    kind: "tattoo_artist",
    avatarUrl: null,
    ownerName: null,
  },
  {
    id: "sp-kai-linha-fina",
    handle: "linha-fina",
    displayName: "Linha Fina",
    kind: "tattoo_artist",
    avatarUrl: null,
    ownerName: null,
  },
  {
    id: "sp-tiago-agulha-lenta",
    handle: "agulha-lenta",
    displayName: "Agulha Lenta",
    kind: "tattoo_artist",
    avatarUrl: null,
    ownerName: null,
  },
  {
    id: "sp-anika-fumo-azul",
    handle: "fumo-azul",
    displayName: "Fumo Azul",
    kind: "tattoo_artist",
    avatarUrl: null,
    ownerName: null,
  },
  // Linked and still named after its craft, so the invite picker shows
  // "Beatriz Pinto" over its handle and kind. Seeded in no row.
  {
    id: "sp-beatriz-tattoo-artist",
    handle: "beatriz-tattoo",
    displayName: "Tattoo artist",
    kind: "tattoo_artist",
    avatarUrl: null,
    ownerName: "Beatriz Pinto",
  },
];

/** The persona the demo viewer owns. */
export const DEMO_VIEWER_TEAM_PERSONA_ID = "sp-tiago-agulha-lenta";

export const DEMO_TEAM_ROWS: DemoTeamRow[] = [
  {
    id: "demo-team-link-tinta-viva-rosa-brava",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-rita-rosa-brava",
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: "Resident artist",
    position: 0,
    createdAt: "2026-09-02T10:00:00.000Z",
    answeredAt: "2026-09-02T18:30:00.000Z",
  },
  {
    id: "demo-team-link-tinta-viva-linha-fina",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-kai-linha-fina",
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: "Resident artist",
    position: 1,
    createdAt: "2026-09-03T11:15:00.000Z",
    answeredAt: "2026-09-04T09:00:00.000Z",
  },
  {
    id: "demo-team-link-tinta-viva-agulha-lenta",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-tiago-agulha-lenta",
    status: "accepted",
    initiatedBy: "persona",
    roleLabel: "Apprentice",
    position: 2,
    createdAt: "2026-09-10T14:20:00.000Z",
    answeredAt: "2026-09-11T08:45:00.000Z",
  },
  {
    id: "demo-team-link-tinta-viva-fumo-azul",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-anika-fumo-azul",
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: "Guest artist",
    position: 3,
    createdAt: "2026-09-22T16:00:00.000Z",
    answeredAt: "2026-09-23T12:10:00.000Z",
  },
  {
    id: "demo-team-link-navalha-agulha-lenta",
    listingId: "demo-listing-navalha",
    subprofileId: "sp-tiago-agulha-lenta",
    status: "pending",
    initiatedBy: "listing",
    roleLabel: "Guest artist",
    position: null,
    createdAt: "2026-10-08T15:30:00.000Z",
    answeredAt: null,
  },
  {
    id: "demo-team-link-studio-cabelo-agulha-lenta",
    listingId: "demo-listing-studio-cabelo",
    subprofileId: "sp-tiago-agulha-lenta",
    status: "pending",
    initiatedBy: "persona",
    roleLabel: null,
    position: null,
    createdAt: "2026-10-12T09:40:00.000Z",
    answeredAt: null,
  },
];
