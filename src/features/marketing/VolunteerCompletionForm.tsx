import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VolunteerApplicantsDashboardPage.module.css";

const ATTENDED_YES = "yes";
const ATTENDED_NO = "no";
const MAX_SESSION_HOURS = 24;

/**
 * The completion step on one accepted applicant row (SUS-05): did they turn
 * up, and for how long. Only rendered on a signup that is accepted and has no
 * completion recorded, so it disappears the moment the server confirms.
 *
 * Local state per row, one shared mutation: `isSaving` is passed in rather
 * than read from the mutation, so confirming one row does not put every other
 * row into a busy state.
 *
 * A no-show is a real answer, and choosing it disables the hours field rather
 * than hiding it: the label stays readable, and the server zeroes the number
 * anyway.
 *
 * The copy tells the poster what the confirmation is FOR (reportable hours,
 * the member's recognition) and stops there. It does not say the volunteer
 * will be told, because nothing tells them.
 */
export function VolunteerCompletionForm({
  memberName,
  isSaving,
  error,
  onConfirm,
}: {
  memberName: string;
  isSaving: boolean;
  /** Already-translated message, or null. Rendered inline, never as a toast. */
  error: string | null;
  onConfirm: (values: { attended: boolean; hours: number }) => void;
}) {
  const { t } = useTranslation();
  const [attendedChoice, setAttendedChoice] = useState(ATTENDED_YES);
  const [hoursText, setHoursText] = useState("");

  const isAttended = attendedChoice === ATTENDED_YES;
  const parsedHours = Number.parseFloat(hoursText);
  const hasValidHours =
    Number.isFinite(parsedHours) &&
    parsedHours >= 0 &&
    parsedHours <= MAX_SESSION_HOURS;
  const canConfirm = isAttended ? hasValidHours : true;

  return (
    <div className={styles.completion}>
      <p className={styles.completionTitle}>
        {t("marketing:volunteerManage.completion.title")}
      </p>

      <div className={styles.completionControls}>
        <SegmentedControl
          label={`${t("marketing:volunteerManage.completion.attendedLabel")} ${memberName}`}
          options={[
            {
              value: ATTENDED_YES,
              label: t("marketing:volunteerManage.completion.attendedYes"),
            },
            {
              value: ATTENDED_NO,
              label: t("marketing:volunteerManage.completion.attendedNo"),
            },
          ]}
          value={attendedChoice}
          onChange={setAttendedChoice}
        />

        <FormField
          label={t("marketing:volunteerManage.completion.hoursLabel")}
          helper={t("marketing:volunteerManage.completion.hoursHelper")}
          className={styles.completionHours}
        >
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={MAX_SESSION_HOURS}
            step={0.25}
            value={hoursText}
            disabled={!isAttended || isSaving}
            onChange={(changeEvent) => setHoursText(changeEvent.target.value)}
          />
        </FormField>

        <Button
          size="sm"
          onClick={() =>
            onConfirm({
              attended: isAttended,
              hours: isAttended && hasValidHours ? parsedHours : 0,
            })
          }
          disabled={isSaving || !canConfirm}
          aria-busy={isSaving}
        >
          <FiCheck aria-hidden />{" "}
          {isSaving
            ? t("marketing:volunteerManage.completion.confirming")
            : t("marketing:volunteerManage.completion.confirm")}
        </Button>
      </div>

      <p className={styles.completionWhy}>
        {t("marketing:volunteerManage.completion.why")}
      </p>

      {error && (
        <p className={styles.completionError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
