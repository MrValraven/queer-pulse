import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DIRECTORY_KEY } from "../../marketing/api/useDirectory";
import type { SafeSpaceVouchRelationship } from "../vouchModal.data";
import { vouchForSafeSpace } from "./safeSpaceVouch.api";
import { SAFE_SPACES_KEY } from "./useSafeSpaces";

export interface SafeSpaceVouchInput {
  /** The space's listing slug (the public URL id). */
  slug: string;
  relationship?: SafeSpaceVouchRelationship;
  note?: string;
  anonymous?: boolean;
}

/**
 * One-shot "vouch for a safe space" mutation for `VouchModal`. Demo mode
 * resolves without a network call (the modal keeps its animated fake-success
 * fallback). In live mode it POSTs the real vouch, then invalidates the
 * surfaces a new vouch changes: the directory detail (where
 * `DirectorySpaceTrust` renders the vouch list) and the safe-spaces hub detail,
 * so the freshly-added vouch appears in the list.
 */
export function useSafeSpaceVouch() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    { vouchCount: number } | undefined,
    Error,
    SafeSpaceVouchInput
  >({
    mutationFn: async ({ slug, relationship, note, anonymous }) => {
      if (demoMode) return undefined;
      return vouchForSafeSpace(slug, { relationship, note, anonymous });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [SAFE_SPACES_KEY] });
    },
  });
}
