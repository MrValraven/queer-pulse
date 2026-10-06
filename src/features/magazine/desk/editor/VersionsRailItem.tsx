import { FiColumns, FiRotateCcw } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { formatRelative } from "../../../../shared/lib/date";
import type { ArticleVersionSummaryDto } from "../../api/pieces.api";
import styles from "./VersionsRail.module.css";

export interface VersionsRailItemProps {
  version: ArticleVersionSummaryDto;
  /** The newest version (index 0): gets the "Latest" tag and the filled dot. */
  isLatest: boolean;
  onCompare: (versionId: string) => void;
  onRestore: (version: ArticleVersionSummaryDto) => void;
}

/** Full date and time for the `<time>` tooltip, e.g. "5 October 2026 at 14:20". */
const ABSOLUTE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "long",
  timeStyle: "short",
};

/**
 * One version in the History timeline: a single compact row of dot, text
 * (label, then author and relative time) and the Compare / Restore actions.
 * The actions are icon-only in a narrow rail and gain their visible word once
 * the rail is wide enough (see the container query in VersionsRail.module.css);
 * the aria-label names the version in both layouts, so repeated rows stay
 * distinguishable to a screen reader.
 */
export function VersionsRailItem({
  version,
  isLatest,
  onCompare,
  onRestore,
}: VersionsRailItemProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const createdDate = new Date(version.createdAt);
  const isValidDate = !Number.isNaN(createdDate.getTime());
  const relativeTime =
    formatRelative(version.createdAt, formatters) || version.createdAt;
  const absoluteTime = isValidDate
    ? formatters.date(createdDate, ABSOLUTE_DATE_OPTIONS)
    : undefined;
  const compareText = t("magazine:write.versions.compare");
  const restoreText = t("magazine:write.versions.restore");

  return (
    <li className={styles.item}>
      <span className={styles.marker} aria-hidden="true">
        <span className={cx(styles.dot, isLatest && styles.dotLatest)} />
      </span>

      <div className={styles.body}>
        <span className={styles.label}>
          {version.label}
          {isLatest && " "}
          {isLatest && (
            <span className={styles.latest}>
              {t("magazine:write.versions.latest")}
            </span>
          )}
        </span>
        <span className={styles.meta}>
          {version.author} ·{" "}
          <time dateTime={version.createdAt} title={absoluteTime}>
            {relativeTime}
          </time>
        </span>
      </div>

      <div className={styles.actions}>
        <IconButton
          size="sm"
          className={styles.action}
          aria-label={t("magazine:write.versions.compareAria", {
            label: version.label,
          })}
          title={compareText}
          onClick={() => onCompare(version.id)}
        >
          <FiColumns aria-hidden />
          <span className={styles.actionText}>{compareText}</span>
        </IconButton>
        <IconButton
          size="sm"
          className={styles.action}
          aria-label={t("magazine:write.versions.restoreAria", {
            label: version.label,
          })}
          title={restoreText}
          onClick={() => onRestore(version)}
        >
          <FiRotateCcw aria-hidden />
          <span className={styles.actionText}>{restoreText}</span>
        </IconButton>
      </div>
    </li>
  );
}
