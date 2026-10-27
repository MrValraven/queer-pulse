import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertTriangle, FiClock } from "react-icons/fi";
import { CollapseListItem } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { OpenedFileInfo } from "../model/pdfEditModel";
import styles from "./PdfChrome.module.css";
import toneStyles from "./fileTones.module.css";

interface PdfFileListProps {
  files: readonly OpenedFileInfo[];
}

/**
 * The name each row shows. A name opened more than once gets " (2)", " (3)"
 * on its later copies, in the order they were added, so the rows tell apart.
 * Display only: the files keep their own names.
 */
function displayNamesOf(files: readonly OpenedFileInfo[]): Map<string, string> {
  const timesSeen = new Map<string, number>();
  const displayNames = new Map<string, string>();
  for (const file of files) {
    const seenCount = (timesSeen.get(file.name) ?? 0) + 1;
    timesSeen.set(file.name, seenCount);
    displayNames.set(
      file.id,
      seenCount > 1 ? `${file.name} (${seenCount})` : file.name,
    );
  }
  return displayNames;
}

/**
 * The open files, in the order they were added. Each row carries the file's
 * tone, so a page in the grid can be traced back to its file, and any warning
 * the file earned sits under its own row.
 */
export function PdfFileList({ files }: PdfFileListProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const displayNames = displayNamesOf(files);
  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.panelHeading}>
        {t("admin:utilities.pdf.files.heading")}
      </h2>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {files.map((file) => {
            const displayName = displayNames.get(file.id) ?? file.name;
            return (
              <CollapseListItem key={file.id}>
                <div
                  className={`${styles.fileRow} ${toneStyles.tone}`}
                  data-file-tone={file.toneIndex}
                >
                  <div className={styles.fileLine}>
                    <span className={styles.toneDot} aria-hidden />
                    <span className={styles.fileName} title={displayName}>
                      {displayName}
                    </span>
                    <span className={styles.pageCount}>
                      {t("admin:utilities.pdf.files.pageCount", {
                        count: file.pageCount,
                      })}
                    </span>
                  </div>
                  {file.isSigned && (
                    <p className={`${styles.warning} ${styles.warningSigned}`}>
                      <FiAlertTriangle aria-hidden />
                      {t("admin:utilities.pdf.files.signedWarning")}
                    </p>
                  )}
                  {file.isLarge && (
                    <p className={`${styles.warning} ${styles.warningLarge}`}>
                      <FiClock aria-hidden />
                      {t("admin:utilities.pdf.files.largeWarning")}
                    </p>
                  )}
                </div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
