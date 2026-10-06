import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ForumFundingView } from "./funding.types";

/**
 * When a call's deadline passes while its page is open, ask the server once
 * for the new state, so "Closed" comes from the server and the Open calls
 * list it feeds stops listing it. Live only; demo has no server to ask.
 */
export function useDeadlineRefetch(
  slug: string | undefined,
  funding: ForumFundingView,
  nowMs: number,
): void {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const refetchedForRef = useRef<string | null>(null);
  const hasPassed =
    funding.deadline !== null && Date.parse(funding.deadline) <= nowMs;
  const isServerStillOpen =
    funding.callState === "open" || funding.callState === "closing";
  useEffect(() => {
    if (demoMode || !slug || !hasPassed || !isServerStillOpen) return;
    if (refetchedForRef.current === slug) return;
    refetchedForRef.current = slug;
    void queryClient.invalidateQueries({ queryKey: ["forum-thread-meta"] });
    void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
  }, [demoMode, slug, hasPassed, isServerStillOpen, queryClient]);
}
