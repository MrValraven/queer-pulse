import { FiArrowRight, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui";
import { ModalSheet } from "../../../shared/components/ui/Modal";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import { HOUSING_PILLARS } from "./housingExplainer.data";
import styles from "./ExplainerModal.module.css";

/**
 * Signed-out explainer for the housing CTA: what the housing offer actually is
 * and why the board is members-only. Shown instead of bouncing a logged-out
 * visitor to the sign-in page. Rendered only while open (owns no state itself),
 * so `ModalSheet` runs its scroll-lock/focus-trap once per open.
 *
 * The note links to the housing co-ops page, the one housing surface that is
 * genuinely readable without an account (`/local/housing/coop` is a
 * PUBLIC_EXCEPTIONS entry in `authGate.ts`), so the modal ends on something the
 * visitor can do now rather than only on a door.
 */
export function HousingExplainerModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      success
      onClose={onClose}
      ariaLabel={t("homepage:housingExplainer.titlePlain")}
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
          {t("homepage:housingExplainer.eyebrow")}
        </span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="homepage:housingExplainer.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>{t("homepage:housingExplainer.lede")}</p>

        <ul className={styles.pillars}>
          {HOUSING_PILLARS.map(({ id, Icon, titleKey, bodyKey }) => (
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

        <p className={styles.note}>
          <Translation
            i18nKey="homepage:housingExplainer.note"
            components={{
              coop: (
                <Link
                  to={routes.housingCoop}
                  className={styles.noteLink}
                  onClick={onClose}
                />
              ),
            }}
          />
        </p>

        <div className={styles.actions}>
          <Button size="lg" to={requestInvitePath("housing_explainer")}>
            {t("homepage:housingExplainer.requestInviteCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button size="lg" variant="ghost-dark" to={routes.signIn}>
            {t("homepage:housingExplainer.signInCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
