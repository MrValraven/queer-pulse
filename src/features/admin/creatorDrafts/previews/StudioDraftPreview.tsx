import { useMemo } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioTrackRowView } from "../../../studio/api/studio.adapters";
import type { StudioReleaseDTO } from "../../../studio/api/studio.types";
import { StudioAlbumHero } from "../../../studio/StudioAlbumHero";
import { StudioPreviewTracklist } from "../../../studio/StudioPreviewTracklist";
import { StudioTrackWarningPill } from "../../../studio/StudioTrackWarningPill";
import studioStyles from "../../../studio/studio.module.css";
import previewStyles from "../../../studio/StudioPreview.module.css";
import releaseStyles from "../../../studio/StudioRelease.module.css";
import showStyles from "../../../studio/StudioShow.module.css";
import { CreatorDraftPreviewFrame } from "./CreatorDraftPreviewFrame";
import styles from "./CreatorDraftPreviews.module.css";
import {
  STAFF_STUDIO_PREVIEW_TOKEN,
  toStaffStudioPreview,
} from "./studioDraftPreview.adapters";

/** No-op: a preview has no Tip or Report, and the frame swallows every press. */
function noop() {}

/** The draft episode staff opened, with what the show page's episode row
 *  shows: its title, the explicit mark, its content warnings, its length
 *  and the one line of show notes the track summary carries. An `h2`, since
 *  the hero's `h1` is the only heading above it. */
function StudioDraftEpisode({ episode }: { episode: StudioTrackRowView }) {
  const { t } = useTranslation();
  return (
    <article className={styles.episode}>
      <p className={showStyles.eyebrow}>
        <span className={showStyles.draftChip}>
          {t("studio:show.draftChip")}
        </span>
      </p>
      <h2 className={showStyles.title}>
        {episode.title}
        {episode.isExplicit && (
          <abbr
            className={releaseStyles.explicit}
            title={t("studio:release.explicit")}
          >
            {t("studio:release.explicitShort")}
          </abbr>
        )}
      </h2>
      <StudioTrackWarningPill warnings={episode.contentWarnings} />
      <p className={showStyles.facts}>
        <span>{episode.durationLabel ?? t("studio:release.processing")}</span>
      </p>
      {episode.notesExcerpt && (
        <p className={showStyles.excerpt}>{episode.notesExcerpt}</p>
      )}
    </article>
  );
}

/**
 * A Studio draft (a draft or scheduled release, or a show's draft episode)
 * as its private preview link shows it, built from the same parts as
 * `StudioPreviewPage`: the album hero (which names the artist
 * without a link under a preview token), then the tracklist or, for an
 * episode, that one episode, and the description. The public adapter drops
 * a draft episode, so `toStaffStudioPreview` picks it out by id.
 */
export function StudioDraftPreview({
  preview,
  episodeTrackId,
}: {
  preview: StudioReleaseDTO;
  episodeTrackId: string | null;
}) {
  const { t } = useTranslation();
  const { release, episode } = useMemo(
    () => toStaffStudioPreview(preview, episodeTrackId),
    [preview, episodeTrackId],
  );
  // The release description is the artist's own text, shown as written.
  const paragraphs = (release.description ?? "")
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim());
  const isEpisodeDraft = episodeTrackId !== null;

  return (
    <CreatorDraftPreviewFrame label={t("admin:creatorDrafts.preview.label")}>
      <div className={styles.studioFrame}>
        <StudioAlbumHero
          release={release}
          previewToken={STAFF_STUDIO_PREVIEW_TOKEN}
          onTip={noop}
          onReport={noop}
        />
        <section className={previewStyles.body}>
          {!isEpisodeDraft ? (
            <StudioPreviewTracklist
              release={release}
              previewToken={STAFF_STUDIO_PREVIEW_TOKEN}
            />
          ) : episode ? (
            <StudioDraftEpisode episode={episode} />
          ) : (
            // A fail-safe: the server always sends the episode with the show.
            <p className={styles.muted}>
              {t("admin:creatorDrafts.preview.episodeMissing")}
            </p>
          )}
          {paragraphs.length > 0 && (
            <div className={studioStyles.prose}>
              {paragraphs.map((paragraph, index) => (
                // Keyed by position: the text can repeat and never reorders.
                <p key={index} className={releaseStyles.linerParagraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </section>
      </div>
    </CreatorDraftPreviewFrame>
  );
}
