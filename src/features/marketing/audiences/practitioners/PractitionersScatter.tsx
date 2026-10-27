import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { BeforeAfter } from "../shared/BeforeAfter";
import {
  PRACTITIONER_AFTER_ITEMS,
  PRACTITIONER_BEFORE_ITEMS,
  PRACTITIONER_SCATTER,
} from "./practitionersLanding.data";
import styles from "./PractitionersLanding.module.css";

/** "Where it all lives today": the practice spread across a feed, a pinned
 *  post, a calendar and the same answers typed again and again. */
export function PractitionersScatter() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="today"
      eyebrow={t("audiences:scatter.eyebrow")}
      title={t("forPractitioners:scatter.title")}
      lede={t("forPractitioners:scatter.lede")}
      tone="paper"
    >
      <ul className={styles.scatter}>
        {PRACTITIONER_SCATTER.map(({ itemId, labelKey, Icon }) => (
          <li key={itemId} className={styles.scatterNote}>
            <Icon aria-hidden className={styles.scatterIcon} />
            <span>{t(labelKey)}</span>
          </li>
        ))}
      </ul>
    </AudienceSection>
  );
}

/** "All in one place": the tools of today beside the one page, both as
 *  short text lists. */
export function PractitionersAllInOne() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId="all-in-one"
      eyebrow={t("audiences:allInOne.eyebrow")}
      title={t("forPractitioners:allInOne.title")}
      tone="paper"
    >
      <BeforeAfter
        beforeItems={PRACTITIONER_BEFORE_ITEMS}
        afterItems={PRACTITIONER_AFTER_ITEMS}
      />
    </AudienceSection>
  );
}
