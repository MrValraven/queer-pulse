import { FiShield, FiUser } from "react-icons/fi";
import { useFormat } from "../../../../../shared/i18n/format";
import { Translation } from "../../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type {
  OwnerListingHistoryActor,
  OwnerListingHistoryEventDTO,
} from "../../api/listingHistory.api";
import {
  describeHistoryEvent,
  historyWhen,
  historyWhenFull,
  type HistoryTextFormat,
} from "./listingHistory.data";
import styles from "./ListingHistory.module.css";

/** A dashed ring marks someone who is no longer on the team. */
const ICON_CLASS: Record<OwnerListingHistoryActor["kind"], string | undefined> =
  {
    team: styles.rowIcon,
    previous_team: `${styles.rowIcon} ${styles.rowIconPrevious}`,
    moderation: styles.rowIcon,
  };

/**
 * One change on the listing: who made it and what it was, when, and, when a
 * moderator wrote a note about it, a pointer to where that note went. The note
 * itself is never shown here; it reached whoever owned the listing then.
 *
 * Focusable by script only (`tabIndex={-1}`), so "Show older" can hand focus
 * to the first row it revealed.
 */
export function ListingHistoryRow({
  event,
  format,
}: {
  event: OwnerListingHistoryEventDTO;
  format: HistoryTextFormat;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const sentence = describeHistoryEvent(event, t, format);
  const whenText = historyWhen(event.createdAt, formatters);

  return (
    <li className={styles.row} tabIndex={-1}>
      <span className={ICON_CLASS[event.actor.kind]} aria-hidden="true">
        {event.actor.kind === "moderation" ? <FiShield /> : <FiUser />}
      </span>
      <div className={styles.rowBody}>
        <p className={styles.sentence}>
          {sentence.kind === "catalog" ? (
            <Translation
              i18nKey={sentence.key}
              values={sentence.values}
              components={{ strong: <strong className={styles.actor} /> }}
            />
          ) : (
            sentence.text
          )}
        </p>
        {whenText && (
          <time
            className={styles.time}
            dateTime={event.createdAt}
            title={historyWhenFull(event.createdAt, formatters)}
          >
            {whenText}
          </time>
        )}
        {event.hasModeratorNote && (
          <p className={styles.note}>
            {t("marketing:listBusiness.editor.history.moderatorNote")}
          </p>
        )}
      </div>
    </li>
  );
}
