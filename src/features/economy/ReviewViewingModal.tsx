import { useState } from "react";
import { LoadErrorState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell } from "./ModalKit";
import { ReviewViewingEditPanel } from "./ReviewViewingEditPanel";
import { ReviewViewingSubmitPanel } from "./ReviewViewingSubmitPanel";
import { hasHousingReviewGonePublic } from "./ReviewViewingRules";
import { useViewingReviewPair } from "./api/useHousingReviews";
import panel from "./ReviewViewingModal.module.css";

/**
 * The one modal for a member's own review of a completed viewing: write it, or
 * correct it while it is still blind, or read it back once it has gone public.
 *
 * IT ASKS FIRST. The viewings list cannot tell whether this member has already
 * reviewed (the viewing DTO carries nothing about reviews), so the pair is
 * fetched here, on open, once. That is also what keeps the failure honest: a
 * pair that fails to load is a `LoadErrorState` with a retry, and never the
 * blank form, which would tell somebody who has already written a review that
 * they have not.
 *
 * WHY `hasJustSubmitted` EXISTS. Submitting invalidates the pair, so
 * `yourReview` fills in a moment later. A branch read purely off the pair would
 * take the "thank you" away from under the member and drop them into an edit
 * form they never asked for, so once they have submitted in this modal it stays
 * on the submit panel. `hasRevealed` deliberately stays live: that one has to be
 * able to change while the modal is open.
 */
export function ReviewViewingModal({
  viewingId,
  counterpartyName,
  onClose,
}: {
  viewingId: string;
  counterpartyName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const reviewPairQuery = useViewingReviewPair(viewingId);
  const [hasJustSubmitted, setHasJustSubmitted] = useState(false);

  const settledPair = reviewPairQuery.data;
  const existingReview = hasJustSubmitted
    ? null
    : (settledPair?.yourReview ?? null);

  // The server's own answer to "has this member's review gone public", which is
  // the same predicate the PATCH gates on. It used to be inferred from
  // `counterpartySubmitted`, which could only ever say yes: a review whose
  // counterparty never wrote one and whose anti-retaliation window had elapsed
  // was public and read here as still private, so the edit form offered a save
  // that came back 409. `hasHousingReviewGonePublic` holds the field and the
  // one decision about what an older backend's silence means.
  const hasRevealed = hasHousingReviewGonePublic(settledPair);

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t(
        existingReview
          ? "economy:housingViewing.review.editAriaLabel"
          : "economy:housingViewing.review.ariaLabel",
      )}
    >
      {reviewPairQuery.isError ? (
        <LoadErrorState
          title={t("economy:housingViewing.review.loadError.title")}
          description={t("economy:housingViewing.review.loadError.description")}
          onRetry={() => void reviewPairQuery.refetch()}
        />
      ) : reviewPairQuery.isPending ? (
        <div className={panel.loading} role="status">
          <span className={panel.loadingLabel}>
            {t("economy:housingViewing.review.loading")}
          </span>
          <SkeletonLine height={22} width="70%" />
          <SkeletonLine height={14} />
          <SkeletonLine height={110} />
        </div>
      ) : existingReview ? (
        <ReviewViewingEditPanel
          viewingId={viewingId}
          review={existingReview}
          counterpartyName={counterpartyName}
          hasRevealed={hasRevealed}
          onClose={onClose}
        />
      ) : (
        <ReviewViewingSubmitPanel
          viewingId={viewingId}
          counterpartyName={counterpartyName}
          isSubmitted={hasJustSubmitted}
          onSubmitted={() => setHasJustSubmitted(true)}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}
