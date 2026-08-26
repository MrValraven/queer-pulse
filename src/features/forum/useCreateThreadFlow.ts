import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../auth/api/auth.api";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
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
import { type NewThreadInput, type PublishStatus } from "./ComposeThreadModal";

/**
 * Owns the create-thread concern lifted out of `useForumPageState`: the compose
 * modal's open/close state and the publish handler (its optimistic thread
 * literal + the `POST /forum/threads` mutation).
 *
 * Deliberately does NOT own `cat`/`sort`/the first-post prompt — those are other
 * concerns in `useForumPageState`. This hook calls `onAfterPublish` once the
 * thread is genuinely published (immediately in demo, in the mutation's
 * `onSuccess` in live) so the caller can run its post-publish side effects:
 * surface the new post, dismiss the first-post prompt.
 *
 * Dead-link fix: the create mutation returns a `ForumThreadResponse`, whose real
 * `slug` (+ `opPostId`) we stamp onto the optimistic card in `onSuccess` — so its
 * list link resolves in live mode *before* the list refetch lands (the old
 * slug-less card linked to `/thread/<tempId>`, which 404'd).
 *
 * Fake-success fix: nothing about publishing is confirmed until the server says
 * so. `publishStatus` drives the modal (`publishing` disables the submit,
 * `published` shows the confirmation, `error` keeps the draft on screen with an
 * inline message), the optimistic card is REMOVED again in `onError`, and
 * `onAfterPublish` (which resets the filters and permanently dismisses the
 * first-post prompt) only runs once the thread genuinely exists.
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
  const { showToast } = useToast();
  const { t } = useTranslation();
  const createMutation = useMutation<
    ForumThreadResponse,
    Error,
    CreateThreadDto
  >({
    mutationFn: (dto) => createThread(dto),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["forum-threads"] }),
  });
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [composing, setComposing] = useState(false);
  const [composeSeed, setComposeSeed] = useState("");
  // DISC-5 — seeds `ComposeThreadModal`'s tags field, so a topic page's
  // "Write a post" CTA (`writeHrefForTag`, `?tag=…&compose=1`) opens the
  // composer with that topic's tag already attached. Empty for every other
  // caller (the first-post prompt's starter chips only ever seed the title).
  const [composeTags, setComposeTags] = useState<string[]>([]);

  function openCompose(seed = "", tags: string[] = []) {
    setComposeSeed(seed);
    setComposeTags(tags);
    setPublishStatus("idle");
    setComposing(true);
  }

  function closeCompose() {
    // A publish in flight can't be dismissed: until the server answers, the
    // optimistic card carries no slug, so its row would link to a dead
    // `/thread/<tempId>`. The request settles into `published` or `error`
    // either way, and both are dismissible.
    if (publishStatus === "publishing") return;
    setComposing(false);
    setPublishStatus("idle");
  }

  function publishThread({
    title,
    body,
    cat: postCat,
    tags,
    communitySlug,
    isOfficial,
    image,
    imagePreviewUrl,
  }: NewThreadInput) {
    // A client-only temp id keys the optimistic card so the create response can
    // reconcile it (stamp the server slug) once it resolves.
    const tempId = Date.now();
    const excerpt = body.length > 160 ? `${body.slice(0, 157)}…` : body;
    // Live posts are authored by the REAL session user — never the mock
    // `SELF_AUTHOR` ("Tiago Costa" demo persona), which would otherwise leak into
    // production. Demo keeps the scripted "You" persona; live with no session
    // (compose is auth-gated, so this is only a defensive fallback) uses a
    // neutral non-persona placeholder instead of the demo persona.
    // Both placeholder blocks ship an empty `name` and `isMine: true`; the
    // display string is filled here, where a translator is in scope, so the
    // card never renders a hardcoded English "You".
    const author = demoMode
      ? { ...SELF_AUTHOR, name: t("forum:author.you") }
      : user
        ? { ...selfAuthorFromProfile(user.profile), isMine: true }
        : { ...NEUTRAL_AUTHOR, name: t("forum:author.you") };
    setExtraThreads((prev) => [
      {
        id: tempId,
        category: postCat,
        title,
        excerpt,
        author,
        posted: t("forum:time.justNow"),
        // No `views`: a thread published a second ago has no view count worth
        // showing, and the backend serves none. The OP card hides the stat.
        upvotes: 1,
        comments: 0,
        tags,
        myVote: 0,
        body: body
          .split("\n")
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
        // The upload's local blob, so the optimistic card shows the photo at
        // once; the list refetch swaps in the server's resolved `/files/` URL.
        opImage: imagePreviewUrl,
        replies: [],
      },
      ...prev,
    ]);
    // Demo mode no-ops (the local thread above is the record), so it is
    // published the moment the card exists.
    if (demoMode) {
      onAfterPublish();
      setPublishStatus("published");
      return;
    }
    setPublishStatus("publishing");
    createMutation.mutate(
      {
        title,
        body,
        category: postCat,
        tags,
        ...(communitySlug ? { communitySlug } : {}),
        ...(isOfficial ? { isOfficial: true } : {}),
        ...(image ? { image } : {}),
      },
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
                    // Reconcile the optimistic author to "QueerPulse
                    // Official" once the server confirms it — otherwise the
                    // card would briefly show the admin's own name until the
                    // next list refetch.
                    ...(created.author.official
                      ? {
                          author: {
                            ...thread.author,
                            name: created.author.displayName,
                            official: true,
                          },
                        }
                      : {}),
                  }
                : thread,
            ),
          );
          // Filters reset + the first-post prompt is dismissed only now that
          // the thread really exists.
          onAfterPublish();
          setPublishStatus("published");
        },
        onError: (error) => {
          // Nothing was created: take the optimistic card back out so it can't
          // link to a dead `/thread/<tempId>`, and tell the member plainly. The
          // modal stays open on the form with their draft untouched.
          logError(error, { scope: "forum.createThread" });
          setExtraThreads((prev) =>
            prev.filter((thread) => thread.id !== tempId),
          );
          setPublishStatus("error");
          showToast(t("forum:toast.error"), "error");
        },
      },
    );
  }

  return {
    composing,
    composeSeed,
    composeTags,
    publishStatus,
    openCompose,
    closeCompose,
    publishThread,
  };
}
