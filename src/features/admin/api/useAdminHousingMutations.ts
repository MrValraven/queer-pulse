import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  return useMutation<HousingCoopDTO | undefined, Error, CoopWriteBody>({
    mutationFn: async (body) => {
      if (demoMode) return undefined;
      return createAdminCoop(body);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
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
  return useMutation<HousingCoopDTO | undefined, Error, UpdateCoopVars>({
    mutationFn: async ({ id, body }) => {
      if (demoMode) return undefined;
      return updateAdminCoop(id, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
    },
  });
}

/** Admin removes a housing coop. No-op in demo mode. */
export function useDeleteCoop() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (demoMode) return undefined;
      return deleteAdminCoop(id);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
      queryClient.invalidateQueries({
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
  return useMutation<
    AdminJoinRequestDTO | undefined,
    Error,
    TriageJoinRequestVars
  >({
    mutationFn: async ({ id, action }) => {
      if (demoMode) return undefined;
      return triageAdminJoinRequest(id, action);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({
        queryKey: [ADMIN_HOUSING_JOIN_REQUESTS_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_HOUSING_COOPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [HOUSING_COOPS_KEY] });
    },
  });
}
