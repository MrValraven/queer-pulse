import { Collapse } from "../../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  TATTOO_STATUS_OPTIONS,
  tattooStatusLabelKey,
} from "./tattooBooksStatus";
import { formatTattooDay } from "./tattooView.helpers";
import type { TattooBooksStatus } from "./tattooVocab.data";
import styles from "./TattooBlock.module.css";

interface TattooStatusPillProps {
  status: TattooBooksStatus | null;
  /** YYYY-MM-DD; shown for waitlist and closed. */
  nextOpening: string;
  /** The waitlist's wait note, as its own line under the pill. The phone
   *  bar leaves it out to stay one compact row. */
  waitNote?: string;
}

/** The books status: a pill with a dot, the label and "Books open again
 *  {date}" for a waitlist or closed book, then the wait note on its own line
 *  under the pill while the book is a waitlist. The note folds in and out as
 *  the status changes. */
export function TattooStatusPill({
  status,
  nextOpening,
  waitNote = "",
}: TattooStatusPillProps) {
  const { t, language } = useTranslation();
  if (!status) return null;
  const tone = TATTOO_STATUS_OPTIONS.find(
    (option) => option.status === status,
  )?.tone;
  const dateText =
    status !== "open" && nextOpening
      ? formatTattooDay(nextOpening, language)
      : "";
  const hasWaitNote = status === "waitlist" && waitNote !== "";
  return (
    <div className={styles.statusStack}>
      <span className={styles.status} data-tone={tone}>
        <span className={styles.statusLabel}>
          {t(tattooStatusLabelKey(status))}
        </span>
        {dateText && (
          <span className={styles.statusDetail}>
            {t("subprofiles:tattoo.status.nextOpening", { date: dateText })}
          </span>
        )}
      </span>
      <Collapse isOpen={hasWaitNote}>
        <p className={styles.statusNote}>{waitNote}</p>
      </Collapse>
    </div>
  );
}
