import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyRoadmapVotes, useRoadmapVote } from "./api/useRoadmapMutations";

interface UseRoadmapVoteToggleArgs {
  targetType: "item" | "idea";
  targetId: string;
  /** The vote count the server (or the demo mock) currently reports. */
  serverVotes: number;
}

/**
 * One vote button's state, shared by the planned cards and the idea rows.
 *
 * `votedOverride` is the optimistic answer to "have I voted?": `null` defers
 * to the server's list of my votes, a boolean wins until the request settles
 * (live mode clears it once the refetched data is in place; demo mode has no
 * server, so it keeps the override and shows the count +1 / back).
 */
export function useRoadmapVoteToggle({
  targetType,
  targetId,
  serverVotes,
}: UseRoadmapVoteToggleArgs) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const myVotes = useMyRoadmapVotes();
  const {
    demoMode,
    isSignInRequired,
    vote: castVote,
    unvote: removeVote,
    pending: isPending,
  } = useRoadmapVote();
  const [votedOverride, setVotedOverride] = useState<boolean | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const isVotedOnServer = myVotes.has(targetId);
  const isVoted = votedOverride ?? isVotedOnServer;
  const count =
    serverVotes +
    (votedOverride === null ? 0 : Number(isVoted) - Number(isVotedOnServer));

  function toggleVote() {
    if (isPending) return;
    if (isSignInRequired) {
      setIsSignInOpen(true);
      return;
    }
    const wantsToVote = !isVoted;
    const toastKey = wantsToVote
      ? "marketing:roadmap.topIdeas.toast.voted"
      : "marketing:roadmap.topIdeas.toast.unvoted";
    setVotedOverride(wantsToVote);
    if (demoMode) {
      showToast(t(toastKey), "success");
      return;
    }
    const variables = { targetType, targetId };
    const callbacks = {
      onSuccess: () => {
        setVotedOverride(null);
        showToast(t(toastKey), "success");
      },
      // Roll back to whatever the server says so the button stays usable
      // (the global error toast already fires since these mutations don't set
      // meta.silentError).
      onError: () => setVotedOverride(null),
    };
    if (wantsToVote) castVote(variables, callbacks);
    else removeVote(variables, callbacks);
  }

  return { isVoted, count, toggleVote, isSignInOpen, setIsSignInOpen };
}
