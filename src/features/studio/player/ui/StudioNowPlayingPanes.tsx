import { useEffect, useId, useRef } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  SegmentedControl,
  tabPanelProps,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import { StudioTablist } from "../../StudioTablist";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import {
  useStudioPlayerSurface,
  type StudioNowPlayingTab,
} from "../studioPlayerSurface";
import { StudioNowPlayingPaneContent } from "./StudioNowPlayingPaneContent";
import {
  useIsStuck,
  useNowPlayingActiveTab,
  usePanelHoldsFocusables,
} from "./StudioNowPlayingPaneState";
import { useNowPlayingIsTranscript } from "./useNowPlayingIsTranscript";
import styles from "./StudioNowPlaying.module.css";

const PANES: readonly { id: StudioNowPlayingTab; labelKey: string }[] = [
  { id: "lyrics", labelKey: "studio:nowPlaying.tab.lyrics" },
  { id: "queue", labelKey: "studio:nowPlaying.tab.queue" },
  { id: "credits", labelKey: "studio:nowPlaying.tab.credits" },
  { id: "chapters", labelKey: "studio:nowPlaying.tab.chapters" },
];

const TRANSCRIPT_LABEL_KEY = "studio:trackPage.transcriptHeading";

/** Phones lead with the queue, so it is one tap from the cover. */
const PHONE_ORDER: readonly StudioNowPlayingTab[] = [
  "queue",
  "lyrics",
  "credits",
  "chapters",
];

/** The pane's arrival: a short fade with a small rise, a fade alone under
 *  reduced motion. */
function usePaneMotion() {
  const { reducedMotion } = useMotionPrefs();
  const rise = reducedMotion ? 0 : 6;
  return {
    initial: { opacity: 0, y: rise },
    animate: {
      opacity: 1,
      y: 0,
      transition: reducedMotion ? { duration: 0.12 } : STUDIO_FADE,
    },
    exit: {
      opacity: 0,
      y: -rise,
      transition: reducedMotion ? { duration: 0.12 } : STUDIO_EXIT,
    },
  };
}

/** Phones: a Queue, Lyrics and Credits switcher above one pane at a time
 *  (DES-19), so the queue never sits below a long lyric list. A pane chosen
 *  from outside (the Q key, a queue button) scrolls the switcher into view;
 *  one chosen on the switcher stays where the finger is, and so does the
 *  queue standing in for a track with no words. */
function PhonePanes({
  panes,
  activeTab,
  requestedTab,
  onChange,
  item,
  isTranscript,
}: {
  panes: typeof PANES;
  activeTab: StudioNowPlayingTab;
  requestedTab: StudioNowPlayingTab;
  onChange: (tab: StudioNowPlayingTab) => void;
  item: StudioQueueItem;
  isTranscript: boolean;
}) {
  const { t } = useTranslation();
  const paneMotion = usePaneMotion();
  const switcherRef = useRef<HTMLDivElement>(null);
  const isSwitcherStuck = useIsStuck(switcherRef);
  // Opening leaves the sheet at its top (the cover). Compared with the last
  // pane asked for, so a StrictMode re-run scrolls nothing twice.
  const shownTabRef = useRef<StudioNowPlayingTab>(requestedTab);
  useEffect(() => {
    if (shownTabRef.current === requestedTab) return;
    shownTabRef.current = requestedTab;
    switcherRef.current?.scrollIntoView({ block: "start" });
  }, [requestedTab]);
  const orderedPanes = PHONE_ORDER.flatMap(
    (id) => panes.find((pane) => pane.id === id) ?? [],
  );
  const activePane =
    orderedPanes.find((pane) => pane.id === activeTab) ?? orderedPanes[0];
  return (
    <div className={styles.phonePanes} data-lyrics-scroll-chain="">
      <div
        ref={switcherRef}
        className={styles.switcher}
        data-stuck={isSwitcherStuck || undefined}
      >
        <SegmentedControl
          fullWidth
          label={t("studio:nowPlaying.tabsLabel")}
          options={orderedPanes.map((pane) => ({
            value: pane.id,
            label: t(pane.labelKey),
          }))}
          value={activeTab}
          onChange={(value) => {
            const tab = value as StudioNowPlayingTab;
            shownTabRef.current = tab;
            onChange(tab);
          }}
        />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {activePane && (
          <m.section
            key={activePane.id}
            className={styles.paneSection}
            {...paneMotion}
          >
            <h2 className="visuallyHidden">{t(activePane.labelKey)}</h2>
            <StudioNowPlayingPaneContent
              tab={activePane.id}
              item={item}
              isTranscript={isTranscript}
            />
          </m.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Lyrics, Queue, Credits and Chapters: tabs on desktop, a switcher on
 *  phones. */
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
  const { activeTab, requestedTab, choose } = useNowPlayingActiveTab({
    item,
    paneIds: panes.map((pane) => pane.id),
    nowPlayingTab,
    setNowPlayingTab,
  });
  const paneMotion = usePaneMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const holdsFocusables = usePanelHoldsFocusables(panelRef, isPhone);
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
        requestedTab={requestedTab}
        onChange={choose}
        item={item}
        isTranscript={isTranscript}
      />
    );
  return (
    <div className={styles.panes} data-now-playing-panes="">
      <StudioTablist
        tabs={panes}
        activeId={activeTab}
        onChange={choose}
        idPrefix={tabsId}
        label={t("studio:nowPlaying.tabsLabel")}
      />
      <div
        ref={panelRef}
        {...tabPanelProps(tabsId, activeTab)}
        // Rows inside take Tab themselves; an empty pane keeps its stop.
        tabIndex={holdsFocusables ? undefined : 0}
        className={styles.panel}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={activeTab} {...paneMotion}>
            <StudioNowPlayingPaneContent
              tab={activeTab}
              item={item}
              isTranscript={isTranscript}
            />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
