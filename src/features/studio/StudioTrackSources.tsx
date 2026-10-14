import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isSourcedReleaseType,
  type StudioTrackView,
} from "./api/studio.adapters";
import css from "./StudioEpisode.module.css";

/** Sources on edit, lip-sync and mix tracks (spec 5.4): "Song title by
 *  Artist", one per line. */
export function StudioTrackSources({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const headingId = useId();
  if (!isSourcedReleaseType(track.release.type) || track.sources.length === 0)
    return null;
  return (
    <section className={css.sources} aria-labelledby={headingId}>
      <h2 id={headingId}>{t("studio:sources.heading")}</h2>
      <ul aria-label={t("studio:sources.listLabel", { title: track.title })}>
        {track.sources.map((source, index) => (
          <li key={`${index}-${source.title}`}>
            {t("studio:sources.line", {
              title: source.title,
              artist: source.artist,
            })}
          </li>
        ))}
      </ul>
    </section>
  );
}
