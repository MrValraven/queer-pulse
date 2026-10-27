import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DirectoryAffirmingBaseline } from "../../DirectoryAffirmingBaseline";
import { AudiencePointGrid } from "../shared/AudiencePointGrid";
import { AudienceSection } from "../shared/AudienceSection";
import { BUSINESS_SAFETY_POINTS } from "./businessesLanding.data";
import styles from "./BusinessesSafety.module.css";

/**
 * "Safe by design": the affirming baseline exactly as every listing page
 * states it (rendered once on this page, since it carries a fixed id), then
 * the two trust points behind it. The pledge is the real text, so it hangs
 * in an inert, labelled figure without the "Sample" caption.
 */
export function BusinessesSafety() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="safe-by-design"
      eyebrow={t("audiences:safety.eyebrow")}
      title={
        <Translation
          i18nKey="forBusinesses:safety.title"
          components={{ em: <em /> }}
        />
      }
      lede={t("forBusinesses:safety.lede")}
      tone="paper"
    >
      <div className={styles.layout}>
        <figure
          aria-label={t("forBusinesses:safety.frame")}
          className={styles.pledge}
        >
          <div className={styles.baselineStage} inert>
            <DirectoryAffirmingBaseline />
          </div>
        </figure>
        <AudiencePointGrid points={BUSINESS_SAFETY_POINTS} />
      </div>
    </AudienceSection>
  );
}
