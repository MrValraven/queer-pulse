import { useEffect, useId, useRef } from "react";
import { tabPanelProps } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioTablist } from "../../StudioTablist";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import {
  useStudioPlayerSurface,
  type StudioNowPlayingTab,
} from "../studioPlayerSurface";
import { StudioNowPlayingPaneContent } from "./StudioNowPlayingPaneContent";
import { useNowPlayingIsTranscript } from "./useNowPlayingIsTranscript";
import styles from "./StudioNowPlaying.module.css";

const PANES: readonly { id: StudioNowPlayingTab; labelKey: string }[] = [
  { id: "lyrics", labelKey: "studio:nowPlaying.tab.lyrics" },
  { id: "queue", labelKey: "studio:nowPlaying.tab.queue" },
  { id: "credits", labelKey: "studio:nowPlaying.tab.credits" },
  { id: "chapters", labelKey: "studio:nowPlaying.tab.chapters" },
];

const TRANSCRIPT_LABEL_KEY = "studio:trackPage.transcriptHeading";

function PhonePanes({
  panes,
  activeTab,
  item,
  isTranscript,
}: {
  panes: typeof PANES;
  activeTab: StudioNowPlayingTab;
  item: StudioQueueItem;
  isTranscript: boolean;
}) {
  const { t } = useTranslation();
  const sectionRefs = useRef(new Map<StudioNowPlayingTab, HTMLElement>());
  // The pane the sheet last brought up. Opening on Lyrics leaves the sheet at
  // its top (the cover); opening on another pane (Q, the queue button) or a
  // later L or Q while open scrolls that pane into view. Comparing with the
  // last pane, so a StrictMode re-run scrolls nothing twice.
  const shownTabRef = useRef<StudioNowPlayingTab>("lyrics");
  useEffect(() => {
    if (shownTabRef.current === activeTab) return;
    shownTabRef.current = activeTab;
    sectionRefs.current.get(activeTab)?.scrollIntoView({ block: "start" });
  }, [activeTab]);
  return (
    <div className={styles.stack}>
      {panes.map((pane) => (
        <section
          key={pane.id}
          className={styles.paneSection}
          ref={(element) => {
            if (element) sectionRefs.current.set(pane.id, element);
            else sectionRefs.current.delete(pane.id);
          }}
        >
          <h2 className={styles.paneHeading}>{t(pane.labelKey)}</h2>
          <StudioNowPlayingPaneContent
            tab={pane.id}
            item={item}
            isTranscript={isTranscript}
          />
        </section>
      ))}
    </div>
  );
}

/** Lyrics, Queue, Credits and Chapters: tabs on desktop, stacked on phones. */
export function StudioNowPlayingPanes({
  item,
  isPhone,
}: {
  item: StudioQueueItem;
  isPhone: boolean;
}) {
  const { t } = useTranslation();
  const tabsId = useId();
  const { nowPlayingTab, setNowPlayingTab } = useStudioPlayerSurface();
  const player = useStudioPlayer();
  const hasChapters = (player.currentChapters?.length ?? 0) > 0;
  // An episode or a spoken word track names its words a transcript.
  const isTranscript = useNowPlayingIsTranscript(item);
  const panes = PANES.filter(
    (pane) => pane.id !== "chapters" || hasChapters,
  ).map((pane) =>
    pane.id === "lyrics" && isTranscript
      ? { ...pane, labelKey: TRANSCRIPT_LABEL_KEY }
      : pane,
  );
  const activeTab = panes.some((pane) => pane.id === nowPlayingTab)
    ? nowPlayingTab
    : "lyrics";
  // A track without chapters drops a Chapters choice left from the last
  // one, so the next track with chapters opens on Lyrics.
  useEffect(() => {
    if (!hasChapters && nowPlayingTab === "chapters")
      setNowPlayingTab("lyrics");
  }, [hasChapters, nowPlayingTab, setNowPlayingTab]);
  if (isPhone)
    return (
      <PhonePanes
        panes={panes}
        activeTab={activeTab}
        item={item}
        isTranscript={isTranscript}
      />
    );
  return (
    <div className={styles.panes}>
      <StudioTablist
        tabs={panes}
        activeId={activeTab}
        onChange={setNowPlayingTab}
        idPrefix={tabsId}
        label={t("studio:nowPlaying.tabsLabel")}
      />
      <div {...tabPanelProps(tabsId, activeTab)} className={styles.panel}>
        <StudioNowPlayingPaneContent
          tab={activeTab}
          item={item}
          isTranscript={isTranscript}
        />
      </div>
    </div>
  );
}
