import { useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { tabPanelProps } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioArtist } from "./api/useStudioArtist";
import { StudioArtistHero } from "./StudioArtistHero";
import { StudioArtistMain } from "./StudioArtistMain";
import { StudioArtistOwnerPanel } from "./StudioArtistOwnerPanel";
import { StudioArtistSidebar } from "./StudioArtistSidebar";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { StudioTablist } from "./StudioTablist";
import { StudioTipModal } from "./StudioTipModal";
import { TABS, type ArtistTabId } from "./studioArtist.data";
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
        <StudioLoadError loadState={loadState} />
      </StudioShell>
    );
  if (!artist)
    return (
      <StudioShell>
        <StudioDetailSkeleton />
      </StudioShell>
    );

  const name = artist.artist.name;
  return (
    <StudioShell>
      <StudioArtistHero
        artist={artist}
        titleRef={titleRef}
        onTip={() => setIsTipOpen(true)}
      />
      {artist.ownerReleases && (
        <StudioArtistOwnerPanel
          artist={artist}
          onListEmptied={focusPageHeading}
        />
      )}
      <StudioTablist
        tabs={TABS}
        activeId={tab}
        onChange={setTab}
        idPrefix={tabsId}
        label={t("studio:artistPage.tabsLabel", { name })}
      />
      <section className={isShowcase ? styles.detailGrid : kit.detailSingle}>
        <div {...tabPanelProps(tabsId, tab)} className={kit.panel}>
          <StudioArtistMain tab={tab} artist={artist} />
        </div>
        {isShowcase && (
          <StudioArtistSidebar
            artistName={name}
            onTip={() => setIsTipOpen(true)}
          />
        )}
      </section>
      {isShowcase && isTipOpen && (
        <StudioTipModal recipient={name} onClose={() => setIsTipOpen(false)} />
      )}
    </StudioShell>
  );
}
