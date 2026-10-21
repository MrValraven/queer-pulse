import { useState } from "react";
import { FiAlertTriangle, FiClock, FiRefreshCw } from "react-icons/fi";
import type { ModSeverity } from "../admin/api/moderation.api";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import { studioReasonCopyKey } from "./studioReason";
import { useReviewSpan } from "./useReviewDate";
import css from "./StudioFlagReview.module.css";

/** A reason an action on a card waits, read under the actions and tied to
 *  the button through `aria-describedby`. */
export interface ReviewDisabledReason {
  id: string;
  text: string;
}

/**
 * A card whose release or track read failed: the reason, and Reload in
 * place. Its actions stay disabled meanwhile, so staff never act on a card
 * they cannot see. The panel stays up while the reload runs.
 */
export function ReviewLookupFailure({
  loadState,
  whatKey,
  reloadLabelKey,
  textId,
}: {
  loadState: StudioLoadState;
  /** The id on the failure text, so a waiting action can point at it. */
  textId?: string;
  /** `studio:errors.what.*`: the thing that did not load. */
  whatKey: string;
  reloadLabelKey: string;
}) {
  const { t } = useTranslation();
  const reason = loadState.reason ?? "unknown";
  return (
    <Collapse isOpen={loadState.isError}>
      <div className={css.lookupError} role="alert">
        <FiAlertTriangle aria-hidden className={css.lookupIcon} />
        <div className={css.lookupText} id={textId}>
          <p>
            {t("studio:flagReviewLive.card.lookupFailed", { what: t(whatKey) })}
          </p>
          <p className={css.lookupReason}>
            {t(studioReasonCopyKey(reason, "load"))}
          </p>
        </div>
        <Button
          variant="quiet"
          size="sm"
          aria-busy={loadState.isRetrying || undefined}
          aria-disabled={loadState.isRetrying || undefined}
          onClick={() => {
            if (!loadState.isRetrying) loadState.retry();
          }}
        >
          <FiRefreshCw aria-hidden /> {t(reloadLabelKey)}
        </Button>
      </div>
    </Collapse>
  );
}

/** Why each waiting action waits, as visible lines under the actions. */
export function ReviewDisabledReasons({
  reasons,
}: {
  reasons: ReviewDisabledReason[];
}) {
  return (
    <Collapse isOpen={reasons.length > 0}>
      <ul className={css.disabledReasons}>
        {reasons.map((reason) => (
          <li key={reason.id} id={reason.id}>
            {reason.text}
          </li>
        ))}
      </ul>
    </Collapse>
  );
}

const SEVERITY_CLASS: Record<ModSeverity, string | undefined> = {
  emergency: css.severityUrgent,
  high: css.severityHigh,
  medium: undefined,
  low: undefined,
};

/** The moderation severity and how long until the SLA falls due (or how
 *  long it has been overdue). Nothing shows when the row carries neither. */
export function ReviewUrgency({
  severity,
  slaDueAt,
}: {
  severity?: ModSeverity | null;
  slaDueAt?: string | null;
}) {
  const { t } = useTranslation();
  // The moment the card first drew: the queue re-reads after every decision,
  // which refreshes it, and a span in hours or days needs nothing finer.
  const [now] = useState(() => Date.now());
  const spanOf = useReviewSpan();
  const dueTime = slaDueAt ? Date.parse(slaDueAt) : Number.NaN;
  const hasDue = !Number.isNaN(dueTime);
  if (!severity && !hasDue) return null;
  const isOverdue = hasDue && dueTime < now;
  return (
    <p className={css.urgency}>
      {severity ? (
        <span
          className={[css.severity, SEVERITY_CLASS[severity]]
            .filter(Boolean)
            .join(" ")}
        >
          {t(`studio:flagReviewLive.severity.${severity}`)}
        </span>
      ) : null}
      {hasDue ? (
        <span
          className={[css.due, isOverdue && css.dueOver]
            .filter(Boolean)
            .join(" ")}
        >
          <FiClock aria-hidden />
          {t(
            isOverdue
              ? "studio:flagReviewLive.card.overdueBy"
              : "studio:flagReviewLive.card.dueIn",
            { span: spanOf(dueTime - now) },
          )}
        </span>
      ) : null}
    </p>
  );
}

/** The card's tick in selection mode, named after the card it picks. */
export function ReviewSelectBox({
  isShown,
  isChecked,
  label,
  onToggle,
}: {
  isShown: boolean;
  isChecked: boolean;
  label: string;
  onToggle: (withShift: boolean) => void;
}) {
  return (
    <Collapse isOpen={isShown} className={css.selectBox}>
      <label className={css.selectLabel}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) =>
            onToggle(
              (event.nativeEvent as MouseEvent | KeyboardEvent).shiftKey ===
                true,
            )
          }
        />
        <span className="visuallyHidden">{label}</span>
      </label>
    </Collapse>
  );
}
