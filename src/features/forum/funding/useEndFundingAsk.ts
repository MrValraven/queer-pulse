import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { endFundingAsk, type ForumThreadResponse } from "../api/forum.api";
import type { FundingEndReason } from "./funding.types";

/** The author ends their fundraiser. Live writes the server's answer into
 *  the thread meta; demo keeps the ending here, since the demo thread is a
 *  static fixture. */
export function useEndFundingAsk(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [demoEndedReason, setDemoEndedReason] =
    useState<FundingEndReason | null>(null);
  const mutation = useMutation<
    ForumThreadResponse | null,
    Error,
    FundingEndReason
  >({
    meta: { silentError: true },
    mutationFn: async (reason) => {
      if (demoMode) return null;
      if (!slug) {
        throw new Error("Cannot end a fundraiser without its thread slug");
      }
      return endFundingAsk(slug, reason);
    },
    onSuccess: (updated, reason) => {
      if (!updated) {
        setDemoEndedReason(reason);
        return;
      }
      queryClient.setQueriesData<ForumThreadResponse>(
        { queryKey: ["forum-thread-meta", false, updated.slug] },
        updated,
      );
      void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
  return {
    endAsk: mutation.mutate,
    isPending: mutation.isPending,
    demoEndedReason,
  };
}
