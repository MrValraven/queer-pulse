import { FiAlertCircle } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatRowDate } from "./addMonthDates";
import {
  eventBatchFailureText,
  type EventBatchFailure,
  type EventBatchFailureReason,
} from "./eventBatchErrors";
import styles from "./AddMonthPublish.module.css";

/** The reasons where the request may have reached the server and gone
 *  through before the answer was lost, so the month may already be live. */
const UNCONFIRMED_REASONS: ReadonlySet<EventBatchFailureReason> =
  new Set<EventBatchFailureReason>([
    "timedOut",
    "unreachable",
    "offline",
    "server",
    "unreadableAnswer",
  ]);

/** DOM id of the panel's heading, where focus lands after a failed publish
 *  that names no card or section. */
export const ADD_MONTH_FAILURE_HEADING_ID = "add-month-failure-heading";

interface AddMonthFailurePanelProps {
  failure: EventBatchFailure;
  /** True when the page marked the card the server named. */
  hasMarkedRow: boolean;
}

/**
 * Names why a publish failed. A refused publish says nothing was published.
 * A timed-out, unreachable, offline, server-error or unreadable-answer
 * publish may still have gone through, so that panel says the month could not be confirmed and links
 * to the host's events, where the host checks before pressing Publish again.
 */
export function AddMonthFailurePanel({
  failure,
  hasMarkedRow,
}: AddMonthFailurePanelProps) {
  const { t, language } = useTranslation();
  const causeText = eventBatchFailureText(failure, t, (date) =>
    formatRowDate(date, language),
  );
  const isUnconfirmed = UNCONFIRMED_REASONS.has(failure.reason);

  return (
    <div className={styles.failure} role="alert">
      <FiAlertCircle className={styles.failureIcon} aria-hidden />
      <div className={styles.failureBody}>
        <h3
          id={ADD_MONTH_FAILURE_HEADING_ID}
          className={styles.failureTitle}
          tabIndex={-1}
        >
          {t(
            isUnconfirmed
              ? "gatherings:addMonth.failure.titleUnconfirmed"
              : "gatherings:addMonth.failure.title",
          )}
        </h3>
        <p className={styles.failureText}>{causeText}</p>
        <Collapse isOpen={hasMarkedRow}>
          <p className={styles.failureText}>
            {t("gatherings:addMonth.failure.markedRow")}
          </p>
        </Collapse>
        <Collapse isOpen={isUnconfirmed}>
          <Button
            variant="ghost"
            size="sm"
            to={routes.myEvents}
            className={styles.failureLink}
          >
            {t("gatherings:addMonth.results.goToEvents")}
          </Button>
        </Collapse>
      </div>
    </div>
  );
}
