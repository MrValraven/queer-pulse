import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiSend, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  FormField,
  IconButton,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  CulturalIdeaCommentDTO,
  CulturalIdeaDTO,
} from "./api/culturalProduction.types";
import {
  useAddCulturalIdeaComment,
  useDeleteCulturalIdeaComment,
  useIsCulturalWriteInFlight,
} from "./api/useCulturalIdeaMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { IdeaStaffIdentity } from "./IdeaBackers";
import styles from "./IdeaDrawer.module.css";

/** Day, month and time: a thread reads as a recent conversation. */
const COMMENT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

/** How many frames the composer waits for the confirm to let go of focus. */
const COMPOSER_FOCUS_FRAMES = 60;

/**
 * Moves focus to the composer once the delete confirm has closed: while
 * focus sits on the page itself or in another dialog (the confirm on its way
 * out, which keeps the drawer inert), it tries again on the next frame, up
 * to a bound. Focus the viewer moved on their own is left alone.
 */
function focusComposerWhenFree(
  textarea: HTMLTextAreaElement | null,
  frameRef: { current: number | null },
): void {
  let framesLeft = COMPOSER_FOCUS_FRAMES;
  const attempt = () => {
    frameRef.current = null;
    if (textarea === null || !textarea.isConnected) return;
    const active = document.activeElement;
    const activeDialog = active?.closest('[aria-modal="true"]') ?? null;
    const ownDialog = textarea.closest('[aria-modal="true"]');
    const isFocusFree =
      active === null ||
      active === document.body ||
      !active.isConnected ||
      (activeDialog !== null && activeDialog !== ownDialog);
    if (!isFocusFree) return;
    textarea.focus({ preventScroll: true });
    framesLeft -= 1;
    if (document.activeElement !== textarea && framesLeft > 0) {
      frameRef.current = requestAnimationFrame(attempt);
    }
  };
  frameRef.current = requestAnimationFrame(attempt);
}

/** One comment: who wrote it, when, the text as written, and Delete
 *  comment (asked first) when the server says this viewer may. */
function IdeaCommentItem({
  ideaId,
  comment,
  onDeleted,
}: {
  ideaId: string;
  comment: CulturalIdeaCommentDTO;
  /** Called once the comment is gone, so focus can land in the composer. */
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const deleteComment = useDeleteCulturalIdeaComment(ideaId);
  // Comment writes keep `updatedAt`, so the cache cannot order two answers:
  // every control that sends one waits while any write runs.
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [refusal, setRefusal] = useState<unknown>(null);
  const writtenAt = format.date(
    new Date(comment.createdAt),
    COMMENT_TIME_FORMAT,
  );

  const confirmDelete = () => {
    if (isWriteInFlight) return;
    setRefusal(null);
    deleteComment.mutate(
      { commentId: comment.id },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          onDeleted();
          showToast(
            t("admin:culturalProduction.ideas.drawer.commentDeletedToast"),
            "success",
          );
        },
        onError: (cause) => setRefusal(cause),
      },
    );
  };

  return (
    <article className={styles.comment}>
      <div className={styles.commentHead}>
        <IdeaStaffIdentity
          person={comment.author}
          detail={<time dateTime={comment.createdAt}>{writtenAt}</time>}
        />
        {comment.canDelete && (
          <IconButton
            aria-label={t(
              "admin:culturalProduction.ideas.drawer.commentDeleteAria",
              { date: writtenAt },
            )}
            tooltip
            aria-disabled={isWriteInFlight || undefined}
            onClick={() => {
              if (isWriteInFlight) return;
              setRefusal(null);
              setIsConfirmOpen(true);
            }}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        )}
      </div>
      <p className={styles.commentBody}>{comment.body}</p>
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            open
            tone="destructive"
            initialFocus="cancel"
            loading={isWriteInFlight}
            title={t(
              "admin:culturalProduction.ideas.drawer.commentDeleteConfirmTitle",
            )}
            confirmLabel={t(
              "admin:culturalProduction.ideas.drawer.commentDeleteCta",
            )}
            cancelLabel={t("admin:culturalProduction.common.cancel")}
            onClose={() => {
              if (!isWriteInFlight) setIsConfirmOpen(false);
            }}
            onConfirm={confirmDelete}
          >
            <CulturalRefusalLine error={refusal} />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </article>
  );
}

/**
 * The idea's thread, oldest first, and the box for a new comment. Post
 * comment stays `aria-disabled` and ignores presses while the box is blank
 * or any write runs. A comment that lands clears what it posted from the
 * box (words typed while it was on its way stay), grows into the thread and
 * is scrolled into view; a refused one keeps the text and names its cause.
 * Deleting a comment brings focus to the box.
 */
export function IdeaComments({ idea }: { idea: CulturalIdeaDTO }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const addComment = useAddCulturalIdeaComment(idea.id);
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const [text, setText] = useState("");
  const [refusal, setRefusal] = useState<unknown>(null);
  const shouldRevealNewestRef = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusFrameRef = useRef<number | null>(null);
  const headingId = `cultural-idea-${idea.id}-comments`;
  const textareaId = `${headingId}-new`;
  const refusalId = `${textareaId}-refusal`;
  const isBlank = text.trim() === "";
  const isPostDisabled = isBlank || isWriteInFlight;
  const commentCount = idea.comments.length;

  // Once a posted comment is in the thread, the thread scrolls it into view.
  // The flag is set as the post lands, before the answer renders.
  useEffect(() => {
    if (!shouldRevealNewestRef.current) return;
    shouldRevealNewestRef.current = false;
    listRef.current?.lastElementChild?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [commentCount, reducedMotion]);

  useEffect(
    () => () => {
      if (focusFrameRef.current !== null) {
        cancelAnimationFrame(focusFrameRef.current);
      }
    },
    [],
  );

  const focusComposer = () => {
    if (focusFrameRef.current !== null) {
      cancelAnimationFrame(focusFrameRef.current);
    }
    focusComposerWhenFree(textareaRef.current, focusFrameRef);
  };

  const post = () => {
    if (isPostDisabled) return;
    setRefusal(null);
    const postedText = text;
    addComment.mutate(
      { body: postedText.trim() },
      {
        onSuccess: () => {
          shouldRevealNewestRef.current = true;
          setText((current) =>
            current.startsWith(postedText)
              ? current.slice(postedText.length).trimStart()
              : current,
          );
        },
        onError: (cause) => setRefusal(cause),
      },
    );
  };

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {t("admin:culturalProduction.ideas.drawer.commentsHeading")}
      </h3>
      <ol ref={listRef} className={styles.commentList}>
        <AnimatePresence initial={false}>
          {idea.comments.map((comment) => (
            <CollapseListItem key={comment.id}>
              <IdeaCommentItem
                ideaId={idea.id}
                comment={comment}
                onDeleted={focusComposer}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ol>
      <Collapse isOpen={commentCount === 0}>
        <p className={styles.empty}>
          {t("admin:culturalProduction.ideas.drawer.commentsNone")}
        </p>
      </Collapse>
      <div className={styles.composer}>
        <FormField
          label={t("admin:culturalProduction.ideas.drawer.commentLabel")}
        >
          <textarea
            ref={textareaRef}
            id={textareaId}
            rows={3}
            value={text}
            placeholder={t(
              "admin:culturalProduction.ideas.drawer.commentPlaceholder",
            )}
            aria-invalid={refusal !== null || undefined}
            aria-describedby={refusal === null ? undefined : refusalId}
            onChange={(event) => {
              setText(event.target.value);
              setRefusal(null);
            }}
          />
        </FormField>
        <CulturalRefusalLine error={refusal} id={refusalId} />
        <div className={styles.composerActions}>
          <Button
            variant="primary"
            size="sm"
            className={styles.phoneTarget}
            aria-disabled={isPostDisabled || undefined}
            onClick={post}
          >
            <FiSend aria-hidden />
            {t("admin:culturalProduction.ideas.drawer.commentCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
