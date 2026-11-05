/**
 * The VJ projector at /admin/vj/screen. Before the show it shows the setup
 * card; from the first fullscreen on it shows only the stage (the clips, the
 * effects and the overlay text). It never shows the connection state: the
 * show keeps running when the socket drops, and a refusal arriving mid-show
 * changes nothing on screen. Only the lead screen strobes, so two projectors
 * in one room never flash out of step.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMaximize } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  createVjStageState,
  type VjStageRestore,
} from "../../../shared/contracts/vj";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo";
import { useFullscreen } from "../../quizshow/screen/useFullscreen";
import { useVjStage } from "../live/useVjStage";
import { useIsPointerIdle, VJ_CURSOR_IDLE_MS } from "./useIsPointerIdle";
import { useVjScreenDocumentFlag } from "./useVjScreenDocumentFlag";
import { useVjScreenPreload } from "./useVjScreenPreload";
import { useVjScreenProgram } from "./useVjScreenProgram";
import { useVjScreenRecordSync } from "./useVjScreenRecordSync";
import { useVjScreenStatusReport } from "./useVjScreenStatusReport";
import {
  useReleaseUnadoptedVjSource,
  useVjSourceUrlLedger,
  useVjTargetClip,
} from "./useVjTargetClip";
import { requestPersistentVjClipStorage } from "./vjClipCache";
import {
  readOrMintVjScreenId,
  readVjScreenRecord,
  vjStageRestoreOf,
} from "./vjScreenRecord";
import { VjScreenSetupCard } from "./VjScreenSetupCard";
import { VjStageRenderer } from "./VjStageRenderer";
import styles from "./VjScreen.module.css";

/** What the stage draws before any state exists: a black frame with the default look. */
const IDLE_STAGE_STATE = createVjStageState("vj-screen-idle", 0);
const FADE_SECONDS = 0.25;

/** The attach `restoreState`: the last look this screen saved. */
function readRestoreState(): VjStageRestore | null {
  const savedRecord = readVjScreenRecord();
  return savedRecord === null ? null : vjStageRestoreOf(savedRecord.state);
}

function readIsOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Composes the stage, the preload, the status report, the record and the program. */
function useVjScreenShow(isFullscreen: boolean) {
  const [record] = useState(readVjScreenRecord);
  const [screenId] = useState(readOrMintVjScreenId);
  const [isStartedOffline] = useState(readIsOffline);
  const stage = useVjStage({
    role: "screen",
    screenId,
    getRestoreState: readRestoreState,
  });
  const displayState = stage.state ?? record?.state ?? null;
  const packId = displayState?.activePackId ?? null;

  const preload = useVjScreenPreload({ packId, record, stage });
  useVjScreenStatusReport({
    stage,
    isFullscreen,
    packId,
    statuses: preload.statuses,
  });
  const liveClipId = stage.state?.liveClipId ?? null;
  const { clipById } = preload;
  const liveClip = useMemo(
    () => (liveClipId === null ? null : clipById(liveClipId)),
    [liveClipId, clipById],
  );
  useVjScreenRecordSync({
    state: stage.state,
    pack: preload.pack,
    clips: preload.clips,
    liveClip,
  });

  const program = useVjScreenProgram({
    state: displayState,
    isConnected: stage.isConnected,
    isLead: stage.isLead,
    readyClipIds: preload.readyClipIds,
    advance: stage.advance,
  });
  const ledger = useVjSourceUrlLedger();
  const target = useVjTargetClip({
    displayedClipId: program.displayedClipId,
    preload,
    ledger,
  });

  return {
    stage,
    displayState,
    preload,
    target,
    ledger,
    isOfflineStart: isStartedOffline && stage.state === null,
  };
}

/** After the first fullscreen: the one way back in, shown only while the pointer moves. */
function VjScreenReenterButton({
  isShown,
  fadeSeconds,
  onGoFullscreen,
}: {
  isShown: boolean;
  fadeSeconds: number;
  onGoFullscreen: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isShown ? (
        <m.div
          key="reenter"
          className={styles.reenterLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeSeconds }}
        >
          <Button variant="stage-ghost" size="sm" onClick={onGoFullscreen}>
            <FiMaximize aria-hidden="true" />
            {t("vj:screen.goFullscreen")}
          </Button>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

export function VjScreenPage(): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fadeSeconds = reducedMotion ? 0 : FADE_SECONDS;
  useVjScreenDocumentFlag();
  useScreenWakeLock(true);
  const fullscreen = useFullscreen();
  const { isFullscreen, isSupported, toggleFullscreen } = fullscreen;
  const isPointerIdle = useIsPointerIdle(VJ_CURSOR_IDLE_MS);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] =
    useState(isFullscreen);
  if (isFullscreen && !hasEnteredFullscreen) setHasEnteredFullscreen(true);

  const show = useVjScreenShow(isFullscreen);
  const { stage, preload, target, ledger } = show;
  useEffect(() => {
    // Asked once per mount, so Chrome keeps the clip cache between shows.
    void requestPersistentVjClipStorage();
  }, []);
  const stageState = show.displayState ?? IDLE_STAGE_STATE;
  const mainRef = useRef<HTMLElement>(null);
  useReleaseUnadoptedVjSource(mainRef, target, ledger);

  const goFullscreen = useCallback(() => {
    if (!isFullscreen) toggleFullscreen();
  }, [isFullscreen, toggleFullscreen]);

  return (
    <div
      className={styles.screen}
      data-cursor-hidden={isPointerIdle || undefined}
    >
      <PageMeta title={t("vj:screen.metaTitle")} noIndex />
      <main
        ref={mainRef}
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={styles.main}
      >
        <VjStageRenderer
          target={target}
          transition={stageState.transition}
          effects={stageState.effects}
          overlay={stageState.overlay}
          bpm={stageState.shuffle.bpm}
          isStrobeEnabled={stage.isLead}
          onClipFailed={preload.markDecodeFailed}
          onSourceReleased={ledger.release}
        />
        <AnimatePresence>
          {hasEnteredFullscreen ? null : (
            <m.div
              key="setup"
              className={styles.setupLayer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fadeSeconds }}
            >
              <VjScreenSetupCard
                pack={preload.pack}
                statuses={preload.statuses}
                isOfflineStart={show.isOfflineStart}
                refusal={stage.refusal}
                isFullscreenSupported={isSupported}
                onGoFullscreen={goFullscreen}
              />
            </m.div>
          )}
        </AnimatePresence>
        <VjScreenReenterButton
          isShown={
            hasEnteredFullscreen &&
            !isFullscreen &&
            !isPointerIdle &&
            isSupported
          }
          fadeSeconds={fadeSeconds}
          onGoFullscreen={goFullscreen}
        />
      </main>
    </div>
  );
}
