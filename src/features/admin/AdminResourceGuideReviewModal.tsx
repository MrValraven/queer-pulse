import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { todayIso } from "../../shared/lib/date";
import { AdminModal } from "./ui";
import { useReviewResourceGuide } from "./api/useAdminResourceGuideMutations";
import type { AdminResourceGuideDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminResourceGuidesPage.module.css";

const FORM_ID = "admin-guide-review-form";

/** Six months on from today, as `yyyy-mm-dd` — the default next-review date,
 *  and only a default: the editor changes it for anything that moves faster. */
function defaultNextReview(): string {
  const next = new Date();
  next.setMonth(next.getMonth() + 6);
  return next.toISOString().slice(0, 10);
}

/**
 * Stamps "I read this guide end to end and it is still accurate" (CON-09).
 *
 * Kept separate from the prose editor on purpose, and it maps to its own
 * endpoint: conflating the two would let a typo fix silently reset a crisis
 * guide's freshness clock, which is the opposite of what the review date is
 * for. `reviewedBy` is required, because a review with no owner is the state
 * these guides were already in.
 */
export function AdminResourceGuideReviewModal({
  guide,
  onClose,
}: {
  guide: AdminResourceGuideDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reviewGuide = useReviewResourceGuide();
  const [reviewedBy, setReviewedBy] = useState(guide.reviewedBy ?? "");
  const [lastReviewedOn, setLastReviewedOn] = useState(todayIso());
  const [reviewDueOn, setReviewDueOn] = useState(defaultNextReview());

  function submit(event: FormEvent) {
    event.preventDefault();
    reviewGuide.mutate(
      { id: guide.id, body: { reviewedBy, lastReviewedOn, reviewDueOn } },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminResourceGuides.toast.reviewed", {
              title: guide.title,
            }),
            "info",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:adminResourceGuides.error.review"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={guide.slug}
      title={t("admin:adminResourceGuides.review.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={reviewGuide.isPending || reviewedBy.trim().length === 0}
          >
            {t("admin:adminResourceGuides.review.confirmCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className={styles.fieldGroup}>
        <p className={styles.reviewBody}>
          {t("admin:adminResourceGuides.review.body")}
        </p>

        <label className={styles.fieldLabel} htmlFor="guide-reviewed-by">
          {t("admin:adminResourceGuides.review.reviewedByLabel")}
        </label>
        <input
          id="guide-reviewed-by"
          className={styles.textInput}
          value={reviewedBy}
          onChange={(event) => setReviewedBy(event.target.value)}
          placeholder={t("admin:adminResourceGuides.review.reviewedByHint")}
          required
        />

        <label className={styles.fieldLabel} htmlFor="guide-reviewed-on">
          {t("admin:adminResourceGuides.review.reviewedOnLabel")}
        </label>
        <input
          id="guide-reviewed-on"
          type="date"
          className={styles.textInput}
          value={lastReviewedOn}
          onChange={(event) => setLastReviewedOn(event.target.value)}
          required
        />

        <label className={styles.fieldLabel} htmlFor="guide-review-due">
          {t("admin:adminResourceGuides.review.dueLabel")}
        </label>
        <input
          id="guide-review-due"
          type="date"
          className={styles.textInput}
          value={reviewDueOn}
          onChange={(event) => setReviewDueOn(event.target.value)}
        />
      </form>
    </AdminModal>
  );
}
