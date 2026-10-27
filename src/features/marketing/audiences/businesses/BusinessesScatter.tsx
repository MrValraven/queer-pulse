import { Reveal } from "../../../../shared/components/ui/Reveal";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { BUSINESS_SCATTER_ITEMS } from "./businessesLanding.data";
import styles from "./BusinessesScatter.module.css";

/**
 * "Where it all lives today": the bits of a small business spread across the
 * web, as price tags hung on strings in a shop window. Told in general
 * terms; no platform is named.
 */
export function BusinessesScatter() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="scatter"
      eyebrow={t("audiences:scatter.eyebrow")}
      title={
        <Translation
          i18nKey="forBusinesses:scatter.title"
          components={{ em: <em /> }}
        />
      }
      lede={t("forBusinesses:scatter.lede")}
      tone="paper"
    >
      <ul className={styles.notes}>
        {BUSINESS_SCATTER_ITEMS.map(
          ({ itemId, titleKey, bodyKey, Icon }, index) => (
            <Reveal
              as="li"
              key={itemId}
              delay={index * 80}
              className={styles.note}
            >
              <span className={styles.hole} aria-hidden="true" />
              <span className={styles.icon}>
                <Icon aria-hidden />
              </span>
              <h3 className={styles.title}>{t(titleKey)}</h3>
              <p className={styles.body}>{t(bodyKey)}</p>
            </Reveal>
          ),
        )}
      </ul>
    </AudienceSection>
  );
}
