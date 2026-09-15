import { useCallback, useMemo, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { pollView } from "./api/forum.adapters";
import { useVotePoll } from "./api/useForumMutations";
import type { ThreadPoll } from "./forum.data";

/**
 * Voting on a thread's poll, in both modes.
 *
 * LIVE: `POST /forum/threads/:slug/poll/vote` answers with the poll and its
 * counts RELEASED, because the voter has now answered. That response is applied
 * straight away rather than waited for through a refetch, so the bars appear on
 * the same interaction that cast the ballot; the thread meta is invalidated
 * underneath it, and the next read of the cache carries the same poll.
 *
 * DEMO: there is no server to release anything, so the scripted tally each
 * option carries as `demoTally` moves into `voteCount` at exactly the moment a
 * live response would carry the real one. A demo option with no `demoTally`
 * reveals `0`, which is a truthful count for an answer nobody picked rather
 * than a stand-in for a withheld one.
 *
 * NULL IS NEVER TURNED INTO ZERO ANYWHERE IN HERE. Before a ballot is cast the
 * poll is returned exactly as it arrived, withheld counts included, and the
 * card reads `resultsVisible` to decide whether there is a number to draw.
 */
export function useThreadPoll(
  slug: string | undefined,
  poll: ThreadPoll | null | undefined,
) {
  const { demoMode } = useDemoMode();
  const { castVote, isPending } = useVotePoll();
  // The live poll as the last vote response returned it, and the demo ballot,
  // held separately: neither is a copy of server state the cache already owns,
  // and both are dropped the moment a fresh poll arrives underneath them.
  const [votedPoll, setVotedPoll] = useState<ThreadPoll | null>(null);
  const [demoSelection, setDemoSelection] = useState<string[] | null>(null);
  const [error, setError] = useState<"closed" | "failed" | null>(null);

  const pollId = poll?.id ?? null;

  const resolved = useMemo<ThreadPoll | null>(() => {
    if (!poll) return null;
    if (demoMode && demoSelection) return withDemoBallot(poll, demoSelection);
    // A held response only stands while it describes THIS poll. A different
    // thread, or a poll replaced underneath, falls back to what arrived.
    if (!demoMode && votedPoll && votedPoll.id === pollId) return votedPoll;
    return poll;
  }, [poll, pollId, demoMode, demoSelection, votedPoll]);

  const vote = useCallback(
    (optionIds: string[]) => {
      if (!optionIds.length) return;
      // A closed poll still reads and still refuses votes. Saying so here
      // spares the member a round-trip that can only come back 403.
      if (resolved?.isClosed) {
        setError("closed");
        return;
      }
      setError(null);
      if (demoMode) {
        setDemoSelection(optionIds);
        return;
      }
      if (!slug) return;
      castVote(slug, optionIds, {
        onSuccess: (next) => {
          setVotedPoll(pollView(next));
        },
        onError: () => setError("failed"),
      });
    },
    [resolved?.isClosed, demoMode, slug, castVote],
  );

  return {
    poll: resolved,
    vote,
    isVoting: isPending,
    /** Why the last ballot did not land, or null. The card says it in words. */
    error,
    dismissError: useCallback(() => setError(null), []),
  };
}

/**
 * DEMO ONLY: the mock poll as it stands once the prototype's visitor has
 * answered, which is what a live vote response would carry back.
 *
 * The counts come from the corpus (`demoTally`) plus this ballot, so the demo
 * poll releases a real, internally consistent tally instead of the placeholder
 * percentages a prototype usually shows. Nothing in here runs in live mode.
 */
function withDemoBallot(poll: ThreadPoll, selection: string[]): ThreadPoll {
  const picked = new Set(selection);
  const options = poll.options.map((option) => {
    const isPicked = picked.has(option.id);
    return {
      ...option,
      selected: isPicked,
      voteCount: (option.demoTally ?? 0) + (isPicked ? 1 : 0),
    };
  });
  return {
    ...poll,
    options,
    totalVotes: options.reduce(
      (running, option) => running + (option.voteCount ?? 0),
      0,
    ),
    hasVoted: true,
    resultsVisible: true,
  };
}
