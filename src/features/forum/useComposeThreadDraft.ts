import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  usePostImageAttach,
  type StagedPostImage,
} from "../communities/usePostImageAttach";
import { type ForumImageAttachState } from "./ForumImageAttach";
import { useForumComposerDraft } from "./useForumComposerDraft";
import { NEW_THREAD_DRAFT_ID } from "./api/forumDrafts.api";
import { type ForumThreadDraftSnapshot } from "./forumDraftSnapshot";

/**
 * Resolves whether a stored preview URL still renders.
 *
 * A staged photo's preview is a `blob:` URL, which is scoped to the document
 * that created it: it survives the composer being closed and reopened, and dies
 * with a reload. There is no frontend way to turn a storage key back into a
 * fetchable URL (only the backend resolves those, into the `/files/` URLs it
 * serves on its own DTOs), so a dead preview cannot be re-derived. Probing it
 * is how the composer tells the two cases apart without rendering a broken
 * image.
 */
function canRenderImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = url;
  });
}

interface ComposeThreadDraftOptions {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  communitySlug: string;
  setCommunitySlug: Dispatch<SetStateAction<string>>;
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
  /** The category the composer opens on, so a restore knows "untouched". */
  defaultCategory: string;
  /** Every selectable category id, so a stored value from a build whose
   *  categories have since changed is dropped instead of selecting nothing. */
  categoryIds: readonly string[];
}

/**
 * The new-thread composer's autosave, photo attachment and restore, lifted out
 * of `ComposeThreadModal` so the modal component stays inside the 200-line
 * budget.
 *
 * PRD-165: the composer used to autosave its BODY alone. Everything else the
 * member had chosen (title, category, community, tags, photo) was gone on the
 * next visit. All of it now goes to the generic `/me/drafts` module: the title
 * and body as the readable, resumable row on the member's drafts list, the rest
 * in that row's `meta` bag (`forumDraftSnapshot.ts`). The photo travels as its
 * REFERENCE alone; the bytes stay where they were uploaded.
 *
 * Because the draft lives on the server, it follows the member: a post begun on
 * a phone reopens whole on a laptop. This browser keeps the same fields as a
 * same-session fallback, and the server's copy wins whenever both exist.
 *
 * Restoring is field by field and never destructive: each value is applied only
 * where the composer is still untouched, so a topic page's "Write a post" deep
 * link (which seeds the tag) and the first-post prompt (which seeds the title)
 * both keep what they seeded.
 */
export function useComposeThreadDraft({
  title,
  setTitle,
  body,
  setBody,
  category,
  setCategory,
  communitySlug,
  setCommunitySlug,
  tags,
  setTags,
  defaultCategory,
  categoryIds,
}: ComposeThreadDraftOptions) {
  const { t } = useTranslation();
  // The shared presigned upload pipeline, same hook the community composers
  // use — no forum-only upload path.
  const attach = usePostImageAttach();
  // A photo recovered from a draft. Held apart from `attach` (whose state only
  // ever comes from a live file pick) and folded back together below, so
  // neither the upload hook nor the attach control needs to know that drafts
  // exist.
  const [restoredImage, setRestoredImage] = useState<StagedPostImage | null>(
    null,
  );

  const stagedImage = attach.image ?? restoredImage;
  const attachState: ForumImageAttachState = {
    image: stagedImage,
    uploading: attach.uploading,
    error: attach.error,
    inputRef: attach.inputRef,
    handleFile: attach.handleFile,
    openPicker: attach.openPicker,
    remove: () => {
      setRestoredImage(null);
      attach.remove();
    },
  };

  const snapshot: ForumThreadDraftSnapshot = {
    title,
    category,
    communitySlug,
    tags,
    imageKey: stagedImage?.key ?? null,
    imagePreviewUrl: stagedImage?.previewUrl ?? null,
  };

  const onRestoreSnapshot = useCallback(
    (stored: ForumThreadDraftSnapshot) => {
      // Functional updates throughout: this runs from an async restore, long
      // after the values this callback closed over could have moved.
      setTitle((previous) => (previous.trim() ? previous : stored.title));
      setCommunitySlug((previous) => previous || stored.communitySlug);
      setTags((previous) => (previous.length ? previous : stored.tags));
      setCategory((previous) =>
        previous === defaultCategory && categoryIds.includes(stored.category)
          ? stored.category
          : previous,
      );
      if (!stored.imageKey || !stored.imagePreviewUrl) return;
      const { imageKey, imagePreviewUrl } = stored;
      void canRenderImage(imagePreviewUrl).then((isRenderable) => {
        // A photo the member cannot see is a photo they cannot check before
        // publishing, so an unrenderable preview drops the attachment rather
        // than carrying a key they would publish blind. The next autosave
        // writes the snapshot back without it.
        if (isRenderable)
          setRestoredImage({ key: imageKey, previewUrl: imagePreviewUrl });
      });
    },
    [
      setTitle,
      setCommunitySlug,
      setTags,
      setCategory,
      defaultCategory,
      categoryIds,
    ],
  );

  const { status, clearDraft } = useForumComposerDraft({
    draftId: NEW_THREAD_DRAFT_ID,
    body,
    onRestore: setBody,
    title,
    // `?compose=1` (already read by `useForumPageState`) reopens the composer
    // itself, so the drafts list's "Resume" lands on the member's text instead
    // of a bare forum index with the draft nowhere in sight.
    href: `${routes.forum}?compose=1`,
    kind: t("forum:draft.threadKind"),
    // A member can save a post they have not titled (they picked a community
    // and some tags first). "POST" is the kind label the drafts list renders as
    // a badge, and it reads as shouting as a row title.
    fallbackTitle: t("forum:draft.untitledThreadTitle"),
    snapshot,
    onRestoreSnapshot,
  });

  return { attach: attachState, stagedImage, status, clearDraft };
}
