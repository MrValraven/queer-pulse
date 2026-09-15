import { useCallback, useState } from "react";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
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
import type { ThreadListPage } from "./api/useForum";
import { useDeleteThread } from "./api/useForumMutations";
import type { PublishMode } from "./compose/composeThread.types";
import {
  toCreateThreadDto,
  type ComposePublishInput,
} from "./compose/composePublish";

/**
 * Where the publish is in its lifecycle. `published` is the ONLY state that
 * shows the success panel, and it is reached solely from the create mutation's
 * `onSuccess` — never optimistically.
 */
export type PublishStatus = "idle" | "publishing" | "published" | "error";

/** What the success panel needs to know about the thread that now exists. */
export interface PublishedThread {
  /** Server slug. Absent in demo, where nothing was created. */
  slug?: string;
  title: string;
  /** How it left the composer. Recorded HERE rather than read back off the
   *  overlay state, which has already moved on by the time the panel renders. */
  mode: PublishMode;
  /** Live to the forum right now, as opposed to scheduled or in review. */
  isPublished: boolean;
  /** The instant a scheduled thread goes out, ISO, or null. */
  scheduledAt: string | null;
}

/**
 * The create-thread concern, now serving the full page at `/forum/new` rather
 * than the modal that used to sit on `/forum`.
 *
 * The modal's open/close state is GONE with the modal — there is nothing left
 * to open, and a route is its own "open". What stayed is everything that was
 * hard won about publishing, unchanged in substance:
 *
 * - **Nothing is confirmed until the server says so.** `publishStatus` drives
 *   the page (`publishing` holds the footer, `published` is the only thing
 *   that shows `ComposeSuccessPanel`, `error` keeps the draft on screen with
 *   an inline message), and `published` is set from `onSuccess` alone.
 * - **No card can outlive a failed publish.** The optimistic row is written
 *   into the shared `["forum-threads"]` cache — which is where it has to live
 *   now that publishing happens on a different route from the list — and it is
 *   REMOVED again in `onError`, so it can never link to a dead
 *   `/thread/<tempId>`. `onSuccess` stamps the server's real `slug` and
 *   `opPostId` onto it before the list refetch lands.
 * - **The demo persona never reaches production.** Live posts are authored by
 *   the real session user; `SELF_AUTHOR` ("Tiago Costa") is demo-only, and a
 *   live session with no profile falls back to a neutral non-persona.
 * - **Demo mode short-circuits** without calling the mutation at all.
 *
 * One rule is new, and it follows from the composer's three publish modes: an
 * optimistic card is minted for `now` ONLY. A scheduled thread and a thread
 * waiting on a moderator are both invisible to the forum on purpose, and a row
 * promising otherwise would be the same lie the dead link was.
 */
export function useCreateThreadFlow({
  demoMode,
  user,
}: {
  demoMode: boolean;
  user: AuthUser | null;
}) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { mutate: deleteThread } = useDeleteThread();
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [published, setPublished] = useState<PublishedThread | null>(null);
  const [optimisticId, setOptimisticId] = useState<number | null>(null);

  const createMutation = useMutation<
    ForumThreadResponse,
    Error,
    CreateThreadDto
  >({ mutationFn: (dto) => createThread(dto) });

  const buildAuthor = useCallback(
    () => composeAuthor({ demoMode, user, youLabel: t("forum:author.you") }),
    [demoMode, user, t],
  );

  const publishThread = useCallback(
    (input: ComposePublishInput) => {
      const dto = toCreateThreadDto(input);
      // A client-only temp id keys the optimistic row so the create response
      // can reconcile it once it resolves.
      const tempId = Date.now();
      const isImmediate = input.mode === "now";
      if (isImmediate) {
        prependThread(
          queryClient,
          optimisticThread({
            tempId,
            dto,
            author: buildAuthor(),
            postedLabel: t("forum:time.justNow"),
            previewUrl: input.state.photos[0]?.previewUrl,
          }),
        );
        setOptimisticId(tempId);
      }

      // Demo mode makes no request — the local row above is the whole record —
      // so it is published the moment that row exists.
      if (demoMode) {
        setPublished({
          title: dto.title,
          mode: input.mode,
          isPublished: isImmediate,
          scheduledAt: dto.publishAt ?? null,
        });
        setPublishStatus("published");
        return;
      }

      setPublishStatus("publishing");
      createMutation.mutate(dto, {
        onSuccess: (created) => {
          if (isImmediate) reconcileThread(queryClient, tempId, created);
          setPublished({
            slug: created.slug,
            title: created.title,
            mode: input.mode,
            isPublished: created.isPublished,
            scheduledAt: dto.publishAt ?? null,
          });
          setPublishStatus("published");
          void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
          void queryClient.invalidateQueries({
            queryKey: ["forum-thread-counts"],
          });
        },
        onError: (error) => {
          // Nothing was created: take the optimistic row back out so it can
          // never link to a dead `/thread/<tempId>`, and say so plainly. The
          // composer stays put with the member's draft untouched.
          logError(error, { scope: "forum.createThread" });
          removeThread(queryClient, tempId);
          setOptimisticId(null);
          setPublishStatus("error");
          showToast(t("forum:toast.error"), "error");
        },
      });
    },
    [queryClient, demoMode, buildAuthor, createMutation, showToast, t],
  );

  /** Back to the composer with the draft intact, after a take-it-back. */
  const resetPublish = useCallback(() => {
    setPublishStatus("idle");
    setPublished(null);
    setOptimisticId(null);
  }, []);

  /**
   * Take the post back down inside the window the success panel offers. Runs
   * the same author withdraw (`DELETE /forum/threads/:slug`) the thread row's
   * own delete does, then drops the optimistic row and returns the member to
   * the composer.
   */
  const withdrawPublished = useCallback(() => {
    if (optimisticId !== null) removeThread(queryClient, optimisticId);
    const slug = published?.slug;
    if (slug) deleteThread({ slug });
    resetPublish();
  }, [optimisticId, published, queryClient, deleteThread, resetPublish]);

  return {
    publishStatus,
    published,
    publishThread,
    resetPublish,
    withdrawPublished,
  };
}

/**
 * Who the optimistic row is attributed to.
 *
 * Live posts carry the REAL session user. The mock `SELF_AUTHOR` is the demo
 * persona and must never leak into production; a live session with no resolved
 * profile (compose is auth-gated, so this is defensive) gets a neutral
 * placeholder instead of borrowing it. Both placeholders ship an empty `name`
 * and `isMine: true`, and the display string is filled here, where a
 * translator is in scope, so the card never renders a hardcoded English "You".
 */
function composeAuthor({
  demoMode,
  user,
  youLabel,
}: {
  demoMode: boolean;
  user: AuthUser | null;
  youLabel: string;
}): Thread["author"] {
  if (demoMode) return { ...SELF_AUTHOR, name: youLabel };
  if (user) return { ...selfAuthorFromProfile(user.profile), isMine: true };
  return { ...NEUTRAL_AUTHOR, name: youLabel };
}

/** The row the forum list shows while the server is still answering. */
function optimisticThread({
  tempId,
  dto,
  author,
  postedLabel,
  previewUrl,
}: {
  tempId: number;
  dto: CreateThreadDto;
  author: Thread["author"];
  postedLabel: string;
  previewUrl?: string;
}): Thread {
  const body = dto.body;
  return {
    id: tempId,
    category: dto.category,
    title: dto.title,
    excerpt: body.length > 160 ? `${body.slice(0, 157)}…` : body,
    author,
    posted: postedLabel,
    // No `views`: a thread published a second ago has no view count worth
    // showing, and the backend serves none.
    upvotes: 1,
    comments: 0,
    tags: dto.tags ?? [],
    myVote: 0,
    body: body
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    // The upload's local blob, so the row shows the photo at once; the list
    // refetch swaps in the server's resolved `/files/` URL.
    opImage: previewUrl,
    replies: [],
  };
}

// ── The shared thread-list cache ────────────────────────────────────────────
// The composer is its own route, so there is no page-local `extraThreads` to
// prepend to any more: by the time the member reaches `/forum` the composer has
// unmounted. The optimistic row therefore goes where the list itself reads
// from. Every `["forum-threads", …]` entry is patched, because the key carries
// demo mode, the category, the language and the live filters, and the member
// may arrive under any of them.

const THREADS_KEY = { queryKey: ["forum-threads"] } as const;

type ThreadListData = InfiniteData<ThreadListPage> | undefined;

function patchThreadLists(
  queryClient: QueryClient,
  patchPage: (items: Thread[]) => Thread[],
) {
  queryClient.setQueriesData<InfiniteData<ThreadListPage>>(
    THREADS_KEY,
    (data: ThreadListData) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page, index) =>
              index === 0 ? { ...page, items: patchPage(page.items) } : page,
            ),
          }
        : data,
  );
}

function prependThread(queryClient: QueryClient, thread: Thread) {
  patchThreadLists(queryClient, (items) => [thread, ...items]);
}

function removeThread(queryClient: QueryClient, tempId: number) {
  patchThreadLists(queryClient, (items) =>
    items.filter((thread) => thread.id !== tempId),
  );
}

/** Stamps the server's own identifiers onto the optimistic row, so its list
 *  link resolves before the refetch lands. */
function reconcileThread(
  queryClient: QueryClient,
  tempId: number,
  created: ForumThreadResponse,
) {
  patchThreadLists(queryClient, (items) =>
    items.map((thread) =>
      thread.id === tempId
        ? {
            ...thread,
            slug: created.slug,
            opPostId: created.opPostId,
            myVote: created.myVote ?? thread.myVote,
            upvotes: created.opVoteCount ?? thread.upvotes,
            tags: created.tags ?? thread.tags,
            // Reconcile to the QueerPulse Official byline once the server
            // confirms it, so the row does not briefly wear the admin's own
            // name until the next refetch.
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
}
