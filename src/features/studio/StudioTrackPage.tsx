import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioTrack } from "./api/useStudioTrack";
import { StudioDetailLoading } from "./StudioDetailLoading";
import { StudioLoadError, StudioNotFound } from "./StudioLoadStates";
import { StudioEpisodeHero } from "./StudioEpisodeHero";
import { StudioShell } from "./StudioShell";
import { StudioShowNotes } from "./StudioShowNotes";
import { StudioWithdrawnView } from "./StudioWithdrawnView";
import { StudioTipModal } from "./StudioTipModal";
import { StudioTrackChapters } from "./player/ui/StudioTrackChapters";
import { StudioTrackClaimPanels } from "./StudioClaimPanels";
import { StudioTrackHero } from "./StudioTrackHero";
import { StudioTrackInSet } from "./StudioTrackInSet";
import { StudioTrackLyrics } from "./StudioTrackLyrics";
import { StudioTrackMore } from "./StudioTrackMore";
import { StudioTrackPlaylists } from "./StudioTrackPlaylists";
import { StudioTrackSafetyRow } from "./StudioTrackSafetyRow";
import { StudioTrackSidebar } from "./StudioTrackSidebar";
import { StudioTrackStickyHeader } from "./StudioTrackStickyHeader";
import { StudioTrackSources } from "./StudioTrackSources";
import { StudioTrackWithheldView } from "./StudioTrackWithheldView";
import { StudioWithheldBanner } from "./StudioWithheldBanner";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioShowcase } from "./useStudioShowcase";
import episodeCss from "./StudioEpisode.module.css";
import trackStyles from "./track.module.css";

export function StudioTrackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { track, loadState } = useStudioTrack(searchParams.get("id"));
  const isShowcase = useStudioShowcase();
  const [isTipOpen, setIsTipOpen] = useState(false);
  // The hero's foot, held in state so the sticky header arms once it mounts.
  const [heroSentinel, setHeroSentinel] = useState<HTMLDivElement | null>(null);
  useStudioDocumentTitle(track?.title);

  // Studio safety: a listener's withheld track (410, names nothing).
  if (loadState.isTrackWithheld)
    return (
      <StudioShell>
        <StudioTrackWithheldView />
      </StudioShell>
    );
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
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.track"
        />
      </StudioShell>
    );
  if (!track)
    return (
      <StudioShell>
        <StudioDetailLoading label={t("studio:loading.track")} rows={0} />
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
      {!track.release.isShow && (
        <StudioTrackStickyHeader track={track} sentinel={heroSentinel} />
      )}
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
        <StudioTrackHero
          track={track}
          sentinelRef={setHeroSentinel}
          onTip={() => setIsTipOpen(true)}
        />
      )}
      {/* Straight after the hero, so the warning pill lines up under the
          title and details (StudioClaimPanel.module.css .safetyRow). */}
      <StudioTrackSafetyRow track={track} />
      <StudioWithheldBanner
        isShown={(track.claims ?? []).some((claim) => claim.isHolding)}
      />
      <StudioTrackClaimPanels track={track} />
      <StudioShowNotes track={track} />
      {track.release.isShow && (
        // The episode's chapters take the notes' light heading and room.
        <div className={episodeCss.chapters}>
          <StudioTrackChapters
            track={track}
            headingLevel={2}
            heading={t("studio:chapters.editor.heading")}
          />
        </div>
      )}
      <StudioTrackSources track={track} />
      {isShowcase && isMusic && <StudioTrackInSet />}
      <div className={trackStyles.body}>
        <StudioTrackLyrics track={track} />
        <StudioTrackSidebar track={track} />
      </div>
      {!track.release.isShow && (
        <StudioTrackChapters track={track} headingLevel={2} />
      )}
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
