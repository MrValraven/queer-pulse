import { useId } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../../app/routeMap";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { CONSENT_POINTS } from "../questionnaireSteps.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

/** Plain words about what happens to the answers, then the explicit consent
 *  tick. The tick is never stored with the draft: every save asks again. */
export function ConsentStep({ questionnaire }: QuestionnaireStepProps) {
  const { t } = useTranslation();
  const checkboxId = useId();
  return (
    <div className={styles.rows}>
      <ul className={styles.consentList}>
        {CONSENT_POINTS.map(({ id, icon: Icon, textKey }) => (
          <li key={id} className={styles.consentPoint}>
            <Icon className={styles.consentIcon} aria-hidden />
            <span>
              <Translation
                i18nKey={textKey}
                components={{
                  link: (
                    <Link
                      to={`${routes.settings}?pane=data`}
                      className={styles.inlineLink}
                    />
                  ),
                }}
              />
            </span>
          </li>
        ))}
      </ul>
      <label className={styles.consentCheck} htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={questionnaire.hasConsented}
          onChange={(event) =>
            questionnaire.setHasConsented(event.target.checked)
          }
        />
        <span>{t("goTogether:questionnaire.consent.agree")}</span>
      </label>
    </div>
  );
}
