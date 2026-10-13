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
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioTrackHero } from "./StudioTrackHero";
import { StudioTrackInSet } from "./StudioTrackInSet";
import { StudioTrackLyrics } from "./StudioTrackLyrics";
import { StudioTrackMore } from "./StudioTrackMore";
import { StudioTrackSidebar } from "./StudioTrackSidebar";
import { useStudioShowcase } from "./useStudioShowcase";
import trackStyles from "./track.module.css";

export function StudioTrackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { track, loadState } = useStudioTrack(searchParams.get("id"));
  const isShowcase = useStudioShowcase();
  const [isTipOpen, setIsTipOpen] = useState(false);

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

  return (
    <StudioShell>
      <nav
        className={trackStyles.crumb}
        aria-label={t("studio:trackPage.crumbLabel")}
      >
        <Link to={track.release.artist.href}>{track.release.artist.name}</Link>
        <span aria-hidden>
          <FiChevronRight />
        </span>
        <Link to={track.release.href}>{track.release.title}</Link>
        <span aria-hidden>
          <FiChevronRight />
        </span>
        <em aria-current="page">
          {t("studio:track.page.crumbLabel", { number: track.position })}
        </em>
      </nav>
      <StudioTrackHero track={track} onTip={() => setIsTipOpen(true)} />
      {isShowcase && <StudioTrackInSet />}
      <div className={trackStyles.body}>
        <StudioTrackLyrics track={track} />
        <StudioTrackSidebar track={track} />
      </div>
      <StudioTrackMore track={track} />
      {isShowcase && isTipOpen && (
        <StudioTipModal
          recipient={track.release.artist.name}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
