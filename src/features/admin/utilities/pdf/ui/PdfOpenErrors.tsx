import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertCircle, FiX } from "react-icons/fi";
import {
  CollapseListItem,
  IconButton,
} from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { MAX_FILE_MEGABYTES } from "../io/pdfFileChecks";
import {
  openFailureMessageKey,
  type OpenFailureNotice,
} from "../io/pdfOpenErrors";
import {
  buildFailureMessageKey,
  type PdfBuildStep,
} from "../output/pdfBuildError";
import styles from "./PdfChrome.module.css";

interface PdfOpenErrorsProps {
  notices: readonly OpenFailureNotice[];
  failedStep: PdfBuildStep | null;
  onDismissNotice: (noticeId: string) => void;
  onDismissFailure: () => void;
}

interface NoticeRowProps {
  textId: string;
  message: string;
  onDismiss: () => void;
}

function NoticeRow({ textId, message, onDismiss }: NoticeRowProps) {
  const { t } = useTranslation();
  return (
    <CollapseListItem>
      <div className={styles.notice}>
        <FiAlertCircle className={styles.noticeIcon} aria-hidden />
        <p id={textId} className={styles.noticeText}>
          {message}
        </p>
        <IconButton
          size="sm"
          aria-label={t("admin:utilities.pdf.errors.dismiss")}
          aria-describedby={textId}
          onClick={onDismiss}
        >
          <FiX aria-hidden />
        </IconButton>
      </div>
    </CollapseListItem>
  );
}

/**
 * Every file that could not be opened, each with its own reason, and the
 * failed download when building a file went wrong. Rows fold away as they
 * are dismissed.
 */
export function PdfOpenErrors({
  notices,
  failedStep,
  onDismissNotice,
  onDismissFailure,
}: PdfOpenErrorsProps) {
  const { t } = useTranslation();
  const idPrefix = useId();
  return (
    <div role="alert">
      <ul className={styles.errors}>
        <AnimatePresence initial={false}>
          {notices.map((notice) => (
            <NoticeRow
              key={notice.id}
              textId={`${idPrefix}-${notice.id}`}
              message={t(openFailureMessageKey(notice.reason), {
                fileName: notice.fileName,
                limit: MAX_FILE_MEGABYTES,
              })}
              onDismiss={() => onDismissNotice(notice.id)}
            />
          ))}
          {failedStep !== null && (
            <NoticeRow
              key="build-failure"
              textId={`${idPrefix}-build-failure`}
              message={t(buildFailureMessageKey(failedStep))}
              onDismiss={onDismissFailure}
            />
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}
