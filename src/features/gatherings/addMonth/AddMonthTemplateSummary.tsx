import { AnimatePresence } from "motion/react";
import { useId, type ReactNode } from "react";
import { FiInfo } from "react-icons/fi";
import { Button, Collapse, SkeletonLine } from "../../../shared/components/ui";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EventBatchTemplateDTO } from "../api/eventBatch.api";
import styles from "./AddMonthTemplate.module.css";
import { formatRowDate } from "./addMonthDates";
import type {
  AddMonthCostValues,
  AddMonthPlaceValues,
  AddMonthTimes,
} from "./addMonthState";
import { templateDropNotices, templateSummaryRows } from "./addMonthSummary";
import {
  eventBatchFailureText,
  type EventBatchFailure,
} from "./eventBatchErrors";

const KEY_PREFIX = "gatherings:addMonth.template.";
const LOADING_LINE_WIDTHS = ["60%", "85%", "45%"];

export interface AddMonthTemplateSummaryProps {
  template: EventBatchTemplateDTO | undefined;
  failure: EventBatchFailure | null;
  isLoading: boolean;
  place: AddMonthPlaceValues | null;
  cost: AddMonthCostValues | null;
  times: AddMonthTimes;
  isEditing: boolean;
  onToggleEdit: () => void;
  /** The shared place and cost fields, passed in by the page. */
  editSlot: ReactNode;
}

/** The summary list, the drop notices and the two quiet lines. */
function SummaryBody({
  template,
  place,
  cost,
  times,
}: {
  template: EventBatchTemplateDTO;
  place: AddMonthPlaceValues | null;
  cost: AddMonthCostValues | null;
  times: AddMonthTimes;
}) {
  const { t } = useTranslation();
  const rows = templateSummaryRows(template, { place, cost, times }, t);
  const notices = templateDropNotices(template, t, place);
  const title = template.title.trim();
  return (
    <>
      <dl className={styles.summaryList}>
        {rows.map((row) => (
          <div key={row.id} className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>{t(row.labelKey)}</dt>
            <dd className={styles.summaryValue}>
              {row.value}
              {row.id === "times" && (
                <span className={styles.summaryPointer}>
                  {t(`${KEY_PREFIX}summary.timesPointer`)}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <Collapse isOpen={notices.length > 0}>
        <ul className={styles.notices}>
          <AnimatePresence initial={false}>
            {notices.map((notice) => (
              <CollapseListItem key={notice}>
                <div className={styles.notice}>
                  <FiInfo className={styles.noticeIcon} aria-hidden="true" />
                  <span>{notice}</span>
                </div>
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </Collapse>
      <p className={styles.quietLine}>
        {title
          ? t(`${KEY_PREFIX}summary.editElsewhere`, { title })
          : t(`${KEY_PREFIX}summary.editElsewhereUnnamed`)}
      </p>
      <p className={styles.quietLine}>{t(`${KEY_PREFIX}summary.notCopied`)}</p>
    </>
  );
}

/**
 * What every date copies from the starting event, after the server's drop
 * rules, with the host's place and cost edits read over it. "Edit place and
 * cost" opens the shared fields the page passes in.
 */
export function AddMonthTemplateSummary({
  template,
  failure,
  isLoading,
  place,
  cost,
  times,
  isEditing,
  onToggleEdit,
  editSlot,
}: AddMonthTemplateSummaryProps) {
  const { t, language } = useTranslation();
  const headingId = useId();
  const editRegionId = useId();
  if (isLoading) {
    return (
      <div className={styles.summary} aria-busy="true">
        <span role="status" className="visuallyHidden">
          {t(`${KEY_PREFIX}loading`)}
        </span>
        {LOADING_LINE_WIDTHS.map((width) => (
          <SkeletonLine key={width} width={width} />
        ))}
      </div>
    );
  }
  if (failure) {
    return (
      <div className={styles.failure} role="alert">
        <p className={styles.failureText}>
          {eventBatchFailureText(
            failure,
            t,
            (date) => formatRowDate(date, language),
            "read",
          )}
        </p>
      </div>
    );
  }
  if (!template) return null;
  return (
    <section className={styles.summary} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.summaryHeading}>
        {t(`${KEY_PREFIX}summary.heading`)}
      </h3>
      <SummaryBody
        template={template}
        place={place}
        cost={cost}
        times={times}
      />
      <Button
        variant="quiet"
        size="sm"
        className={styles.editToggle}
        aria-expanded={isEditing}
        aria-controls={editRegionId}
        onClick={onToggleEdit}
      >
        {isEditing
          ? t(`${KEY_PREFIX}summary.doneEditing`)
          : t(`${KEY_PREFIX}summary.edit`)}
      </Button>
      <div id={editRegionId}>
        <Collapse isOpen={isEditing}>{editSlot}</Collapse>
      </div>
    </section>
  );
}
