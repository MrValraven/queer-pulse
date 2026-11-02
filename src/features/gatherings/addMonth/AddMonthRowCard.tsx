import { useRef, type Dispatch } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextArea, TextInput } from "../CreateGatheringFields";
import {
  MAX_DESCRIPTION_STORAGE_LENGTH,
  MAX_TITLE_LENGTH,
} from "../steps/whatChapter.data";
import { addMonthRowAnchorId, addMonthRowFieldId } from "./addMonth.data";
import { formatRowDate } from "./addMonthDates";
import type {
  AddMonthAction,
  AddMonthRow,
  AddMonthRowIssue,
  AddMonthTimes,
} from "./addMonthState";
import { AddMonthRowPhoto } from "./AddMonthRowPhoto";
import { AddMonthRowTime } from "./AddMonthRowTime";
import styles from "./AddMonthRows.module.css";

/** What every card on the page reads from the page. */
export interface AddMonthRowContext {
  sharedTimes: AddMonthTimes;
  /** The shared cover to show, or null when there is no picture to paint. */
  sharedCoverUrl: string | null;
  /** The starting event's description, for "Same as the starting event". */
  templateDescription: string;
  /** True once the host pressed Publish with something to fix. */
  shouldShowIssues: boolean;
  dispatch: Dispatch<AddMonthAction>;
}

/**
 * The card for one date: its title, description, photo and time. The photo
 * comes first in the DOM so it sits above the fields at phone width.
 *
 * Missing fields are marked only once the host tried to publish; a message
 * the server sent about this date shows straight away.
 */
export function AddMonthRowCard({
  row,
  issues,
  serverMessage,
  context,
}: {
  row: AddMonthRow;
  issues: AddMonthRowIssue[];
  serverMessage: string | null;
  context: AddMonthRowContext;
}) {
  const { t, language } = useTranslation();
  const { dispatch } = context;
  const anchorId = addMonthRowAnchorId(row.date);
  const headingId = `${anchorId}-heading`;
  const cardLabelId = `${anchorId}-label`;
  const titleId = addMonthRowFieldId(row.date, "title");
  const descriptionId = addMonthRowFieldId(row.date, "description");
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dateText = formatRowDate(row.date, language);
  const visibleIssues = context.shouldShowIssues
    ? issues
    : issues.filter((issue) => issue.problem === "server");
  const isTitleInvalid = visibleIssues.some((issue) => issue.field === "title");
  const isDescriptionInvalid = visibleIssues.some(
    (issue) => issue.field === "description",
  );
  const timeIssue =
    visibleIssues.find(
      (issue) =>
        issue.problem === "startPassed" ||
        issue.field === "startTime" ||
        issue.field === "endTime",
    ) ?? null;
  const titleError = visibleIssues.some(
    (issue) => issue.problem === "titleMissing",
  )
    ? t("gatherings:addMonth.row.titleMissing")
    : undefined;
  const descriptionError = visibleIssues.some(
    (issue) => issue.problem === "descriptionMissing",
  )
    ? t("gatherings:addMonth.row.descriptionMissing")
    : undefined;
  const canCopyTemplate =
    row.description.trim() === "" && context.templateDescription.trim() !== "";

  function edit(patch: { title?: string; description?: string }) {
    dispatch({ type: "editRow", date: row.date, patch });
  }

  function copyTemplateDescription() {
    edit({ description: context.templateDescription });
    // The button folds away once the description has text, so focus moves
    // to the field it just filled.
    descriptionRef.current?.focus();
  }

  return (
    <article
      id={anchorId}
      className={styles.card}
      aria-labelledby={cardLabelId}
    >
      <span id={cardLabelId} className="visuallyHidden">
        {t("gatherings:addMonth.row.cardLabel", { date: dateText })}
      </span>
      <div className={styles.cardHeader}>
        <h3 id={headingId} className={styles.cardHeading}>
          {dateText}
        </h3>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => dispatch({ type: "removeDate", date: row.date })}
        >
          <FiX aria-hidden /> {t("gatherings:addMonth.row.remove")}
        </Button>
      </div>
      <Collapse isOpen={serverMessage !== null}>
        <p className={styles.serverMessage} role="alert">
          <FiAlertCircle className={styles.serverIcon} aria-hidden />
          {serverMessage}
        </p>
      </Collapse>
      <div className={styles.cardBody}>
        <AddMonthRowPhoto
          row={row}
          sharedCoverUrl={context.sharedCoverUrl}
          dispatch={dispatch}
          labelledBy={headingId}
        />
        <div className={styles.fields}>
          <Field
            label={t("gatherings:addMonth.row.titleLabel")}
            htmlFor={titleId}
            count={`${row.title.length}/${MAX_TITLE_LENGTH}`}
            error={titleError}
          >
            <TextInput
              id={titleId}
              type="text"
              maxLength={MAX_TITLE_LENGTH}
              autoComplete="off"
              aria-required={true}
              aria-invalid={isTitleInvalid || undefined}
              aria-describedby={titleError ? `${titleId}-error` : undefined}
              value={row.title}
              onChange={(event) => edit({ title: event.target.value })}
            />
          </Field>
          <Field
            label={t("gatherings:addMonth.row.descriptionLabel")}
            htmlFor={descriptionId}
            count={`${row.description.length}/${MAX_DESCRIPTION_STORAGE_LENGTH}`}
            error={descriptionError}
          >
            <TextArea
              ref={descriptionRef}
              id={descriptionId}
              rows={4}
              maxLength={MAX_DESCRIPTION_STORAGE_LENGTH}
              aria-required={true}
              aria-invalid={isDescriptionInvalid || undefined}
              aria-describedby={
                descriptionError ? `${descriptionId}-error` : undefined
              }
              value={row.description}
              onChange={(event) => edit({ description: event.target.value })}
            />
            <Collapse isOpen={canCopyTemplate}>
              <div className={styles.copyTemplate}>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={copyTemplateDescription}
                >
                  {t("gatherings:addMonth.row.sameAsTemplate")}
                </Button>
              </div>
            </Collapse>
          </Field>
          <AddMonthRowTime
            row={row}
            sharedTimes={context.sharedTimes}
            dispatch={dispatch}
            issue={timeIssue}
          />
        </div>
      </div>
    </article>
  );
}
