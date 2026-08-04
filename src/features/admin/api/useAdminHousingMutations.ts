import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { HousingCoopDTO } from "../../economy/api/housingCoop.api";
import {
  type AdminJoinRequestDTO,
  type CoopWriteBody,
  createAdminCoop,
  deleteAdminCoop,
  triageAdminJoinRequest,
  updateAdminCoop,
} from "./adminHousing.api";
import {
  ADMIN_HOUSING_COOPS_KEY,
  ADMIN_HOUSING_JOIN_REQUESTS_KEY,
} from "./useAdminHousingCoops";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** Public housing key (`economy/api/useHousingCoops.ts`) — invalidated too so
 *  the member-facing directory reflects admin edits without a manual refresh. */
const HOUSING_COOPS_KEY = "housing-coops";

/**
 * Admin creates a new housing coop. No-op in demo mode (there's nothing to
 * persist to and the admin panel's demo state is intentionally empty); live
 * mode POSTs and invalidates both the admin list and the public directory.
 */
export function useCreateCoop() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<HousingCoopDTO | undefined, Error, CoopWriteBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminHousingCoopForm toasts locally
    demoResult: () => undefined,
    live: (body) => createAdminCoop(body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
    },
  });
}

export interface UpdateCoopVars {
  id: string;
  body: Partial<CoopWriteBody>;
}

/** Admin edits an existing housing coop. No-op in demo mode. */
export function useUpdateCoop() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<HousingCoopDTO | undefined, Error, UpdateCoopVars>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminHousingCoopForm + AdminHousingCoopsPage toast locally
    demoResult: () => undefined,
    live: ({ id, body }) => updateAdminCoop(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
    },
  });
}

/** Admin removes a housing coop. No-op in demo mode. */
export function useDeleteCoop() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminHousingCoopsPage toasts locally
    demoResult: () => undefined,
    live: (id) => deleteAdminCoop(id),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_HOUSING_JOIN_REQUESTS_KEY],
      });
    },
  });
}

export interface TriageJoinRequestVars {
  id: string;
  action: "accepted" | "declined";
}

/**
 * Admin accepts or declines a coop join request. No-op in demo mode (the
 * demo queue is intentionally empty); live mode PATCHes and invalidates the
 * join-request queue plus the coop list (household counts can shift on
 * acceptance).
 */
export function useTriageJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminJoinRequestDTO | undefined,
    Error,
    TriageJoinRequestVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminHousingJoinRequests toasts locally
    demoResult: () => undefined,
    live: ({ id, action }) => triageAdminJoinRequest(id, action),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_HOUSING_JOIN_REQUESTS_KEY],
      });
      void queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
    },
  });
}
