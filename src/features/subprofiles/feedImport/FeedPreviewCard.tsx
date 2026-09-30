import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFocusOnMount } from "../../../shared/hooks/useFocusOnMount";
import type { FeedPreviewDTO } from "../api/subprofileFeeds.api";
import { episodeMetaLine } from "./episodeMeta";
import styles from "./FeedConnect.module.css";

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * What the feed holds, shown before anything is connected: the show's title,
 * author and episode count, and its newest few episodes with date and length.
 * No artwork: the preview never carries third-party images, so the card reads
 * as text until the show is connected and we hold our own copy of its art.
 *
 * Focus moves to the title when the card appears, so a screen-reader user
 * lands on the result of the lookup they just asked for.
 */
export function FeedPreviewCard({ preview }: { preview: FeedPreviewDTO }) {
  const { t } = useTranslation();
  const { date } = useFormat();
  const titleRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <section className={styles.preview} aria-labelledby="feed-preview-title">
      <h4 id="feed-preview-title" ref={titleRef} tabIndex={-1}>
        {preview.title || t("subprofiles:feedImport.preview.untitled")}
      </h4>
      <p className={styles.previewMeta}>
        {[
          preview.author
            ? t("subprofiles:feedImport.preview.author", {
                author: preview.author,
              })
            : null,
          t("subprofiles:feedImport.preview.episodes", {
            count: preview.episodeCount,
          }),
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {preview.description && (
        <p className={styles.previewDescription}>{preview.description}</p>
      )}
      <p className={styles.previewHeading}>
        {t("subprofiles:feedImport.preview.newest")}
      </p>
      <ol className={styles.previewList}>
        {preview.latest.map((episode) => (
          <li key={episode.guid}>
            <b>{episode.title}</b>
            <small>
              {episodeMetaLine(episode, (when) => date(when, SHORT_DATE))}
            </small>
          </li>
        ))}
      </ol>
      {preview.alreadyConnected && (
        <p className={styles.previewNote} role="status">
          {t("subprofiles:feedImport.preview.alreadyConnected")}
        </p>
      )}
    </section>
  );
}
