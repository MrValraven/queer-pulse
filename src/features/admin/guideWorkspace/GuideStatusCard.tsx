import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { describeError } from "../../../shared/api/errorMessage";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate, todayIso } from "../../../shared/lib/date";
import { AdminResourceGuideReviewModal } from "../AdminResourceGuideReviewModal";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import { useSetResourceGuidePublished } from "../api/useAdminResourceGuideMutations";
import styles from "./GuideRail.module.css";

const REVIEW_HINT_ID = "guide-status-review-hint";

/**
 * Whether readers can see the guide, and the two acts that change that:
 * Mark reviewed (disabled until the draft is saved, so a review always covers
 * what readers get) and Publish/Unpublish (Admins only, as on the backend).
 */
export function GuideStatusCard({
  guide,
  isDirty,
  isTakingOverPage,
  onGuideUpdated,
}: {
  guide: AdminResourceGuideDTO | null;
  isDirty: boolean;
  isTakingOverPage: boolean;
  onGuideUpdated: (guide: AdminResourceGuideDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { role } = useAuth();
  const setPublished = useSetResourceGuidePublished();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (!guide) {
    return (
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>
          {t("admin:guideWorkspace.status.title")}
        </h2>
        <p className={styles.panelText}>
          {t("admin:guideWorkspace.status.newGuide")}
        </p>
      </section>
    );
  }

  const savedGuide = guide;
  const isPublished = savedGuide.publishedAt !== null;
  const isOverdue =
    savedGuide.reviewDueOn !== null && savedGuide.reviewDueOn <= todayIso();
  const reviewLine = savedGuide.lastReviewedOn
    ? savedGuide.reviewedBy
      ? t("admin:adminResourceGuides.row.reviewedBy", {
          date: formatDate(savedGuide.lastReviewedOn),
          reviewer: savedGuide.reviewedBy,
        })
      : t("admin:adminResourceGuides.row.reviewed", {
          date: formatDate(savedGuide.lastReviewedOn),
        })
    : t("admin:adminResourceGuides.row.neverReviewed");

  function togglePublished() {
    setPublished.mutate(
      { id: savedGuide.id, isPublished: !isPublished },
      {
        onSuccess: (updated) => {
          if (!updated) {
            showToast(t("admin:guideWorkspace.toast.demoNotSaved"), "info");
            return;
          }
          onGuideUpdated(updated);
          showToast(
            t(
              isPublished
                ? "admin:guideWorkspace.toast.unpublished"
                : "admin:guideWorkspace.toast.published",
              { title: savedGuide.title },
            ),
            "info",
          );
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:guideWorkspace.error.publish"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>
        {t("admin:guideWorkspace.status.title")}
      </h2>
      <p
        className={
          isPublished ? styles.statusPublished : styles.statusUnpublished
        }
      >
        {isPublished ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
        {t(
          isPublished
            ? "admin:guideWorkspace.status.published"
            : "admin:guideWorkspace.status.unpublished",
        )}
      </p>
      {isPublished && !savedGuide.lastReviewedOn && (
        <p className={styles.panelWarning}>
          {t("admin:guideWorkspace.status.hiddenUntilReviewed")}
        </p>
      )}
      <p className={styles.panelText}>{reviewLine}</p>
      {savedGuide.reviewDueOn && (
        <p className={isOverdue ? styles.panelWarning : styles.panelText}>
          {t(
            isOverdue
              ? "admin:guideWorkspace.status.reviewOverdue"
              : "admin:guideWorkspace.status.reviewDue",
            { date: formatDate(savedGuide.reviewDueOn) },
          )}
        </p>
      )}
      {isTakingOverPage && (
        <p className={styles.panelNotice}>
          {t("admin:adminResourceGuides.editor.takeoverNotice")}
        </p>
      )}
      <div className={styles.panelActions}>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDirty}
          aria-describedby={isDirty ? REVIEW_HINT_ID : undefined}
          onClick={() => setIsReviewOpen(true)}
        >
          {t("admin:adminResourceGuides.row.reviewCta")}
        </Button>
        {role === "admin" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isDirty || setPublished.isPending}
            aria-describedby={isDirty ? REVIEW_HINT_ID : undefined}
            onClick={togglePublished}
          >
            {t(
              isPublished
                ? "admin:guideWorkspace.status.unpublishCta"
                : "admin:guideWorkspace.status.publishCta",
            )}
          </Button>
        )}
      </div>
      {isDirty && (
        <p id={REVIEW_HINT_ID} className={styles.fieldHint}>
          {t("admin:guideWorkspace.status.saveBeforeReview")}
        </p>
      )}
      {isReviewOpen && (
        <AdminResourceGuideReviewModal
          guide={savedGuide}
          onClose={() => setIsReviewOpen(false)}
          onReviewed={onGuideUpdated}
        />
      )}
    </section>
  );
}
