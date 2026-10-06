import { FiArrowRight, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { VOLUNTEER_PILLARS } from "./volunteerExplainer.data";
import styles from "../homepage/sections/ExplainerModal.module.css";

/**
 * PRD-454. Signed-out explainer for the volunteer board's member-side CTAs
 * ("Post an opportunity", "Meet the change makers"): what the organising side
 * offers and how to get in, for a visitor who would otherwise land on the
 * sign-in wall.
 * Same shape as the homepage `MembersExplainerModal`, so it is rendered only
 * while open and `ModalSheet` runs its scroll-lock and focus trap once per
 * open.
 */
export function VolunteerExplainerModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      success
      onClose={onClose}
      ariaLabel={t("marketing:volunteerExplainer.titlePlain")}
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
          {t("marketing:volunteerExplainer.eyebrow")}
        </span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="marketing:volunteerExplainer.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>{t("marketing:volunteerExplainer.lede")}</p>

        <ul className={styles.pillars}>
          {VOLUNTEER_PILLARS.map(({ id, Icon, titleKey, bodyKey }) => (
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

        <div className={styles.actions}>
          <Button size="lg" to={requestInvitePath("volunteer_explainer")}>
            {t("marketing:volunteerExplainer.requestInviteCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button size="lg" variant="ghost-dark" to={routes.signIn}>
            {t("marketing:volunteerExplainer.signInCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
