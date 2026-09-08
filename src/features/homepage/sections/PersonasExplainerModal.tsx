import { FiArrowRight, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { ModalSheet } from "../../../shared/components/ui/Modal";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import { PERSONA_PILLARS } from "./personasExplainer.data";
import styles from "./ExplainerModal.module.css";

/**
 * Signed-out explainer for the "Explore personas" CTA: why the persona
 * directory is members-only, and how to get in. Shown instead of bouncing a
 * logged-out visitor to the sign-in page. Rendered only while open (owns no
 * state itself), so `ModalSheet` runs its scroll-lock/focus-trap once per open.
 */
export function PersonasExplainerModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      success
      onClose={onClose}
      ariaLabel={t("homepage:personasExplainer.titlePlain")}
    >
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("shared:modal.close")}
        >
          <FiX aria-hidden />
        </button>

        <span className={styles.eyebrow}>
          {t("homepage:personasExplainer.eyebrow")}
        </span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="homepage:personasExplainer.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>{t("homepage:personasExplainer.lede")}</p>

        <ul className={styles.pillars}>
          {PERSONA_PILLARS.map(({ id, Icon, titleKey, bodyKey }) => (
            <li key={id} className={styles.pillar}>
              <span className={styles.pillarIcon} aria-hidden>
                <Icon />
              </span>
              <span className={styles.pillarText}>
                <span className={styles.pillarTitle}>{t(titleKey)}</span>
                <span className={styles.pillarBody}>{t(bodyKey)}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.note}>{t("homepage:personasExplainer.note")}</p>

        <div className={styles.actions}>
          <Button size="lg" to={requestInvitePath("personas_explainer")}>
            {t("homepage:personasExplainer.requestInviteCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button size="lg" variant="ghost-dark" to={routes.signIn}>
            {t("homepage:personasExplainer.signInCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
