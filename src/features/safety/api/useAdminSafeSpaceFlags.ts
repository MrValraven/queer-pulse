import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_ADMIN_FLAGS,
  DEMO_RE_REVIEW_DUE,
} from "../safeSpaceGovernance.data";
import {
  getAdminFlags,
  getReReviewDue,
  resolveFlag,
  restoreBadge,
  suspendBadge,
  type AdminFlagsQueryInput,
  type AdminSafeSpaceFlagDTO,
  type AdminSafeSpaceSuspensionDTO,
  type SafeSpaceFlagResolution,
  type SafeSpaceReReviewDueDTO,
} from "./safeSpaceGovernance.api";

export const ADMIN_SAFE_SPACE_FLAGS_KEY = "admin-safe-space-flags";
export const ADMIN_SAFE_SPACE_RE_REVIEW_KEY = "admin-safe-space-re-review";

function filterDemoFlags(query: AdminFlagsQueryInput): AdminSafeSpaceFlagDTO[] {
  const state = query.state ?? "open";
  return DEMO_ADMIN_FLAGS.filter((flag) => {
    if (state === "open" && flag.state !== "open") return false;
    if (state === "resolved" && flag.state !== "resolved") return false;
    if (query.reasonCode && flag.reasonCode !== query.reasonCode) return false;
    return true;
  });
}

/**
 * The moderator flag queue. This is the only surface in the app that receives
 * a flagger's id or their written detail, and it is guarded by the backend's
 * `@Roles(Moderator, Admin)`. Demo mode serves the invented fixture.
 */
export function useAdminSafeSpaceFlags(query: AdminFlagsQueryInput) {
  const { demoMode } = useDemoMode();
  const result = useQuery<{ items: AdminSafeSpaceFlagDTO[]; total: number }>({
    queryKey: [ADMIN_SAFE_SPACE_FLAGS_KEY, query, demoMode],
    queryFn: async () => {
      if (demoMode) {
        const items = filterDemoFlags(query);
        return { items, total: items.length };
      }
      return getAdminFlags(query);
    },
  });
  return {
    ...result,
    flags: result.data?.items ?? [],
    total: result.data?.total ?? 0,
  };
}

/** Badges past their annual re-review, most overdue first. */
export function useAdminSafeSpaceReReviewDue() {
  const { demoMode } = useDemoMode();
  const result = useQuery<SafeSpaceReReviewDueDTO[]>({
    queryKey: [ADMIN_SAFE_SPACE_RE_REVIEW_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_RE_REVIEW_DUE;
      return getReReviewDue();
    },
  });
  return { ...result, due: result.data ?? [] };
}

/** Uphold or dismiss one flag. */
export function useResolveSafeSpaceFlag() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    AdminSafeSpaceFlagDTO | null,
    Error,
    { id: string; resolution: SafeSpaceFlagResolution; note?: string }
  >({
    mutationFn: async ({ id, resolution, note }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return null;
      }
      return resolveFlag(id, { resolution, note });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_FLAGS_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_RE_REVIEW_KEY],
      });
    },
  });
}

export type BadgeSuspensionAction =
  | { kind: "suspend"; ref: string; reason: string }
  | { kind: "restore"; ref: string; reason: string };

/** Suspend a badge pending review, or lift a suspension. */
export function useSafeSpaceBadgeSuspension() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    AdminSafeSpaceSuspensionDTO | null,
    Error,
    BadgeSuspensionAction
  >({
    mutationFn: async (action) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return null;
      }
      return action.kind === "suspend"
        ? suspendBadge(action.ref, { reason: action.reason })
        : restoreBadge(action.ref, { reason: action.reason });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_FLAGS_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_SAFE_SPACE_RE_REVIEW_KEY],
      });
    },
  });
}
