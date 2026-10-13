import { useCallback } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  deleteAdminInvite,
  getAdminInvites,
  getAdminInviteInviters,
  patchAdminInviteQuota,
  postAdminInviteRefresh,
  type AdminInviteDTO,
  type AdminInviteInviterDTO,
  type AdminInviteQuotaDTO,
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
 * never hits the network — this is an admin-only endpoint that 403s otherwise,
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
        // undefined — demo never issues a page-2 fetch.
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
              // The fixture carries no quota overrides of its own — every demo
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

/** `["admin-invite-inviters", demoMode]`'s cache holds a plain array (not a
 *  paginated/infinite shape), so patching one inviter in place is a direct
 *  `setQueryData` map — no snapshot/rollback machinery needed for a control
 *  this small; a failed save just leaves the value unpatched and the mutation
 *  error surfaces through the global mutation-error toast. */
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
 * Set or clear one member's monthly invite quota override, from the invite
 * oversight page's per-inviter row. `quota: null` clears the override back to
 * the platform-wide default.
 *
 * Demo mode never touches the network (this is an admin-only endpoint) — it
 * resolves a synthetic result and patches the `admin-invite-inviters` cache
 * directly, mirroring `useGrantStaffRole`'s "the patch IS the source of
 * truth" approach. Live mode calls
 * `PATCH /admin/members/:memberSlug/invite-quota` and patches the same cache
 * on success rather than a full refetch, since the response already carries
 * the new value.
 */
export function useUpdateInviteQuota() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminInviteQuotaDTO,
    unknown,
    UpdateInviteQuotaVars
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-invite-inviters", "update-quota"],
    demoResult: ({ slug, quota }) => ({
      userId: slug,
      slug,
      inviteMonthlyQuota: quota,
    }),
    live: ({ slug, quota }) => patchAdminInviteQuota(slug, quota),
    onSuccess: (_data, { slug, quota }) => {
      patchInviteQuotaInCache(queryClient, demoMode, slug, quota);
    },
  });
}

/**
 * Replace one invite everywhere the paginated `admin-invites` cache holds it.
 *
 * The cache is an infinite query keyed by `[key, demoMode, filter, inviterSlug]`,
 * so the same invite can sit in several cached filter/sender combinations at
 * once. `setQueriesData` with a partial key patches all of them in one pass, and
 * a row that no longer matches its query's filter is left in place rather than
 * spliced out: dropping it would make the row vanish mid-read for the admin who
 * just acted on it. The status chip changing to "Revoked" is the honest signal
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
    (invite: AdminInviteDTO) => {
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
    },
    [queryClient, demoMode],
  );
}

/**
 * Revoke a still-valid invite from the admin oversight drawer, whoever sent it.
 * Destructive: the shared link stops working immediately and there is no
 * un-revoke, so the caller gates this behind the shared `ConfirmDialog`.
 *
 * Demo mode never touches the network (this is an admin-only endpoint that 403s
 * otherwise) and resolves a synthetic revoked row; live mode calls
 * `DELETE /admin/invites/:id`. Either way the cache is patched from the RESULT
 * in `onSuccess` — never optimistically — so the row only reads "Revoked" once
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
