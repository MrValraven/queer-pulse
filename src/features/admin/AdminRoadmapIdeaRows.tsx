import { useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { Badge, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { AdminModal } from "./ui";
import type { AdminRoadmapIdea } from "./adminRoadmap.data";
import styles from "./AdminRoadmapPage.module.css";

export type IdeaConfirmKind = "dismiss" | "delete";

/**
 * The queue's one shared confirm dialog — covers both "dismiss a pending
 * idea" and "delete a published idea", matching `AdminRoadmapBoard`'s
 * single-confirm-modal convention rather than mounting one per row. `kind`
 * picks the copy; the caller supplies `onConfirm` already bound to the
 * right target.
 */
export function IdeaQueueConfirmModal({
  kind,
  onConfirm,
  onClose,
}: {
  kind: IdeaConfirmKind;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminModal
      title={t(`admin:roadmap.ideas.${kind}.title`)}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t(`admin:roadmap.ideas.${kind}.confirmCta`)}
          </Button>
        </>
      }
    >
      <p className={styles.deleteConfirmBody}>
        {t(`admin:roadmap.ideas.${kind}.body`)}
      </p>
    </AdminModal>
  );
}

/**
 * One "pending review" row — a member-submitted idea awaiting triage.
 * Promote is one click (publishing an idea is non-destructive, reversible
 * via the published list's own delete); dismiss goes through the queue's
 * shared confirm dialog since hiding a submission is harder for the member
 * who wrote it to notice/undo.
 */
export function IdeaQueuePendingRow({
  idea,
  onPromote,
  onDismiss,
}: {
  idea: AdminRoadmapIdea;
  onPromote: () => void;
  onDismiss: () => void;
}) {
  const { t, language } = useTranslation();
  return (
    <li className={styles.ideaQueueRow}>
      <div className={styles.ideaQueueMain}>
        <p className={styles.ideaQueueText}>{idea.text}</p>
        <div className={styles.ideaQueueMeta}>
          {idea.fromMember && (
            <Badge tone="ghost">{t("admin:roadmap.ideas.fromMemberTag")}</Badge>
          )}
          <span className={styles.ideaQueueDate}>
            {t("admin:roadmap.ideas.submittedLabel", {
              date: formatDate(idea.createdAt, language),
            })}
          </span>
        </div>
      </div>
      <div className={styles.ideaQueueActions}>
        <Button variant="jade" size="md" onClick={onPromote}>
          {t("admin:roadmap.ideas.promoteCta")}
        </Button>
        <Button variant="ghost" size="md" onClick={onDismiss}>
          {t("admin:roadmap.ideas.dismissCta")}
        </Button>
      </div>
    </li>
  );
}

/**
 * One "published" (live Top-ideas) row — inline text edit, reorder within
 * the published list (mirrors `AdminRoadmapItemRow`'s column-local
 * up/down), and delete (confirmed by the queue's shared dialog). Tally is
 * `votes + liveVotes` per the seeded-count / live-accrued split the item
 * rows already use.
 */
export function IdeaQueuePublishedRow({
  idea,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSaveText,
  onDelete,
}: {
  idea: AdminRoadmapIdea;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaveText: (text: string) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(idea.text);

  function startEdit() {
    setDraftText(idea.text);
    setEditing(true);
  }

  function save() {
    const trimmed = draftText.trim();
    if (trimmed && trimmed !== idea.text) onSaveText(trimmed);
    setEditing(false);
  }

  return (
    <li className={styles.ideaQueueRow}>
      <div className={styles.itemReorder}>
        <Button
          variant="ghost"
          size="md"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          aria-label={t("admin:roadmap.ideas.moveUpAriaLabel", { text: idea.text })}
        >
          <FiChevronUp size={16} />
        </Button>
        <Button
          variant="ghost"
          size="md"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          aria-label={t("admin:roadmap.ideas.moveDownAriaLabel", { text: idea.text })}
        >
          <FiChevronDown size={16} />
        </Button>
      </div>

      <div className={styles.ideaQueueMain}>
        {editing ? (
          <input
            className={styles.textInput}
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            aria-label={t("admin:roadmap.ideas.editAriaLabel", { text: idea.text })}
          />
        ) : (
          <p className={styles.ideaQueueText}>{idea.text}</p>
        )}
        <span className={styles.ideaQueueTally}>
          {t("admin:roadmap.ideas.tallyLabel", {
            count: idea.votes + idea.liveVotes,
          })}
        </span>
      </div>

      <div className={styles.ideaQueueActions}>
        {editing ? (
          <>
            <Button variant="primary" size="md" onClick={save}>
              {t("admin:common.saveChanges")}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setEditing(false)}>
              {t("admin:common.cancel")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="md" onClick={startEdit}>
              {t("admin:common.edit")}
            </Button>
            <Button variant="ghost" size="md" onClick={onDelete}>
              {t("admin:common.delete")}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
