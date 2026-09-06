import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useStorageScope } from "../../app/providers/useStorageScope";
import {
  NEW_THREAD_DRAFT_ID,
  forumDraftQueryKey,
  getForumDraft,
  type ForumDraftPreview,
} from "./api/forumDrafts.api";
import {
  isEmptyThreadDraftSnapshot,
  readThreadDraftSnapshot,
  threadDraftSnapshotFromMeta,
  type ForumThreadDraftSnapshot,
} from "./forumDraftSnapshot";

/** Where a demo-mode draft body lives (mirrors `useForumComposerDraft`). */
const demoStorageKey = (draftId: string) => `qp.forum.draft.${draftId}`;

/** A first line for the resume notice when the member typed no title yet. */
const EXCERPT_LENGTH = 90;

function toExcerpt(body: string): string {
  const oneLine = body.trim().replace(/\s+/g, " ");
  return oneLine.length > EXCERPT_LENGTH
    ? `${oneLine.slice(0, EXCERPT_LENGTH - 1)}…`
    : oneLine;
}

/**
 * Folds a body and the composer fields into the preview the notice renders, or
 * null when neither holds anything.
 *
 * The fields are half the answer on purpose: a member who chose a community and
 * two tags but wrote no body still has a draft, and the notice is the only
 * place the forum says so.
 */
function toPreview(
  body: string,
  snapshot: ForumThreadDraftSnapshot | null,
): ForumDraftPreview | null {
  const hasExtraFields = !!snapshot && !isEmptyThreadDraftSnapshot(snapshot);
  if (!body.trim() && !hasExtraFields) return null;
  return { body, title: snapshot?.title.trim() ?? "", hasExtraFields };
}

/**
 * Does this member have an unsent new-thread draft, and what does it say?
 *
 * PRD-165: the drafts list was the ONLY place a forum draft was visible, so a
 * member who closed the composer had no way of knowing their words still
 * existed. This is the forum page's own read of the same draft.
 *
 * It shares one react-query entry with the composer, which writes a fresh
 * preview through the cache on every autosave (see `useForumComposerDraft`), so
 * closing the composer updates the notice without a second request, and
 * publishing clears it.
 */
export function useForumThreadDraftPreview() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const storageScope = useStorageScope();

  const draftQuery = useQuery<ForumDraftPreview | null>({
    queryKey: forumDraftQueryKey(NEW_THREAD_DRAFT_ID),
    queryFn: async () => {
      const localSnapshot = readThreadDraftSnapshot(
        NEW_THREAD_DRAFT_ID,
        storageScope,
      );
      if (demoMode) {
        const body =
          window.localStorage.getItem(demoStorageKey(NEW_THREAD_DRAFT_ID)) ??
          "";
        return toPreview(body, localSnapshot);
      }
      const draft = await getForumDraft(NEW_THREAD_DRAFT_ID);
      // Same precedence as the composer's own restore: the draft ROW carries
      // the fields, and this browser's copy answers only when it does not. A
      // notice that read the local copy alone would say "no draft" for a post
      // started on another device.
      return toPreview(
        draft?.desc ?? "",
        threadDraftSnapshotFromMeta(draft?.meta) ?? localSnapshot,
      );
    },
    // Every change made HERE writes through the cache, so there is nothing to
    // revalidate for within a session. A draft can now also change on another
    // device, which this will not notice mid-session; that is deliberate. The
    // composer itself re-reads the draft on every open, so the words are never
    // stale where it matters, and polling a notice would cost a request on
    // every forum visit to keep one line of text current.
    staleTime: Infinity,
    // Signed out there is no draft to read, and no session to read it with.
    enabled: demoMode || loggedIn,
  });

  const draft = draftQuery.data ?? null;
  return {
    hasDraft: !!draft,
    /** Title if the member typed one, else the first line of the body. */
    label: draft ? draft.title || toExcerpt(draft.body) : "",
  };
}
