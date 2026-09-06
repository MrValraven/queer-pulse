import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { todayIso } from "../../shared/lib/date";
import { AdminModal } from "./ui";
import { useReviewGlossaryTerm } from "./api/useAdminResourceGuideMutations";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminGlossaryPage.module.css";

const FORM_ID = "admin-glossary-review-form";

/** Six months on from today, as `yyyy-mm-dd` — the default next-review date,
 *  and only a default: language moves, and a contested term moves faster. */
function defaultNextReview(): string {
  const next = new Date();
  next.setMonth(next.getMonth() + 6);
  return next.toISOString().slice(0, 10);
}

/**
 * Stamps "I read this definition and it still holds" on one term.
 *
 * Its own modal and its own endpoint, for the same reason the guide review is
 * separate from the guide editor: fixing a typo must not silently reset the
 * freshness clock on a definition nobody has actually re-read.
 */
export function AdminGlossaryReviewModal({
  term,
  onClose,
}: {
  term: AdminGlossaryTermDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reviewTerm = useReviewGlossaryTerm();
  const [reviewedBy, setReviewedBy] = useState(term.reviewedBy ?? "");
  const [lastReviewedOn, setLastReviewedOn] = useState(todayIso());
  const [reviewDueOn, setReviewDueOn] = useState(defaultNextReview());

  function submit(event: FormEvent) {
    event.preventDefault();
    reviewTerm.mutate(
      { id: term.id, body: { reviewedBy, lastReviewedOn, reviewDueOn } },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminGlossary.toast.reviewed", { term: term.term }),
            "info",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:adminGlossary.error.review"),
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
      eyebrow={term.slug}
      title={t("admin:adminGlossary.review.title")}
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
            disabled={reviewTerm.isPending || reviewedBy.trim().length === 0}
          >
            {t("admin:adminResourceGuides.review.confirmCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className={styles.fieldGroup}>
        <p className={styles.reviewBody}>
          {t("admin:adminGlossary.review.body")}
        </p>

        <label className={styles.fieldLabel} htmlFor="glossary-reviewed-by">
          {t("admin:adminResourceGuides.review.reviewedByLabel")}
        </label>
        <input
          id="glossary-reviewed-by"
          className={styles.textInput}
          value={reviewedBy}
          onChange={(event) => setReviewedBy(event.target.value)}
          placeholder={t("admin:adminResourceGuides.review.reviewedByHint")}
          required
        />

        <label className={styles.fieldLabel} htmlFor="glossary-reviewed-on">
          {t("admin:adminResourceGuides.review.reviewedOnLabel")}
        </label>
        <input
          id="glossary-reviewed-on"
          type="date"
          className={styles.textInput}
          value={lastReviewedOn}
          onChange={(event) => setLastReviewedOn(event.target.value)}
          required
        />

        <label className={styles.fieldLabel} htmlFor="glossary-review-due">
          {t("admin:adminResourceGuides.review.dueLabel")}
        </label>
        <input
          id="glossary-review-due"
          type="date"
          className={styles.textInput}
          value={reviewDueOn}
          onChange={(event) => setReviewDueOn(event.target.value)}
        />
      </form>
    </AdminModal>
  );
}
