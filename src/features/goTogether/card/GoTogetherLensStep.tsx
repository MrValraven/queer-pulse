import { useId } from "react";
import { RadioCardGroup } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ChoiceCheck } from "./ChoiceCheck";
import { LENS_CHOICES, NO_LENS, type LensChoice } from "./goTogetherCard.data";
import styles from "./GoTogetherCard.module.css";

/**
 * The optional identity lens. "No lens" is the default. Choosing a lens
 * reveals a required consent box, and the parent keeps the confirm button
 * disabled until it is ticked. This step is the only place the lens is ever
 * shown, and only to the member choosing it.
 */
export function GoTogetherLensStep({
  lens,
  onLensChange,
  hasConsent,
  onConsentChange,
}: {
  lens: LensChoice;
  onLensChange: (lens: LensChoice) => void;
  hasConsent: boolean;
  onConsentChange: (hasConsent: boolean) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const hintId = useId();

  const labelFor = (choice: LensChoice) =>
    choice === NO_LENS
      ? t("goTogether:card.lens.none.label")
      : t(`goTogether:lens.${choice}.label`);
  const descriptionFor = (choice: LensChoice) =>
    choice === NO_LENS
      ? t("goTogether:card.lens.none.description")
      : t(`goTogether:lens.${choice}.description`);

  return (
    <fieldset className={styles.step}>
      <legend id={headingId} className={styles.stepTitle}>
        {t("goTogether:card.lens.title")}
      </legend>
      <p id={hintId} className={styles.stepHint}>
        {t("goTogether:card.lens.hint")}
      </p>
      <RadioCardGroup<LensChoice>
        value={lens}
        onChange={(choice) => {
          onLensChange(choice);
          if (choice === NO_LENS) onConsentChange(false);
        }}
        ariaLabel={t("goTogether:card.lens.title")}
        ariaLabelledBy={headingId}
        ariaDescribedBy={hintId}
        className={styles.choices}
        optionClassName={styles.choice}
        checkedClassName={styles.choiceChecked}
        options={LENS_CHOICES.map((choice) => ({
          id: choice,
          render: (
            <>
              <span className={styles.choiceLabel}>{labelFor(choice)}</span>
              <span className={styles.choiceDescription}>
                {descriptionFor(choice)}
              </span>
              <ChoiceCheck isChecked={lens === choice} />
            </>
          ),
        }))}
      />
      {lens !== NO_LENS && (
        <label className={styles.consent}>
          <input
            type="checkbox"
            className={styles.consentBox}
            checked={hasConsent}
            required
            onChange={(event) => onConsentChange(event.target.checked)}
          />
          <span>{t("goTogether:card.lens.consent")}</span>
        </label>
      )}
    </fieldset>
  );
}
