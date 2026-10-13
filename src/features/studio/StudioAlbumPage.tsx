import { useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { tabPanelProps } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReportListingModal } from "../economy/ReportListingModal";
import { useStudioRelease } from "./api/useStudioRelease";
import { StudioAlbumHero } from "./StudioAlbumHero";
import { StudioAlbumMain } from "./StudioAlbumMain";
import { StudioAlbumMore } from "./StudioAlbumMore";
import { StudioAlbumSidebar } from "./StudioAlbumSidebar";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { StudioTipModal } from "./StudioTipModal";
import { TABS, type AlbumTabId } from "./studioAlbum.data";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** A release (album, EP, single or mix), at the route the Album page always had. */
export function StudioAlbumPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { release, loadState } = useStudioRelease(searchParams.get("id"));
  const isShowcase = useStudioShowcase();
  const tabsId = useId();
  // The chosen tab belongs to one release: another release opens on its first tab.
  const [tabChoice, setTabChoice] = useState<{
    releaseId: string;
    tab: AlbumTabId;
  } | null>(null);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

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
  if (!release)
    return (
      <StudioShell>
        <StudioDetailSkeleton />
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
  const hasSidebar = isShowcase && isPublished;
  return (
    <StudioShell>
      <StudioAlbumHero
        release={release}
        onTip={() => setIsTipOpen(true)}
        onReport={() => setIsReporting(true)}
      />
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
            <StudioAlbumSidebar
              artistName={release.artist.name}
              onTip={() => setIsTipOpen(true)}
            />
          )}
        </section>
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
      {isShowcase && isTipOpen && (
        <StudioTipModal
          recipient={release.artist.name}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
