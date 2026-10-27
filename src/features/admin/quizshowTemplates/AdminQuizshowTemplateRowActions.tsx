import { useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCopy,
  FiEyeOff,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { adminQuizshowTemplatePath } from "../../../app/routeMap";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse, ConfirmDialog } from "../../../shared/components/ui";
import type { QuizshowTemplateRow } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useDeleteQuizshowTemplate,
  useDuplicateQuizshowTemplate,
  usePublishQuizshowTemplate,
  useUnpublishQuizshowTemplate,
} from "../../quizshow/api/useQuizshowTemplates";
import {
  quizshowTemplateErrorKeyOf,
  quizshowTemplatePublishErrorKeyOf,
} from "../../quizshow/templates/quizshowTemplateErrors";
import { templateCardTitleOf } from "../../quizshow/templates/quizshowTemplateResponse";
import { QUIZSHOW_TEMPLATES_HEADING_ID } from "./quizshowTemplateList.data";
import styles from "./AdminQuizshowTemplates.module.css";

/** About a second and a half of frames to wait for the dialog's focus return to fail. */
const FOCUS_WATCH_FRAME_LIMIT = 90;

/**
 * After a delete, the dialog hands focus back to Delete template, which leaves
 * with its row, so focus drops to the body. This waits for that drop and moves
 * focus onto the page heading. A staff member who has already moved focus
 * somewhere else keeps it there.
 */
function focusHeadingOnceFocusDrops(framesLeft = FOCUS_WATCH_FRAME_LIMIT) {
  requestAnimationFrame(() => {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      document.getElementById(QUIZSHOW_TEMPLATES_HEADING_ID)?.focus();
      return;
    }
    if (framesLeft > 0) focusHeadingOnceFocusDrops(framesLeft - 1);
  });
}

/** The refusal copy stays put while its panel folds away, so it never blanks mid-fold. */
interface RowRefusal {
  messageKey: string;
  isShown: boolean;
}

const NO_REFUSAL: RowRefusal = { messageKey: "", isShown: false };

/**
 * One template row's actions: open, duplicate, publish or unpublish, and
 * delete behind a confirm. Each names the row's title as its description, so
 * a screen reader hears which template it acts on. A refused action names its
 * reason in a panel under the buttons.
 */
export function AdminQuizshowTemplateRowActions({
  row,
  titleId,
}: {
  row: QuizshowTemplateRow;
  titleId: string;
}) {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const cardTitle = templateCardTitleOf(row.title, language);
  // The confirm names what goes; an untitled draft keeps the plain question.
  const deleteTitle =
    cardTitle === ""
      ? t("quizshow:templates.row.deleteTitle")
      : t("quizshow:templates.row.deleteTitleNamed", { title: cardTitle });
  const duplicateTemplate = useDuplicateQuizshowTemplate();
  const publishTemplate = usePublishQuizshowTemplate();
  const unpublishTemplate = useUnpublishQuizshowTemplate();
  const deleteTemplate = useDeleteQuizshowTemplate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [refusal, setRefusal] = useState<RowRefusal>(NO_REFUSAL);
  const isPublished = row.status === "published";
  const isStatusPending =
    publishTemplate.isPending || unpublishTemplate.isPending;
  const isBusy =
    duplicateTemplate.isPending || isStatusPending || deleteTemplate.isPending;

  const hideRefusal = () =>
    setRefusal((previous) => ({ ...previous, isShown: false }));
  const showRefusal = (messageKey: string) =>
    setRefusal({ messageKey, isShown: true });

  const duplicate = async () => {
    if (isBusy) return;
    hideRefusal();
    try {
      const copy = await duplicateTemplate.mutateAsync(row.id);
      showToast(t("quizshow:templates.row.duplicated"), "success");
      void navigate(adminQuizshowTemplatePath(copy.id));
    } catch (error) {
      showRefusal(quizshowTemplateErrorKeyOf(error));
    }
  };

  const changeStatus = async () => {
    if (isBusy) return;
    hideRefusal();
    try {
      if (isPublished) {
        await unpublishTemplate.mutateAsync(row.id);
        showToast(t("quizshow:templates.unpublished"), "success");
      } else {
        await publishTemplate.mutateAsync(row.id);
        showToast(t("quizshow:templates.published"), "success");
      }
    } catch (error) {
      showRefusal(
        isPublished
          ? quizshowTemplateErrorKeyOf(error)
          : quizshowTemplatePublishErrorKeyOf(error),
      );
    }
  };

  const openDeleteConfirm = () => {
    if (isBusy) return;
    hideRefusal();
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTemplate.isPending) return;
    try {
      await deleteTemplate.mutateAsync(row.id);
    } catch (error) {
      setIsDeleteConfirmOpen(false);
      showRefusal(quizshowTemplateErrorKeyOf(error));
      return;
    }
    setIsDeleteConfirmOpen(false);
    showToast(t("quizshow:templates.row.deleted"), "success");
    focusHeadingOnceFocusDrops();
  };

  return (
    <>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          to={adminQuizshowTemplatePath(row.id)}
          aria-describedby={titleId}
        >
          <FiArrowRight aria-hidden fill="none" />
          {t("quizshow:templates.row.open")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-describedby={titleId}
          aria-disabled={isBusy || undefined}
          onClick={() => void duplicate()}
        >
          <FiCopy aria-hidden fill="none" />
          {t("quizshow:templates.row.duplicate")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-describedby={titleId}
          aria-disabled={isBusy || undefined}
          onClick={() => void changeStatus()}
        >
          {isPublished ? (
            <FiEyeOff aria-hidden fill="none" />
          ) : (
            <FiSend aria-hidden fill="none" />
          )}
          {isPublished
            ? t("quizshow:templates.unpublish")
            : t("quizshow:templates.publish")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-describedby={titleId}
          aria-disabled={isBusy || undefined}
          onClick={openDeleteConfirm}
        >
          <FiTrash2 aria-hidden fill="none" />
          {t("quizshow:templates.row.delete")}
        </Button>
      </div>
      <Collapse isOpen={refusal.isShown}>
        <p className={styles.refusal} role="alert">
          <FiAlertCircle
            aria-hidden
            fill="none"
            className={styles.refusalIcon}
          />
          {t(refusal.messageKey)}
        </p>
      </Collapse>
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <ConfirmDialog
            key="delete-template"
            open
            tone="destructive"
            initialFocus="cancel"
            loading={deleteTemplate.isPending}
            title={deleteTitle}
            description={t("quizshow:templates.row.deleteBody")}
            confirmLabel={t("quizshow:templates.row.delete")}
            onConfirm={() => void confirmDelete()}
            onClose={() => setIsDeleteConfirmOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
