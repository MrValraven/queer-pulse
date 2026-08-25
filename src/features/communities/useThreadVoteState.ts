import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReact, useUnreact } from "./api/useCommunityMutations";
import type { Thread as ThreadData } from "./communityDetails";

/** The Heart-reaction upvote toggle on a thread's OP post. Split out of
 *  `useCommunityThreadState` as its own seam: it's the only piece of state
 *  driven by `useReact`/`useUnreact`, with no overlap with post/reply
 *  moderation or the composer. */
export function useThreadVoteState(
  slug: string,
  data: ThreadData,
  demoMode: boolean,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const react = useReact(slug);
  const unreact = useUnreact(slug);
  const [voted, setVoted] = useState(!!data.voted);

  function toggleVote() {
    const next = !voted;
    setVoted(next);
    if (demoMode || !data.id) return;
    // A refused vote puts the arrow (and the count derived from it) back where
    // it was; before this the toast said "something went wrong" while the UI
    // kept showing a vote the server never recorded.
    const callbacks = {
      onError: () => {
        setVoted(!next);
        showToast(t("communities:common.error"), "error");
      },
    };
    if (next) react.mutate({ id: data.id, key: "heart" }, callbacks);
    else unreact.mutate({ id: data.id, key: "heart" }, callbacks);
  }

  return { voted, toggleVote };
}
