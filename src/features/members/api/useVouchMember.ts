import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { vouchFor } from "./members.api";
import type { VouchRelationship } from "../vouchMember.data";

export interface VouchMemberInput {
  slug: string;
  relationship?: VouchRelationship;
  note?: string;
  anonymous?: boolean;
}

/** One-shot "vouch for a member" mutation for VouchMemberModal. Demo mode
 *  resolves without a network call. Invalidates the surfaces a new vouch
 *  changes: the target profile, the members list, and the vouchers face-row. */
export function useVouchMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ vouchCount: number } | undefined, Error, VouchMemberInput>({
    mutationFn: async ({ slug, relationship, note, anonymous }) => {
      if (demoMode) return undefined;
      return vouchFor(slug, { relationship, note, anonymous });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}
