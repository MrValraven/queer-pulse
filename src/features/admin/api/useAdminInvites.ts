import { useCallback, useMemo } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  deleteAdminInvite,
  getAdminInvites,
  getAdminInviteInviters,
  getAdminInviteQuotas,
  patchAdminInviteQuota,
  postAdminInviteRefresh,
  postAdminInvitesBulk,
  postAdminInvitesRefreshExpired,
  type AdminInviteBulkAction,
  type AdminInviteBulkResultDTO,
  type AdminInviteBulkSkipReason,
  type AdminInviteDTO,
  type AdminInviteInviterDTO,
  type AdminInviteQuotaDTO,
  type AdminInviteQuotaListDTO,
  type AdminInviteQuotaMemberDTO,
  type AdminInviteRefreshExpiredResultDTO,
  type AdminInviteStatus,
} from "./adminInvites.api";

export type AdminInviteFilter = AdminInviteStatus | "all";

interface AdminInvitesPageVM {
  items: AdminInviteDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide invite list for the admin oversight page, paginated and
 * optionally filtered by status. Demo mode returns the colocated
 * `ADMIN_INVITES` fixture (filtered client-side) as a single synthetic page and
 * never hits the network: this is an admin-only endpoint that 403s otherwise,
 * and the fixture is fabricated data that must not surface as platform truth in
 * live mode. Live mode calls `GET /admin/invites?page&status`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminInvites(
  filter: AdminInviteFilter,
  inviterSlug: string | null,
) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const inviterArg = inviterSlug ?? undefined;
  const query = useInfiniteQuery<AdminInvitesPageVM>({
    queryKey: ["admin-invites", demoMode, filter, inviterArg ?? null],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_INVITES } = await import("../adminInvites.data");
        const filtered = ADMIN_INVITES.filter(
          (invite) =>
            (!statusArg || invite.status === statusArg) &&
            (!inviterArg || invite.inviter.slug === inviterArg),
        );
        // pageSize === filtered.length (min 1) so getNextPageParam yields
        // undefined, so demo never issues a page-2 fetch.
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminInvites({
        page: pageParam as number,
        status: statusArg,
        inviterSlug: inviterArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const invites = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, invites, total };
}

/**
 * Every member who has sent an invite, for the oversight page's sender filter.
 * Demo mode derives the distinct senders (with counts) from the colocated
 * `ADMIN_INVITES` fixture; live mode calls `GET /admin/invites/inviters`. The
 * list is small and changes rarely, so it stays fresh for a few minutes.
 */
export function useAdminInviteInviters() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminInviteInviterDTO[]>({
    queryKey: ["admin-invite-inviters", demoMode],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (demoMode) {
        const { ADMIN_INVITES } = await import("../adminInvites.data");
        const bySlug = new Map<string, AdminInviteInviterDTO>();
        for (const invite of ADMIN_INVITES) {
          const existing = bySlug.get(invite.inviter.slug);
          if (existing) {
            existing.count += 1;
          } else {
            bySlug.set(invite.inviter.slug, {
              slug: invite.inviter.slug,
              name: invite.inviter.name,
              avatarUrl: invite.inviter.avatarUrl ?? null,
              count: 1,
              // The fixture carries no quota overrides of its own: every demo
              // inviter starts on the platform default. `useUpdateInviteQuota`
              // patches this query's cache directly on save, the same way
              // `useGrantStaffRole` treats its optimistic patch as demo mode's
              // source of truth.
              inviteMonthlyQuota: null,
            });
          }
        }
        return [...bySlug.values()].sort((first, second) =>
          first.name.localeCompare(second.name),
        );
      }
      return getAdminInviteInviters();
    },
  });
  return {
    inviters: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** The demo stand-in for "this month" in the invite limits list. The fixture
 *  dates sit in the past, so the calendar month of its newest invite plays
 *  the current one, which keeps the usage figures the same on every load. */
function demoCurrentMonthKey(invites: AdminInviteDTO[]): string {
  const newestCreatedAt = invites.reduce(
    (newest, invite) => (invite.createdAt > newest ? invite.createdAt : newest),
    "",
  );
  return newestCreatedAt.slice(0, 7);
}

/** Demo-mode overrides saved from the invite limits modal this session, by
 *  slug (`null` = set back to the default). The demo query re-derives its rows
 *  from the fixture on every fetch, so a save made before a new search would
 *  otherwise come back as the fixture value. */
const demoQuotaOverridesBySlug = new Map<string, number | null>();

/** One cached page of the invite limits list, stamped with the search term it
 *  answers, so the empty state can echo the term the rows on screen belong
 *  to while the next search loads behind them. */
interface AdminInviteQuotaPageVM extends AdminInviteQuotaListDTO {
  searchTerm: string;
}

/** The platform-wide monthly allowance demo mode shows. */
const DEMO_DEFAULT_MONTHLY_QUOTA = 5;

/** The longest `q` the invite limits search accepts; the server answers a
 *  longer one with a 400. The search field caps its own input at this too. */
export const QUOTA_SEARCH_MAX_LENGTH = 100;

/** A search term as the server reads it: trimmed, with one leading "@" left
 *  off so a pasted handle finds the member, and cut to
 *  {@link QUOTA_SEARCH_MAX_LENGTH} so a long paste still gets results. */
export function normalizeQuotaSearchTerm(searchTerm: string): string {
  return searchTerm
    .trim()
    .replace(/^@/, "")
    .trim()
    .slice(0, QUOTA_SEARCH_MAX_LENGTH)
    .trim();
}

/** Lower case with accents folded, so the demo search matches "ines" to
 *  "Inês" the way the server's own search does. */
function foldForDemoSearch(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Demo mode's stand-in for `GET /admin/invites/quotas`, built from the
 *  invite fixture as one page. Filtering here is demo only: live results come
 *  from the server's own search and are shown as they arrive. */
async function loadDemoInviteQuotas(
  searchTerm: string,
): Promise<AdminInviteQuotaListDTO> {
  const {
    ADMIN_INVITES,
    ADMIN_INVITE_DEMO_QUOTA_OVERRIDES,
    ADMIN_INVITE_DEMO_PAUSED_SLUGS,
  } = await import("../adminInvites.data");
  const currentMonthKey = demoCurrentMonthKey(ADMIN_INVITES);
  const membersBySlug = new Map<string, AdminInviteQuotaMemberDTO>();
  for (const invite of ADMIN_INVITES) {
    const { slug, name, avatarUrl } = invite.inviter;
    const member = membersBySlug.get(slug) ?? {
      slug,
      name,
      avatarUrl: avatarUrl ?? null,
      sentThisMonth: 0,
      sentTotal: 0,
      inviteMonthlyQuota: null,
      monthlyLimit: DEMO_DEFAULT_MONTHLY_QUOTA,
      hasInviteAccess: !ADMIN_INVITE_DEMO_PAUSED_SLUGS.has(slug),
    };
    member.sentTotal += 1;
    if (invite.createdAt.startsWith(currentMonthKey)) member.sentThisMonth += 1;
    membersBySlug.set(slug, member);
  }
  const foldedTerm = foldForDemoSearch(searchTerm);
  const items = [...membersBySlug.values()]
    .map((member) => {
      const inviteMonthlyQuota = demoQuotaOverridesBySlug.has(member.slug)
        ? (demoQuotaOverridesBySlug.get(member.slug) ?? null)
        : (ADMIN_INVITE_DEMO_QUOTA_OVERRIDES[member.slug] ?? null);
      return {
        ...member,
        inviteMonthlyQuota,
        monthlyLimit: inviteMonthlyQuota ?? DEMO_DEFAULT_MONTHLY_QUOTA,
      };
    })
    .filter(
      (member) =>
        !foldedTerm ||
        foldForDemoSearch(member.name).includes(foldedTerm) ||
        foldForDemoSearch(member.slug).includes(foldedTerm),
    )
    .sort(
      (first, second) =>
        second.sentThisMonth - first.sentThisMonth ||
        first.name.localeCompare(second.name),
    );
  // pageSize === items.length (min 1), so getNextPageParam ends at page 1.
  return {
    defaultMonthlyQuota: DEMO_DEFAULT_MONTHLY_QUOTA,
    items,
    total: items.length,
    page: 1,
    pageSize: items.length || 1,
  };
}

/** Every loaded page's rows in order, each member once. The pages are OFFSET
 *  pages ordered by this month's sends, so when counts shift between two page
 *  loads a member can come back on a later page too; the first occurrence
 *  wins, so each slug keys one row and one editor. */
function uniqueQuotaMembers(
  pages: AdminInviteQuotaPageVM[],
): AdminInviteQuotaMemberDTO[] {
  const seenSlugs = new Set<string>();
  const members: AdminInviteQuotaMemberDTO[] = [];
  for (const page of pages) {
    for (const member of page.items) {
      if (seenSlugs.has(member.slug)) continue;
      seenSlugs.add(member.slug);
      members.push(member);
    }
  }
  return members;
}

/**
 * The invite limits list behind the "Manage invite quotas" modal, searched by
 * member name or handle on the server. The term is debounced, and while the
 * next term's results load the previous ones stay on screen
 * (`keepPreviousData`), so the list never flashes empty mid-typing.
 *
 * Live mode calls `GET /admin/invites/quotas?q&page`, 20 rows a page, until
 * the loaded rows reach the server's `total`. Demo mode builds one page from
 * the invite fixture (see {@link loadDemoInviteQuotas}) and never touches the
 * network, since the endpoint is admin-only.
 */
export function useAdminInviteQuotas(searchTerm: string) {
  const { demoMode } = useDemoMode();
  const normalizedTerm = normalizeQuotaSearchTerm(searchTerm);
  const debouncedTerm = useDebouncedValue(normalizedTerm);
  const query = useInfiniteQuery<AdminInviteQuotaPageVM>({
    queryKey: ["admin-invite-quotas", demoMode, debouncedTerm],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      const page = demoMode
        ? await loadDemoInviteQuotas(debouncedTerm)
        : await getAdminInviteQuotas({
            q: debouncedTerm || undefined,
            page: pageParam as number,
          });
      return { ...page, searchTerm: debouncedTerm };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const firstPage = query.data?.pages[0];
  const loadedPages = query.data?.pages;
  const members = useMemo(
    () => uniqueQuotaMembers(loadedPages ?? []),
    [loadedPages],
  );
  return {
    ...query,
    members,
    total: firstPage?.total ?? 0,
    defaultMonthlyQuota: firstPage?.defaultMonthlyQuota ?? null,
    /** The term the rows on screen answer. It trails the typed one while the
     *  debounce settles and the next search loads. */
    shownTerm: firstPage?.searchTerm ?? "",
    /** True from the first keystroke of a new term until its rows arrive. */
    isSearching:
      normalizedTerm !== debouncedTerm ||
      (query.isPlaceholderData && query.isFetching),
  };
}

/** Write one demo save into every cached invite limits page, so the row shows
 *  it at once and keeps it under any search term already loaded. A cleared
 *  override falls back to that page's default (demo has no bonuses). */
function patchDemoInviteQuotaRows(
  queryClient: ReturnType<typeof useQueryClient>,
  slug: string,
  quota: number | null,
) {
  demoQuotaOverridesBySlug.set(slug, quota);
  queryClient.setQueriesData<InfiniteData<AdminInviteQuotaPageVM>>(
    { queryKey: ["admin-invite-quotas", true] },
    (current) =>
      current && {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.map((member) =>
            member.slug === slug
              ? {
                  ...member,
                  inviteMonthlyQuota: quota,
                  monthlyLimit: quota ?? page.defaultMonthlyQuota,
                }
              : member,
          ),
        })),
      },
  );
}

/** `["admin-invite-inviters", demoMode]`'s cache holds a plain array (not a
 *  paginated/infinite shape), so patching one inviter in place is a direct
 *  `setQueryData` map, with no snapshot/rollback machinery for a control this
 *  small; a failed save leaves the value unpatched and the invite limits
 *  modal shows the reason on the row. */
function patchInviteQuotaInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  demoMode: boolean,
  slug: string,
  inviteMonthlyQuota: number | null,
) {
  queryClient.setQueryData<AdminInviteInviterDTO[]>(
    ["admin-invite-inviters", demoMode],
    (current) =>
      current?.map((inviter) =>
        inviter.slug === slug ? { ...inviter, inviteMonthlyQuota } : inviter,
      ),
  );
}

export interface UpdateInviteQuotaVars {
  slug: string;
  quota: number | null;
}

/**
 * Set or clear one member's monthly invite quota override, from a row of the
 * invite limits modal. `quota: null` clears the override back to the
 * platform-wide default.
 *
 * Demo mode never touches the network (this is an admin-only endpoint): it
 * resolves a synthetic result after the usual demo latency and patches the
 * `admin-invite-inviters` and `admin-invite-quotas` caches directly,
 * mirroring `useGrantStaffRole`'s "the patch IS the source of truth"
 * approach.
 *
 * Live mode calls `PATCH /admin/members/:memberSlug/invite-quota`, patches the
 * inviters cache from the result, and then waits for the invite limits list
 * to refetch before it settles: only the server knows the default plus bonus
 * a cleared override falls back to, so the row stays pending until the real
 * `monthlyLimit` is in and the number moves once.
 *
 * The modal shows a failed save on the row itself with its reason, so the
 * app-wide error toast stays out (`silentError`).
 */
export function useUpdateInviteQuota({
  onSaved,
}: {
  /** Runs once the save has settled, from the mutation's own `onSuccess`, so
   *  it still runs when the refetch drops the saved row and unmounts the
   *  caller (a per-`mutate` callback would be skipped then). */
  onSaved?: (variables: UpdateInviteQuotaVars) => void;
} = {}) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminInviteQuotaDTO,
    unknown,
    UpdateInviteQuotaVars
  >({
    demoMode,
    mutationKey: ["admin-invite-inviters", "update-quota"],
    meta: { silentError: true },
    demoResult: ({ slug, quota }) => ({
      userId: slug,
      slug,
      inviteMonthlyQuota: quota,
    }),
    live: async ({ slug, quota }) => {
      const result = await patchAdminInviteQuota(slug, quota);
      await queryClient.invalidateQueries({
        queryKey: ["admin-invite-quotas", demoMode],
      });
      return result;
    },
    logLabel: "admin.invite.updateQuota",
    logContext: ({ slug, quota }) => ({ slug, quota }),
    onSuccess: (_data, variables) => {
      const { slug, quota } = variables;
      patchInviteQuotaInCache(queryClient, demoMode, slug, quota);
      if (demoMode) patchDemoInviteQuotaRows(queryClient, slug, quota);
      onSaved?.(variables);
    },
  });
}

/**
 * Replace one invite everywhere the paginated `admin-invites` cache holds it.
 *
 * The cache is an infinite query keyed by `[key, demoMode, filter, inviterSlug]`,
 * so the same invite can sit in several cached filter/sender combinations at
 * once. `setQueriesData` with a partial key patches all of them in one pass, and
 * a row that no longer matches its query's filter stays where it is: dropping
 * it would make the row vanish mid-read for the admin who just acted on it. The status chip changing to "Revoked" is the honest signal
 * while the drawer stays open; membership is reconciled when the drawer closes
 * (see {@link useReconcileAdminInviteMembership}).
 */
function patchInviteInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  demoMode: boolean,
  invite: AdminInviteDTO,
) {
  queryClient.setQueriesData<{ pages: AdminInvitesPageVM[] }>(
    { queryKey: ["admin-invites", demoMode] },
    (current) =>
      current && {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.map((row) => (row.id === invite.id ? invite : row)),
        })),
      },
  );
}

/** Whether a row with `status` belongs in a list filtered by `filter`: the
 *  "all" list holds every status, every other filter holds only its own. */
export function isInviteInFilter(
  filter: AdminInviteFilter,
  status: AdminInviteStatus,
): boolean {
  return filter === "all" || filter === status;
}

/** The filter segment of an `["admin-invites", demoMode, filter, inviterSlug]`
 *  key. */
function filterFromQueryKey(queryKey: QueryKey): AdminInviteFilter {
  return queryKey[2] as AdminInviteFilter;
}

/**
 * Settles list membership for an invite whose status changed while its drawer
 * was open, called once that drawer closes. `patchInviteInCache` deliberately
 * leaves the row where it was so it does not vanish mid-read; this is the
 * second half of that.
 *
 * Every cached `admin-invites` list whose filter no longer admits the new
 * status drops the row, and its `total` (read from `pages[0].total`, and used by
 * `getNextPageParam` on every page) goes down by one so any count stays right.
 * The splice is a direct cache write in both modes: a refetch in demo mode would
 * re-read the unchanged fixture and bring the old status back.
 *
 * Live mode also marks the lists for the new status stale without refetching
 * them, so the Pending or Revoked tab picks the row up the next time it is
 * shown. Demo mode skips that for the same fixture reason.
 */
export function useReconcileAdminInviteMembership() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useCallback(
    (invite: AdminInviteDTO) =>
      settleInviteMembership(queryClient, demoMode, invite),
    [queryClient, demoMode],
  );
}

/**
 * The body of {@link useReconcileAdminInviteMembership} as a plain function,
 * so the bulk hooks can settle many rows at once from inside their
 * `onSuccess`, where a hook cannot be called.
 */
function settleInviteMembership(
  queryClient: ReturnType<typeof useQueryClient>,
  demoMode: boolean,
  invite: AdminInviteDTO,
) {
  const cachedLists = queryClient.getQueriesData<
    InfiniteData<AdminInvitesPageVM>
  >({ queryKey: ["admin-invites", demoMode] });
  for (const [queryKey, cachedList] of cachedLists) {
    if (
      !cachedList ||
      isInviteInFilter(filterFromQueryKey(queryKey), invite.status)
    )
      continue;
    const hasRow = cachedList.pages.some((page) =>
      page.items.some((row) => row.id === invite.id),
    );
    if (!hasRow) continue;
    queryClient.setQueryData<InfiniteData<AdminInvitesPageVM>>(queryKey, {
      ...cachedList,
      pages: cachedList.pages.map((page) => ({
        ...page,
        items: page.items.filter((row) => row.id !== invite.id),
        total: Math.max(0, page.total - 1),
      })),
    });
  }
  if (demoMode) return;
  void queryClient.invalidateQueries({
    queryKey: ["admin-invites", demoMode, invite.status],
    refetchType: "none",
  });
}

/**
 * Revoke a still-valid invite from the admin oversight drawer, whoever sent it.
 * Destructive: the shared link stops working immediately and there is no
 * un-revoke, so the caller gates this behind the shared `ConfirmDialog`.
 *
 * Demo mode never touches the network (this is an admin-only endpoint that 403s
 * otherwise) and resolves a synthetic revoked row; live mode calls
 * `DELETE /admin/invites/:id`. Either way the cache is patched from the RESULT
 * in `onSuccess`, after the server answers, so the row only reads "Revoked" once
 * the revoke is real.
 */
export function useRevokeAdminInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<AdminInviteDTO, unknown, AdminInviteDTO>({
    demoMode,
    mutationKey: ["admin-invites", "revoke"],
    // This write owns its error UI: the caller tells a 409 ("the invite moved
    // on") apart from a real failure, which the app-wide MutationCache handler
    // would flatten into one generic toast (and double up on).
    meta: { silentError: true },
    demoResult: (invite) => ({ ...invite, status: "revoked" as const }),
    live: (invite) => deleteAdminInvite(invite.id),
    logLabel: "admin.invite.revoke",
    logContext: (invite) => ({ id: invite.id }),
    onSuccess: (revoked) => {
      patchInviteInCache(queryClient, demoMode, revoked);
    },
  });
}

/** How long a refreshed invite stays open: the backend sets `expiresAt` to
 *  now plus this, and demo mode mirrors it. */
const REFRESHED_INVITE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Refresh an expired invite from the admin oversight drawer, whoever sent it.
 * The code stays the same, so the link the inviter already shared works again
 * for seven days; the caller gates this behind the shared `ConfirmDialog`.
 *
 * Demo mode never touches the network (this is an admin-only endpoint that 403s
 * otherwise) and resolves a synthetic valid row; live mode calls
 * `POST /admin/invites/:id/refresh`. Either way the cache is patched from the
 * RESULT in `onSuccess`, after the server answers, so the row only reads
 * "Pending" once the refresh is real.
 */
export function useRefreshAdminInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<AdminInviteDTO, unknown, AdminInviteDTO>({
    demoMode,
    mutationKey: ["admin-invites", "refresh"],
    // Same reason as the revoke: the caller tells a 409 apart from a real
    // failure, so the app-wide generic toast stays out of it.
    meta: { silentError: true },
    demoResult: (invite) => ({
      ...invite,
      status: "valid" as const,
      expiresAt: new Date(
        Date.now() + REFRESHED_INVITE_LIFETIME_MS,
      ).toISOString(),
    }),
    live: (invite) => postAdminInviteRefresh(invite.id),
    logLabel: "admin.invite.refresh",
    logContext: (invite) => ({ id: invite.id }),
    onSuccess: (refreshed) => {
      patchInviteInCache(queryClient, demoMode, refreshed);
    },
  });
}

/** The reason the backend gives for leaving `invite` alone under `action`,
 *  or null when the action applies to it. Mirrors the single routes' rules:
 *  refresh needs an expired invite, revoke needs a pending one. */
function bulkSkipReasonFor(
  action: AdminInviteBulkAction,
  status: AdminInviteStatus,
): AdminInviteBulkSkipReason | null {
  if (status === "used") return "accepted";
  if (status === "revoked") return "revoked";
  if (action === "refresh") return status === "expired" ? null : "still_valid";
  return status === "valid" ? null : "expired";
}

/** The new state of an invite a refresh brought back: pending again, with
 *  seven more days from now. */
function refreshedInvite(invite: AdminInviteDTO): AdminInviteDTO {
  return {
    ...invite,
    status: "valid",
    expiresAt: new Date(
      Date.now() + REFRESHED_INVITE_LIFETIME_MS,
    ).toISOString(),
  };
}

/** Demo mode's stand-in for `POST /admin/invites/bulk`: the same per-invite
 *  rules, worked out from each row's status with no network. */
function demoBulkResult(
  action: AdminInviteBulkAction,
  invites: AdminInviteDTO[],
): AdminInviteBulkResultDTO {
  const result: AdminInviteBulkResultDTO = { updated: [], skipped: [] };
  for (const invite of invites) {
    const reason = bulkSkipReasonFor(action, invite.status);
    if (reason) {
      result.skipped.push({ id: invite.id, code: invite.code, reason });
    } else {
      result.updated.push(
        action === "refresh"
          ? refreshedInvite(invite)
          : { ...invite, status: "revoked" },
      );
    }
  }
  return result;
}

/** Patch each changed row into every cached list, then settle membership
 *  straight away: a bulk action has no open drawer to wait for, so acted-on
 *  cards leave a filtered list now and each list's `total` stays right. */
function applyChangedInvites(
  queryClient: ReturnType<typeof useQueryClient>,
  demoMode: boolean,
  changedInvites: AdminInviteDTO[],
) {
  for (const invite of changedInvites) {
    patchInviteInCache(queryClient, demoMode, invite);
    settleInviteMembership(queryClient, demoMode, invite);
  }
}

export interface BulkAdminInviteActionVars {
  action: AdminInviteBulkAction;
  /** The invites to act on. The caller sends only the eligible ones; any that
   *  moved on in the meantime come back in `skipped`. */
  invites: AdminInviteDTO[];
}

/**
 * Refresh or revoke many invites at once from the oversight page's selection
 * bar. Live mode sends their ids to `POST /admin/invites/bulk`; demo mode works
 * the result out locally from each row's status and never touches the network.
 *
 * The cache is patched from the RESULT once it arrives, and membership is
 * settled at once, so acted-on cards leave a filtered list with the grid's
 * exit animation. The caller owns the toasts (success count, skipped
 * reasons, request failure), so the app-wide error toast stays out.
 *
 * Live mode then refetches every shown invite list. Each removed row lowers
 * the cached `total` by one, which `getNextPageParam` reads, and the server
 * shifted later rows up into the freed places: without the refetch a bulk
 * that empties a loaded page ends Load more early, and a smaller one makes
 * the next page skip the rows that moved up. The refetch also brings in the
 * new status of rows the server skipped (an invite accepted meanwhile). The
 * acted-on rows are already out of the cache, so none flash back. Demo mode
 * skips it: a refetch there re-reads the unchanged fixture.
 */
export function useBulkAdminInviteAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminInviteBulkResultDTO,
    unknown,
    BulkAdminInviteActionVars
  >({
    demoMode,
    mutationKey: ["admin-invites", "bulk"],
    meta: { silentError: true },
    demoResult: ({ action, invites }) => demoBulkResult(action, invites),
    live: ({ action, invites }) =>
      postAdminInvitesBulk(
        action,
        invites.map((invite) => invite.id),
      ),
    logLabel: "admin.invite.bulk",
    logContext: ({ action, invites }) => ({ action, count: invites.length }),
    onSuccess: (result) => {
      applyChangedInvites(queryClient, demoMode, result.updated);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-invites", demoMode],
        refetchType: "active",
      });
    },
  });
}

/** Every distinct expired row across the cached `admin-invites` lists, from
 *  one sender when `inviterSlug` is given. Demo mode's whole invite graph is
 *  what the cache holds, so this is the set a refresh-all would touch. */
function collectCachedExpiredInvites(
  queryClient: ReturnType<typeof useQueryClient>,
  demoMode: boolean,
  inviterSlug: string | null,
): AdminInviteDTO[] {
  const expiredById = new Map<string, AdminInviteDTO>();
  const cachedLists = queryClient.getQueriesData<
    InfiniteData<AdminInvitesPageVM>
  >({ queryKey: ["admin-invites", demoMode] });
  for (const [, cachedList] of cachedLists) {
    for (const page of cachedList?.pages ?? []) {
      for (const row of page.items) {
        const isFromSender = !inviterSlug || row.inviter.slug === inviterSlug;
        if (row.status === "expired" && isFromSender) {
          expiredById.set(row.id, row);
        }
      }
    }
  }
  return [...expiredById.values()];
}

export interface RefreshAllExpiredAdminInvitesVars {
  /** Only this sender's expired invites, or every sender's when null. */
  inviterSlug: string | null;
}

/**
 * Refresh every expired invite at once, platform-wide or from one sender,
 * from the oversight page's Expired tab. Each keeps its code and works again
 * for seven days.
 *
 * Live mode calls `POST /admin/invites/refresh-expired`, whose response is
 * only a count, then refetches every invite list and the senders list. Demo
 * mode never touches the network: it turns each cached expired row (from the
 * sender, when one is given) pending again and settles membership the same
 * way the bulk action does, and `refreshedCount` is how many distinct rows
 * changed.
 */
export function useRefreshAllExpiredAdminInvites() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminInviteRefreshExpiredResultDTO,
    unknown,
    RefreshAllExpiredAdminInvitesVars
  >({
    demoMode,
    mutationKey: ["admin-invites", "refresh-expired"],
    meta: { silentError: true },
    // The cache write sits here, in the demo branch alone, because demo mode
    // has no server to count for it: the rows it changes are the count.
    demoResult: ({ inviterSlug }) => {
      const refreshedInvites = collectCachedExpiredInvites(
        queryClient,
        demoMode,
        inviterSlug,
      ).map(refreshedInvite);
      applyChangedInvites(queryClient, demoMode, refreshedInvites);
      return { refreshedCount: refreshedInvites.length };
    },
    live: ({ inviterSlug }) =>
      postAdminInvitesRefreshExpired(inviterSlug ?? undefined),
    logLabel: "admin.invite.refreshExpired",
    logContext: ({ inviterSlug }) => ({ inviterSlug }),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-invites", demoMode],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin-invite-inviters", demoMode],
      });
    },
  });
}
