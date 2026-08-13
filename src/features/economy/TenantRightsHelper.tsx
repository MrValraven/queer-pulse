import { Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SafetyIcon } from "./SafetyIcon";
import {
  LISBON_PRICE_RANGES,
  TENANT_RIGHTS_SECTIONS,
  type PriceRange,
  type RightsSection,
} from "./housingSafety.data";
import styles from "./HousingSafety.module.css";

/** One tenant-rights topic as a card with a few plain-language points. */
function RightsCard({ section }: { section: RightsSection }) {
  const { t } = useTranslation();
  return (
    <Reveal as="article" className={styles.rightsCard}>
      <span className={styles.rightsIcon}>
        <SafetyIcon name={section.icon} size={20} />
      </span>
      <h3 className={styles.rightsCardTitle}>{t(section.titleKey)}</h3>
      <ul className={styles.rightsPoints}>
        {section.pointKeys.map((pointKey) => (
          <li key={pointKey}>{t(pointKey)}</li>
        ))}
      </ul>
    </Reveal>
  );
}

/** A single Lisbon rent range, formatted as "€min–max / mo". */
function PriceRow({ range }: { range: PriceRange }) {
  const { t } = useTranslation();
  return (
    <li className={styles.priceRow}>
      <span className={styles.priceLabel}>{t(range.labelKey)}</span>
      <span className={styles.priceValue}>
        &euro;{range.minEuros}&ndash;{range.maxEuros}
        <span className={styles.pricePer}> {t("economy:housingSafety.price.perMonth")}</span>
      </span>
    </li>
  );
}

/**
 * The reusable tenant-rights + price-sanity reference. Static content, so it
 * takes no props and reads entirely from the catalog and the verified data
 * file. Composed by the housing rights page, and safe to drop into any housing
 * surface that wants the reference inline.
 */
export function TenantRightsHelper() {
  const { t } = useTranslation();
  return (
    <div className={styles.helper}>
      <section className={styles.rightsSection} aria-labelledby="tenant-rights-heading">
        <h2 id="tenant-rights-heading" className={styles.sectionTitle}>
          {t("economy:housingSafety.page.rightsTitle")}
        </h2>
        <div className={styles.rightsGrid}>
          {TENANT_RIGHTS_SECTIONS.map((section) => (
            <RightsCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      <Reveal as="section" className={styles.priceCard} aria-labelledby="price-sanity-heading">
        <h2 id="price-sanity-heading" className={styles.sectionTitle}>
          {t("economy:housingSafety.price.title")}
        </h2>
        <p className={styles.priceLead}>{t("economy:housingSafety.price.lead")}</p>
        <ul className={styles.priceList}>
          {LISBON_PRICE_RANGES.map((range) => (
            <PriceRow key={range.id} range={range} />
          ))}
        </ul>
        <p className={styles.priceNote}>{t("economy:housingSafety.price.note")}</p>
      </Reveal>
    </div>
  );
}
