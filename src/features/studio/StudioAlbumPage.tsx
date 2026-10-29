import { useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Collapse, tabPanelProps } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReportListingModal } from "../economy/ReportListingModal";
import { isBuyPanelShown } from "./api/studioPurchases.adapters";
import { useStudioOffer } from "./api/useStudioOffer";
import { useStudioRelease } from "./api/useStudioRelease";
import { StudioAlbumBuyShortcut } from "./StudioAlbumBuyShortcut";
import { StudioAlbumHero } from "./StudioAlbumHero";
import { StudioAlbumMain } from "./StudioAlbumMain";
import { StudioAlbumMore } from "./StudioAlbumMore";
import { StudioDetailLoading } from "./StudioDetailLoading";
import { StudioReleaseStickyHeader } from "./StudioDetailSticky";
import { StudioLoadError, StudioNotFound } from "./StudioLoadStates";
import { useLastPresent } from "./StudioOfferState";
import { StudioReleaseBuyPanel } from "./StudioReleaseBuyPanel";
import { StudioReleaseSupportCard } from "./StudioReleaseSupportCard";
import { StudioReleaseVersions } from "./StudioReleaseVersions";
import { StudioReleaseWall } from "./StudioReleaseWall";
import { StudioShell } from "./StudioShell";
import { StudioShowPage } from "./StudioShowPage";
import { StudioWithdrawnView } from "./StudioWithdrawnView";
import { StudioTablist } from "./StudioTablist";
import { StudioUpcomingNote } from "./StudioUpcomingNote";
import { TABS, type AlbumTabId } from "./studioAlbum.data";
import { isSellableReleaseType } from "./studioPurchaseRules";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** A release (album, EP, single, mix, edit or lip-sync mix) at the route the
 *  Album page always had; a podcast show renders StudioShowPage. */
export function StudioAlbumPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { release, loadState } = useStudioRelease(searchParams.get("id"));
  const tabsId = useId();
  // The chosen tab belongs to one release: another release opens on its first tab.
  const [tabChoice, setTabChoice] = useState<{
    releaseId: string;
    tab: AlbumTabId;
  } | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  // The hero's foot, held in state so the sticky header arms once it mounts.
  const [heroSentinel, setHeroSentinel] = useState<HTMLDivElement | null>(null);
  useStudioDocumentTitle(release?.title);
  const shouldReadOffer =
    release !== null &&
    release.status === "published" &&
    !release.isPreview &&
    isSellableReleaseType(release.type);
  const { offer } = useStudioOffer("release", release?.id ?? null, {
    isEnabled: shouldReadOffer,
  });
  const buyPanelOffer = offer !== null && isBuyPanelShown(offer) ? offer : null;
  // Keeps the panel's words while it folds away.
  const shownBuyPanelOffer = useLastPresent(buyPanelOffer);
  const buyPanelRef = useRef<HTMLDivElement>(null);

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
          what="studio:errors.what.release"
        />
      </StudioShell>
    );
  if (!release)
    return (
      <StudioShell>
        <StudioDetailLoading label={t("studio:loading.release")} />
      </StudioShell>
    );

  // Studio artist kinds: a podcast show has its own page at the same route
  // (spec 5.2).
  if (release.type === "podcast")
    return (
      <StudioShell>
        <StudioShowPage
          release={release}
          onReport={() => setIsReporting(true)}
        />
        {isReporting && (
          <ReportListingModal
            subjectType="studio_release"
            subjectId={release.id}
            subjectName={release.title}
            onClose={() => setIsReporting(false)}
          />
        )}
      </StudioShell>
    );

  const isPublished = release.status === "published";
  // A tab shows only with something in it: a draft with no tracks and no
  // liner notes shows its hero and status line with no tablist.
  const visibleTabs = TABS.filter((tabItem) =>
    tabItem.id === "tracklist"
      ? release.tracks.length > 0
      : Boolean(release.description),
  );
  const chosenTab = tabChoice?.releaseId === release.id ? tabChoice.tab : null;
  const activeTab = visibleTabs.some((tabItem) => tabItem.id === chosenTab)
    ? (chosenTab ?? "tracklist")
    : (visibleTabs[0]?.id ?? "tracklist");
  // The side column holds the Buy panel, then the buy link and the support
  // links. It is decided from the release itself, so the grid holds still
  // when the offer arrives: a priced release keeps its column while the
  // offer loads, and the panel folds in.
  const hasSupport =
    release.buyLink !== null || release.supportLinks.length > 0;
  const hasBuyPanel = buyPanelOffer !== null;
  const isPricedForViewer = shouldReadOffer && release.price !== null;
  const hasSidebar =
    isPublished && (hasSupport || isPricedForViewer || hasBuyPanel);
  const isUpcomingForViewer = release.isUpcoming && !release.isOwner;
  return (
    <StudioShell>
      <StudioReleaseStickyHeader release={release} sentinel={heroSentinel} />
      <StudioAlbumHero
        release={release}
        sentinelRef={setHeroSentinel}
        onReport={() => setIsReporting(true)}
      />
      {hasSidebar && (
        <StudioAlbumBuyShortcut offer={buyPanelOffer} panelRef={buyPanelRef} />
      )}
      <StudioReleaseVersions release={release} />
      {isUpcomingForViewer && <StudioUpcomingNote release={release} />}
      {visibleTabs.length > 0 && (
        <StudioTablist
          tabs={visibleTabs}
          activeId={activeTab}
          onChange={(nextTab) =>
            setTabChoice({ releaseId: release.id, tab: nextTab })
          }
          idPrefix={tabsId}
          label={t("studio:release.tabsLabel", { title: release.title })}
        />
      )}
      {(visibleTabs.length > 0 || hasSidebar) && (
        <section className={hasSidebar ? styles.detailGrid : kit.detailSingle}>
          {visibleTabs.length > 0 && (
            <div {...tabPanelProps(tabsId, activeTab)} className={kit.panel}>
              <StudioAlbumMain tab={activeTab} release={release} />
            </div>
          )}
          {hasSidebar && (
            <div className={styles.sideCol}>
              <div ref={buyPanelRef} className={styles.buyPanelAnchor}>
                <Collapse isOpen={hasBuyPanel}>
                  <div className={styles.buyPanelFold}>
                    {shownBuyPanelOffer !== null && (
                      <StudioReleaseBuyPanel offer={shownBuyPanelOffer} />
                    )}
                  </div>
                </Collapse>
              </div>
              <StudioReleaseSupportCard release={release} />
            </div>
          )}
        </section>
      )}
      {isPublished && isSellableReleaseType(release.type) && (
        <StudioReleaseWall
          releaseId={release.id}
          releaseTitle={release.title}
        />
      )}
      <StudioAlbumMore release={release} />
      {isReporting && (
        <ReportListingModal
          subjectType="studio_release"
          subjectId={release.id}
          subjectName={release.title}
          onClose={() => setIsReporting(false)}
        />
      )}
    </StudioShell>
  );
}
