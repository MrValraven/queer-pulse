import { useId } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatDate } from "../../../shared/lib/date";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminChip } from "../ui";
import type { CulturalGuideListItemDTO } from "./api/culturalProduction.types";
import { CulturalEventTypeChip } from "./CulturalEventTypeChip";
import { CULTURAL_GUIDE_LOCALE_KEY } from "./culturalProductionLabels.data";
import { culturalGuidePath } from "./culturalProductionPaths";
import { GUIDE_EDIT_DATE_OPTIONS, guideEditLineOf } from "./guidesTab.data";
import styles from "./Guides.module.css";

const GUIDES_PREFIX = "admin:culturalProduction.guides";

/** Who last edited a guide and when, or that it is a starter guide. Shared
 *  by the card and the guide page header. */
export function GuideEditLine({
  guide,
  className,
}: {
  guide: Pick<
    CulturalGuideListItemDTO,
    "author" | "updatedBy" | "createdAt" | "updatedAt"
  >;
  className?: string;
}) {
  const { t, language } = useTranslation();
  const { key, name } = guideEditLineOf(guide);
  const date = formatDate(guide.updatedAt, language, GUIDE_EDIT_DATE_OPTIONS);
  return (
    <span className={className}>
      {t(key, name === null ? { date } : { name, date })}
    </span>
  );
}

/**
 * One guide on the Guides tab: a link to its page with the event type and
 * language, the title and summary, the section and step counts, and who
 * edited it last. The link is named by the title; the summary and the
 * counts describe it.
 */
export function GuideCard({ guide }: { guide: CulturalGuideListItemDTO }) {
  const { t } = useTranslation();
  const describedById = useId();
  return (
    <Link
      to={culturalGuidePath(guide.id)}
      className={styles.card}
      aria-label={t(`${GUIDES_PREFIX}.card.openAria`, { title: guide.title })}
      aria-describedby={describedById}
    >
      <span className={styles.cardChips}>
        <CulturalEventTypeChip eventType={guide.eventType} />
        <AdminChip tone="ghost">
          {t(CULTURAL_GUIDE_LOCALE_KEY[guide.locale])}
        </AdminChip>
      </span>
      <span className={styles.cardTitle}>{guide.title}</span>
      <span id={describedById} className={styles.cardDescription}>
        {guide.summary !== "" && (
          <span className={styles.cardSummary}>{guide.summary}</span>
        )}
        <span className={styles.cardCounts}>
          <span>
            {t(`${GUIDES_PREFIX}.card.sections`, {
              count: guide.sectionCount,
            })}
          </span>
          <span className={styles.cardDot} aria-hidden>
            ·
          </span>
          <span>
            {t(`${GUIDES_PREFIX}.card.steps`, { count: guide.stepCount })}
          </span>
        </span>
        <GuideEditLine guide={guide} className={styles.cardEditLine} />
      </span>
      <FiArrowRight className={styles.cardArrow} aria-hidden />
    </Link>
  );
}
