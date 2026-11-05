import {
  useCallback,
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type JSX,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { routes } from "../../../app/routeMap";
import type {
  VjClipDTO,
  VjPackDTO,
  VjScreenStatus,
  VjStageState,
} from "../../../shared/contracts/vj";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui/Button";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { useQuizshowFramelessPage } from "../../quizshow/useQuizshowFramelessPage";
import { QuizshowBackdrop } from "../../quizshow/stage/QuizshowBackdrop";
import { useInvalidateVjLibrary } from "../api/useInvalidateVjLibrary";
import { useVjClips } from "../api/useVjClips";
import { useVjPackClips } from "../api/useVjPackClips";
import { useVjPacks } from "../api/useVjPacks";
import { useVjStage, type VjStageController } from "../live/useVjStage";
import { useVjCommandRunner, type VjCommandName } from "./useVjCommandRunner";
import { vjRemoteOfflineReasonOf } from "./vjRemoteOffline";
import { VjEffectsSheet } from "./VjEffectsSheet";
import { VjRemoteClipGrid } from "./VjRemoteClipGrid";
import { VjRemoteControlBar, type VjRemoteSheet } from "./VjRemoteControlBar";
import { VjRemoteLiveStrip } from "./VjRemoteLiveStrip";
import { VjRemoteStatusLine } from "./VjRemoteStatusLine";
import { VjShuffleSheet } from "./VjShuffleSheet";
import { VjTextSheet } from "./VjTextSheet";
import styles from "./VjRemote.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const NO_PACKS: readonly VjPackDTO[] = [];
const NO_CLIPS: readonly VjClipDTO[] = [];
const VIEW_FADE_SECONDS = 0.2;

/**
 * The library the remote reads: the packs, the active pack's clips and the
 * live clip (from the active pack, else from every clip). Each
 * `library:changed` the stage passes on marks the library stale.
 */
function useVjRemoteLibrary(stage: VjStageController) {
  const packsQuery = useVjPacks();
  const activePackId = stage.state?.activePackId ?? null;
  const liveClipId = stage.state?.liveClipId ?? null;
  const packClipsQuery = useVjPackClips(activePackId);
  const packClips = packClipsQuery.data?.items ?? NO_CLIPS;
  const isLiveInPack =
    liveClipId !== null && packClips.some((clip) => clip.id === liveClipId);
  const libraryClipsQuery = useVjClips({
    isEnabled: liveClipId !== null && !isLiveInPack,
  });
  const invalidateLibrary = useInvalidateVjLibrary();
  const { subscribeLibrary } = stage;

  useEffect(
    () => subscribeLibrary(invalidateLibrary),
    [subscribeLibrary, invalidateLibrary],
  );

  const liveClip =
    liveClipId === null
      ? null
      : (packClips.find((clip) => clip.id === liveClipId) ??
        libraryClipsQuery.data?.find((clip) => clip.id === liveClipId) ??
        null);

  return {
    packs: packsQuery.data ?? NO_PACKS,
    hasLoadedPacks: packsQuery.data !== undefined,
    activePackId,
    activePackName: packClipsQuery.data?.pack.name ?? null,
    packClips,
    hasLoadedPackClips: packClipsQuery.data !== undefined,
    liveClip,
  };
}

type VjClipsView = "loading" | "noPacks" | "pickPack" | "packEmpty" | "grid";

function clipsViewOf(
  library: ReturnType<typeof useVjRemoteLibrary>,
): VjClipsView {
  if (!library.hasLoadedPacks) return "loading";
  if (library.packs.length === 0) return "noPacks";
  if (library.activePackId === null) return "pickPack";
  if (!library.hasLoadedPackClips) return "loading";
  return library.packClips.length === 0 ? "packEmpty" : "grid";
}

const CLIPS_MESSAGE_KEY: Partial<Record<VjClipsView, string>> = {
  noPacks: "vj:remote.noPacks",
  pickPack: "vj:remote.pickPackHint",
  packEmpty: "vj:remote.packEmpty",
};

interface VjRemoteClipsProps {
  library: ReturnType<typeof useVjRemoteLibrary>;
  state: VjStageState | null;
  screens: readonly VjScreenStatus[];
  isBlocked: boolean;
  onGoClip: (clipId: string) => void;
}

/** The clip grid, or the line that says why there is none, swapped with a fade. */
function VjRemoteClips({
  library,
  state,
  screens,
  isBlocked,
  onGoClip,
}: VjRemoteClipsProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const view: VjClipsView = clipsViewOf(library);
  const messageKey = CLIPS_MESSAGE_KEY[view];

  return (
    <section
      className={styles.clips}
      aria-labelledby="vj-remote-clips"
      aria-busy={view === "loading"}
    >
      <h2 id="vj-remote-clips" className={styles.sectionTitle}>
        {library.activePackName ?? t("vj:remote.packLabel")}
      </h2>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : VIEW_FADE_SECONDS }}
        >
          {view === "grid" ? (
            <VjRemoteClipGrid
              clips={library.packClips}
              liveClipId={state?.liveClipId ?? null}
              packId={library.activePackId}
              screens={screens}
              isBlocked={isBlocked}
              onGoClip={onGoClip}
            />
          ) : null}
          {messageKey !== undefined ? (
            <p className={styles.clipsMessage}>{t(messageKey)}</p>
          ) : null}
        </m.div>
      </AnimatePresence>
    </section>
  );
}

interface VjRemoteSheetsProps {
  openSheet: VjRemoteSheet | null;
  state: VjStageState | null;
  liveClip: VjClipDTO | null;
  run: VjRun;
  isPending: (name: VjCommandName) => boolean;
  isBlocked: boolean;
  onClose: () => void;
}

/** The Effects, Text and Shuffle sheets, one at a time, each animating in and out. */
function VjRemoteSheets({
  openSheet,
  state,
  liveClip,
  run,
  isPending,
  isBlocked,
  onClose,
}: VjRemoteSheetsProps): JSX.Element {
  return (
    <AnimatePresence>
      {state !== null && openSheet === "effects" ? (
        <VjEffectsSheet
          key="effects"
          state={state}
          liveClipMediaKind={liveClip?.mediaKind ?? null}
          run={run}
          isPending={isPending}
          isBlocked={isBlocked}
          onClose={onClose}
        />
      ) : null}
      {state !== null && openSheet === "text" ? (
        <VjTextSheet
          key="text"
          overlay={state.overlay}
          run={run}
          isBlocked={isBlocked}
          onClose={onClose}
        />
      ) : null}
      {state !== null && openSheet === "shuffle" ? (
        <VjShuffleSheet
          key="shuffle"
          shuffle={state.shuffle}
          run={run}
          isBlocked={isBlocked}
          onClose={onClose}
        />
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Keeps keyboard focus clear of the fixed control bar: the document scrolls
 * a focused control up past the bar's measured height.
 */
function useScrollPaddingForBar(barHeight: number): void {
  useEffect(() => {
    if (barHeight <= 0) return undefined;
    const rootStyle = document.documentElement.style;
    const previous = rootStyle.scrollPaddingBlockEnd;
    rootStyle.scrollPaddingBlockEnd = `${barHeight}px`;
    return () => {
      rootStyle.scrollPaddingBlockEnd = previous;
    };
  }, [barHeight]);
}

/**
 * The VJ remote at /admin/vj/remote: phone first, in the dark Pulse Live
 * remote look. A live mirror of the screen, how many screens are live, the
 * pack picker, the clip grid with each clip's preload state, and the fixed
 * control bar with its sheets.
 */
export function AdminVjRemotePage(): JSX.Element {
  const { t } = useTranslation();
  useQuizshowFramelessPage();
  const stage = useVjStage({ role: "remote" });
  const isOnline = useOnlineStatus();
  const offlineReason = vjRemoteOfflineReasonOf(stage, isOnline);
  const isBlocked = offlineReason !== null;
  const { run, isPending, lastErrorKey } = useVjCommandRunner(stage);
  const library = useVjRemoteLibrary(stage);
  const [openSheet, setOpenSheet] = useState<VjRemoteSheet | null>(null);
  const [barHeight, setBarHeight] = useState(0);
  const statusLineId = useId();
  useScrollPaddingForBar(barHeight);
  const closeSheet = useCallback(() => setOpenSheet(null), []);
  // Every tap is sent: commandSequence makes the last one win, and the
  // server applies one socket's commands in order.
  const goClip = (clipId: string) => {
    if (isBlocked) return;
    void run("goClip", clipId);
  };
  // The measured control bar, so the last section always clears it; 0 keeps the CSS fallback.
  const pageStyle =
    barHeight > 0
      ? ({ "--vj-remote-bar-space": `${barHeight}px` } as CSSProperties)
      : undefined;

  return (
    <div
      className={styles.page}
      style={pageStyle}
      data-theme="dark"
      data-vj-remote=""
    >
      <div className={styles.backdrop}>
        <QuizshowBackdrop variant="phone" />
      </div>
      <PageMeta title={t("vj:remote.metaTitle")} noIndex />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
        <header className={styles.header}>
          <Button variant="stage-ghost" to={routes.adminVj}>
            <FiArrowLeft aria-hidden="true" focusable="false" />
            {t("vj:remote.backToLibrary")}
          </Button>
          <h1 className={styles.title}>{t("vj:remote.metaTitle")}</h1>
        </header>
        <VjRemoteLiveStrip
          state={stage.state}
          liveClip={library.liveClip}
          screens={stage.screens}
          packs={library.packs}
          isBlocked={isBlocked}
          isScreensKnown={offlineReason === null}
          blockedReasonId={isBlocked ? statusLineId : undefined}
          run={run}
        />
        <VjRemoteClips
          library={library}
          state={stage.state}
          screens={stage.screens}
          isBlocked={isBlocked}
          onGoClip={goClip}
        />
      </main>
      <VjRemoteControlBar
        state={stage.state}
        isBlocked={isBlocked}
        run={run}
        isPending={isPending}
        onOpenSheet={setOpenSheet}
        onHeightChange={setBarHeight}
        statusLine={
          <VjRemoteStatusLine
            id={statusLineId}
            offlineReason={offlineReason}
            errorKey={lastErrorKey}
          />
        }
      />
      <VjRemoteSheets
        openSheet={openSheet}
        state={stage.state}
        liveClip={library.liveClip}
        run={run}
        isPending={isPending}
        isBlocked={isBlocked}
        onClose={closeSheet}
      />
    </div>
  );
}
