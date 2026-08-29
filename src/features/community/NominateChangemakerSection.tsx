import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NominateChangemakerForm } from "./NominateChangemakerForm";
import styles from "./ChangemakersPage.module.css";

/** What happens after the button, in order — the section used to stop at the
 *  button and say nothing about where a nomination goes. */
const STEP_KEYS = [
  "community:changemakers.nominate.stepSend",
  "community:changemakers.nominate.stepRead",
  "community:changemakers.nominate.stepHear",
] as const;

/**
 * The Change Makers page's "Nominate them" section. The directory itself
 * (`CHANGEMAKERS`) is curated editorial content, but a nomination is real
 * member data — the form calls `POST /changemakers/nominations` in live mode
 * (see `useCreateChangemakerNomination`); demo mode keeps the prototype's
 * simulated success toast.
 *
 * The pitch and the steps sit on the left, the form card on the right: the
 * copy no longer pushes the fields down the page, and each field carries its
 * own label, limit and error instead of leaning on a placeholder. There is no
 * signed-out branch because `/changemakers` is member-gated in `authGate.ts` —
 * a logged-out visitor is redirected before this renders.
 */
export function NominateChangemakerSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.nominate}>
      <div className="wrap">
        <div className={styles.nomGrid}>
          <div className={styles.nomIntro}>
            <Reveal as="div" className={styles.nomEye}>
              {t("community:changemakers.nominate.eyebrow")}
            </Reveal>
            <Reveal as="h2" delay={60}>
              <Translation
                i18nKey="community:changemakers.nominate.heading"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" delay={120}>
              {t("community:changemakers.nominate.lead")}
            </Reveal>
            <Reveal as="ol" className={styles.nomSteps} delay={180}>
              {STEP_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </Reveal>
          </div>
          <Reveal className={styles.nomPanel} delay={120}>
            <NominateChangemakerForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
