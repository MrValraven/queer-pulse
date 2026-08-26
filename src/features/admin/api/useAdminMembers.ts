import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ACTIVE_MEMBER_COUNT,
  cardForFlagged,
  detailFor,
  FLAGGED,
  MEMBERS,
  type AdminMember,
  type FlaggedMember,
  type MemberDetail,
} from "../adminMembers.data";
import type { StaffRoleId } from "../staffRoles.registry";
import {
  cardDtoToMember,
  detailDtoToMember,
  detailDtoToMemberCard,
  flaggedDtoToMember,
} from "./adminMembers.adapters";
import {
  citeMember,
  getAdminFlagged,
  getAdminMember,
  getAdminMembers,
  getMemberRestriction,
  grantStaffRole,
  liftMemberRestriction,
  liftUserSuspension,
  patchAdminMemberRole,
  restrictMember,
  revokeStaffRole,
  verifyMember,
  type AdminMemberRoleDTO,
  type AdminStaffRolesDTO,
  type CitedMemberDTO,
  type LiftRestrictionInput,
  type MemberRestrictionDTO,
  type MemberRole,
  type RestrictedMemberDTO,
  type RestrictMemberInput,
  type VerifiedMemberDTO,
} from "./adminMembers.api";

interface AdminMembersPageVM {
  items: AdminMember[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Admin member directory grid, paginated. Demo mode returns the whole
 * `MEMBERS` fixture as a single synthetic page whose `pageSize` is set to
 * `ACTIVE_MEMBER_COUNT` (the vanity total shown in the header) rather than to
 * `MEMBERS.length` — that makes `page * pageSize === total` after page 1, so
 * `getNextPageParam` returns `undefined` and demo mode never issues a page-2
 * fetch, while the header still reads the platform's real 8,412 total. Live
 * mode calls `GET /admin/members` and adapts each card DTO through
 * `cardDtoToMember`, stopping once `page * pageSize` reaches the server's
 * real `total`.
 *
 * `language` sits in the query key (not just `fmt`/`t` in the closure)
 * because `cardDtoToMember` resolves catalog keys and locale-formats
 * dates/relative-times through them — a language switch must re-map the
 * already-fetched DTOs, not just re-render stale English strings.
 */
export function useAdminMembers(filter: "all" | "verified" | "new") {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const query = useInfiniteQuery<AdminMembersPageVM>({
    queryKey: ["admin-members", demoMode, filter, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const filteredMembers =
          filter === "verified"
            ? MEMBERS.filter((member) => member.verified)
            : filter === "new"
              ? MEMBERS.filter((member) => member.newThisWeek)
              : MEMBERS;
        // pageSize === ACTIVE_MEMBER_COUNT so getNextPageParam yields
        // undefined (no page 2 in demo) while the header still shows the
        // 8,412 vanity total.
        return {
          items: filteredMembers,
          total: ACTIVE_MEMBER_COUNT,
          page: 1,
          pageSize: ACTIVE_MEMBER_COUNT,
        };
      }
      const listDto = await getAdminMembers({
        page: pageParam as number,
        filter,
      });
      return {
        items: listDto.items.map((cardDto) => cardDtoToMember(cardDto, t, fmt)),
        total: listDto.total,
        page: listDto.page,
        pageSize: listDto.pageSize,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const members = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, members, total };
}

/**
 * The flagged-members queue. Demo mode returns the colocated `FLAGGED`
 * fixture and never hits the network — this is an admin-only endpoint that
 * 403s for anyone else, and the fixture is fabricated data that must not
 * appear as platform truth unless the operator explicitly turned "Populate
 * platform" on.
 */
export function useAdminFlagged() {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<FlaggedMember[]>({
    queryKey: ["admin-members", "flagged", demoMode, language],
    initialData: demoMode ? FLAGGED : undefined,
    queryFn: async () => {
      if (demoMode) return FLAGGED;
      const flaggedDtos = await getAdminFlagged();
      return flaggedDtos.map((flaggedDto) =>
        flaggedDtoToMember(flaggedDto, t, fmt),
      );
    },
  });
}

/**
 * One member's drawer detail. `member` is nullable because the grid renders
 * with no row selected; `enabled` keeps the query from firing until a row is
 * opened.
 */
export function useAdminMember(member: AdminMember | null) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<MemberDetail | undefined>({
    queryKey: [
      "admin-members",
      "detail",
      member?.id ?? null,
      demoMode,
      language,
    ],
    enabled: member !== null,
    initialData: demoMode && member ? detailFor(member) : undefined,
    queryFn: async () => {
      if (demoMode) {
        return member ? detailFor(member) : undefined;
      }
      if (member === null) return undefined;
      return detailDtoToMember(await getAdminMember(member.id), t, fmt);
    },
  });
}

/**
 * The demo `AdminMember` card behind one id. The roster fixture answers first;
 * a flagged-only member (the queue lists people the roster fixture never
 * carries) is synthesized from their own `FLAGGED` entry by
 * {@link cardForFlagged}. Flagged fixtures use the handle without its "@" as
 * both id and slug, so a row that passes either resolves.
 */
function demoMemberCard(memberId: string): AdminMember | undefined {
  const rosterMember = MEMBERS.find((member) => member.id === memberId);
  if (rosterMember) return rosterMember;
  const flaggedMember = FLAGGED.find(
    (member) => member.id === memberId || member.slug === memberId,
  );
  return flaggedMember ? cardForFlagged(flaggedMember) : undefined;
}

/**
 * One member's `AdminMember` card, fetched by id rather than read off the
 * loaded roster. This is what the flagged queue needs to open the drawer,
 * since a flagged member is usually not on the roster page held in memory.
 *
 * Live mode maps `GET /admin/members/:id` through `detailDtoToMemberCard`
 * (the detail response carries every card field). Demo mode resolves from the
 * colocated fixtures instead and never hits the network, the same way
 * `useAdminFlagged` does. `memberId` is nullable because nothing is selected
 * until a row is opened; `enabled` keeps the query from firing until then.
 */
export function useAdminMemberCard(memberId: string | null) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<AdminMember | undefined>({
    queryKey: ["admin-members", "card", memberId, demoMode, language],
    enabled: memberId !== null,
    initialData:
      demoMode && memberId !== null ? demoMemberCard(memberId) : undefined,
    queryFn: async () => {
      if (memberId === null) return undefined;
      if (demoMode) return demoMemberCard(memberId);
      return detailDtoToMemberCard(await getAdminMember(memberId), t, fmt);
    },
  });
}

/**
 * Grant or revoke `moderator` / `admin` on one member.
 *
 * Demo mode never touches the network — it resolves a synthetic success DTO so
 * the operator can see the flow without mutating fixtures (the roster's demo
 * data is regenerated on every render from `MEMBERS`, so there is nothing to
 * persist). Live mode calls `PATCH /admin/members/:id/role`, where the backend
 * enforces every guardrail (no self-change, no house account, never the last
 * admin) and answers 403/409 with a specific reason — surfaced by the global
 * mutation-error toast (`handleMutationError`), so failures are never silent
 * and never faked into success.
 *
 * On success both the roster (`useAdminMembers`) and the open drawer
 * (`useAdminMember`) are invalidated via the shared `["admin-members"]` key
 * prefix, so the new role shows everywhere without a manual patch.
 */
export function useUpdateMemberRole() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminMemberRoleDTO,
    unknown,
    { memberId: string; slug: string; role: MemberRole; isSystem: boolean }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "update-role"],
    demoResult: ({ memberId, slug, role, isSystem }) => ({
      id: memberId,
      slug,
      role,
      isSystem,
    }),
    live: ({ memberId, role }) => patchAdminMemberRole(memberId, role),
    // Demo mode holds its roster in fixtures, not the cache — invalidating would
    // refetch nothing and needlessly churn. Live mode re-reads both the roster
    // and the drawer detail off the same key prefix.
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * Lift a member's active suspension (reinstate them).
 *
 * Demo mode never touches the network — it resolves synthetically so the
 * operator can walk the flow without mutating fixtures. Live mode calls
 * `PATCH /mod/users/:userId/suspension` (liftSuspension); the backend enforces
 * the guardrails and answers 403 with a specific reason, surfaced by the global
 * mutation-error toast. On success live mode invalidates the shared
 * `["admin-members"]` prefix so the drawer re-reads the member as reinstated.
 */
export function useLiftSuspension() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, { memberId: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "lift-suspension"],
    demoResult: () => undefined,
    live: async ({ memberId }) => {
      await liftUserSuspension(memberId);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * A member's live scoped restriction, so the drawer only offers a lift when
 * there is one in force.
 *
 * `restricted` is not carried on any other admin DTO, so this is its own small
 * read. Demo mode answers "not restricted" without touching the network: the
 * fixtures model suspension, not the scoped restriction, and inventing one
 * would put a control in the demo that maps to nothing.
 */
export function useMemberRestriction(memberId: string) {
  const { demoMode } = useDemoMode();
  return useQuery<MemberRestrictionDTO>({
    queryKey: ["admin-members", "restriction", memberId],
    queryFn: () => getMemberRestriction(memberId),
    enabled: !demoMode && Boolean(memberId),
    initialData: demoMode
      ? { id: memberId, restricted: false, restrictedUntil: null }
      : undefined,
  });
}

/**
 * Lift a member's scoped restriction (TS-09) — the way back out of a `restrict`
 * that did not exist before.
 *
 * Demo mode resolves synthetically. Live mode calls
 * `PATCH /admin/members/:id/restriction`, which is idempotent and tells the
 * member. On success the shared `["admin-members"]` prefix is invalidated, so
 * both this member's restriction read and the roster re-read.
 */
export function useLiftRestriction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    MemberRestrictionDTO,
    unknown,
    { memberId: string; input: LiftRestrictionInput }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "lift-restriction"],
    demoResult: ({ memberId }) => ({
      id: memberId,
      restricted: false,
      restrictedUntil: null,
    }),
    live: ({ memberId, input }) => liftMemberRestriction(memberId, input),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * Verify a member from the drawer.
 *
 * Demo mode never touches the network — it resolves a synthetic success DTO so
 * the operator can see the flow without mutating fixtures (the roster's demo
 * data is regenerated from `MEMBERS` on every render, so there's nothing to
 * persist). Live mode calls `POST /admin/members/:id/verify` (idempotent) and,
 * on success, invalidates the shared `["admin-members"]` prefix so the roster
 * row and the open drawer both re-read the member as verified. Failures surface
 * through the global mutation-error toast — never faked into success.
 */
export function useVerifyMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    VerifiedMemberDTO,
    unknown,
    { memberId: string; slug: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "verify"],
    demoResult: ({ memberId, slug }) => ({
      id: memberId,
      slug,
      verified: true,
      verifiedAt: new Date().toISOString(),
    }),
    live: ({ memberId }) => verifyMember(memberId),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * Restrict a member (platform-wide) from the drawer's Restrict modal.
 *
 * Demo mode resolves synthetically. Live mode calls
 * `POST /admin/members/:id/restrict` — a `duration` (`"7d"`/`"24h"`/`"30d"`)
 * makes it a time-boxed suspension; omitting it makes it a permanent ban. The
 * backend enforces the guardrails (not yourself, not a staff/house account) and
 * 403/404s otherwise, surfaced by the global mutation-error toast. On success
 * both the roster and the open drawer re-read off the shared `["admin-members"]`
 * key prefix so the member shows as limited/suspended everywhere.
 */
export function useRestrictMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    RestrictedMemberDTO,
    unknown,
    { memberId: string; input: RestrictMemberInput }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "restrict"],
    demoResult: ({ memberId, input }) => ({
      id: memberId,
      status: "suspended",
      suspendedUntil: input.duration ? new Date().toISOString() : null,
    }),
    live: ({ memberId, input }) => restrictMember(memberId, input),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * Cite evidence against a member (ADM-9) — the trust network graph
 * inspector's real "Cite" action, replacing the old button that fired a
 * success toast and did nothing. Demo mode resolves synthetically. Live mode
 * calls `POST /admin/members/:id/cite`; on success both the roster and the
 * open drawer re-read off the shared `["admin-members"]` key prefix, so the
 * new entry shows up in the member's moderation timeline right away.
 */
export function useCiteMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    CitedMemberDTO,
    unknown,
    { memberId: string; slug: string; note: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "cite"],
    demoResult: ({ memberId, slug, note }) => ({
      id: memberId,
      slug,
      note,
      citedAt: new Date().toISOString(),
    }),
    live: ({ memberId, note }) => citeMember(memberId, note),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/* ── Staff roles (additive, on top of `role`) ────────────────────────────── */

type StaffRolesSnapshot = Array<[QueryKey, unknown]>;

/**
 * Does `queryKey` (an `["admin-members", …]` query) belong to `demoMode`?
 * `demoMode` sits at a different position depending on the query's own
 * shape — position 1 for the roster (`["admin-members", demoMode, filter,
 * language]`), position 3 for the drawer detail (`["admin-members",
 * "detail", memberId, demoMode, language]`) and for a single member card
 * (`["admin-members", "card", memberId, demoMode, language]`), position 2 for
 * the flagged queue (`["admin-members", "flagged", demoMode, language]`) — so
 * this reads the right slot per shape rather than assuming one fixed position.
 */
function staffRolesQueryMatchesMode(
  queryKey: QueryKey,
  demoMode: boolean,
): boolean {
  if (queryKey[1] === "detail" || queryKey[1] === "card") {
    return queryKey[3] === demoMode;
  }
  if (queryKey[1] === "flagged") return queryKey[2] === demoMode;
  return queryKey[1] === demoMode;
}

/**
 * Optimistically add/remove one staff role on member `memberId`'s cached
 * `staffRoles`, across every currently-cached `["admin-members"]` query for
 * the CURRENT `demoMode` this session has touched: the roster's
 * `useInfiniteQuery` pages (`items[]`), the open drawer's detail query
 * (`["admin-members", "detail", memberId, …]`) AND a single fetched member
 * card (`["admin-members", "card", memberId, …]`). Scoped to `demoMode` (via
 * {@link staffRolesQueryMatchesMode}) the same way `useAdminListings.ts`'s
 * `snapshotAdminListingsQueries`/`patchListingInCache` scope to
 * `[ADMIN_LISTINGS_KEY, demoMode]` — otherwise a demo-mode grant/revoke could
 * cancel an in-flight live fetch or rewrite/roll back the OTHER mode's
 * cached entries (they share the bare `["admin-members"]` prefix but
 * `demoMode` sits at a different position per query shape here, so a single
 * `[..., demoMode]` prefix can't cover both — hence the predicate). Cancels
 * in-flight `["admin-members"]` queries for this mode first (so a resolving
 * fetch can't stomp the optimistic patch), then returns a snapshot of every
 * query touched — the mutation's `onMutate` context — for
 * {@link restoreStaffRolesSnapshot} to roll back to on `onError`.
 *
 * The flagged-members query (`["admin-members", "flagged", …]`) is skipped:
 * `FlaggedMember` carries no `staffRoles`. Telling the shapes apart reads
 * position 1 of the key (`"detail"` / `"card"` / `"flagged"` vs. the roster's
 * `demoMode` boolean) rather than inspecting the cached value's shape,
 * mirroring `patchListingInCache`'s reliance on its own query key.
 */
export async function patchStaffRolesInCache(
  queryClient: QueryClient,
  demoMode: boolean,
  memberId: string,
  updater: (current: StaffRoleId[]) => StaffRoleId[],
): Promise<StaffRolesSnapshot> {
  const modeFilter = {
    queryKey: ["admin-members"] as QueryKey,
    predicate: (query: { queryKey: QueryKey }) =>
      staffRolesQueryMatchesMode(query.queryKey, demoMode),
  };
  await queryClient.cancelQueries(modeFilter);
  const previousQueries = queryClient.getQueriesData(
    modeFilter,
  ) as StaffRolesSnapshot;

  for (const [queryKey, currentData] of previousQueries) {
    if (!currentData) continue;

    if (queryKey[1] === "detail") {
      if (queryKey[2] !== memberId) continue;
      const detail = currentData as MemberDetail;
      queryClient.setQueryData(queryKey, {
        ...detail,
        staffRoles: updater(detail.staffRoles),
      });
      continue;
    }

    // A single member card (`useAdminMemberCard`) — what the flagged queue
    // opens its drawer on, so its head/footer follow the same toggle the
    // roster row would.
    if (queryKey[1] === "card") {
      if (queryKey[2] !== memberId) continue;
      const card = currentData as AdminMember;
      queryClient.setQueryData(queryKey, {
        ...card,
        staffRoles: updater(card.staffRoles),
      });
      continue;
    }

    if (queryKey[1] === "flagged") continue;

    const rosterData = currentData as InfiniteData<AdminMembersPageVM>;
    if (!rosterData.pages) continue;
    let memberWasFound = false;
    const patchedPages = rosterData.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => {
        if (item.id !== memberId) return item;
        memberWasFound = true;
        return { ...item, staffRoles: updater(item.staffRoles) };
      }),
    }));
    if (memberWasFound) {
      queryClient.setQueryData(queryKey, {
        ...rosterData,
        pages: patchedPages,
      });
    }
  }

  return previousQueries;
}

/** Restore a snapshot taken by {@link patchStaffRolesInCache}, e.g. after a
 *  failed grant/revoke mutation. */
export function restoreStaffRolesSnapshot(
  queryClient: QueryClient,
  snapshot: StaffRolesSnapshot | undefined,
) {
  if (!snapshot) return;
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}

interface StaffRoleMutationVars {
  memberId: string;
  slug: string;
  role: StaffRoleId;
  isSystem: boolean;
}

/**
 * Grant one additive staff role (e.g. `magazine_editor`) to a member —
 * functional capabilities that sit on top of `role`, not tiers above it (see
 * `staffRoles.registry.ts`). Unlike `useUpdateMemberRole`'s single-value tier
 * swap, this optimistically patches `onMutate` (both the roster row and the
 * open drawer detail via {@link patchStaffRolesInCache}) and rolls back in
 * `onError`, so the drawer's toggle flips instantly rather than waiting on a
 * round-trip.
 *
 * Demo mode never touches the network — the optimistic patch IS its source of
 * truth (the roster's demo data is regenerated from fixtures on every render,
 * so there's nothing else to persist); `demoResult` stays shape-correct
 * anyway per `useDemoAwareMutation`'s contract. Live mode calls
 * `POST /admin/members/:id/staff-roles` and reconciles both caches via
 * `invalidateQueries` on success.
 */
export function useGrantStaffRole() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminStaffRolesDTO,
    unknown,
    StaffRoleMutationVars,
    StaffRolesSnapshot
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "grant-staff-role"],
    demoResult: ({ memberId, slug, role }) => ({
      userId: memberId,
      slug,
      staffRoles: [role],
    }),
    live: ({ memberId, role }) => grantStaffRole(memberId, role),
    onMutate: ({ memberId, role }) =>
      patchStaffRolesInCache(queryClient, demoMode, memberId, (current) =>
        current.includes(role) ? current : [...current, role],
      ),
    onError: (_error, _vars, context) =>
      restoreStaffRolesSnapshot(queryClient, context),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

/**
 * Revoke one additive staff role from a member — the mirror of
 * {@link useGrantStaffRole}: optimistically filters the role out of the
 * cached `staffRoles`, rolled back on error, `DELETE
 * /admin/members/:id/staff-roles/:role` in live mode.
 */
export function useRevokeStaffRole() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminStaffRolesDTO,
    unknown,
    StaffRoleMutationVars,
    StaffRolesSnapshot
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "revoke-staff-role"],
    demoResult: ({ memberId, slug }) => ({
      userId: memberId,
      slug,
      staffRoles: [],
    }),
    live: ({ memberId, role }) => revokeStaffRole(memberId, role),
    onMutate: ({ memberId, role }) =>
      patchStaffRolesInCache(queryClient, demoMode, memberId, (current) =>
        current.filter((heldRole) => heldRole !== role),
      ),
    onError: (_error, _vars, context) =>
      restoreStaffRolesSnapshot(queryClient, context),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}
