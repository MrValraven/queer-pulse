import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  ADMIN_GROUP_JOIN_REQUESTS_DEMO,
  ADMIN_GROUP_LISTINGS_DEMO,
} from "../adminHousingGroups.data";
import {
  type AdminGroupJoinRequestDTO,
  type AdminGroupListingDTO,
  type GroupTriageAction,
  getAdminGroupJoinRequests,
  getAdminGroupListings,
  setAdminGroupListingHidden,
  triageAdminGroupJoinRequest,
} from "./adminHousingGroups.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export const ADMIN_GROUP_JOIN_REQUESTS_KEY =
  "admin-housing-group-join-requests";
export const ADMIN_GROUP_LISTINGS_KEY = "admin-housing-group-listings";

/**
 * Every group join request across all groups, for the admin triage queue. Demo
 * mode returns the colocated (empty) fixture and never hits the network — this
 * is a moderator/admin-only endpoint that 403s for anyone else.
 */
export function useAdminGroupJoinRequests() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminGroupJoinRequestDTO[]>({
    queryKey: [ADMIN_GROUP_JOIN_REQUESTS_KEY, demoMode],
    initialData: demoMode ? ADMIN_GROUP_JOIN_REQUESTS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_GROUP_JOIN_REQUESTS_DEMO : getAdminGroupJoinRequests(),
  });
}

/** Every group listing, including hidden ones, for norm enforcement. */
export function useAdminGroupListings() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminGroupListingDTO[]>({
    queryKey: [ADMIN_GROUP_LISTINGS_KEY, demoMode],
    initialData: demoMode ? ADMIN_GROUP_LISTINGS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_GROUP_LISTINGS_DEMO : getAdminGroupListings(),
  });
}

export interface TriageGroupJoinRequestVars {
  id: string;
  action: GroupTriageAction;
}

/**
 * Admin approves or declines a group join request. No-op in demo mode (the demo
 * queue is intentionally empty); live mode PATCHes and invalidates the queue.
 */
export function useTriageGroupJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGroupJoinRequestDTO | undefined,
    Error,
    TriageGroupJoinRequestVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the page toasts locally
    demoResult: () => undefined,
    live: ({ id, action }) => triageAdminGroupJoinRequest(id, action),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GROUP_JOIN_REQUESTS_KEY],
      });
    },
  });
}

export interface SetGroupListingHiddenVars {
  id: string;
  hidden: boolean;
  reason?: string;
}

/**
 * Admin hides or un-hides a group listing for a norm violation. No-op in demo
 * mode; live mode PATCHes and invalidates the listings table.
 */
export function useSetGroupListingHidden() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGroupListingDTO | undefined,
    Error,
    SetGroupListingHiddenVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the page toasts locally
    demoResult: () => undefined,
    live: ({ id, hidden, reason }) =>
      setAdminGroupListingHidden(id, hidden, reason),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GROUP_LISTINGS_KEY],
      });
    },
  });
}
