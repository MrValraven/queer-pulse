// Demo seed for "Meet the team" (QUEERPULSE-BUSINESS-TEAM-CONTRACT-2026-10-19.md
// and the members addendum of 2026-10-30).
// Wire-shaped: the demo store in `listingTeam.demo.ts` answers from copies of it.
import type {
  ListingTeamInitiatedBy,
  ListingTeamListingDTO,
  ListingTeamMemberProfileDTO,
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
  /** Set for a persona row; null for a member row. */
  subprofileId: string | null;
  /** Set for a member row; null for a persona row. The wire never carries it. */
  userId: string | null;
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

/** The user id the demo store gives the signed-in demo viewer as a member. */
export const DEMO_VIEWER_TEAM_USER_ID = "demo-user-viewer";

/** A member the demo store can put on a team. */
export interface DemoTeamMember extends ListingTeamMemberProfileDTO {
  userId: string;
}

/**
 * The demo viewer's accepted connections (slugs from the demo connections
 * list), so an invite can name any of them, plus the viewer. The viewer's
 * entry carries a stand-in name: the demo member shows under a real person's
 * name elsewhere, and business screenshots read this list. The store refuses
 * an invite to the viewer as a self-invite, so the viewer reaches this entry
 * only through the seeded pending invite below.
 */
export const DEMO_TEAM_MEMBERS: DemoTeamMember[] = [
  {
    userId: "demo-user-catarina-vaz",
    slug: "catarina-vaz",
    name: "Catarina Vaz",
    avatarUrl: null,
  },
  {
    userId: "demo-user-jonas",
    slug: "jonas",
    name: "Jonas Ferreira",
    avatarUrl: null,
  },
  {
    userId: "demo-user-luisa",
    slug: "luisa",
    name: "Luísa Gomes",
    avatarUrl: null,
  },
  {
    userId: "demo-user-anika",
    slug: "anika",
    name: "Anika Kovač",
    avatarUrl: null,
  },
  {
    userId: "demo-user-rita",
    slug: "rita",
    name: "Rita Varela",
    avatarUrl: null,
  },
  {
    userId: "demo-user-nuno",
    slug: "nuno",
    name: "Nuno Alves",
    avatarUrl: null,
  },
  {
    userId: "demo-user-sofia-castano",
    slug: "sofia-castano",
    name: "Sofia Castaño",
    avatarUrl: null,
  },
  {
    userId: "demo-user-sara-pinheiro",
    slug: "sara-pinheiro",
    name: "Sara Pinheiro",
    avatarUrl: null,
  },
  {
    userId: DEMO_VIEWER_TEAM_USER_ID,
    slug: "tiago",
    name: "Alex Moreno",
    avatarUrl: null,
  },
];

export const DEMO_TEAM_ROWS: DemoTeamRow[] = [
  {
    id: "demo-team-link-tinta-viva-rosa-brava",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-rita-rosa-brava",
    userId: null,
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
    userId: null,
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: "Resident artist",
    position: 1,
    createdAt: "2026-09-03T11:15:00.000Z",
    answeredAt: "2026-09-04T09:00:00.000Z",
  },
  {
    id: "demo-team-link-tinta-viva-catarina-vaz",
    listingId: "demo-listing-tinta-viva",
    subprofileId: null,
    userId: "demo-user-catarina-vaz",
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: "Front of house",
    position: 2,
    createdAt: "2026-09-05T09:30:00.000Z",
    answeredAt: "2026-09-06T10:15:00.000Z",
  },
  {
    id: "demo-team-link-tinta-viva-agulha-lenta",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-tiago-agulha-lenta",
    userId: null,
    status: "accepted",
    initiatedBy: "persona",
    roleLabel: "Apprentice",
    position: 3,
    createdAt: "2026-09-10T14:20:00.000Z",
    answeredAt: "2026-09-11T08:45:00.000Z",
  },
  {
    id: "demo-team-link-tinta-viva-fumo-azul",
    listingId: "demo-listing-tinta-viva",
    subprofileId: "sp-anika-fumo-azul",
    userId: null,
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: "Guest artist",
    position: 4,
    createdAt: "2026-09-22T16:00:00.000Z",
    answeredAt: "2026-09-23T12:10:00.000Z",
  },
  {
    id: "demo-team-link-navalha-agulha-lenta",
    listingId: "demo-listing-navalha",
    subprofileId: "sp-tiago-agulha-lenta",
    userId: null,
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
    userId: null,
    status: "pending",
    initiatedBy: "persona",
    roleLabel: null,
    position: null,
    createdAt: "2026-10-12T09:40:00.000Z",
    answeredAt: null,
  },
  {
    id: "demo-team-link-studio-cabelo-viewer-member",
    listingId: "demo-listing-studio-cabelo",
    subprofileId: null,
    userId: DEMO_VIEWER_TEAM_USER_ID,
    status: "pending",
    initiatedBy: "listing",
    roleLabel: "Colourist",
    position: null,
    createdAt: "2026-10-14T11:05:00.000Z",
    answeredAt: null,
  },
];
