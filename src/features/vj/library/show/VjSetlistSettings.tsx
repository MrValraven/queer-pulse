import { useId } from "react";
import type { VjSetlistDTO } from "../../../../shared/contracts/vj";
import { Toggle } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../../VjReasonLine";
import { VjStepDurationPicker } from "./VjStepDurationPicker";
import type { VjSetlistSettingsSender } from "./vjSetlistSlots";
import styles from "./VjSetlists.module.css";

/**
 * The sequence's own settings above its steps: the default step length and
 * Loop, each saved on its own through the row's settings sender. The
 * controls read the values on their way, so a tap answers at once and a
 * refusal rolls the control back and names its reason. The heading names the
 * sequence, so two open panels each have their own name.
 */
export function VjSetlistSettings({
  setlist,
  sender,
}: {
  setlist: VjSetlistDTO;
  sender: VjSetlistSettingsSender;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const loopId = useId();
  const loopHintId = useId();
  const { shownIsLooping, shownStepDuration, save, isSaved, error } = sender;

  return (
    <section className={styles.settings} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.settingsHeading}>
        {t("vj:librarySetlists.settingsLabelNamed", { name: setlist.name })}
      </h3>
      <div className={styles.settingsField}>
        <span className={styles.addLabel} aria-hidden="true">
          {t("vj:librarySetlists.defaultLength")}
        </span>
        <VjStepDurationPicker
          label={t("vj:librarySetlists.defaultLength")}
          value={shownStepDuration}
          onChange={(duration) => {
            if (duration !== null) save({ stepDuration: duration });
          }}
        />
      </div>
      <div className={styles.loopRow}>
        <span className={styles.loopText}>
          <label htmlFor={loopId} className={styles.loopLabel}>
            {t("vj:librarySetlists.loop")}
          </label>
          <span id={loopHintId} className={styles.loopHint}>
            {t("vj:librarySetlists.loopHint")}
          </span>
        </span>
        <Toggle
          id={loopId}
          label={t("vj:librarySetlists.loop")}
          aria-describedby={loopHintId}
          checked={shownIsLooping}
          onChange={(isLooping) => save({ isLooping })}
        />
      </div>
      <p role="status" className="visuallyHidden">
        {isSaved ? t("vj:librarySetlists.saved") : ""}
      </p>
      <VjReasonLine error={error} />
    </section>
  );
}
