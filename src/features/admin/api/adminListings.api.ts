import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import type { ListingDTO } from "../../marketing/listBusiness/api/listings.api";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { AdminTone } from "../ui";

/** Three visually distinct tones for a queue row's status chip — `warn`
 *  (amber) for a listing waiting on a moderator, `violet` for one waiting on
 *  the submitter, `jade` once live. Shared by the row and the drawer so they
 *  can't drift apart (they used to duplicate this mapping). */
export const LISTING_STATUS_TONE: Record<ListingStatus, AdminTone> = {
  review: "warn",
  question: "violet",
  live: "jade",
};

/** One row in the moderation queue — the subset the admin page renders, plus
 *  the full listing (`detail`) so the preview drawer needs no second fetch. */
export interface ListingQueueRow {
  ref: string;
  slug: string;
  name: string;
  hood: string;
  status: ListingStatus;
  submitterName: string;
  submitterSlug: string;
  createdAt: string;
  /** The full listing, for the moderation preview drawer. */
  detail: ListingDTO;
}

/** Map a backend listing to the queue row shape. */
export function listingDtoToQueueRow(dto: ListingDTO): ListingQueueRow {
  const submitter = dto.submittedBy;
  return {
    ref: dto.ref,
    slug: dto.slug,
    name: dto.name,
    hood: dto.hood,
    status: dto.status,
    submitterName: submitter
      ? `${submitter.firstName} ${submitter.lastName}`.trim()
      : "",
    submitterSlug: submitter?.slug ?? "",
    createdAt: dto.createdAt,
    detail: dto,
  };
}

/** `sort` the moderation queue can be ordered by — mirrors the backend's
 *  `list-listing-queue.query.ts` DTO. */
export type ListingQueueSort = "newest" | "oldest" | "name";

/** The status filter, plus the synthetic `"all"` tab — what `AdminListingsHeader`'s
 *  counted chips and the page's `status` query param both key off. */
export type AdminListingsStatusFilter = ListingStatus | "all";

/** Chip order for the status filter row. */
export const ADMIN_LISTINGS_STATUS_FILTERS: AdminListingsStatusFilter[] = [
  "all",
  "review",
  "question",
  "live",
];

/** Per-status counts across the queue, scoped by the active `q` search but
 *  NOT by `status` — this is the axis the four counted tabs vary across. */
export interface ListingQueueCounts {
  all: number;
  review: number;
  question: number;
  live: number;
}

/** `GET /listings/admin/queue` response envelope. */
export interface ListingQueuePage {
  items: ListingDTO[];
  total: number;
  page: number;
  pageSize: number;
  counts: ListingQueueCounts;
}

export interface GetListingQueueParams {
  status?: ListingStatus;
  page?: number;
  q?: string;
  sort?: ListingQueueSort;
}

/** Mirrors the backend's `@ArrayMaxSize(200)` on `BulkStatusDto`/`BulkRemoveDto`
 *  (`queerpulse-backend/src/listings/dto/bulk-listing.dto.ts`) — the most a
 *  single bulk request can carry. The selection UI enforces the same ceiling
 *  client-side so a moderator finds out while picking rows, not from a
 *  generic failure toast after submitting. */
export const LISTING_BULK_ACTION_CAP = 200;

/** One page of the admin listings queue, already mapped from `ListingDTO` to
 *  the row shape the queue renders. `counts` rides along on every page (the
 *  server/demo fixture both answer with the whole-queue counts alongside
 *  `rows`), so a reader can take `pages[0].counts` regardless of how many
 *  pages have been fetched. */
export interface AdminListingsPageVM {
  rows: ListingQueueRow[];
  total: number;
  page: number;
  pageSize: number;
  counts: ListingQueueCounts;
}

/** Group listings by status, for the demo fixture's fallback counts and as a
 *  defensive fallback if a payload ever arrives without `counts`. */
export function countListingsByStatus(
  items: ListingDTO[] | ListingQueueRow[],
): ListingQueueCounts {
  const counts: ListingQueueCounts = {
    all: items.length,
    review: 0,
    question: 0,
    live: 0,
  };
  for (const item of items) {
    counts[item.status] += 1;
  }
  return counts;
}

/** The moderation queue, filterable by status, free-text search, and sort,
 *  and paginated. Moderator/Admin only. */
export async function getListingQueue(
  params: GetListingQueueParams = {},
): Promise<ListingQueuePage> {
  const { status, page = 1, q, sort } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  if (status) searchParams.set("status", status);
  if (q) searchParams.set("q", q);
  if (sort) searchParams.set("sort", sort);
  const res = await apiGet<Partial<ListingQueuePage>>(
    `/listings/admin/queue?${searchParams.toString()}`,
  );
  const items = res?.items ?? [];
  return {
    items,
    total: res?.total ?? items.length,
    page: res?.page ?? page,
    pageSize: res?.pageSize ?? items.length,
    counts: res?.counts ?? countListingsByStatus(items),
  };
}

/** Response shape shared by both bulk moderation endpoints — which refs
 *  succeeded and which didn't. An unknown ref is the only per-item failure
 *  mode (it lands in `failed` without aborting the rest of the batch); a
 *  genuine server error instead throws and the whole request fails. Mirrors
 *  the backend's `BulkListingResultDTO` (`listings/dto/bulk-listing.dto.ts`). */
export interface BulkListingResultDTO {
  updated: string[];
  failed: string[];
}

/** PATCH /listings/admin/bulk-status — moves many listings to one status in a
 *  single server-side transaction (cap 200 refs, server-enforced).
 *  Moderator/Admin only. `reason` is optional free text recorded on each
 *  listing's moderation event. */
export const bulkSetListingStatus = (
  refs: string[],
  status: ListingStatus,
  reason?: string,
) =>
  apiPatch<BulkListingResultDTO>("/listings/admin/bulk-status", {
    refs,
    status,
    reason,
  });

/** POST /listings/admin/bulk-remove — hard-deletes many listings in a single
 *  server-side transaction (cap 200 refs, server-enforced). Moderator/Admin
 *  only. */
export const bulkRemoveListings = (refs: string[], reason?: string) =>
  apiPost<BulkListingResultDTO>("/listings/admin/bulk-remove", {
    refs,
    reason,
  });

/** What happened, in a listing's own words — one row per moderation event.
 *  Mirrors the backend's `ListingModerationEventDTO`. `fromStatus`/`toStatus`
 *  are `null` for an action that isn't itself a status transition (e.g.
 *  `question_asked`, `answered`). `actor` is `null` for an action attributed
 *  to no longer resolvable account (deleted/anonymised moderator). */
export type ListingModerationAction =
  | "status_changed"
  | "removed"
  | "question_asked"
  | "answered"
  | "bulk_status";

export interface ListingModerationEventDTO {
  id: string;
  action: ListingModerationAction;
  fromStatus: ListingStatus | null;
  toStatus: ListingStatus | null;
  reason: string | null;
  actor: MemberRefDTO | null;
  createdAt: string;
}

/** One question a moderator asked the submitter, and its answer if the
 *  submitter has replied yet. Mirrors the backend's `ListingQuestionDTO`.
 *  Answering happens on the submitter-facing surface — this admin drawer only
 *  displays the thread. */
export interface ListingQuestionDTO {
  id: string;
  body: string;
  answer: string | null;
  answeredAt: string | null;
  askedBy: MemberRefDTO | null;
  createdAt: string;
}

/** `GET /listings/admin/:ref/history` response — the moderation event
 *  timeline and the Q&A thread for one listing, both newest-first. */
export interface ListingHistoryDTO {
  events: ListingModerationEventDTO[];
  questions: ListingQuestionDTO[];
}

/** The moderation audit trail + Q&A thread for one listing. Moderator/Admin
 *  only. */
export const getListingHistory = (ref: string) =>
  apiGet<ListingHistoryDTO>(`/listings/admin/${ref}/history`);

/** PATCH /listings/:ref/queer-owned-verified — moderator-verified confirmation
 *  of the "queer-owned" badge, distinct from the submitter's own self-reported
 *  `linkToProfile` claim. Returns the updated listing. Moderator/Admin only. */
export const setQueerOwnedVerified = (ref: string, verified: boolean) =>
  apiPatch<ListingDTO>(
    `/listings/${encodeURIComponent(ref)}/queer-owned-verified`,
    { verified },
  );
