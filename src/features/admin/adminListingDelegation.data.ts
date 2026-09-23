import type { MemberRefDTO } from "../../shared/api/refs";
import type {
  AdminListingDelegationDTO,
  ListingCoManagerDTO,
  ListingOwnerOfferDTO,
} from "./api/adminListingDelegation.api";

/**
 * Demo fixtures for the admin delegation panel, plus the session overlay that
 * keeps a demo mutation alive across a tab switch.
 *
 * Fabricated throughout. The six delegation routes are admin-only, so none of
 * this may ever be mistaken for platform truth in live mode: every read here
 * sits behind a `demoMode` branch in `useAdminListingDelegation`.
 *
 * The refs match `ADMIN_LISTINGS_QUEUE` in `adminListings.data.ts`, so opening
 * any demo listing's preview drawer lands on a delegation picture that fits
 * the row above it.
 */

function demoMember(
  slug: string,
  firstName: string,
  lastName: string,
): MemberRefDTO {
  return { slug, firstName, lastName, avatarUrl: null };
}

/**
 * The immutable baseline. `QPL-2026-0007` is house-authored with an offer out
 * and one staff-attached seat, `QPL-2026-0006` is owned with a seat of the
 * owner's own, and `QPL-2026-0005` has nothing arranged yet.
 */
const DEMO_LISTING_DELEGATION: Record<string, AdminListingDelegationDTO> = {
  "QPL-2026-0007": {
    openOffer: {
      id: "offer-demo-1",
      listingRef: "QPL-2026-0007",
      listingSlug: "maison-du-tiago",
      listingName: "Maison Du Tiago",
      offeree: demoMember("nadia", "Nadia", "Faro"),
      offeredBy: demoMember("sam", "Sam", "Reis"),
      note: "You run the room night to night, so the page should be yours.",
      status: "offered",
      offeredAt: "2026-08-14T09:20:00.000Z",
      respondedAt: null,
    },
    coManagers: [
      {
        id: "seat-demo-1",
        member: demoMember("ines", "Inês", "Brito"),
        status: "active",
        invitedBy: demoMember("sam", "Sam", "Reis"),
        invitedAt: "2026-08-02T11:00:00.000Z",
        acceptedAt: "2026-08-03T08:40:00.000Z",
        endedAt: null,
      },
      {
        id: "seat-demo-2",
        member: demoMember("rui", "Rui", "Matos"),
        status: "invited",
        invitedBy: demoMember("sam", "Sam", "Reis"),
        invitedAt: "2026-08-15T16:05:00.000Z",
        acceptedAt: null,
        endedAt: null,
      },
    ],
  },
  "QPL-2026-0006": {
    openOffer: null,
    coManagers: [
      {
        id: "seat-demo-3",
        member: demoMember("joana", "Joana", "Lima"),
        status: "active",
        invitedBy: demoMember("casa", "Casa", "Viva"),
        invitedAt: "2026-07-19T14:30:00.000Z",
        acceptedAt: "2026-07-20T09:15:00.000Z",
        endedAt: null,
      },
    ],
  },
  "QPL-2026-0005": { openOffer: null, coManagers: [] },
};

const EMPTY_DELEGATION: AdminListingDelegationDTO = {
  openOffer: null,
  coManagers: [],
};

/**
 * The demo-session mutation overlay, keyed by listing `ref`, following
 * `adminListings.data.ts:278-325`. `DEMO_LISTING_DELEGATION` itself is never
 * mutated, so a page reload resets demo state; this `Map` is what carries an
 * offer or a seat change through a tab switch, a drawer close and a remount,
 * because a fresh `getDemoListingDelegation` call for a query key that was
 * never cached would otherwise re-derive straight from the untouched fixture
 * and the change would vanish. Module-level on purpose: `useState` or context
 * would die with the component tree the drawer unmounts.
 */
export interface DemoDelegationMutation {
  openOffer?: ListingOwnerOfferDTO | null;
  coManagers?: ListingCoManagerDTO[];
}
const demoDelegationMutations = new Map<string, DemoDelegationMutation>();

/** Record a demo-mode delegation change so every later read of `ref` reflects
 *  it. Demo-only; live mode reconciles against the server. */
export function recordDemoDelegationMutation(
  ref: string,
  patch: DemoDelegationMutation,
): void {
  demoDelegationMutations.set(ref, {
    ...demoDelegationMutations.get(ref),
    ...patch,
  });
}

/**
 * The demo delegation picture for one listing: the fixture with this
 * session's overlay applied. A ref with no fixture answers an honest empty
 * picture, keeping another listing's people out of it.
 */
export function getDemoListingDelegation(
  ref: string,
): AdminListingDelegationDTO {
  const base = DEMO_LISTING_DELEGATION[ref] ?? EMPTY_DELEGATION;
  const overlay = demoDelegationMutations.get(ref);
  if (!overlay) return base;
  return {
    openOffer:
      overlay.openOffer === undefined ? base.openOffer : overlay.openOffer,
    coManagers: overlay.coManagers ?? base.coManagers,
  };
}

/**
 * Build the offer a demo `POST` would have come back with. The slug is all the
 * console typed, so the name is the slug: inventing a first and last name for
 * somebody the fixture has never heard of would put a stranger's identity on
 * screen.
 */
export function buildDemoOwnerOffer(
  ref: string,
  memberSlug: string,
  note: string | undefined,
): ListingOwnerOfferDTO {
  return {
    id: `offer-demo-${ref}-${memberSlug}`,
    listingRef: ref,
    listingSlug: ref.toLowerCase(),
    listingName: ref,
    offeree: { slug: memberSlug, firstName: memberSlug, lastName: "" },
    offeredBy: null,
    note: note?.trim() ? note.trim() : null,
    status: "offered",
    offeredAt: new Date().toISOString(),
    respondedAt: null,
  };
}

/** Build the seat a demo `POST` would have come back with. `invited`, because
 *  an invitation grants nothing until the member accepts. */
export function buildDemoCoManagerSeat(
  ref: string,
  memberSlug: string,
): ListingCoManagerDTO {
  return {
    id: `seat-demo-${ref}-${memberSlug}`,
    member: { slug: memberSlug, firstName: memberSlug, lastName: "" },
    status: "invited",
    invitedBy: null,
    invitedAt: new Date().toISOString(),
    acceptedAt: null,
    endedAt: null,
  };
}
