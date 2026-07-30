import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { useAdminRoadmap, useAdminRoadmapMutations } from "./api/useAdminRoadmap";
import {
  IdeaQueuePendingRow,
  IdeaQueuePublishedRow,
  IdeaQueueConfirmModal,
  type IdeaConfirmKind,
} from "./AdminRoadmapIdeaRows";
import type { AdminRoadmapIdea } from "./adminRoadmap.data";
import styles from "./AdminRoadmapPage.module.css";

type ConfirmTarget = { kind: IdeaConfirmKind; idea: AdminRoadmapIdea };

/**
 * The member-idea triage queue (`/admin/roadmap`, Ideas tab) — replaces
 * Task 6's flat read-only placeholder. Two sections: "Pending review" for
 * `status: "pending"` ideas (promote → published, dismiss → hidden), and
 * "Published" for the live Top-ideas list the public roadmap page reads
 * (inline text edit, column-local reorder via `sortOrder` swaps exactly
 * like `AdminRoadmapBoard`'s items, delete, and an "Add idea" that posts
 * straight to published — mirrors `createRoadmapIdea`'s own "admin-authored
 * ideas skip triage" contract). One shared confirm dialog covers both
 * dismiss and delete, matching the board's one-confirm-modal convention.
 */
export function AdminRoadmapIdeasQueue() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { ideas } = useAdminRoadmap();
  const { createIdea, updateIdea, deleteIdea } = useAdminRoadmapMutations();
  const [newIdeaText, setNewIdeaText] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);

  const pending = ideas
    .filter((idea) => idea.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const published = ideas
    .filter((idea) => idea.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  function promote(idea: AdminRoadmapIdea) {
    updateIdea(
      { id: idea.id, body: { status: "published", sortOrder: published.length } },
      {
        onSuccess: () => showToast(t("admin:roadmap.ideas.toast.promoted"), "success"),
        onError: (error) =>
          showToast(describeError("Couldn't promote that idea", error), "error"),
      },
    );
  }

  function confirmAction() {
    if (!confirmTarget) return;
    const { kind, idea } = confirmTarget;
    if (kind === "dismiss") {
      updateIdea(
        { id: idea.id, body: { status: "dismissed" } },
        {
          onSuccess: () => showToast(t("admin:roadmap.ideas.toast.dismissed"), "info"),
          onError: (error) =>
            showToast(describeError("Couldn't dismiss that idea", error), "error"),
        },
      );
    } else {
      deleteIdea(idea.id, {
        onSuccess: () => showToast(t("admin:roadmap.ideas.toast.removed"), "info"),
        onError: (error) =>
          showToast(describeError("Couldn't remove that idea", error), "error"),
      });
    }
    setConfirmTarget(null);
  }

  function moveIdea(idea: AdminRoadmapIdea, delta: 1 | -1) {
    const index = published.findIndex((candidate) => candidate.id === idea.id);
    const neighbor = published[index + delta];
    if (!neighbor) return;
    const onError = (error: Error) =>
      showToast(describeError("Couldn't reorder that idea", error), "error");
    updateIdea({ id: idea.id, body: { sortOrder: neighbor.sortOrder } }, { onError });
    updateIdea({ id: neighbor.id, body: { sortOrder: idea.sortOrder } }, { onError });
  }

  function saveIdeaText(idea: AdminRoadmapIdea, text: string) {
    updateIdea(
      { id: idea.id, body: { text } },
      {
        onSuccess: () => showToast(t("admin:roadmap.ideas.toast.updated"), "success"),
        onError: (error) =>
          showToast(describeError("Couldn't save that idea", error), "error"),
      },
    );
  }

  function handleAddIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newIdeaText.trim();
    if (!text) return;
    createIdea(text, {
      onSuccess: () => {
        setNewIdeaText("");
        showToast(t("admin:roadmap.ideas.toast.added"), "success");
      },
      onError: (error) =>
        showToast(describeError("Couldn't add that idea", error), "error"),
    });
  }

  return (
    <div className={styles.ideasQueue}>
      <section className={styles.ideaSection}>
        <h2 className={styles.boardColumnTitle}>
          {t("admin:roadmap.ideas.pending.title")}
          <span className={styles.boardColumnCount}>{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className={styles.empty}>{t("admin:roadmap.ideas.pending.empty")}</p>
        ) : (
          <ul className={styles.ideaQueueList}>
            {pending.map((idea) => (
              <IdeaQueuePendingRow
                key={idea.id}
                idea={idea}
                onPromote={() => promote(idea)}
                onDismiss={() => setConfirmTarget({ kind: "dismiss", idea })}
              />
            ))}
          </ul>
        )}
      </section>

      <section className={styles.ideaSection}>
        <h2 className={styles.boardColumnTitle}>
          {t("admin:roadmap.ideas.published.title")}
          <span className={styles.boardColumnCount}>{published.length}</span>
        </h2>

        <form className={styles.addIdeaForm} onSubmit={handleAddIdea}>
          <input
            className={styles.textInput}
            value={newIdeaText}
            onChange={(event) => setNewIdeaText(event.target.value)}
            placeholder={t("admin:roadmap.ideas.addPlaceholder")}
            aria-label={t("admin:roadmap.ideas.addAriaLabel")}
          />
          <Button variant="primary" type="submit" size="md">
            {t("admin:roadmap.ideas.addCta")}
          </Button>
        </form>

        {published.length === 0 ? (
          <p className={styles.empty}>{t("admin:roadmap.ideas.published.empty")}</p>
        ) : (
          <ul className={styles.ideaQueueList}>
            {published.map((idea, index) => (
              <IdeaQueuePublishedRow
                key={idea.id}
                idea={idea}
                canMoveUp={index > 0}
                canMoveDown={index < published.length - 1}
                onMoveUp={() => moveIdea(idea, -1)}
                onMoveDown={() => moveIdea(idea, 1)}
                onSaveText={(text) => saveIdeaText(idea, text)}
                onDelete={() => setConfirmTarget({ kind: "delete", idea })}
              />
            ))}
          </ul>
        )}
      </section>

      {confirmTarget && (
        <IdeaQueueConfirmModal
          kind={confirmTarget.kind}
          onConfirm={confirmAction}
          onClose={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
