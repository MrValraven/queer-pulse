import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  actOnCommunityReport,
  type CommunityModActionInput,
} from "./communities.api";

/**
 * The community reports queue's write path (TS-07 / TS-08).
 *
 * One mutation behind all three answers a community moderator can give a
 * report: dismiss it, remove the content, or escalate it to platform staff.
 * They differ only in what is sent, so they share one hook rather than three
 * near-identical ones.
 *
 * This replaces the old delete-then-dismiss pair. The takedown and the report
 * close now happen in a single server-side transaction, which is what makes
 * the audit trail read "Removed content" instead of "Dismissed" and gives the
 * appeal machinery a true record to rest on.
 *
 * Demo mode is a no-op with no network call, exactly like the mutation it
 * replaces; the caller reflects the result with its own toast.
 */
export function useActOnCommunityReport(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string } & CommunityModActionInput>({
    mutationFn: async ({ id, ...body }) => {
      if (demoMode) return;
      await actOnCommunityReport(id, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: ["community-reports", slug],
      });
      // A removal changes what the discussion tab renders (the post comes back
      // blanked as a tombstone), so the post feed is stale the moment this
      // lands.
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
    },
  });
}
