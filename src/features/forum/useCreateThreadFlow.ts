import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../auth/api/auth.api";
import {
  NEUTRAL_AUTHOR,
  SELF_AUTHOR,
  selfAuthorFromProfile,
  type Thread,
} from "./forum.data";
import {
  createThread,
  type CreateThreadDto,
  type ForumThreadResponse,
} from "./api/forum.api";
import { type NewThreadInput } from "./ComposeThreadModal";

/**
 * Owns the create-thread concern lifted out of `useForumPageState`: the compose
 * modal's open/close state and the publish handler (its optimistic thread
 * literal + the `POST /forum/threads` mutation).
 *
 * Deliberately does NOT own `cat`/`sort`/the first-post prompt — those are other
 * concerns in `useForumPageState`. This hook calls `onAfterPublish` once the
 * optimistic thread is queued so the caller can run its post-publish side
 * effects (surface the new post, dismiss the prompt) in the same order as before.
 *
 * Dead-link fix: the create mutation returns a `ForumThreadResponse`, whose real
 * `slug` (+ `opPostId`) we stamp onto the optimistic card in `onSuccess` — so its
 * list link resolves in live mode *before* the list refetch lands (the old
 * slug-less card linked to `/thread/<tempId>`, which 404'd).
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
  const queryClient = useQueryClient();
  const createMutation = useMutation<
    ForumThreadResponse,
    Error,
    CreateThreadDto
  >({
    mutationFn: (dto) => createThread(dto),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["forum-threads"] }),
  });
  const [composing, setComposing] = useState(false);
  const [composeSeed, setComposeSeed] = useState("");

  function openCompose(seed = "") {
    setComposeSeed(seed);
    setComposing(true);
  }

  function closeCompose() {
    setComposing(false);
  }

  function publishThread({ title, body, cat: postCat, tags }: NewThreadInput) {
    // A client-only temp id keys the optimistic card so the create response can
    // reconcile it (stamp the server slug) once it resolves.
    const tempId = Date.now();
    const excerpt = body.length > 160 ? `${body.slice(0, 157)}…` : body;
    // Live posts are authored by the REAL session user — never the mock
    // `SELF_AUTHOR` ("Tiago Costa" demo persona), which would otherwise leak into
    // production. Demo keeps the scripted "You" persona; live with no session
    // (compose is auth-gated, so this is only a defensive fallback) uses a
    // neutral non-persona placeholder instead of the demo persona.
    const author = demoMode
      ? SELF_AUTHOR
      : user
        ? selfAuthorFromProfile(user.profile)
        : NEUTRAL_AUTHOR;
    setExtraThreads((prev) => [
      {
        id: tempId,
        category: postCat,
        title,
        excerpt,
        author,
        posted: "just now",
        views: 1,
        upvotes: 1,
        comments: 0,
        tags,
        myVote: 0,
        body: body
          .split("\n")
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
        replies: [],
      },
      ...prev,
    ]);
    onAfterPublish();
    // Demo mode no-ops (the local thread above is the record).
    if (demoMode) return;
    createMutation.mutate(
      { title, body, category: postCat, tags },
      {
        onSuccess: (created) => {
          setExtraThreads((prev) =>
            prev.map((thread) =>
              thread.id === tempId
                ? {
                    ...thread,
                    slug: created.slug,
                    opPostId: created.opPostId,
                    myVote: created.myVote ?? thread.myVote,
                    upvotes: created.opVoteCount ?? thread.upvotes,
                    tags: created.tags ?? thread.tags,
                  }
                : thread,
            ),
          );
        },
      },
    );
  }

  return {
    composing,
    composeSeed,
    openCompose,
    closeCompose,
    publishThread,
  };
}
