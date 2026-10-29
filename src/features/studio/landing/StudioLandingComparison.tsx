import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { STUDIO_LANDING_COMPARISON_ROWS } from "./studioLanding.data";
import styles from "./StudioLandingComparison.module.css";

interface ComparisonAnswerProps {
  columnName: string;
  shortLabel: string;
  answer: string;
  isStudio: boolean;
}

/**
 * One answer cell. It starts with the full column name and a colon, visually
 * hidden and always read by screen readers, so every answer names its column
 * at every width. Phones also show a short visible label, hidden from
 * assistive technology so the column name is announced once.
 */
function ComparisonAnswer({
  columnName,
  shortLabel,
  answer,
  isStudio,
}: ComparisonAnswerProps) {
  return (
    <p className={isStudio ? styles.studio : styles.answer}>
      {isStudio ? (
        <FiCheck className={styles.check} aria-hidden="true" />
      ) : null}
      <span className={styles.answerText}>
        <span className={styles.label}>
          <span className={styles.labelFull}>
            {columnName}
            {": "}
          </span>
          <span className={styles.labelShort} aria-hidden="true">
            {shortLabel}
          </span>
        </span>
        {answer}
      </span>
    </p>
  );
}

/**
 * Studio beside streaming apps and artist platforms, row by row. From 900px
 * it reads as a four-column table (topic, streaming apps, artist platforms,
 * Studio) with a header row and hairline dividers, the Studio column on a
 * raised tint with a check mark. Below 900px each row is a stacked card with
 * the topic as its heading, three labelled answers and Studio's highlighted.
 * The heading is the opener: keep Spotify for everything else, Studio is for
 * the music made around you.
 */
export function StudioLandingComparison() {
  const { t } = useTranslation();
  const headingId = useId();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const streamingHeading = t("studio:landing.compare.streamingHeading");
  const platformsHeading = t("studio:landing.compare.platformsHeading");
  const studioHeading = t("studio:landing.compare.studioHeading");

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner} ref={ref} data-revealed={isVisible}>
        <p className={styles.eyebrow}>{t("studio:landing.compare.eyebrow")}</p>
        <h2 id={headingId} className={styles.title}>
          <Translation
            i18nKey="studio:landing.compare.title"
            components={{ em: <em /> }}
          />
        </h2>

        <div className={styles.headerRow} aria-hidden="true">
          <span className={styles.headerCell}>
            {t("studio:landing.compare.topicHeading")}
          </span>
          <span className={styles.headerCell}>{streamingHeading}</span>
          <span className={styles.headerCell}>{platformsHeading}</span>
          <span className={styles.studioHeading}>{studioHeading}</span>
        </div>

        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- grid with list-style none loses the list role in Safari */}
        <ul className={styles.list} role="list">
          {STUDIO_LANDING_COMPARISON_ROWS.map(
            ({ rowId, topicKey, streamingKey, platformsKey, studioKey }) => (
              <li key={rowId} className={styles.row}>
                <h3 className={styles.topic}>{t(topicKey)}</h3>
                <ComparisonAnswer
                  columnName={streamingHeading}
                  shortLabel={t("studio:landing.compare.streamingShort")}
                  answer={t(streamingKey)}
                  isStudio={false}
                />
                <ComparisonAnswer
                  columnName={platformsHeading}
                  shortLabel={t("studio:landing.compare.platformsShort")}
                  answer={t(platformsKey)}
                  isStudio={false}
                />
                <ComparisonAnswer
                  columnName={studioHeading}
                  shortLabel={t("studio:landing.compare.studioShort")}
                  answer={t(studioKey)}
                  isStudio
                />
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
