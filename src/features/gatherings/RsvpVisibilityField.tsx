import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RsvpDetailsVisibility } from "./api/events.api";
import styles from "./RsvpVisibilityField.module.css";

/** Canonical ids in display order, matching the backend's
 *  `RsvpDetailsVisibility` one-to-one, so a save sends the state as it is. */
const VISIBILITY_IDS: RsvpDetailsVisibility[] = [
  "everyone",
  "connections",
  "justMe",
];

/**
 * PRD-414: "Who can see you're going?", the one attendance answer both RSVP
 * details modals ask (the gathering page and My events).
 *
 * Each option is a full-width row with its own one-line scope, so the
 * protective "Only the hosts" choice fits a 360px phone in EN and PT and says
 * plainly what it does. The rows are a WAI-ARIA radiogroup (`RadioCardGroup`:
 * roving tabindex, arrow keys, Space and Enter), named by the visible question
 * and described by the privacy note under it. The chosen row carries an accent
 * border and a tick, so the choice never rests on colour alone.
 */
export function RsvpVisibilityField({
  value,
  onChange,
  note,
  labelClassName,
}: {
  value: RsvpDetailsVisibility;
  onChange: (visibility: RsvpDetailsVisibility) => void;
  /** What the hosts always see, whatever the member picks. Sits directly
   *  under the options and describes the group for assistive tech. */
  note: string;
  /** The host modal's own field-label class, so this question reads like the
   *  fields around it. */
  labelClassName?: string;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const noteId = useId();
  const optionLabel: Record<RsvpDetailsVisibility, string> = {
    everyone: t("gatherings:rsvpDetails.visibility.everyone"),
    connections: t("gatherings:rsvpDetails.visibility.connections"),
    justMe: t("gatherings:rsvpDetails.visibility.justMe"),
  };
  const optionDescription: Record<RsvpDetailsVisibility, string> = {
    everyone: t("gatherings:rsvpDetails.visibility.everyoneDesc"),
    connections: t("gatherings:rsvpDetails.visibility.connectionsDesc"),
    justMe: t("gatherings:rsvpDetails.visibility.justMeDesc"),
  };

  return (
    <div className={styles.field}>
      <div id={labelId} className={labelClassName ?? styles.label}>
        {t("gatherings:rsvpDetails.whoSeesLabel")}
      </div>
      <RadioCardGroup<RsvpDetailsVisibility>
        value={value}
        onChange={onChange}
        ariaLabel={t("gatherings:rsvpDetails.whoSeesLabel")}
        ariaLabelledBy={labelId}
        ariaDescribedBy={noteId}
        className={styles.options}
        optionClassName={styles.option}
        checkedClassName={styles.optionChecked}
        options={VISIBILITY_IDS.map((visibilityId) => ({
          id: visibilityId,
          render: (
            <>
              <span className={styles.optionLabel}>
                {optionLabel[visibilityId]}
              </span>
              <span className={styles.optionDescription}>
                {optionDescription[visibilityId]}
              </span>
              {value === visibilityId && (
                <FiCheck className={styles.check} aria-hidden />
              )}
            </>
          ),
        }))}
      />
      <p id={noteId} className={styles.note}>
        {note}
      </p>
    </div>
  );
}
