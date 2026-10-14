import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCuratedPickView } from "./api/studioDiscovery.adapters";
import { releaseMetaLine } from "./api/studio.adapters";
import { StudioReleaseCard } from "./StudioReleaseCard";
import styles from "./studio.module.css";
import css from "./StudioCuration.module.css";

function StudioPickMeta({ pick }: { pick: StudioCuratedPickView }) {
  const { t } = useTranslation();
  return (
    <>
      <span>{releaseMetaLine(pick)}</span>
      {pick.note && (
        <span className={css.pickNote}>
          <span className="visuallyHidden">
            {t("studio:curation.noteLabel")}{" "}
          </span>
          {pick.note}
        </span>
      )}
    </>
  );
}

/** A staff shelf (Staff picks, New this week): release cards in shelf order
 *  with each pick's note. It folds away while empty or unread. */
export function StudioCuratedShelf({
  picks,
  titleKey,
}: {
  picks: StudioCuratedPickView[];
  titleKey: string;
}) {
  const headingId = useId();
  return (
    <Collapse isOpen={picks.length > 0}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation i18nKey={titleKey} components={{ em: <em /> }} />
          </h2>
        </div>
        <div className={styles.rowGrid}>
          {picks.map((pick) => (
            <StudioReleaseCard
              key={pick.id}
              release={pick}
              meta={<StudioPickMeta pick={pick} />}
            />
          ))}
        </div>
      </section>
    </Collapse>
  );
}
