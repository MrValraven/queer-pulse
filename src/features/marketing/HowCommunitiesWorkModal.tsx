import { FiArrowRight } from "react-icons/fi";
import { Button, Eyebrow } from "../../shared/components/ui";
import { ModalSheet } from "../../shared/components/ui/Modal";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import {
  WhatSection,
  HowSection,
  WhySection,
} from "./CommunitiesAboutSections";
import styles from "./HowCommunitiesWorkModal.module.css";

/**
 * "How communities work" explainer, opened from CTAs on the homepage and the
 * communities hub instead of navigating to a standalone page. Reuses the same
 * What/How/Why sections the old page rendered (`CommunitiesAboutSections`), so
 * the content itself is unchanged — only the shell around it. Sits on the
 * default (non-`success`) `ModalSheet` cream surface, which matches the
 * `--paper` cards those sections already assume. Rendered only while open (owns
 * no state itself), so `ModalSheet` runs its scroll-lock/focus-trap once per open.
 */
export function HowCommunitiesWorkModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      wide
      onClose={onClose}
      ariaLabel={t("marketing:communitiesAbout.meta.title")}
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

      <div className={styles.sections}>
        <WhatSection />
        <HowSection />
        <WhySection />
      </div>

      <div className={styles.outro}>
        <p className={styles.outroTitle}>
          {t("marketing:communitiesAbout.outro.title")}
        </p>
        <p className={styles.outroSub}>
          {t("marketing:communitiesAbout.outro.sub")}
        </p>
        <Button size="lg" to={requestInvitePath("communities_about")}>
          {t("nav:requestInvite")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </ModalSheet>
  );
}
