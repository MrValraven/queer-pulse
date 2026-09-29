import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";
import type { AmbassadorFocusArea } from "../../../shared/ambassadors/ambassadorFocusAreas.data";
import { useDemoAwareMutation } from "../api/demoAwareMutation";
import {
  getAdminAmbassadorHistory,
  getAdminAmbassadors,
  getAmbassadorCircle,
  grantAmbassador,
  revokeAmbassador,
  takeAmbassadorCircleStaffSeat,
  updateAmbassadorFocus,
  type AdminAmbassadorCircleDTO,
  type AdminAmbassadorDTO,
  type AdminAmbassadorStatus,
} from "./adminAmbassadors.api";
import {
  ADMIN_AMBASSADOR_CIRCLE_DEMO,
  ADMIN_AMBASSADORS_DEMO,
  AMBASSADOR_CIRCLE_SLUG_DEMO,
} from "./adminAmbassadors.data";

export const ADMIN_AMBASSADORS_KEY = "admin-ambassadors";
export const ADMIN_AMBASSADOR_CIRCLE_KEY = "admin-ambassador-circle";
/** `useAmbassadorMap`'s root: the tag everywhere else reads it, so a grant or
 *  revoke refreshes it here instead of waiting out its hour-long staleTime. */
const PLATFORM_AMBASSADORS_KEY = "platform-ambassadors";

/** Demo mode's writable copy of the fixture, so a grant, a focus change or a
 *  revoke survives the refetch that follows it for the rest of the visit. */
let demoRows: AdminAmbassadorDTO[] = [...ADMIN_AMBASSADORS_DEMO];
let demoCircle: AdminAmbassadorCircleDTO = { ...ADMIN_AMBASSADOR_CIRCLE_DEMO };

function statusOf(row: AdminAmbassadorDTO): AdminAmbassadorStatus {
  return row.revokedAt ? "past" : "active";
}

/** Newest first by `field`, the order the backend pages in. ISO timestamps
 *  sort as strings. */
function newestFirst(
  rows: AdminAmbassadorDTO[],
  field: "grantedAt" | "revokedAt",
): AdminAmbassadorDTO[] {
  return [...rows].sort((left, right) =>
    (right[field] ?? "").localeCompare(left[field] ?? ""),
  );
}

/** Demo mode answers the whole filtered list as one page, so
 *  `getNextPageParam` yields undefined and no page 2 is ever asked for. */
function singlePage(rows: AdminAmbassadorDTO[]): ItemsPage<AdminAmbassadorDTO> {
  return {
    items: rows,
    total: rows.length,
    page: 1,
    pageSize: rows.length || 1,
  };
}

type AmbassadorPages = InfiniteData<ItemsPage<AdminAmbassadorDTO>>;

function invalidateAmbassadors(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [ADMIN_AMBASSADORS_KEY] });
  void queryClient.invalidateQueries({
    queryKey: [ADMIN_AMBASSADOR_CIRCLE_KEY],
  });
  void queryClient.invalidateQueries({ queryKey: [PLATFORM_AMBASSADORS_KEY] });
}

/**
 * Rewrites every cached page of one tab, demo and live alike. `update` gets
 * each page's rows and whether it is the first page, the one a new row joins
 * at the top of.
 */
function patchRows(
  queryClient: QueryClient,
  status: AdminAmbassadorStatus,
  update: (
    rows: AdminAmbassadorDTO[],
    isFirstPage: boolean,
  ) => AdminAmbassadorDTO[],
) {
  queryClient.setQueriesData<AmbassadorPages>(
    { queryKey: [ADMIN_AMBASSADORS_KEY, status] },
    (cache) =>
      cache
        ? {
            ...cache,
            pages: cache.pages.map((page, pageIndex) => ({
              ...page,
              items: update(page.items, pageIndex === 0),
            })),
          }
        : cache,
  );
}

/**
 * One tab of grants, paginated, newest first (active by grant date, past by
 * revoke date). Live mode calls `GET /admin/ambassadors?status&page`; demo
 * mode answers the writable fixture as a single page.
 */
export function useAdminAmbassadors(status: AdminAmbassadorStatus) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminAmbassadorDTO>>({
    queryKey: [ADMIN_AMBASSADORS_KEY, status, demoMode],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      demoMode
        ? Promise.resolve(
            singlePage(
              newestFirst(
                demoRows.filter((row) => statusOf(row) === status),
                status === "past" ? "revokedAt" : "grantedAt",
              ),
            ),
          )
        : getAdminAmbassadors(status, pageParam as number, signal),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, rows, total };
}

/**
 * Every grant one member has held, active and revoked, newest first, for the
 * History drawer. Idle until a member is picked (`userId` null).
 */
export function useAdminAmbassadorHistory(userId: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminAmbassadorDTO[]>({
    queryKey: [ADMIN_AMBASSADORS_KEY, "history", userId, demoMode],
    enabled: userId !== null,
    queryFn: ({ signal }) =>
      demoMode
        ? newestFirst(
            demoRows.filter((row) => row.member.userId === userId),
            "grantedAt",
          )
        : getAdminAmbassadorHistory(userId ?? "", signal),
  });
}

export function useAdminAmbassadorCircle() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminAmbassadorCircleDTO>({
    queryKey: [ADMIN_AMBASSADOR_CIRCLE_KEY, demoMode],
    queryFn: () => (demoMode ? { ...demoCircle } : getAmbassadorCircle()),
  });
}

/** The member picked in the grant panel. Demo mode needs the name and avatar
 *  to build the row the server would otherwise send back. */
export interface GrantAmbassadorVariables {
  member: { slug: string; name: string; avatarUrl?: string };
  focusArea: AmbassadorFocusArea;
  reason: string;
}

function demoGrant({
  member,
  focusArea,
  reason,
}: GrantAmbassadorVariables): AdminAmbassadorDTO {
  const isAlreadyActive = demoRows.some(
    (row) => row.member.slug === member.slug && !row.revokedAt,
  );
  if (isAlreadyActive) {
    throw new ApiError(409, "Already an ambassador", {
      code: "ambassador_already_active",
    });
  }
  const [firstName = member.name, ...lastNames] = member.name.split(" ");
  // A re-grant keeps the member's id, so their History lists both grants.
  const earlierGrant = demoRows.find(
    (existing) => existing.member.slug === member.slug,
  );
  const row: AdminAmbassadorDTO = {
    id: `demo-ambassador-${member.slug}-${Date.now()}`,
    member: {
      userId: earlierGrant?.member.userId ?? `demo-user-${member.slug}`,
      slug: member.slug,
      firstName,
      lastName: lastNames.join(" "),
      avatarUrl: member.avatarUrl ?? null,
    },
    focusArea,
    grantedAt: new Date().toISOString(),
    grantedBy: null,
    grantReason: reason,
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    isTagVisible: true,
    inviteQuotaOverride: null,
  };
  demoRows = [row, ...demoRows];
  demoCircle = { ...demoCircle, memberCount: demoCircle.memberCount + 1 };
  return row;
}

export function useGrantAmbassador() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminAmbassadorDTO,
    Error,
    GrantAmbassadorVariables
  >({
    demoMode,
    meta: { silentError: true },
    demoResult: demoGrant,
    live: ({ member, focusArea, reason }) =>
      grantAmbassador({ memberSlug: member.slug, focusArea, reason }),
    logLabel: "admin.ambassador.grant",
    logContext: ({ member, focusArea }) => ({ slug: member.slug, focusArea }),
    onSuccess: (row) => {
      patchRows(queryClient, "active", (rows, isFirstPage) => {
        const others = rows.filter((existing) => existing.id !== row.id);
        return isFirstPage ? [row, ...others] : others;
      });
      invalidateAmbassadors(queryClient);
    },
  });
}

export function useChangeAmbassadorFocus() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminAmbassadorDTO,
    Error,
    { row: AdminAmbassadorDTO; focusArea: AmbassadorFocusArea }
  >({
    demoMode,
    meta: { silentError: true },
    demoResult: ({ row, focusArea }) => {
      const updated = { ...row, focusArea };
      demoRows = demoRows.map((existing) =>
        existing.id === row.id ? updated : existing,
      );
      return updated;
    },
    live: ({ row, focusArea }) => updateAmbassadorFocus(row.id, focusArea),
    logLabel: "admin.ambassador.focus",
    logContext: ({ row, focusArea }) => ({ id: row.id, focusArea }),
    onSuccess: (updated) => {
      patchRows(queryClient, "active", (rows) =>
        rows.map((existing) =>
          existing.id === updated.id ? updated : existing,
        ),
      );
      invalidateAmbassadors(queryClient);
    },
  });
}

/**
 * Revoke waits for the server and then moves the row from Active to Past in
 * the cache, in `onSuccess`. The row unmounts at that moment, which is why the
 * page hosts the confirm modal and moves focus to its heading afterwards.
 */
export function useRevokeAmbassador() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminAmbassadorDTO,
    Error,
    { row: AdminAmbassadorDTO; reason: string }
  >({
    demoMode,
    meta: { silentError: true },
    demoResult: ({ row, reason }) => {
      const revoked: AdminAmbassadorDTO = {
        ...row,
        revokedAt: new Date().toISOString(),
        revokeReason: reason,
      };
      demoRows = demoRows.map((existing) =>
        existing.id === row.id ? revoked : existing,
      );
      demoCircle = {
        ...demoCircle,
        memberCount: Math.max(0, demoCircle.memberCount - 1),
      };
      return revoked;
    },
    live: ({ row, reason }) => revokeAmbassador(row.id, reason),
    logLabel: "admin.ambassador.revoke",
    logContext: ({ row }) => ({ id: row.id }),
    onSuccess: (revoked) => {
      patchRows(queryClient, "active", (rows) =>
        rows.filter((existing) => existing.id !== revoked.id),
      );
      patchRows(queryClient, "past", (rows, isFirstPage) => {
        const others = rows.filter((existing) => existing.id !== revoked.id);
        return isFirstPage ? [revoked, ...others] : others;
      });
      invalidateAmbassadors(queryClient);
    },
  });
}

export function useTakeAmbassadorCircleStaffSeat() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<{ slug: string }, Error, void>({
    demoMode,
    meta: { silentError: true },
    // The seat founds the circle when nothing has yet, as the backend does.
    demoResult: () => {
      demoCircle = {
        ...demoCircle,
        isFounded: true,
        slug: AMBASSADOR_CIRCLE_SLUG_DEMO,
        isViewerMember: true,
        memberCount: demoCircle.memberCount + 1,
      };
      return { slug: AMBASSADOR_CIRCLE_SLUG_DEMO };
    },
    live: () => takeAmbassadorCircleStaffSeat(),
    logLabel: "admin.ambassador.staffSeat",
    onSuccess: () => {
      queryClient.setQueriesData<AdminAmbassadorCircleDTO>(
        { queryKey: [ADMIN_AMBASSADOR_CIRCLE_KEY] },
        (circle) => (circle ? { ...circle, isViewerMember: true } : circle),
      );
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_AMBASSADOR_CIRCLE_KEY],
      });
    },
  });
}
