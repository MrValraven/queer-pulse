import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_EARLY_ACCESS_FEATURES,
  demoEarlyAccessGrantorFor,
  demoEarlyAccessRoster,
  demoEarlyAccessRosterMember,
  demoMemberEarlyAccess,
} from "../earlyAccess/adminEarlyAccess.data";
import {
  getEarlyAccessFeatures,
  getEarlyAccessRoster,
  getMemberEarlyAccess,
  grantMemberEarlyAccess,
  revokeMemberEarlyAccess,
} from "./adminEarlyAccess.api";
import type {
  EarlyAccessFeaturesDTO,
  EarlyAccessGrantDTO,
  EarlyAccessRosterDTO,
  EarlyAccessRosterRowDTO,
  MemberEarlyAccessDTO,
} from "./adminEarlyAccess.types";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { earlyAccessKeys } from "./earlyAccessQueryKeys";

const staleTimeFor = (demoMode: boolean) =>
  demoMode ? Number.POSITIVE_INFINITY : 30_000;

/** GET /admin/members/:id/early-access: the member drawer section. */
export function useMemberEarlyAccess(memberId: string) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: earlyAccessKeys.member(demoMode, memberId),
    queryFn: async (): Promise<MemberEarlyAccessDTO> =>
      demoMode
        ? demoMemberEarlyAccess(memberId)
        : await getMemberEarlyAccess(memberId),
    staleTime: staleTimeFor(demoMode),
  });
}

/** GET /admin/early-access: every feature in early access with its count. */
export function useEarlyAccessFeatures() {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: earlyAccessKeys.features(demoMode),
    queryFn: async (): Promise<EarlyAccessFeaturesDTO> =>
      demoMode ? DEMO_EARLY_ACCESS_FEATURES : await getEarlyAccessFeatures(),
    staleTime: staleTimeFor(demoMode),
  });
}

/** GET /admin/early-access/:feature: who holds one feature, newest first. */
export function useEarlyAccessRoster(featureKey: string) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: earlyAccessKeys.roster(demoMode, featureKey),
    queryFn: async (): Promise<EarlyAccessRosterDTO> =>
      demoMode
        ? demoEarlyAccessRoster(featureKey)
        : await getEarlyAccessRoster(featureKey),
    staleTime: staleTimeFor(demoMode),
  });
}

// ── Cache patches ───────────────────────────────────────────────────────────
// Each returns a new object, so the demo fixtures are never written to.

function grantIn(
  record: MemberEarlyAccessDTO | undefined,
  featureKey: string,
): EarlyAccessGrantDTO | null {
  return (
    record?.features.find((feature) => feature.featureKey === featureKey)
      ?.grant ?? null
  );
}

function withFeatureGrant(
  record: MemberEarlyAccessDTO,
  featureKey: string,
  grant: EarlyAccessGrantDTO | null,
): MemberEarlyAccessDTO {
  return {
    features: record.features.map((feature) =>
      feature.featureKey === featureKey ? { ...feature, grant } : feature,
    ),
  };
}

function patchMemberGrant(
  queryClient: QueryClient,
  demoMode: boolean,
  memberId: string,
  featureKey: string,
  grant: EarlyAccessGrantDTO | null,
): void {
  queryClient.setQueryData<MemberEarlyAccessDTO>(
    earlyAccessKeys.member(demoMode, memberId),
    (current) =>
      current ? withFeatureGrant(current, featureKey, grant) : current,
  );
}

function patchGrantCount(
  queryClient: QueryClient,
  demoMode: boolean,
  featureKey: string,
  countChange: number,
): void {
  queryClient.setQueryData<EarlyAccessFeaturesDTO>(
    earlyAccessKeys.features(demoMode),
    (current) =>
      current
        ? {
            features: current.features.map((feature) =>
              feature.featureKey === featureKey
                ? {
                    ...feature,
                    grantCount: Math.max(0, feature.grantCount + countChange),
                  }
                : feature,
            ),
          }
        : current,
  );
}

function hasRosterRow(roster: EarlyAccessRosterDTO, memberId: string): boolean {
  return roster.items.some((row) => row.member.userId === memberId);
}

function withoutRosterRow(
  roster: EarlyAccessRosterDTO,
  memberId: string,
): EarlyAccessRosterDTO {
  if (!hasRosterRow(roster, memberId)) return roster;
  return {
    ...roster,
    total: Math.max(0, roster.total - 1),
    items: roster.items.filter((row) => row.member.userId !== memberId),
  };
}

function withRosterRow(
  roster: EarlyAccessRosterDTO,
  row: EarlyAccessRosterRowDTO,
): EarlyAccessRosterDTO {
  if (hasRosterRow(roster, row.member.userId)) return roster;
  return {
    ...roster,
    total: roster.total + 1,
    items: [row, ...roster.items].slice(0, roster.limit),
  };
}

function patchRoster(
  queryClient: QueryClient,
  demoMode: boolean,
  featureKey: string,
  update: (roster: EarlyAccessRosterDTO) => EarlyAccessRosterDTO,
): void {
  queryClient.setQueryData<EarlyAccessRosterDTO>(
    earlyAccessKeys.roster(demoMode, featureKey),
    (current) => (current ? update(current) : current),
  );
}

// ── Mutations ───────────────────────────────────────────────────────────────

export interface SetMemberEarlyAccessVariables {
  memberId: string;
  featureKey: string;
  isGranted: boolean;
}

interface SetMemberEarlyAccessContext {
  previousRecord: MemberEarlyAccessDTO | undefined;
}

/**
 * The drawer toggle: turns one feature on or off for one member. The member's
 * record flips at once and rolls back on failure. On success the server's
 * grant replaces the placeholder, and the roster page's count and list follow
 * (the demo adds the member's roster row from its members fixture; live reads
 * the roster again). The drawer shows a failure inline, so the global error
 * toast stays quiet.
 */
export function useSetMemberEarlyAccess() {
  const { demoMode } = useDemoMode();
  const { user: signedInUser } = useAuth();
  const queryClient = useQueryClient();
  const memberKeyFor = (memberId: string) =>
    earlyAccessKeys.member(demoMode, memberId);
  const placeholderGrant = (
    memberId: string,
    featureKey: string,
  ): EarlyAccessGrantDTO => ({
    featureKey,
    userId: memberId,
    grantedAt: new Date().toISOString(),
    // Demo credits the signed-in staff member; live, the grantor is known
    // once the server answers.
    grantedBy: demoMode ? demoEarlyAccessGrantorFor(signedInUser) : null,
  });
  return useDemoAwareMutation<
    EarlyAccessGrantDTO | null,
    unknown,
    SetMemberEarlyAccessVariables,
    SetMemberEarlyAccessContext
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-early-access", "set"],
    meta: { silentError: true },
    // onMutate has already written the grant (or its removal) to the cache.
    demoResult: ({ memberId, featureKey, isGranted }) =>
      isGranted
        ? (grantIn(
            queryClient.getQueryData<MemberEarlyAccessDTO>(
              memberKeyFor(memberId),
            ),
            featureKey,
          ) ?? placeholderGrant(memberId, featureKey))
        : null,
    live: async ({ memberId, featureKey, isGranted }) => {
      if (isGranted) return grantMemberEarlyAccess(memberId, featureKey);
      await revokeMemberEarlyAccess(memberId, featureKey);
      return null;
    },
    onMutate: async ({ memberId, featureKey, isGranted }) => {
      await queryClient.cancelQueries({ queryKey: memberKeyFor(memberId) });
      const previousRecord = queryClient.getQueryData<MemberEarlyAccessDTO>(
        memberKeyFor(memberId),
      );
      const previousGrant = grantIn(previousRecord, featureKey);
      patchMemberGrant(
        queryClient,
        demoMode,
        memberId,
        featureKey,
        isGranted
          ? (previousGrant ?? placeholderGrant(memberId, featureKey))
          : null,
      );
      return { previousRecord };
    },
    onError: (_error, { memberId }, context) => {
      if (context?.previousRecord)
        queryClient.setQueryData(
          memberKeyFor(memberId),
          context.previousRecord,
        );
    },
    onSuccess: (grant, { memberId, featureKey, isGranted }, context) => {
      patchMemberGrant(queryClient, demoMode, memberId, featureKey, grant);
      const hasPreviousGrant =
        grantIn(context?.previousRecord, featureKey) !== null;
      if (!context?.previousRecord || hasPreviousGrant === isGranted) return;
      patchGrantCount(queryClient, demoMode, featureKey, isGranted ? 1 : -1);
      if (!isGranted) {
        patchRoster(queryClient, demoMode, featureKey, (roster) =>
          withoutRosterRow(roster, memberId),
        );
        return;
      }
      const rosterMember = demoMode
        ? demoEarlyAccessRosterMember(memberId)
        : null;
      if (grant && rosterMember)
        patchRoster(queryClient, demoMode, featureKey, (roster) =>
          withRosterRow(roster, {
            member: rosterMember,
            grantedAt: grant.grantedAt,
            grantedBy: grant.grantedBy,
          }),
        );
    },
    // A failed write may still have landed, so the record reads again.
    onLiveError: (_error, { memberId }) => {
      void queryClient.invalidateQueries({ queryKey: memberKeyFor(memberId) });
    },
    onLiveSettled: (_result, _error, { featureKey }) => {
      void queryClient.invalidateQueries({
        queryKey: earlyAccessKeys.features(false),
      });
      void queryClient.invalidateQueries({
        queryKey: earlyAccessKeys.roster(false, featureKey),
      });
    },
  });
}

export interface RevokeEarlyAccessFromRosterVariables {
  memberId: string;
  featureKey: string;
}

interface RevokeEarlyAccessFromRosterContext {
  previousRoster: EarlyAccessRosterDTO | undefined;
}

/**
 * The roster page's Revoke: the row leaves the list (and the total drops) at
 * once, and comes back on failure, which the global error toast reports. On
 * success the feature count and the member's drawer record follow. The row
 * unmounts as the mutation starts, so a confirm dialog the row hosts unmounts
 * with it: host the dialog above the list.
 */
export function useRevokeEarlyAccessFromRoster() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const rosterKeyFor = (featureKey: string) =>
    earlyAccessKeys.roster(demoMode, featureKey);
  return useDemoAwareMutation<
    void,
    unknown,
    RevokeEarlyAccessFromRosterVariables,
    RevokeEarlyAccessFromRosterContext
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-early-access", "revoke"],
    demoResult: () => undefined,
    live: ({ memberId, featureKey }) =>
      revokeMemberEarlyAccess(memberId, featureKey),
    onMutate: async ({ memberId, featureKey }) => {
      await queryClient.cancelQueries({ queryKey: rosterKeyFor(featureKey) });
      const previousRoster = queryClient.getQueryData<EarlyAccessRosterDTO>(
        rosterKeyFor(featureKey),
      );
      patchRoster(queryClient, demoMode, featureKey, (roster) =>
        withoutRosterRow(roster, memberId),
      );
      return { previousRoster };
    },
    onError: (_error, { featureKey }, context) => {
      if (context?.previousRoster)
        queryClient.setQueryData(
          rosterKeyFor(featureKey),
          context.previousRoster,
        );
    },
    onSuccess: (_result, { memberId, featureKey }, context) => {
      patchMemberGrant(queryClient, demoMode, memberId, featureKey, null);
      if (
        context?.previousRoster &&
        hasRosterRow(context.previousRoster, memberId)
      )
        patchGrantCount(queryClient, demoMode, featureKey, -1);
    },
    onLiveSettled: (_result, _error, { memberId, featureKey }) => {
      for (const queryKey of [
        earlyAccessKeys.roster(false, featureKey),
        earlyAccessKeys.features(false),
        earlyAccessKeys.member(false, memberId),
      ])
        void queryClient.invalidateQueries({ queryKey });
    },
  });
}
