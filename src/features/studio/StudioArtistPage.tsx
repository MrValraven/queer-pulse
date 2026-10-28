import { useCallback, useId, useRef, useState } from "react";
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
import { StudioArtistSupporterCard } from "./StudioArtistSupporterCard";
import { StudioArtistUpcomingCard } from "./StudioArtistUpcomingCard";
import { StudioDetailLoading } from "./StudioDetailLoading";
import { StudioEditPageSheet } from "./StudioEditPageSheet";
import { StudioEditPageOpenerProvider } from "./studioEditPageOpener";
import type { StudioHeroChoice } from "./studioHeroChoice";
import { StudioArtistStickyHeader } from "./StudioArtistStickyHeader";
import { StudioLoadError, StudioNotFound } from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { StudioTipModal } from "./StudioTipModal";
import { StudioVisitorPreviewBanner } from "./StudioVisitorPreviewBanner";
import { StudioVisitorPreviewProvider } from "./studioVisitorPreview";
import { artistTabsOf, type ArtistTabId } from "./studioArtist.data";
import { useStudioArtistVisitorPreview } from "./useStudioArtistVisitorPreview";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

export function StudioArtistPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const artistAddressId = searchParams.get("id");
  const { artist, loadState } = useStudioArtist(artistAddressId);
  const isShowcase = useStudioShowcase();
  const tabsId = useId();
  const [tab, setTab] = useState<ArtistTabId>("music");
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  // The top the edit sheet has highlighted; null draws the saved one.
  const [previewHero, setPreviewHero] = useState<StudioHeroChoice | null>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  // The hero's foot, held in state so the sticky header arms once it mounts.
  const [heroSentinel, setHeroSentinel] = useState<HTMLDivElement | null>(null);
  useStudioDocumentTitle(artist?.artist.name);
  // Stable, so the opener context does not hand the hero a new function on
  // every render. Each opening starts from the saved top.
  const openEditPage = useCallback(() => {
    setPreviewHero(null);
    setIsEditPageOpen(true);
  }, []);
  // Entering the visitor preview closes the edit sheet, which is owner-only.
  const closeEditPage = useCallback(() => setIsEditPageOpen(false), []);
  const { preview, viewArtist, exitVisitorPreview } =
    useStudioArtistVisitorPreview({
      addressKey: artistAddressId ?? "",
      artist,
      onEnter: closeEditPage,
    });

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
  if (!artist || !viewArtist)
    return (
      <StudioShell>
        <StudioDetailLoading label={t("studio:loading.artist")} rows={0} />
      </StudioShell>
    );

  const name = artist.artist.name;
  // The sheet mounts only for an owner, so a preview counts only while it is
  // up: if ownership drops mid-edit the hero goes back to the saved top.
  const isEditSheetShown = viewArtist.isOwner && isEditPageOpen;
  const heroArtist =
    isEditSheetShown && previewHero
      ? { ...viewArtist, heroLayout: previewHero }
      : viewArtist;
  // While the owner views as a visitor, every child below reads
  // `viewArtist`, the artist as a visitor receives it.
  return (
    <StudioShell>
      <StudioVisitorPreviewProvider value={preview}>
        <StudioArtistStickyHeader artist={viewArtist} sentinel={heroSentinel} />
        <StudioEditPageOpenerProvider
          value={viewArtist.isOwner ? openEditPage : null}
        >
          <StudioArtistHero
            artist={heroArtist}
            titleRef={titleRef}
            sentinelRef={setHeroSentinel}
            onTip={() => setIsTipOpen(true)}
          />
        </StudioEditPageOpenerProvider>
        <StudioTablist
          tabs={artistTabsOf(artist.artist.format)}
          activeId={tab}
          onChange={setTab}
          idPrefix={tabsId}
          label={t("studio:artistPage.tabsLabel", { name })}
        />
        {/* Every viewer gets a side column: an owner has their cards, and
            every other listener has Show me as a supporter. */}
        <section className={styles.detailGrid}>
          <div {...tabPanelProps(tabsId, tab)} className={kit.panel}>
            <StudioArtistMain tab={tab} artist={viewArtist} />
          </div>
          <div className={styles.sideCol}>
            {isShowcase && (
              <StudioArtistSidebar
                artistName={name}
                onTip={() => setIsTipOpen(true)}
              />
            )}
            <StudioArtistUpcomingCard artist={viewArtist} />
            <StudioArtistSupportCard artist={viewArtist} />
            <StudioArtistSupporterCard artist={viewArtist} />
          </div>
        </section>
        {/* The owner's tools sit under the tabs, so the page opens as the
            public sees it: releases, then the press kit and updates. */}
        {viewArtist.ownerReleases && (
          <StudioArtistOwnerPanel
            artist={viewArtist}
            onListEmptied={focusPageHeading}
          />
        )}
        {viewArtist.isOwner && <StudioArtistOwnerTools artist={viewArtist} />}
        {isEditSheetShown && (
          <StudioEditPageSheet
            artist={artist}
            onPreviewChange={setPreviewHero}
            onClose={() => setIsEditPageOpen(false)}
          />
        )}
        {isShowcase && isTipOpen && (
          <StudioTipModal
            recipient={name}
            onClose={() => setIsTipOpen(false)}
          />
        )}
        <StudioVisitorPreviewBanner
          isShown={preview.isVisitorPreview}
          onExit={exitVisitorPreview}
        />
      </StudioVisitorPreviewProvider>
    </StudioShell>
  );
}
