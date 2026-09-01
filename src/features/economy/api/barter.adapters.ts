import { memberRefToPerson } from "../../../shared/api/refs";
import type { Barter } from "../barter.data";
import type {
  BarterProposalRow,
  MyBarterListingRow,
  MySentBarterProposalRow,
} from "../barterProposals.data";
import type {
  BarterListingDTO,
  BarterProposalDTO,
  MyBarterListingDTO,
  MySentBarterProposalDTO,
} from "./barter.api";

/**
 * What the barter surfaces render. It is the demo fixture's `Barter` shape
 * widened with the few things only a live listing knows: who posted it (as a
 * profile slug and photo) and where the reader stands relative to it.
 *
 * Every added field is optional, so a `Barter` straight out of `barter.data.ts`
 * is still a valid `BarterView` and demo mode keeps working untouched.
 */
export interface BarterView extends Barter {
  /** Profile slug of the member who posted, for messaging and profile links. */
  memberSlug?: string | null;
  avatarUrl?: string | null;
  /** True when the reader posted this listing, so the UI offers the owner's
   *  view instead of a propose form the API would refuse. */
  isOwner?: boolean;
  /** True when the reader already has a proposal on this listing. */
  hasProposed?: boolean;
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days since a listing was posted, floored at 1.
 *
 * The board's `postedDaysText` reads `1` as "Today" (that is what the fixture
 * encodes), so anything under 24 hours old collapses to 1 rather than 0.
 */
export function daysSince(iso: string, now: Date = new Date()): number {
  const posted = new Date(iso);
  if (Number.isNaN(posted.getTime())) return 1;
  const elapsed = Math.floor(
    (now.getTime() - posted.getTime()) / MILLISECONDS_PER_DAY,
  );
  return elapsed < 1 ? 1 : elapsed;
}

/**
 * Live listing to the view-model the cards and the detail page render.
 *
 * `hood` comes straight from the API's barter member ref, which the server
 * already gates on the member's own `hoodVisible` setting. A member who keeps
 * their neighbourhood private sends `null`, which becomes `undefined` here and
 * makes the surfaces drop the line entirely — there is deliberately no
 * stand-in location to put in its place.
 */
export function barterListingToView(
  listing: BarterListingDTO,
  now?: Date,
): BarterView {
  const person = memberRefToPerson(listing.member);
  return {
    hood: listing.member?.hood ?? undefined,
    id: listing.id,
    name: person?.name ?? "",
    initials: person?.initials ?? "?",
    tint: person?.tint ?? "jade",
    category: listing.category,
    mode: listing.mode,
    offer: listing.offer,
    want: listing.want,
    offerDetail: listing.offerDetail,
    wantDetail: listing.wantDetail,
    tags: listing.tags,
    days: daysSince(listing.createdAt, now),
    memberSlug: person?.slug ?? null,
    avatarUrl: person?.avatarUrl ?? null,
    isOwner: listing.isOwner,
    hasProposed: listing.hasProposed,
  };
}

/**
 * One of your own listings to the row the proposal inbox lists. Reuses
 * `barterListingToView` for the shared fields (and its `daysSince` floor) so the
 * inbox and the board can never disagree about how old a post is.
 */
export function myBarterListingToRow(
  listing: MyBarterListingDTO,
  now?: Date,
): MyBarterListingRow {
  const view = barterListingToView(listing, now);
  return {
    id: view.id,
    mode: view.mode,
    category: view.category,
    offer: view.offer,
    want: view.want,
    days: view.days,
    pendingProposalCount: listing.pendingProposalCount,
    status: listing.status,
  };
}

/**
 * One proposal the reader SENT to the row their own half of the board lists.
 *
 * `listing` stays `null` when the server sent none: the swap is gone, or its
 * poster and the reader have since blocked each other. The row is still shown
 * because it is the reader's own record of something they sent, and the page
 * says plainly that the swap is no longer there rather than dropping it.
 */
export function mySentBarterProposalToRow(
  dto: MySentBarterProposalDTO,
): MySentBarterProposalRow {
  const poster = memberRefToPerson(dto.listing?.member ?? null);
  return {
    id: dto.id,
    listingId: dto.listingId,
    listing: dto.listing
      ? {
          id: dto.listing.id,
          mode: dto.listing.mode,
          category: dto.listing.category,
          offer: dto.listing.offer,
          want: dto.listing.want,
          status: dto.listing.status,
          name: poster?.name ?? "",
        }
      : null,
    message: dto.message,
    createdAt: dto.createdAt,
    decidedAt: dto.decidedAt,
    status: dto.status,
    wasListingEditedAfterProposal: dto.wasListingEditedAfterProposal,
  };
}

/** One proposal DTO to the inbox's row view-model. A proposer the backend could
 *  not resolve (member deleted, or blocked since) leaves the name empty and the
 *  slug null, which the card renders as a removed member rather than a blank. */
export function barterProposalToRow(dto: BarterProposalDTO): BarterProposalRow {
  const person = memberRefToPerson(dto.proposer);
  return {
    id: dto.id,
    listingId: dto.listingId,
    name: person?.name ?? "",
    initials: person?.initials ?? "?",
    tint: person?.tint ?? "jade",
    avatarUrl: person?.avatarUrl ?? null,
    profileSlug: person?.slug ?? null,
    message: dto.message,
    createdAt: dto.createdAt,
    decidedAt: dto.decidedAt,
    status: dto.status,
  };
}
