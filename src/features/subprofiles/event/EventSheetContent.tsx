import { FiMapPin } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import { GIG_STATE_LABEL } from "../personaSkinRender";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { EventSheetActions } from "./EventSheetActions";
import { EventSheetDate } from "./EventSheetDate";
import { EventSheetLineup } from "./EventSheetLineup";
import { eventPlace } from "./eventCalendar";
import styles from "./EventSheetContent.module.css";

/** The description's paragraphs, split on blank lines; a single line break
 *  inside a paragraph stays a break (the CSS keeps `pre-line`). */
function descriptionParagraphs(description: string): string[] {
  return description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * One event inside the sheet: the poster (when there is one), then the date
 * stamp, the title, its status chip, the place, the line-up, the
 * description and the actions. The sheet keys this on the event, so paging
 * remounts it and the fade plays again.
 */
export function EventSheetContent({ item }: { item: SubprofileItemView }) {
  const { t } = useTranslation();
  const hasPoster = Boolean(item.imageUrl);
  const isCancelled = item.gigState === "cancelled";
  const place = eventPlace(item);
  const paragraphs = descriptionParagraphs(item.description);

  return (
    <article className={styles.layout} data-has-poster={hasPoster || undefined}>
      {hasPoster && (
        <figure className={styles.poster}>
          {/* The title sits right beside it, so the poster is decorative. */}
          <img src={item.imageUrl} alt="" decoding="async" />
        </figure>
      )}
      <div className={styles.details}>
        <EventSheetDate date={item.date} doors={item.doors} />
        <header className={styles.head}>
          <h2 className={cx(styles.title, isCancelled && styles.titleStruck)}>
            {item.title}
          </h2>
          {item.gigState && (
            // The global `.gigstate` chip the page's rows wear.
            <span className={cx("gigstate", item.gigState, styles.state)}>
              {t(GIG_STATE_LABEL[item.gigState])}
            </span>
          )}
        </header>
        {place && (
          <p className={styles.place}>
            <FiMapPin aria-hidden className={styles.placeIcon} />
            <span>{place}</span>
          </p>
        )}
        <EventSheetLineup
          collaborators={item.collaborators}
          lineupText={item.meta}
        />
        {paragraphs.length > 0 && (
          <div className={styles.description}>
            {paragraphs.map((paragraph, paragraphIndex) => (
              // Paragraphs are a fixed split of one string; position is
              // their identity.
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
          </div>
        )}
        <EventSheetActions item={item} />
      </div>
    </article>
  );
}
