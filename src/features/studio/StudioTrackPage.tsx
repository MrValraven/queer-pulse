import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioTrack } from "./api/useStudioTrack";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { StudioEpisodeHero } from "./StudioEpisodeHero";
import { StudioShell } from "./StudioShell";
import { StudioShowNotes } from "./StudioShowNotes";
import { StudioWithdrawnView } from "./StudioWithdrawnView";
import { StudioTipModal } from "./StudioTipModal";
import { StudioTrackChapters } from "./player/ui/StudioTrackChapters";
import { StudioTrackHero } from "./StudioTrackHero";
import { StudioTrackInSet } from "./StudioTrackInSet";
import { StudioTrackLyrics } from "./StudioTrackLyrics";
import { StudioTrackMore } from "./StudioTrackMore";
import { StudioTrackPlaylists } from "./StudioTrackPlaylists";
import { StudioTrackSidebar } from "./StudioTrackSidebar";
import { StudioTrackSources } from "./StudioTrackSources";
import { useStudioShowcase } from "./useStudioShowcase";
import trackStyles from "./track.module.css";

export function StudioTrackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { track, loadState } = useStudioTrack(searchParams.get("id"));
  const isShowcase = useStudioShowcase();
  const [isTipOpen, setIsTipOpen] = useState(false);

  if (loadState.isWithdrawn)
    return (
      <StudioShell>
        <StudioWithdrawnView />
      </StudioShell>
    );
  if (loadState.isNotFound)
    return (
      <StudioShell>
        <StudioNotFound />
      </StudioShell>
    );
  if (loadState.isError)
    return (
      <StudioShell>
        <StudioLoadError loadState={loadState} />
      </StudioShell>
    );
  if (!track)
    return (
      <StudioShell>
        <StudioDetailSkeleton />
      </StudioShell>
    );

  // A show usually carries its persona's name; the crumb names it once and
  // the show page links the persona.
  const isArtistCrumbHidden =
    track.release.isShow && track.release.artist.name === track.release.title;
  // The demo's live set banner speaks of a song; episodes, spoken word and
  // performance tracks leave it out.
  const isMusic = track.release.format === "music";

  return (
    <StudioShell>
      <nav
        className={trackStyles.crumb}
        aria-label={t("studio:trackPage.crumbLabel")}
      >
        {!isArtistCrumbHidden && (
          <>
            <Link to={track.release.artist.href}>
              {track.release.artist.name}
            </Link>
            <span aria-hidden>
              <FiChevronRight />
            </span>
          </>
        )}
        <Link to={track.release.href}>{track.release.title}</Link>
        <span aria-hidden>
          <FiChevronRight />
        </span>
        <em aria-current="page">
          {track.release.isShow
            ? t("studio:episode.crumbLabel")
            : t("studio:track.page.crumbLabel", { number: track.position })}
        </em>
      </nav>
      {track.release.isShow ? (
        <StudioEpisodeHero track={track} />
      ) : (
        <StudioTrackHero track={track} onTip={() => setIsTipOpen(true)} />
      )}
      <StudioShowNotes track={track} />
      {track.release.isShow && (
        <StudioTrackChapters
          track={track}
          heading={t("studio:chapters.editor.heading")}
        />
      )}
      <StudioTrackSources track={track} />
      {isShowcase && isMusic && <StudioTrackInSet />}
      <div className={trackStyles.body}>
        <StudioTrackLyrics track={track} />
        <StudioTrackSidebar track={track} />
      </div>
      {!track.release.isShow && <StudioTrackChapters track={track} />}
      <StudioTrackMore track={track} />
      <StudioTrackPlaylists trackId={track.id} />
      {isShowcase && isTipOpen && (
        <StudioTipModal
          recipient={track.release.artist.name}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
