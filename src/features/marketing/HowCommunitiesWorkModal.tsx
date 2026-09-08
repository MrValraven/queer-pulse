import { FiArrowRight } from "react-icons/fi";
import { Button, Eyebrow } from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { COMMUNITY_STEPS } from "./communitiesAbout.data";
import styles from "./HowCommunitiesWorkModal.module.css";

/**
 * "How communities work" explainer, opened from CTAs on the homepage and the
 * communities hub instead of navigating to a standalone page. Built to fit one
 * desktop screen without scrolling: a one-line lede, the three-step journey
 * side by side, and the invite CTA. It goes wider than the default sheet (see
 * `.sheet` in the module) so the steps can sit in a row instead of stacking. Rendered only while open (owns no state itself), so
 * `ModalSheet` runs its scroll-lock/focus-trap once per open.
 */
export function HowCommunitiesWorkModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("marketing:communitiesAbout.meta.title")}
      className={styles.sheet}
    >
      <div className={styles.head}>
        <Eyebrow>{t("marketing:communitiesAbout.hero.eyebrow")}</Eyebrow>
        <h2 className={styles.title}>
          <Translation
            i18nKey="marketing:communitiesAbout.hero.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lede}>
          {t("marketing:communitiesAbout.hero.sub")}
        </p>
      </div>

      <ol className={styles.steps}>
        {COMMUNITY_STEPS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
          <li key={titleKey} className={styles.step}>
            <span className={styles.stepMark} aria-hidden>
              {index + 1}
            </span>
            <h3 className={styles.stepTitle}>
              <Icon className={styles.stepIcon} aria-hidden />
              {t(titleKey)}
            </h3>
            <p className={styles.stepBody}>{t(bodyKey)}</p>
          </li>
        ))}
      </ol>

      <div className={styles.outro}>
        <div className={styles.outroText}>
          <p className={styles.outroTitle}>
            {t("marketing:communitiesAbout.outro.title")}
          </p>
          <p className={styles.outroSub}>
            {t("marketing:communitiesAbout.outro.sub")}
          </p>
        </div>
        <Button size="lg" to={requestInvitePath("communities_about")}>
          {t("nav:requestInvite")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </ModalSheet>
  );
}
