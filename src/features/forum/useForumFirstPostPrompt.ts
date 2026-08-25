import { useState } from "react";

const PROMPT_DISMISSED_KEY = "qp_forum_prompt_dismissed";

/**
 * Owns the first-post invitation shown to members who genuinely haven't
 * posted and haven't waved it away before (dismissal persists across
 * reloads). LIVE reads `hasPostedFromServer` from the counts response — a
 * real EXISTS check against the member's own threads/posts (see
 * `ForumController.threadCounts`/`ForumPostsService.hasEverPosted`), not just
 * this browsing session, so a repeat poster on a fresh session never sees a
 * false "you haven't posted yet." `extraThreadsCount` still covers the moment
 * immediately after publishing, before that count has refetched. DEMO has no
 * persistent posting history for the mock persona, so it's session-only,
 * exactly as before. Lifted out of `useForumPageState`.
 */
export function useForumFirstPostPrompt({
  demoMode,
  hasPostedFromServer,
  extraThreadsCount,
}: {
  demoMode: boolean;
  hasPostedFromServer: boolean;
  extraThreadsCount: number;
}) {
  const [promptDismissed, setPromptDismissed] = useState(
    () =>
      typeof localStorage !== "undefined" &&
      localStorage.getItem(PROMPT_DISMISSED_KEY) === "1",
  );

  const hasEverPosted = demoMode
    ? extraThreadsCount > 0
    : hasPostedFromServer || extraThreadsCount > 0;
  const showFirstPostPrompt = !promptDismissed && !hasEverPosted;

  function dismissPrompt() {
    setPromptDismissed(true);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Private mode / storage disabled — session-only dismissal is fine.
    }
  }

  return { showFirstPostPrompt, dismissPrompt };
}
