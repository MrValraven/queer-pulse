import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useAuth } from "../../app/providers/authContext";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReportListingModal } from "../economy/ReportListingModal";
import type { PersonaPostView } from "./api/personaPosts.adapters";
import type { PersonaPostsResult } from "./api/usePersonaPosts";
import {
  isPersonaPostGone,
  useDeletePersonaPost,
} from "./api/usePersonaPostMutations";
import { PersonaUpdatesAlert } from "./PersonaPostComposer";
import { PersonaPostItem } from "./PersonaPostItem";
import type { PersonaPostMenuItem } from "./PersonaPostMenu";
import type { PersonaViewMode } from "./personaSkinRender";
import styles from "./PersonaUpdates.module.css";

const FIRST_SHOWN = 3;

/** Where focus moves once a commit lands: the block heading after a delete
 *  (after the confirm dialog has handed focus back) or once an edited post
 *  is found gone, or the first post that "Show more updates" revealed or
 *  loaded when the button folds away (`restIndex` counts within the folded
 *  list). A fresh object per request, so the same target can be asked for
 *  twice. */
type FocusRequest =
  { target: "heading" } | { target: "revealed"; restIndex: number } | null;
const GONE_KEY = "subprofiles:updates.errors.gone";
const EASE = [0.22, 0.68, 0.16, 1] as const;

/** A post that arrives or leaves folds in or out, like Collapse. */
function PostListItem({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : 0.28;
  return (
    <m.li
      className={styles.item}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: { duration, ease: EASE, overflow: { duration: 0 } },
      }}
      transition={{
        duration,
        ease: EASE,
        overflow: { duration: 0, delay: duration },
      }}
    >
      {children}
    </m.li>
  );
}

/** Who sees which post actions, paging, and the delete flow. Owner tools
 *  need the post's `canEdit` and a mode other than "visitor" (the owner
 *  looking at the page as a stranger); Report needs a signed-in viewer. */
function usePersonaPostListState({
  posts,
  subprofileId,
  mode,
}: {
  posts: PersonaPostsResult;
  subprofileId: string;
  mode: PersonaViewMode;
}) {
  const { loggedIn } = useAuth();
  const remove = useDeletePersonaPost(subprofileId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PersonaPostView | null>(
    null,
  );
  const [reportedPost, setReportedPost] = useState<PersonaPostView | null>(
    null,
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest>(null);
  // isPending is a render value; a second press before the re-render reads
  // it stale, so one delete per press is held in a ref.
  const isDeletingRef = useRef(false);
  const rest = posts.posts.slice(FIRST_SHOWN);

  function menuFor(post: PersonaPostView): PersonaPostMenuItem[] {
    if (mode === "preview" || mode === "visitor") return [];
    if (post.canEdit)
      return [
        {
          labelKey: "subprofiles:updates.post.editCta",
          onSelect: () => {
            setStatusKey(null);
            setEditingId(post.id);
          },
        },
        {
          labelKey: "subprofiles:updates.post.deleteCta",
          onSelect: () => setPendingDelete(post),
        },
      ];
    return loggedIn
      ? [
          {
            labelKey: "subprofiles:updates.post.reportCta",
            onSelect: () => setReportedPost(post),
          },
        ]
      : [];
  }

  function showMore() {
    if (posts.isFetchingNextPage) return;
    if (!isExpanded) {
      setIsExpanded(true);
      if (rest.length > 0) {
        if (!posts.hasMore)
          setFocusRequest({ target: "revealed", restIndex: 0 });
        return;
      }
    }
    if (!posts.hasMore) return;
    // The last page folds the button away under the focus, so focus moves
    // to the first post that page brought.
    const restIndex = Math.max(0, posts.posts.length - FIRST_SHOWN);
    void posts.fetchNextPage().then((next) => {
      if (next && !next.hasMore && !next.hasFailed && next.addedCount > 0)
        setFocusRequest({ target: "revealed", restIndex });
    });
  }

  function finishEdit(isSaved: boolean) {
    setEditingId(null);
    if (isSaved) setStatusKey("subprofiles:updates.composer.savedStatus");
  }

  /** The edited post answered 404 and left the list with its editor. */
  function editGone() {
    setEditingId(null);
    setErrorKey(GONE_KEY);
    setFocusRequest({ target: "heading" });
  }

  async function confirmDelete() {
    if (!pendingDelete || remove.isPending || isDeletingRef.current) return;
    isDeletingRef.current = true;
    setErrorKey(null);
    try {
      await remove.mutateAsync({ postId: pendingDelete.id });
      setPendingDelete(null);
      setFocusRequest({ target: "heading" });
    } catch (error) {
      setPendingDelete(null);
      // A post already gone leaves the list too (the hook drops it).
      if (isPersonaPostGone(error)) {
        setErrorKey(GONE_KEY);
        setFocusRequest({ target: "heading" });
      } else setErrorKey("subprofiles:updates.errors.deleteFailed");
    } finally {
      isDeletingRef.current = false;
    }
  }

  return {
    first: posts.posts.slice(0, FIRST_SHOWN),
    rest,
    isExpanded,
    canShowMore: posts.hasMore || (!isExpanded && rest.length > 0),
    editingId,
    pendingDelete,
    setPendingDelete,
    reportedPost,
    setReportedPost,
    errorKey,
    statusKey,
    focusRequest,
    isDeleting: remove.isPending,
    menuFor,
    showMore,
    finishEdit,
    editGone,
    confirmDelete,
  };
}

export function PersonaPostList({
  posts,
  subprofileId,
  personaName,
  mode,
  headingRef,
}: {
  posts: PersonaPostsResult;
  subprofileId: string;
  personaName: string;
  mode: PersonaViewMode;
  /** Focus goes back to the block heading after a delete. */
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  const isInteractive = mode !== "preview";
  const restListRef = useRef<HTMLOListElement>(null);
  const list = usePersonaPostListState({ posts, subprofileId, mode });
  const { focusRequest } = list;
  const handledFocusRef = useRef<FocusRequest>(null);
  const waitingFocusRef = useRef<{
    request: FocusRequest;
    postCount: number;
  } | null>(null);
  const postCount = posts.posts.length;

  // A passive effect runs after the closing dialog's own focus return, so
  // the heading keeps focus. A loaded page can answer before its posts
  // render, so a request with no target yet waits one post count change for
  // its post, then drops; each request is handled once.
  useEffect(() => {
    if (!focusRequest || handledFocusRef.current === focusRequest) return;
    const target =
      focusRequest.target === "heading"
        ? headingRef.current
        : restListRef.current?.querySelectorAll<HTMLElement>("article")[
            focusRequest.restIndex
          ];
    const waiting = waitingFocusRef.current;
    if (!target) {
      if (waiting?.request !== focusRequest)
        waitingFocusRef.current = { request: focusRequest, postCount };
      else if (waiting.postCount !== postCount) {
        handledFocusRef.current = focusRequest;
        waitingFocusRef.current = null;
      }
      return;
    }
    handledFocusRef.current = focusRequest;
    waitingFocusRef.current = null;
    target.focus();
  }, [focusRequest, headingRef, postCount]);

  const renderItems = (items: PersonaPostView[]) => (
    <AnimatePresence initial={false}>
      {items.map((post) => (
        <PostListItem key={post.id}>
          <PersonaPostItem
            post={post}
            subprofileId={subprofileId}
            isInteractive={isInteractive}
            isEditing={list.editingId === post.id}
            menuItems={list.menuFor(post)}
            onEditDone={list.finishEdit}
            onEditGone={list.editGone}
          />
        </PostListItem>
      ))}
    </AnimatePresence>
  );

  const errorMessage = list.errorKey
    ? t(list.errorKey)
    : posts.isFetchNextPageError
      ? t("subprofiles:updates.loadMoreError")
      : "";

  return (
    <>
      <ol className={styles.list}>{renderItems(list.first)}</ol>
      <Collapse isOpen={list.isExpanded && list.rest.length > 0}>
        <ol ref={restListRef} className={styles.list}>
          {renderItems(list.rest)}
        </ol>
      </Collapse>
      <PersonaUpdatesAlert message={errorMessage} />
      <Collapse isOpen={list.canShowMore}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.tapTarget}
          aria-disabled={posts.isFetchingNextPage || undefined}
          onClick={list.showMore}
        >
          {posts.isFetchingNextPage
            ? t("subprofiles:updates.loadingMore")
            : t("subprofiles:updates.showMoreCta")}
        </Button>
      </Collapse>
      <p className="visuallyHidden" role="status">
        {list.statusKey ? t(list.statusKey) : ""}
      </p>
      <ConfirmDialog
        open={list.pendingDelete !== null}
        onClose={() => list.setPendingDelete(null)}
        onConfirm={() => void list.confirmDelete()}
        loading={list.isDeleting}
        tone="destructive"
        title={t("subprofiles:updates.post.deleteTitle")}
        description={t("subprofiles:updates.post.deleteBody", {
          name: personaName,
        })}
        confirmLabel={t("subprofiles:updates.post.deleteCta")}
      />
      <AnimatePresence>
        {list.reportedPost && (
          <ReportListingModal
            key={list.reportedPost.id}
            subjectType="persona_post"
            subjectId={list.reportedPost.id}
            subjectName={t("subprofiles:updates.post.reportSubject")}
            onClose={() => list.setReportedPost(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
