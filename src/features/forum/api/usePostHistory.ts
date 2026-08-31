import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPostHistory } from "./forum.api";
import type { ForumPostHistoryEntry } from "../../../shared/contracts/contracts";

// Demo has no server-side revision store; the history modal simply shows an
// empty timeline in demo mode. Live fetches lazily (only when the modal opens,
// gated by `enabled`).
export function usePostHistory(
  postId: string | undefined,
  enabled: boolean,
): {
  revisions: ForumPostHistoryEntry[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const live = !demoMode && enabled && !!postId;

  const query = useQuery({
    queryKey: ["forum-post-history", postId],
    enabled: live,
    queryFn: () => getPostHistory(postId as string),
  });

  return {
    revisions: query.data?.revisions ?? [],
    isLoading: live && query.isLoading,
    // Without this a failed fetch would claim the post was never edited.
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
