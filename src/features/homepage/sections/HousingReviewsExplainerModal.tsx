import { FiArrowRight, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { ModalSheet } from "../../../shared/components/ui/Modal";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { HOUSING_REVIEW_RULES } from "./housingReviewsExplainer.data";
import styles from "./ExplainerModal.module.css";

/**
 * "How reviews work" for the housing showcase's landlord tab: who may write
 * about a landlord, what the landlord can do about it, and what the words are
 * NOT (verified). This link used to navigate to the housing board, which
 * answered a question nobody had asked and dropped the reader out of the
 * homepage; the question is about the rules, so the answer is a modal.
 *
 * The rules themselves live in `housingReviewsExplainer.data.ts`, whose comment
 * names the backend method behind each one. Rendered only while open (owns no
 * state itself), so `ModalSheet` runs its scroll-lock/focus-trap once per open.
 */
export function HousingReviewsExplainerModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      success
      onClose={onClose}
      ariaLabel={t("homepage:housing.reviewsExplainer.titlePlain")}
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
          {t("homepage:housing.reviewsExplainer.eyebrow")}
        </span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="homepage:housing.reviewsExplainer.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>
          {t("homepage:housing.reviewsExplainer.lede")}
        </p>

        <ul className={styles.pillars}>
          {HOUSING_REVIEW_RULES.map(({ id, Icon, titleKey, bodyKey }) => (
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
          {t("homepage:housing.reviewsExplainer.note")}
        </p>

        <div className={styles.actions}>
          <Button size="lg" to={routes.housing}>
            {t("homepage:housing.reviewsExplainer.browseCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button size="lg" variant="ghost-dark" onClick={onClose}>
            {t("homepage:housing.reviewsExplainer.closeCta")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
