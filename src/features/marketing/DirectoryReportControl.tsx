import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DirectoryReportModal,
  type DirectoryReportSubject,
} from "./DirectoryReportModal";
import s from "./DirectorySpacePage.module.css";

interface Props {
  /** The subject's own uuid, sent as the report's `subjectId`. */
  subjectId: string;
  subjectKind: DirectoryReportSubject;
  /** The author's display name, for the modal heading. */
  authorName?: string;
}

/**
 * "Report this" under a review. Visible to any viewer, not only the listing
 * owner (unlike the owner-only reply composer beside it). Self-contained: owns
 * its own open/close state, so the review list needs no per-row state to track
 * which report modal is open.
 */
export function DirectoryReportControl({
  subjectId,
  subjectKind,
  authorName,
}: Props) {
  const { t } = useTranslation();
  const [isReporting, setIsReporting] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={s.reportToggle}
        onClick={() => setIsReporting(true)}
      >
        <FiFlag aria-hidden />
        {t("marketing:directory.detail.reportReview.cta")}
      </Button>
      {isReporting && (
        <DirectoryReportModal
          subjectId={subjectId}
          subjectKind={subjectKind}
          authorName={authorName}
          onClose={() => setIsReporting(false)}
        />
      )}
    </>
  );
}
