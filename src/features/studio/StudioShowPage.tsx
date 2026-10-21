import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { episodesOf } from "./api/studioEpisodes";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioEpisodeList } from "./StudioEpisodeList";
import { StudioReleaseSupportCard } from "./StudioReleaseSupportCard";
import { StudioShowHero } from "./StudioShowHero";
import css from "./StudioShow.module.css";

/** A podcast show at /studio/album?id= (spec 5.2): the hero, About the
 *  show, the persona's support links on a live show, then the episodes. */
export function StudioShowPage({
  release,
  onReport,
}: {
  release: StudioReleaseView;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const aboutId = useId();
  const hideExplicit = useStudioHideExplicit();
  const { published, drafts } = episodesOf(release);
  // Play latest episode starts the newest published episode with audio that
  // the member's settings do not hide (published comes oldest first).
  const latest =
    published.findLast(
      (episode) => episode.hasAudio && !(hideExplicit && episode.isExplicit),
    ) ?? null;
  return (
    <>
      <StudioShowHero
        release={release}
        latest={latest}
        publishedCount={published.length}
        playableEpisodeIds={published
          .filter((episode) => episode.hasAudio)
          .map((episode) => episode.id)}
        onReport={onReport}
      />
      {release.description && (
        <section className={css.about} aria-labelledby={aboutId}>
          <h2 id={aboutId}>{t("studio:show.aboutHeading")}</h2>
          <p>{release.description}</p>
        </section>
      )}
      {release.status === "published" && (
        <div className={css.support}>
          <StudioReleaseSupportCard release={release} />
        </div>
      )}
      <StudioEpisodeList
        release={release}
        published={published}
        drafts={drafts}
      />
    </>
  );
}
