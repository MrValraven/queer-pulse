import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  type OrgTierAdminDTO,
  type OrgTierWriteBody,
  createOrgTier,
  deleteOrgTier,
  updateOrgTier,
} from "../../marketing/api/adminOrgTiers.api";
import { ADMIN_ORG_TIERS_KEY } from "./useAdminOrgTiers";

/** Public tiers key (`marketing/api/useOrgTiers.ts`) — invalidated so the
 *  For Organisations page reflects admin edits without a manual refresh. */
const ORG_TIERS_KEY = "org-tiers";

export function useCreateOrgTier() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<OrgTierAdminDTO | undefined, Error, OrgTierWriteBody>({
    mutationFn: async (body) => {
      if (demoMode) return undefined;
      return createOrgTier(body);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORG_TIERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORG_TIERS_KEY] });
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
  return useMutation<OrgTierAdminDTO | undefined, Error, UpdateOrgTierVars>({
    mutationFn: async ({ id, body }) => {
      if (demoMode) return undefined;
      return updateOrgTier(id, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORG_TIERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORG_TIERS_KEY] });
    },
  });
}

export function useDeleteOrgTier() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (demoMode) return undefined;
      return deleteOrgTier(id);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORG_TIERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORG_TIERS_KEY] });
    },
  });
}
