import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import {
  DatePicker,
  Select,
  formatSpanDuration,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  GATE_ANCHOR,
  HOODS,
  MAX_GATHERING_SPAN_DAYS,
} from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { VenuePicker } from "../VenuePicker";
import { schedulePairErrorKey, scheduleInstants } from "./schedulePair";
import { StepRequirementBadge } from "./StepRequirement";
import styles from "../CreateGatheringPage.module.css";

const MILLISECONDS_PER_MINUTE = 60_000;

/**
 * Start date, start time, end date, end time, and the one line underneath that
 * reads the pair back.
 *
 * Four controls under two visible words. "Starts" and "Ends" head a PAIR each,
 * so they are plain headings with a `role="group"` pointing at them, and every
 * control carries its own hidden label. A single `<label>` over two fields
 * would leave one of them unnamed.
 */
function ScheduleFields({
  form,
  fieldId,
}: {
  form: GatheringForm;
  fieldId: string;
}) {
  const { t } = useTranslation();
  const { startInstant, endInstant } = scheduleInstants(form);

  const errorKey = schedulePairErrorKey(form);
  const isEndInvalid = errorKey !== null;
  const errorMessage = errorKey
    ? t(errorKey, { days: MAX_GATHERING_SPAN_DAYS })
    : null;

  // Only ever shown for a schedule the wizard would accept: a span read off a
  // backwards or over-long pair is a number nobody can act on, and the message
  // above says the actionable thing instead. "Runs 3 days" already carries the
  // roll-over, so the next-day note is kept for the single-night case only.
  const spanNote =
    startInstant && endInstant && form.scheduleValid
      ? [
          t("gatherings:create.step2.duration", {
            duration: formatSpanDuration(
              (endInstant.getTime() - startInstant.getTime()) /
                MILLISECONDS_PER_MINUTE,
              t,
            ),
          }),
          form.spanDays === 1 ? t("gatherings:create.step2.endsNextDay") : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  const errorId = `${fieldId}-schedule-error`;
  const spanId = `${fieldId}-span`;
  // One description per end control: the fix when there is one, the readout
  // otherwise. The two never coexist, because a span is only read back for a
  // schedule the wizard accepts.
  const endDescribedBy = errorMessage ? errorId : undefined;
  const endReadoutBy = spanNote ? spanId : undefined;

  return (
    <div className={styles.timeFields}>
      <div className={styles.scheduleRows}>
        <div>
          <span id={`${fieldId}-starts-label`} className={styles.label}>
            {t("gatherings:create.step2.dateLabel")}
          </span>
          <div
            className={styles.row2}
            role="group"
            aria-labelledby={`${fieldId}-starts-label`}
          >
            <div id={GATE_ANCHOR.date}>
              <span
                id={`${fieldId}-startDate-label`}
                className="visuallyHidden"
              >
                {t("gatherings:create.step2.startDateLabel")}
              </span>
              <DatePicker
                mode="date"
                id={`${fieldId}-date`}
                labelledBy={`${fieldId}-startDate-label`}
                min={new Date().toISOString().slice(0, 10)}
                invalid={!form.dateValid}
                aria-required={true}
                aria-describedby={
                  !form.dateValid ? `${fieldId}-date-hint` : undefined
                }
                value={form.date || null}
                onChange={(value) => form.setDate(value ?? "")}
              />
            </div>
            <div>
              <span
                id={`${fieldId}-startTime-label`}
                className="visuallyHidden"
              >
                {t("gatherings:create.step2.startTimeLabel")}
              </span>
              <DatePicker
                mode="time"
                id={`${fieldId}-time`}
                labelledBy={`${fieldId}-startTime-label`}
                value={form.time || null}
                onChange={(value) => form.setTime(value ?? "")}
              />
            </div>
          </div>
          {!form.dateValid && (
            <p id={`${fieldId}-date-hint`} className={styles.scheduleRowNote}>
              {t("gatherings:create.step2.dateRequired")}
            </p>
          )}
        </div>
        <div>
          <span id={`${fieldId}-ends-label`} className={styles.label}>
            {t("gatherings:create.step2.endTimeLabel")}
          </span>
          <div
            className={styles.row2}
            role="group"
            aria-labelledby={`${fieldId}-ends-label`}
          >
            <div>
              <span id={`${fieldId}-endDate-label`} className="visuallyHidden">
                {t("gatherings:create.step2.endDateLabel")}
              </span>
              {/* A `min` of the start date, so the picker cannot offer a day
                  the gathering has not begun on yet. */}
              <DatePicker
                mode="date"
                id={`${fieldId}-endDate`}
                labelledBy={`${fieldId}-endDate-label`}
                min={form.date || undefined}
                invalid={isEndInvalid}
                aria-describedby={endDescribedBy ?? endReadoutBy}
                value={form.endDate || null}
                onChange={(value) => form.setEndDate(value ?? "")}
              />
            </div>
            <div>
              <span id={`${fieldId}-endTime-label`} className="visuallyHidden">
                {t("gatherings:create.step2.endTimeFieldLabel")}
              </span>
              {/* `relativeTo` turns the end list into "+1h, +2h, +2h 30m…":
                  the length is what a host is choosing, and reading it off two
                  absolute clock times is arithmetic they should not have to do.
                  No `min`: a gathering that runs past midnight is normal, and
                  the end DATE beside this field is where that is said. */}
              <DatePicker
                mode="time"
                id={`${fieldId}-endTime`}
                labelledBy={`${fieldId}-endTime-label`}
                relativeTo={form.time || null}
                invalid={isEndInvalid}
                aria-describedby={endDescribedBy ?? endReadoutBy}
                value={form.endTime || null}
                onChange={(value) => form.setEndTime(value ?? "")}
              />
            </div>
          </div>
        </div>
      </div>
      {errorMessage && (
        <p id={errorId} className={styles.scheduleError}>
          <FiAlertCircle aria-hidden />
          {errorMessage}
        </p>
      )}
      {spanNote && (
        <p id={spanId} className={styles.timeSpan}>
          {spanNote}
        </p>
      )}
    </div>
  );
}

export function DatePlaceStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  // An online gathering has no door, so it asks a different question: the join
  // link instead of a street address and arrival directions (PRD-182). The
  // wizard used to ask every host for a street address and collect no link at
  // all, so a host running something on video had nowhere to put it and their
  // attendees were shown a locked "the exact address is shared with the people
  // going" row about an address that did not exist.
  const isOnline = form.hood === "Online";

  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step2.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step2.sub")}</p>
      <StepRequirementBadge required={true} />
      <ScheduleFields form={form} fieldId={fieldId} />
      {/* Neighbourhood has its own full-width row now. It used to share a row
          with the date, which put half the schedule beside a place field and
          left the end of the gathering stranded further down the step. */}
      <label className={styles.label} htmlFor={`${fieldId}-hood`}>
        {t("gatherings:create.step2.hoodLabel")}
      </label>
      <Select
        id={`${fieldId}-hood`}
        placeholder={t("gatherings:create.step2.hoodPlaceholder")}
        options={HOODS.map((hood) => ({
          value: hood.value,
          label: t(hood.labelKey),
        }))}
        value={form.hood || null}
        onChange={(value) => form.setHood(value ?? "")}
      />
      <label
        id={`${fieldId}-venue-label`}
        className={styles.label}
        htmlFor={`${fieldId}-venue`}
      >
        {t("gatherings:create.step2.venueLabel")}
      </label>
      <VenuePicker
        id={`${fieldId}-venue`}
        labelledBy={`${fieldId}-venue-label`}
        value={{
          text: form.venue,
          listingId: form.venueListingId,
          venueListing: form.venueListing,
        }}
        onChange={(selection) => {
          form.setVenue(selection.text);
          form.setVenueListingId(selection.listingId);
          form.setVenueListing(selection.venueListing);
        }}
      />
      {isOnline ? (
        <div id={GATE_ANCHOR.joinLink}>
          <label className={styles.label} htmlFor={`${fieldId}-onlineUrl`}>
            {t("gatherings:create.step2.joinLinkLabel")}
          </label>
          <input
            id={`${fieldId}-onlineUrl`}
            className={styles.input}
            type="url"
            inputMode="url"
            placeholder={t("gatherings:create.step2.joinLinkPlaceholder")}
            aria-invalid={!form.onlineUrlValid}
            aria-describedby={`${fieldId}-onlineUrl-hint`}
            value={form.onlineUrl}
            onChange={(e) => form.setOnlineUrl(e.target.value)}
          />
          <p id={`${fieldId}-onlineUrl-hint`} className={styles.hint}>
            {form.onlineUrlValid
              ? t("gatherings:create.step2.joinLinkHint")
              : t("gatherings:create.step2.joinLinkInvalid")}
          </p>
        </div>
      ) : (
        <>
          <label className={styles.label} htmlFor={`${fieldId}-address`}>
            {t("gatherings:create.step2.addressLabel")}
          </label>
          <input
            id={`${fieldId}-address`}
            className={styles.input}
            type="text"
            placeholder={t("gatherings:create.step2.addressPlaceholder")}
            value={form.address}
            onChange={(e) => form.setAddress(e.target.value)}
          />
          <label className={styles.label} htmlFor={`${fieldId}-directions`}>
            {t("gatherings:create.step2.directionsLabel")}
          </label>
          <input
            id={`${fieldId}-directions`}
            className={styles.input}
            type="text"
            placeholder={t("gatherings:create.step2.directionsPlaceholder")}
            value={form.directions}
            onChange={(e) => form.setDirections(e.target.value)}
          />
        </>
      )}
    </div>
  );
}
