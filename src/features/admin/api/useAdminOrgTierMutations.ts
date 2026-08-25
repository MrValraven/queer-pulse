import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  type OrgTierAdminDTO,
  type OrgTierWriteBody,
  createOrgTier,
  deleteOrgTier,
  updateOrgTier,
} from "../../marketing/api/adminOrgTiers.api";
import { ADMIN_ORG_TIERS_KEY } from "./useAdminOrgTiers";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** Public tiers key (`marketing/api/useOrgTiers.ts`) — invalidated so the
 *  For Organisations page reflects admin edits without a manual refresh. */
const ORG_TIERS_KEY = "org-tiers";

export function useCreateOrgTier() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    OrgTierAdminDTO | undefined,
    Error,
    OrgTierWriteBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminOrgTierForm toasts locally
    demoResult: () => undefined,
    live: (body) => createOrgTier(body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_ORG_TIERS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ORG_TIERS_KEY] });
    },
  });
}

export interface UpdateOrgTierVars {
  id: string;
  body: Partial<OrgTierWriteBody>;
}

export function useUpdateOrgTier() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    OrgTierAdminDTO | undefined,
    Error,
    UpdateOrgTierVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminOrgTierForm + AdminOrgTiersPage toast locally
    demoResult: () => undefined,
    live: ({ id, body }) => updateOrgTier(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_ORG_TIERS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ORG_TIERS_KEY] });
    },
  });
}

export function useDeleteOrgTier() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminOrgTiersPage toasts locally
    demoResult: () => undefined,
    live: (id) => deleteOrgTier(id),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_ORG_TIERS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ORG_TIERS_KEY] });
    },
  });
}
