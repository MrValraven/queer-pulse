import { useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { tabPanelProps } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioArtistHero } from "./StudioArtistHero";
import { StudioArtistMain } from "./StudioArtistMain";
import { StudioArtistOwnerPanel } from "./StudioArtistOwnerPanel";
import { StudioArtistOwnerTools } from "./StudioArtistOwnerTools";
import { StudioArtistSidebar } from "./StudioArtistSidebar";
import { StudioArtistSupportCard } from "./StudioArtistSupportCard";
import { StudioArtistUpcomingCard } from "./StudioArtistUpcomingCard";
import { StudioDetailLoading } from "./StudioDetailLoading";
import { StudioArtistStickyHeader } from "./StudioArtistStickyHeader";
import { StudioLoadError, StudioNotFound } from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { StudioTipModal } from "./StudioTipModal";
import { artistTabsOf, type ArtistTabId } from "./studioArtist.data";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

export function StudioArtistPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { artist, loadState } = useStudioArtist(searchParams.get("id"));
  const isShowcase = useStudioShowcase();
  const tabsId = useId();
  const [tab, setTab] = useState<ArtistTabId>("music");
  const [isTipOpen, setIsTipOpen] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  // The hero's foot, held in state so the sticky header arms once it mounts.
  const [heroSentinel, setHeroSentinel] = useState<HTMLDivElement | null>(null);
  useStudioDocumentTitle(artist?.artist.name);

  // The page h1 outlives the owner panel, so it takes focus when a delete
  // empties the panel. StudioDetailHero renders the h1, so it is found from
  // the name inside it and made focusable by script only.
  function focusPageHeading() {
    const heading = titleRef.current?.closest("h1");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }

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
          what="studio:errors.what.artist"
        />
      </StudioShell>
    );
  if (!artist)
    return (
      <StudioShell>
        <StudioDetailLoading label={t("studio:loading.artist")} rows={0} />
      </StudioShell>
    );

  const name = artist.artist.name;
  // Live gets a side column once there is something for it (Studio v3).
  const hasSide =
    isShowcase ||
    artist.upcoming.length > 0 ||
    artist.supportLinks.length > 0 ||
    artist.isOwner;
  return (
    <StudioShell>
      <StudioArtistStickyHeader artist={artist} sentinel={heroSentinel} />
      <StudioArtistHero
        artist={artist}
        titleRef={titleRef}
        sentinelRef={setHeroSentinel}
        onTip={() => setIsTipOpen(true)}
      />
      <StudioTablist
        tabs={artistTabsOf(artist.artist.format)}
        activeId={tab}
        onChange={setTab}
        idPrefix={tabsId}
        label={t("studio:artistPage.tabsLabel", { name })}
      />
      <section className={hasSide ? styles.detailGrid : kit.detailSingle}>
        <div {...tabPanelProps(tabsId, tab)} className={kit.panel}>
          <StudioArtistMain tab={tab} artist={artist} />
        </div>
        {hasSide && (
          <div className={styles.sideCol}>
            {isShowcase && (
              <StudioArtistSidebar
                artistName={name}
                onTip={() => setIsTipOpen(true)}
              />
            )}
            <StudioArtistUpcomingCard artist={artist} />
            <StudioArtistSupportCard artist={artist} />
          </div>
        )}
      </section>
      {/* The owner's tools sit under the tabs, so the page opens as the
          public sees it: releases, then the press kit and updates. */}
      {artist.ownerReleases && (
        <StudioArtistOwnerPanel
          artist={artist}
          onListEmptied={focusPageHeading}
        />
      )}
      {artist.isOwner && <StudioArtistOwnerTools artist={artist} />}
      {isShowcase && isTipOpen && (
        <StudioTipModal recipient={name} onClose={() => setIsTipOpen(false)} />
      )}
    </StudioShell>
  );
}
