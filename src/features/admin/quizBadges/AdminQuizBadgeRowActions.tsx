import { useEffect, useRef } from "react";
import { FiArchive, FiEdit2, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import type { QuizBadgeDefinitionDTO } from "../../../shared/contracts/quizWinBadges";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizWinBadgeErrorText } from "../../quizshow/winBadges/quizWinBadgeErrors";
import { quizBadgeTextIn } from "../../quizshow/winBadges/quizWinBadgeText";
import { AdminRowActions, adminRowActionClasses } from "../ui";
import {
  useArchiveQuizBadge,
  useRestoreQuizBadge,
} from "./api/useQuizBadgeLibrary";
import phone from "../adminPhoneActions.module.css";
import styles from "./AdminQuizBadges.module.css";

/**
 * One library row's actions: edit, archive or restore, and delete for a
 * badge nobody holds. The group names the badge, so a screen reader hears
 * which one each action works on. Archive and restore toast their result,
 * and a refusal toasts its reason. The library re-sorts an archived or
 * restored badge, so its button keeps focus and scrolls into view.
 */
export function AdminQuizBadgeRowActions({
  definition,
  onEdit,
  onDelete,
}: {
  definition: QuizBadgeDefinitionDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const archiveBadge = useArchiveQuizBadge();
  const restoreBadge = useRestoreQuizBadge();
  const isBusy = archiveBadge.isPending || restoreBadge.isPending;
  const name = quizBadgeTextIn(definition.name, language);
  const archiveButtonRef = useRef<HTMLButtonElement>(null);
  const shouldKeepInViewRef = useRef(false);

  // Runs on the render that moved the row: the button may have lost focus as
  // its row moved, so it takes it back unless focus went somewhere else.
  useEffect(() => {
    const archiveButton = archiveButtonRef.current;
    if (!shouldKeepInViewRef.current || archiveButton === null) return;
    shouldKeepInViewRef.current = false;
    const focused = document.activeElement;
    if (
      focused !== null &&
      focused !== document.body &&
      focused !== archiveButton
    )
      return;
    archiveButton.focus({ preventScroll: true });
    // jsdom leaves scrollIntoView undefined.
    if (typeof archiveButton.scrollIntoView === "function") {
      archiveButton.scrollIntoView({
        block: "nearest",
        behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      });
    }
  }, [definition.isArchived]);

  const changeArchive = async () => {
    if (isBusy) return;
    shouldKeepInViewRef.current = true;
    try {
      if (definition.isArchived) {
        await restoreBadge.mutateAsync({ definitionId: definition.id });
        showToast(t("quizshow:winBadges.admin.library.restored"), "success");
      } else {
        await archiveBadge.mutateAsync({ definitionId: definition.id });
        showToast(t("quizshow:winBadges.admin.library.archived"), "success");
      }
    } catch (error) {
      shouldKeepInViewRef.current = false;
      showToast(quizWinBadgeErrorText(error, t, fmt), "error");
    }
  };

  const openDelete = () => {
    if (isBusy) return;
    onDelete();
  };

  return (
    <div
      role="group"
      aria-label={t("quizshow:winBadges.admin.library.actions", { name })}
    >
      <AdminRowActions className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <FiEdit2 aria-hidden fill="none" />
          {t("quizshow:winBadges.admin.library.edit")}
        </Button>
        <Button
          ref={archiveButtonRef}
          variant="ghost"
          size="sm"
          className={phone.iconButton}
          aria-disabled={isBusy || undefined}
          onClick={() => void changeArchive()}
        >
          {definition.isArchived ? (
            <FiRotateCcw aria-hidden fill="none" />
          ) : (
            <FiArchive aria-hidden fill="none" />
          )}
          <span className={phone.label}>
            {definition.isArchived
              ? t("quizshow:winBadges.admin.library.restore")
              : t("quizshow:winBadges.admin.library.archive")}
          </span>
        </Button>
        <Collapse isOpen={definition.canDelete}>
          <Button
            variant="ghost"
            size="sm"
            className={`${phone.iconButton} ${adminRowActionClasses.danger}`}
            aria-disabled={isBusy || undefined}
            onClick={openDelete}
          >
            <FiTrash2 aria-hidden fill="none" />
            <span className={phone.label}>
              {t("quizshow:winBadges.admin.library.delete")}
            </span>
          </Button>
        </Collapse>
      </AdminRowActions>
    </div>
  );
}
