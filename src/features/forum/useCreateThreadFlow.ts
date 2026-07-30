import { useState } from "react";
import type { AuthUser } from "../auth/api/auth.api";
import { SELF_AUTHOR, selfAuthorFromProfile, type Thread } from "./forum.data";
import { useCreateThread } from "./api/useForumMutations";
import { type NewThreadInput } from "./ComposeThreadModal";

/**
 * Owns the create-thread concern lifted out of `useForumPageState`: the
 * compose modal's open/close state and the publish handler (its optimistic
 * thread literal + the `POST /forum/threads` mutation). Behaviour is
 * identical to the inline state/handler it replaces.
 *
 * Deliberately does NOT own `cat`/`sort`/the first-post prompt — those are
 * other concerns living in `useForumPageState`. Instead this hook calls
 * `onAfterPublish` once the optimistic thread is queued, so the caller can run
 * its own post-publish side effects (surface the new post regardless of
 * filter/sort, dismiss the first-post prompt) in the same order as before.
 */
export function useCreateThreadFlow({
  demoMode,
  user,
  setExtraThreads,
  onAfterPublish,
}: {
  demoMode: boolean;
  user: AuthUser | null;
  setExtraThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  onAfterPublish: () => void;
}) {
  const createThread = useCreateThread();
  const [composing, setComposing] = useState(false);
  const [composeSeed, setComposeSeed] = useState("");

  function openCompose(seed = "") {
    setComposeSeed(seed);
    setComposing(true);
  }

  function closeCompose() {
    setComposing(false);
  }

  function publishThread({ title, body, cat: postCat }: NewThreadInput) {
    const id = Date.now();
    const excerpt = body.length > 160 ? `${body.slice(0, 157)}…` : body;
    // Live posts are authored by the REAL session user — never the mock
    // `SELF_AUTHOR` ("Tiago Costa" demo persona), which would otherwise leak into
    // production. Demo keeps the scripted "You" persona.
    const author =
      demoMode || !user ? SELF_AUTHOR : selfAuthorFromProfile(user.profile);
    setExtraThreads((prev) => [
      {
        id,
        category: postCat,
        title,
        excerpt,
        author,
        posted: "just now",
        views: 1,
        upvotes: 1,
        comments: 0,
        tags: [],
        body: body
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
        replies: [],
      },
      ...prev,
    ]);
    onAfterPublish();
    // Live mode persists; demo mode no-ops (the local thread above is the record).
    createThread.mutate({ title, body, category: postCat });
  }

  return {
    composing,
    composeSeed,
    openCompose,
    closeCompose,
    publishThread,
  };
}
