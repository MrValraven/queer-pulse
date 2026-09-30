import { useId } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { FeedEntryDTO } from "../api/subprofileFeeds.api";
import { episodeMetaLine } from "./episodeMeta";
import styles from "./FeedReview.module.css";

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * One episode in a feed's review list. A waiting episode is a labelled
 * checkbox whose whole row is the tap target (the title names it, the date,
 * length and episode number describe it); a dismissed one carries a Restore
 * button that names the episode. Plain text description, clamped to two lines.
 */
export function FeedEntryRow({
  entry,
  mode,
  isSelected,
  isBusy,
  onToggle,
  onRestore,
}: {
  entry: FeedEntryDTO;
  mode: "pending" | "dismissed";
  isSelected: boolean;
  isBusy: boolean;
  onToggle: (entryId: string) => void;
  onRestore: (entry: FeedEntryDTO) => void;
}) {
  const { t } = useTranslation();
  const { date } = useFormat();
  const titleId = useId();
  const metaId = useId();
  const meta = episodeMetaLine(entry, (when) => date(when, SHORT_DATE));

  const text = (
    <span className={styles.rowText}>
      <b id={titleId}>{entry.title}</b>
      {meta && <small id={metaId}>{meta}</small>}
      {entry.description && <span>{entry.description}</span>}
    </span>
  );

  if (mode === "dismissed") {
    return (
      <li className={styles.row}>
        {text}
        <Button
          variant="ghost"
          size="sm"
          disabled={isBusy}
          aria-label={t("subprofiles:feedImport.review.restoreAria", {
            title: entry.title,
          })}
          onClick={() => onRestore(entry)}
        >
          <FiRotateCcw aria-hidden />{" "}
          {t("subprofiles:feedImport.review.restore")}
        </Button>
      </li>
    );
  }

  return (
    <li className={styles.row} data-selected={isSelected || undefined}>
      <label className={styles.rowLabel}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(entry.id)}
          aria-labelledby={titleId}
          aria-describedby={meta ? metaId : undefined}
        />
        {text}
      </label>
    </li>
  );
}
