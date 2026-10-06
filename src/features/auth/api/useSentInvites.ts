import { useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getSentInviteCounts,
  getSentInvites,
  resendInvite,
  revokeInvite,
  type SentInviteCountsDTO,
  type SentInviteDTO,
} from "./invite.api";

/**
 * Presentation-normalized "invite I've sent" — status chip + dates.
 *
 * i18n note: this adapter emits a catalog *key* for the status chip and keeps
 * the send/expiry timestamps as `Date`s rather than pre-formatted strings —
 * `SentInvitesList` resolves both through `t()` / `useFormat()` at render, so
 * a language switch translates the chip and reformats the dates identically
 * in demo and live mode (see `events.adapters.ts` for the pattern this mirrors).
 */
export interface SentInviteView {
  /** Stable invite uuid the revoke + resend mutations target. */
  id: string;
  code: string;
  status: SentInviteDTO["status"];
  /** Catalog key for the chip label, e.g. "auth:invite.sentList.status.used". */
  statusKey: string;
  /** Chip tone, matching the design-system chip palette. */
  statusTone: "jade" | "amber" | "ghost" | "coral";
  /** When the invite was sent. */
  sentAt: Date;
  /** When the invite stops working, or null when it has no set expiry. */
  expiresAt: Date | null;
  /** The address the invite is pinned to, when the member addressed it to one
   *  person. Undefined means a bearer link anyone holding it can redeem. */
  recipientEmail?: string;
  note?: string;
  /** Name of the person who accepted, if this invite was used. */
  acceptedByName?: string;
}

const STATUS_META: Record<
  SentInviteDTO["status"],
  { key: string; tone: SentInviteView["statusTone"] }
> = {
  valid: { key: "auth:invite.sentList.status.valid", tone: "amber" },
  used: { key: "auth:invite.sentList.status.used", tone: "jade" },
  expired: { key: "auth:invite.sentList.status.expired", tone: "ghost" },
  revoked: { key: "auth:invite.sentList.status.revoked", tone: "coral" },
};

function dtoToView(dto: SentInviteDTO): SentInviteView {
  const meta = STATUS_META[dto.status];
  const accepted = dto.acceptedBy;
  return {
    id: dto.id,
    code: dto.code,
    status: dto.status,
    statusKey: meta.key,
    statusTone: meta.tone,
    sentAt: new Date(dto.createdAt),
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    recipientEmail: dto.email ?? undefined,
    note: dto.note ?? undefined,
    // Non-null only on a `used` row (backend contract), so this "joined by
    // {name}" line appears exactly when someone actually redeemed the code.
    acceptedByName: accepted
      ? `${accepted.firstName} ${accepted.lastName}`.trim()
      : undefined,
  };
}

/** Rows per GET /invites page, so also how many each "Show more" adds. */
export const SENT_INVITES_PAGE_SIZE = 20;

/** A filter tab: every invite, or one lifecycle status. */
export type SentInviteStatusFilter = "all" | SentInviteDTO["status"];

/**
 * Query keys for the sent-invites surface. Every list (one per filter tab)
 * sits under `lists`, the per-status totals under `counts`, and both under
 * `root`, so the mutations can patch every cached list at once and a single
 * invalidate refreshes lists and counts together.
 */
export const sentInviteKeys = {
  root: (demoMode: boolean) => ["sent-invites", demoMode] as const,
  lists: (demoMode: boolean) => ["sent-invites", demoMode, "list"] as const,
  list: (demoMode: boolean, status: SentInviteStatusFilter) =>
    ["sent-invites", demoMode, "list", status] as const,
  counts: (demoMode: boolean) => ["sent-invites", demoMode, "counts"] as const,
};

/** The cached shape of one filter tab's list: its pages, keyed by offset. */
type SentInvitePages = InfiniteData<SentInviteView[], number>;

/**
 * Demo has no server to remember a revoke or a resend, and each filter tab is
 * its own query that reads the fixture afresh. Every demo mutation records the
 * row it produced here, and the demo reads apply it, so a tab opened later (and
 * the counts) agree with what the member just did. Lives for the session only,
 * like the rest of demo.
 */
const demoInviteOverrides = new Map<string, SentInviteView>();

/** The demo fixture as views, with demo mutations applied, newest first (the
 *  order GET /invites answers in). Loaded on demand so it stays out of the
 *  live bundle. */
async function loadDemoInvites(): Promise<SentInviteView[]> {
  const { SENT_INVITES } = await import("../sentInvites.data");
  return SENT_INVITES.map(
    (dto) => demoInviteOverrides.get(dto.id) ?? dtoToView(dto),
  ).sort((newer, older) => older.sentAt.getTime() - newer.sentAt.getTime());
}

/** Totals in the GET /invites/counts shape, for demo. */
function countInvites(invites: SentInviteView[]): SentInviteCountsDTO {
  const counts: SentInviteCountsDTO = {
    all: invites.length,
    valid: 0,
    used: 0,
    expired: 0,
    revoked: 0,
  };
  for (const invite of invites) counts[invite.status] += 1;
  return counts;
}

export interface SentInvitesResult {
  /** Every row fetched so far for the current tab, newest first. */
  invites: SentInviteView[];
  /** True while the tab's first page is in flight (or retrying). */
  isLoading: boolean;
  /** The tab's first page failed. A failed next page leaves the loaded rows
   *  in place and reports `isFetchNextPageError` instead. */
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  /** Re-runs the failed first page. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/**
 * The invites the current member has sent for one filter tab, with their live
 * status/expiry, newest first. Each status is its own infinite query paged on
 * the server (`GET /invites?status=&limit=20&offset=`), so a tab shows its own
 * latest 20 and "Show more" appends the next 20. Demo mode filters and slices
 * the colocated mock the same way, so it pages identically with no backend.
 */
export function useSentInvites(
  status: SentInviteStatusFilter,
): SentInvitesResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery({
    queryKey: sentInviteKeys.list(demoMode, status),
    initialPageParam: 0,
    queryFn: async ({ pageParam: offset, signal }) => {
      if (demoMode) {
        const invites = await loadDemoInvites();
        return invites
          .filter((invite) => status === "all" || invite.status === status)
          .slice(offset, offset + SENT_INVITES_PAGE_SIZE);
      }
      const page = await getSentInvites(
        {
          status: status === "all" ? undefined : status,
          limit: SENT_INVITES_PAGE_SIZE,
          offset,
        },
        signal,
      );
      return page.map(dtoToView);
    },
    // A short page is the last one; otherwise the next offset is everything
    // loaded so far.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < SENT_INVITES_PAGE_SIZE
        ? undefined
        : allPages.reduce((loadedCount, page) => loadedCount + page.length, 0),
  });

  // Offset pages can overlap by a row when an invite changes status or a new
  // one is sent between two page loads. Keep the first copy so each row (and
  // its React key) appears once.
  const invites = useMemo(() => {
    const seenIds = new Set<string>();
    return (query.data?.pages ?? []).flat().filter((invite) => {
      if (seenIds.has(invite.id)) return false;
      seenIds.add(invite.id);
      return true;
    });
  }, [query.data]);

  return {
    invites,
    isLoading: query.isPending,
    // A failed next page also sets `isError`. Only a first page that never
    // landed is an error the list must own; the rows already on screen stay.
    isError: query.isError && invites.length === 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    refetch: () => void query.refetch(),
  };
}

/**
 * The member's sent-invite totals, overall and per status: the real counts
 * behind the filter tabs (`GET /invites/counts`). Demo mode counts the mock.
 */
export function useSentInviteCounts() {
  const { demoMode } = useDemoMode();
  return useQuery<SentInviteCountsDTO>({
    queryKey: sentInviteKeys.counts(demoMode),
    queryFn: async ({ signal }) =>
      demoMode
        ? countInvites(await loadDemoInvites())
        : getSentInviteCounts(signal),
  });
}

/** Replace one invite in every cached filter-tab list, across all its pages. */
function patchCachedInvite(
  queryClient: QueryClient,
  demoMode: boolean,
  id: string,
  patch: (invite: SentInviteView) => SentInviteView,
) {
  queryClient.setQueriesData<SentInvitePages>(
    { queryKey: sentInviteKeys.lists(demoMode) },
    (current) =>
      current && {
        ...current,
        pages: current.pages.map((page) =>
          page.map((invite) => (invite.id === id ? patch(invite) : invite)),
        ),
      },
  );
}

/** Find an invite in whichever cached filter-tab list holds it. */
function findCachedInvite(
  queryClient: QueryClient,
  demoMode: boolean,
  id: string,
): SentInviteView | undefined {
  const cachedLists = queryClient.getQueriesData<SentInvitePages>({
    queryKey: sentInviteKeys.lists(demoMode),
  });
  for (const [, data] of cachedLists) {
    const match = data?.pages.flat().find((invite) => invite.id === id);
    if (match) return match;
  }
  return undefined;
}

/** Move one invite from one status total to another in the cached counts. */
function moveCachedCount(
  queryClient: QueryClient,
  demoMode: boolean,
  from: SentInviteDTO["status"],
  to: SentInviteDTO["status"],
) {
  queryClient.setQueryData<SentInviteCountsDTO>(
    sentInviteKeys.counts(demoMode),
    (current) =>
      current && {
        ...current,
        [from]: Math.max(0, current[from] - 1),
        [to]: current[to] + 1,
      },
  );
}

/** The same invite, now reading `revoked`. */
function asRevoked(invite: SentInviteView): SentInviteView {
  const revoked = STATUS_META.revoked;
  return {
    ...invite,
    status: "revoked",
    statusKey: revoked.key,
    statusTone: revoked.tone,
  };
}

interface RevokeContext {
  previousLists: [QueryKey, SentInvitePages | undefined][];
  previousCounts: SentInviteCountsDTO | undefined;
}

/**
 * Revoke one of the member's own pending invites. Demo mode optimistically
 * flips the row to `revoked` in every cached list, records the flip in the
 * demo overrides, and never touches the network or refetches. Live mode calls
 * `DELETE /invites/:code`, applies the same optimistic flip, and invalidates
 * the lists and counts so the server's truth wins on refetch and the invite
 * lands in its new tab. Failures surface through the caller's `onError`.
 *
 * The mutation takes both `code` (what the backend route resolves by) and `id`
 * (the uuid we patch the cache row against). The two are distinct values, so
 * revoking by id would 404 against the `:code` route.
 *
 * `onMutate` cancels in-flight list and count reads (so a late response can't
 * overwrite the flip), snapshots every cached list plus the counts, then flips
 * the row and moves one from Pending to Revoked. `onError` puts every snapshot
 * back, so a 403/404/offline failure never leaves an invite reading "Revoked"
 * while its link is still live and redeemable. The refetch in `onSettled` is a
 * second line of defence that has to be able to fail: offline it never lands,
 * so the rollback stands on its own. `meta.silentError` keeps the global
 * mutation-error toast from doubling up with the caller's tailored message.
 */
export function useRevokeInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const listsKey = sentInviteKeys.lists(demoMode);
  const countsKey = sentInviteKeys.counts(demoMode);

  return useMutation<
    void,
    unknown,
    { id: string; code: string },
    RevokeContext
  >({
    mutationKey: ["sent-invites", "revoke"],
    meta: { silentError: true },
    mutationFn: async ({ id, code }) => {
      if (demoMode) {
        const current = findCachedInvite(queryClient, demoMode, id);
        if (current) demoInviteOverrides.set(id, asRevoked(current));
        return;
      }
      await revokeInvite(code);
    },
    onMutate: async ({ id }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listsKey }),
        queryClient.cancelQueries({ queryKey: countsKey }),
      ]);
      const previousLists = queryClient.getQueriesData<SentInvitePages>({
        queryKey: listsKey,
      });
      const previousCounts =
        queryClient.getQueryData<SentInviteCountsDTO>(countsKey);
      patchCachedInvite(queryClient, demoMode, id, asRevoked);
      moveCachedCount(queryClient, demoMode, "valid", "revoked");
      return { previousLists, previousCounts };
    },
    // Roll every optimistic change back to exactly what was cached before.
    onError: (_error, _variables, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousLists) {
        queryClient.setQueryData(queryKey, data);
      }
      queryClient.setQueryData(countsKey, context.previousCounts);
    },
    onSettled: () => {
      // Demo has no server truth to reconcile with: the cache patch and the
      // recorded override already are the result, so it skips the refetch.
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: sentInviteKeys.root(demoMode),
      });
    },
  });
}

/**
 * Re-mint one of the member's own **expired** invites: the backend keeps the same
 * code, pushes the expiry out +7d, and flips the status back to pending, then
 * returns the updated row. We patch that row into every cached list in place
 * and move one from Expired to Pending in the counts; live mode then
 * invalidates the lists and counts so the invite lands in its new tab. Demo
 * mode simulates the same re-mint locally off the cached row (no network) and
 * records it in the demo overrides.
 *
 * Errors surface to the caller's `onError` for a tailored, honest message
 * (403 not-yours, 404 unknown, 409 already accepted/revoked/still-valid);
 * `silentError` keeps the global mutation-error toast from doubling up.
 */
export function useResendInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  return useMutation<SentInviteView, unknown, { id: string; code: string }>({
    mutationKey: ["sent-invites", "resend"],
    meta: { silentError: true },
    mutationFn: async ({ id, code }) => {
      if (demoMode) {
        const current = findCachedInvite(queryClient, demoMode, id);
        const valid = STATUS_META.valid;
        const resent: SentInviteView = {
          id,
          code,
          status: "valid",
          statusKey: valid.key,
          statusTone: valid.tone,
          sentAt: current?.sentAt ?? new Date(),
          expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
          recipientEmail: current?.recipientEmail,
          note: current?.note,
          acceptedByName: undefined,
        };
        demoInviteOverrides.set(id, resent);
        return resent;
      }
      return dtoToView(await resendInvite(code));
    },
    onSuccess: (updated) => {
      patchCachedInvite(queryClient, demoMode, updated.id, () => updated);
      moveCachedCount(queryClient, demoMode, "expired", "valid");
    },
    onSettled: () => {
      // Same as revoke: demo's cache patch and override are the result.
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: sentInviteKeys.root(demoMode),
      });
    },
  });
}
