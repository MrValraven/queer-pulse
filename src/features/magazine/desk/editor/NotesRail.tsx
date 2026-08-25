import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useArticleComments } from "../../api/useArticleComments";
import { useCommentMutations } from "../../api/useCommentMutations";
import { CommentThread } from "./CommentThread";
import styles from "../pieceTabs.module.css";

export interface NotesRailProps {
  /** The piece id `useArticleComments`/`useCommentMutations` key off — same
   *  one `ArticleEditorPage` reads its draft with. */
  pieceId: string;
  /** The block currently selected in the document (`ArticleEditorPage`'s
   *  `selectedId`), if any — carried onto a new top-level note so it lands
   *  anchored to that block. `null`/`undefined` posts an unanchored note. */
  blockId?: string | null;
}

/**
 * The draft's threaded, resolvable notes (Phase 7 Wave D). Ported from the
 * design prototype's Notes rail, now fully live-wired: `useArticleComments`
 * reads the nested tree (the demo fixture, or `GET .../comments` in live
 * mode); `useCommentMutations` posts new notes/replies and toggles resolve,
 * invalidating that same query after any live write. Kept thin on purpose —
 * `CommentThread`/`CommentItem` own the per-comment rendering and actions.
 */
export function NotesRail({ pieceId, blockId }: NotesRailProps) {
  const { t } = useTranslation();
  const { comments, isLoading } = useArticleComments(pieceId);
  const { addComment, reply, toggleResolve } = useCommentMutations(pieceId);
  const [noteText, setNoteText] = useState("");

  function handleAddNote() {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    addComment.mutate({ body: trimmed, blockId: blockId ?? undefined });
    setNoteText("");
  }

  return (
    <div className={styles.card}>
      <h3>{t("magazine:write.notes.title")}</h3>

      {isLoading ? (
        <span className={styles.tiny}>{t("magazine:write.notes.loading")}</span>
      ) : comments.length === 0 ? (
        <span className={styles.tiny}>{t("magazine:write.notes.empty")}</span>
      ) : (
        <div className={styles.stack}>
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onReply={(commentId, body) => reply.mutate({ commentId, body })}
              onToggleResolve={(commentId, resolved) =>
                toggleResolve.mutate({ commentId, resolved })
              }
            />
          ))}
        </div>
      )}

      <div className={styles.field}>
        <textarea
          aria-label={t("magazine:write.notes.addAria")}
          placeholder={t("magazine:write.notes.addPlaceholder")}
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
        />
      </div>
      <Button size="sm" onClick={handleAddNote} disabled={addComment.isPending}>
        {t("magazine:write.notes.addCta")}
      </Button>
    </div>
  );
}
