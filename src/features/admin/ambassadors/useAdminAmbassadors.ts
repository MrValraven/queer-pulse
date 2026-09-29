import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { AmbassadorFocusArea } from "../../../shared/ambassadors/ambassadorFocusAreas.data";
import { useDemoAwareMutation } from "../api/demoAwareMutation";
import {
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

function invalidateAmbassadors(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: [ADMIN_AMBASSADORS_KEY] });
  void queryClient.invalidateQueries({
    queryKey: [ADMIN_AMBASSADOR_CIRCLE_KEY],
  });
  void queryClient.invalidateQueries({ queryKey: [PLATFORM_AMBASSADORS_KEY] });
}

/** Rewrites every cached list for one tab, demo and live alike. */
function patchRows(
  queryClient: QueryClient,
  status: AdminAmbassadorStatus,
  update: (rows: AdminAmbassadorDTO[]) => AdminAmbassadorDTO[],
) {
  queryClient.setQueriesData<AdminAmbassadorDTO[]>(
    { queryKey: [ADMIN_AMBASSADORS_KEY, status] },
    (rows) => (rows ? update(rows) : rows),
  );
}

export function useAdminAmbassadors(status: AdminAmbassadorStatus) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminAmbassadorDTO[]>({
    queryKey: [ADMIN_AMBASSADORS_KEY, status, demoMode],
    queryFn: () =>
      demoMode
        ? demoRows.filter((row) => statusOf(row) === status)
        : getAdminAmbassadors(status),
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
  const row: AdminAmbassadorDTO = {
    id: `demo-ambassador-${member.slug}-${Date.now()}`,
    member: {
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
      patchRows(queryClient, "active", (rows) => [
        row,
        ...rows.filter((existing) => existing.id !== row.id),
      ]);
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
      patchRows(queryClient, "past", (rows) => [
        revoked,
        ...rows.filter((existing) => existing.id !== revoked.id),
      ]);
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
    demoResult: () => {
      demoCircle = {
        ...demoCircle,
        isViewerMember: true,
        memberCount: demoCircle.memberCount + 1,
      };
      return { slug: demoCircle.slug };
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
