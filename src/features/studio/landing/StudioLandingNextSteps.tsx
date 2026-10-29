import { useId } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STUDIO_LANDING_NEXT_STEPS } from "./studioLanding.data";
import styles from "./StudioLandingFaq.module.css";

/**
 * What happens after a visitor asks for an invite: three numbered steps. It
 * speaks to people who have not joined yet, so a member sees nothing and the
 * section folds away when someone signs in.
 */
export function StudioLandingNextSteps() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const headingId = useId();

  return (
    <Collapse isOpen={!loggedIn}>
      <section className={styles.section} aria-labelledby={headingId}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{t("studio:landing.next.eyebrow")}</p>
          <h2 id={headingId} className={styles.title}>
            <Translation
              i18nKey="studio:landing.next.title"
              components={{ em: <em /> }}
            />
          </h2>
          <ol className={styles.steps}>
            {STUDIO_LANDING_NEXT_STEPS.map(
              ({ pointId, titleKey, bodyKey, Icon }, index) => (
                <li key={pointId} className={styles.step}>
                  <span className={styles.numeral} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3 className={styles.stepTitle}>{t(titleKey)}</h3>
                  <p className={styles.stepBody}>{t(bodyKey)}</p>
                </li>
              ),
            )}
          </ol>
        </div>
      </section>
    </Collapse>
  );
}
