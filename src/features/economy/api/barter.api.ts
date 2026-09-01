import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { Mode } from "../barter.data";

/** The board's category facet, mirroring the backend `BarterCategory` enum.
 *  The page's `CATS` chips add an `"all"` sentinel on top of these, which is
 *  the absence of the query parameter rather than a value the API knows. */
export type BarterCategoryKey =
  "creative" | "tech" | "legal" | "care" | "food" | "body";

export type BarterListingStatus = "open" | "closed";
export type BarterProposalStatus = "pending" | "accepted" | "declined";

/**
 * The listing owner as a barter card shows them: the shared member ref plus the
 * neighbourhood rendered under their name (`BarterMemberRef` on the backend).
 *
 * `hood` is `null` whenever the member keeps their neighbourhood private — the
 * server gates it on their own `hoodVisible` setting — so a card renders the
 * line only when there is a real one to render, never a stand-in location.
 */
export interface BarterMemberRefDTO extends MemberRefDTO {
  hood: string | null;
}

/** One swap listing. Field names match the `Barter` fixture shape the board
 *  already renders; `barter.adapters.ts` expands `member` into the loose
 *  name/initials/tint the cards read. */
export interface BarterListingDTO {
  id: string;
  member: BarterMemberRefDTO | null;
  category: BarterCategoryKey;
  mode: Mode;
  offer: string;
  want: string;
  offerDetail: string;
  wantDetail: string;
  tags: string[];
  status: BarterListingStatus;
  isOwner: boolean;
  hasProposed: boolean;
  createdAt: string;
}

/** One of your own listings, with the count of proposals still waiting on you
 *  (`GET /barter/mine`). */
export interface MyBarterListingDTO extends BarterListingDTO {
  pendingProposalCount: number;
}

export interface BarterProposalDTO {
  id: string;
  listingId: string;
  proposer: MemberRefDTO | null;
  message: string;
  status: BarterProposalStatus;
  decidedAt: string | null;
  createdAt: string;
}

/** The two terminal states an owner can move a proposal to. `pending` is where
 *  a proposal starts and is never somewhere it can be moved back to. */
export type BarterProposalDecision = "accepted" | "declined";

/** `POST /barter/:id/proposals` — the stored proposal plus the DM thread it was
 *  delivered into (`null` when delivery failed after the proposal committed). */
export interface BarterProposalAckDTO {
  proposal: BarterProposalDTO;
  conversationId: string | null;
}

export interface ListBarterParams {
  category?: BarterCategoryKey;
  mode?: Mode;
  q?: string;
  page?: number;
}

export interface CreateBarterListingBody {
  category: BarterCategoryKey;
  mode: Mode;
  offer?: string;
  want?: string;
  offerDetail?: string;
  wantDetail?: string;
  tags?: string[];
}

/** `PATCH /barter/:id`: the poster's correction. Every field is optional and
 *  an omitted one is left alone; the server names exactly this set, so a field
 *  outside it is rejected outright rather than quietly ignored. */
export type UpdateBarterListingBody = Partial<CreateBarterListingBody>;

/** The listing a sent proposal was made against, as the proposer's own list
 *  shows it. `null` on a row whose listing is gone, or whose poster and the
 *  reader have since blocked each other. */
export interface ProposedBarterListingDTO {
  id: string;
  member: BarterMemberRefDTO | null;
  category: BarterCategoryKey;
  mode: Mode;
  offer: string;
  want: string;
  status: BarterListingStatus;
}

/** One proposal the reader SENT (`GET /barter/mine/proposals`), with where it
 *  stands and the swap it was made against. */
export interface MySentBarterProposalDTO {
  id: string;
  listingId: string;
  listing: ProposedBarterListingDTO | null;
  message: string;
  status: BarterProposalStatus;
  decidedAt: string | null;
  createdAt: string;
  /** True when the poster changed the category, the mode or either headline
   *  after this proposal was sent, so the offer was made against a swap that
   *  no longer reads the same way. */
  wasListingEditedAfterProposal: boolean;
}

/** GET /barter — one page of open listings, filtered by the board's controls. */
export async function getBarterListings(
  params: ListBarterParams,
): Promise<ItemsPage<BarterListingDTO>> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.mode) search.set("mode", params.mode);
  if (params.q) search.set("q", params.q);
  if (params.page) search.set("page", String(params.page));
  const query = search.toString();
  const response = await apiGet<
    BarterListingDTO[] | ItemsPage<BarterListingDTO>
  >(`/barter${query ? `?${query}` : ""}`);
  return toItemsPage(response);
}

/** GET /barter/:id */
export const getBarterListing = (id: string) =>
  apiGet<BarterListingDTO>(`/barter/${id}`);

/** POST /barter */
export const createBarterListing = (body: CreateBarterListingBody) =>
  apiPost<BarterListingDTO>("/barter", body);

/** PATCH /barter/:id: correct a swap you posted. Answers the owner's shape,
 *  so the pending-proposal count comes back with the edit. 403 when the reader
 *  did not post it, 404 when there is no listing with that id. */
export const updateBarterListing = (
  id: string,
  body: UpdateBarterListingBody,
) => apiPatch<MyBarterListingDTO>(`/barter/${id}`, body);

/** POST /barter/:id/close: take one of your swaps off the board. Idempotent
 *  on the server, so re-closing a closed swap answers rather than failing. */
export const closeBarterListing = (id: string) =>
  apiPost<BarterListingDTO>(`/barter/${id}/close`);

/** GET /barter/mine/proposals: the proposals you sent, newest first, each with
 *  its outcome and the listing it was made against. */
export async function getMySentBarterProposals(
  signal?: AbortSignal,
): Promise<MySentBarterProposalDTO[]> {
  const response = await apiGet<
    MySentBarterProposalDTO[] | ItemsPage<MySentBarterProposalDTO>
  >("/barter/mine/proposals", undefined, undefined, signal);
  return toItemsPage(response).items;
}

/** POST /barter/:id/proposals */
export const proposeBarterSwap = (id: string, message: string) =>
  apiPost<BarterProposalAckDTO>(`/barter/${id}/proposals`, { message });

/** GET /barter/mine — the swaps you posted, newest first, each with the number
 *  of proposals still waiting on your answer. Answers a bare array, normalized
 *  here so a future envelope needs no change at the call site. */
export async function getMyBarterListings(
  signal?: AbortSignal,
): Promise<MyBarterListingDTO[]> {
  const response = await apiGet<
    MyBarterListingDTO[] | ItemsPage<MyBarterListingDTO>
  >("/barter/mine", undefined, undefined, signal);
  return toItemsPage(response).items;
}

/** GET /barter/:id/proposals — owner only. 403 when the reader did not post the
 *  listing, 404 when there is no listing with that id. */
export async function getBarterProposals(
  id: string,
  signal?: AbortSignal,
): Promise<BarterProposalDTO[]> {
  const response = await apiGet<
    BarterProposalDTO[] | ItemsPage<BarterProposalDTO>
  >(`/barter/${id}/proposals`, undefined, undefined, signal);
  return toItemsPage(response).items;
}

/**
 * PATCH /barter/:id/proposals/:proposalId — the owner's answer. One-way, and the
 * backend enforces it: 409 when the proposal was already decided (including a
 * concurrent second decision), 403 when the caller is not the poster, 404 when
 * the listing or the proposal is gone. All four reach the caller as an
 * `ApiError` so the inbox can name what actually happened.
 */
export const decideBarterProposal = (
  id: string,
  proposalId: string,
  status: BarterProposalDecision,
) =>
  apiPatch<BarterProposalDTO>(`/barter/${id}/proposals/${proposalId}`, {
    status,
  });
