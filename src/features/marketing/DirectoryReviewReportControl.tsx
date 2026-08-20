import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryReviewReportModal } from "./DirectoryReviewReportModal";
import s from "./DirectorySpacePage.module.css";

interface Props {
  /** The review's own uuid — the report's `subjectId`. */
  reviewId: string;
  /** The reviewer's display name, for the modal heading. */
  reviewerName: string;
}

/**
 * "Report this review" affordance rendered under every review row
 * (gap-audit HSG-6) — visible to any viewer, not just the listing owner
 * (unlike the neighbouring `DirectoryReviewReply` reply composer, which is
 * owner-only). Self-contained: owns its own open/close state so
 * `DirectoryReviewsSection` doesn't need per-row state to track which
 * review's report modal is open, mirroring `DirectoryReviewReply`'s own
 * self-contained composer state.
 */
export function DirectoryReviewReportControl({ reviewId, reviewerName }: Props) {
  const { t } = useTranslation();
  const [reporting, setReporting] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={s.reportToggle}
        onClick={() => setReporting(true)}
      >
        <FiFlag aria-hidden />
        {t("marketing:directory.detail.reportReview.cta")}
      </Button>
      {reporting && (
        <DirectoryReviewReportModal
          reviewId={reviewId}
          reviewerName={reviewerName}
          onClose={() => setReporting(false)}
        />
      )}
    </>
  );
}
