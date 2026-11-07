/**
 * The VJ projector at /admin/vj/screen. Before the show it shows the setup
 * card; from the first fullscreen on it shows only the stage (the WebGL
 * compositor or the DOM renderer), the crisp overlay layer over it and, when
 * the remote asks, this screen's number. It never shows the connection
 * state: the show keeps running when the socket drops, and a refusal arriving
 * mid-show changes nothing on screen. Only the lead screen strobes, so two
 * projectors in one room never flash out of step.
 */
import { useCallback, useEffect, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMaximize } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { createVjStageState } from "../../../shared/contracts/vj";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo";
import { useFullscreen } from "../../quizshow/screen/useFullscreen";
import { VjOverlayLayer } from "./overlay/VjOverlayLayer";
import { VjScreenIdentify } from "./overlay/VjScreenIdentify";
import { useIsPointerIdle, VJ_CURSOR_IDLE_MS } from "./useIsPointerIdle";
import { useVjScreenDocumentFlag } from "./useVjScreenDocumentFlag";
import { useVjScreenShow, type VjScreenShow } from "./useVjScreenShow";
import { requestPersistentVjClipStorage } from "./vjClipCache";
import { VjScreenSetupCard } from "./VjScreenSetupCard";
import { VjScreenStage } from "./VjScreenStage";
import styles from "./VjScreen.module.css";

/** What the stage draws before any state exists: a black frame with the default look. */
const IDLE_STAGE_STATE = createVjStageState("vj-screen-idle", 0);
const FADE_SECONDS = 0.25;

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

/** The visuals, bottom to top: the stage, the overlay layer, the screen number. */
function VjScreenVisuals({ show }: { show: VjScreenShow }): JSX.Element {
  const { stage, preload, ledger } = show;
  const stageState = show.displayState ?? IDLE_STAGE_STATE;
  return (
    <>
      <VjScreenStage
        state={stageState}
        upcoming={show.upcoming}
        live={show.live}
        upcomingLive={show.upcomingLive}
        mix={show.mix}
        upcomingMix={show.upcomingMix}
        isStrobeEnabled={stage.isLead}
        clock={show.clock}
        micLevelRef={show.mic.levelRef}
        handleRef={show.handleRef}
        onClipFailed={preload.markDecodeFailed}
        onSourceReleased={ledger.release}
        onRendererChange={show.onRendererChange}
        onHealth={show.onHealth}
      />
      <VjOverlayLayer
        overlay={stageState.overlay}
        countdown={stageState.countdown}
        logo={stageState.logo}
        eventCard={stageState.eventCard}
        eventCardData={show.eventCard.card}
        clock={show.clock}
        size="screen"
      />
      <VjScreenIdentify identify={show.identify} />
    </>
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
  const { stage, preload } = show;
  useEffect(() => {
    // Asked once per mount, so Chrome keeps the clip cache between shows.
    void requestPersistentVjClipStorage();
  }, []);

  const goFullscreen = useCallback(() => {
    if (!isFullscreen) toggleFullscreen();
  }, [isFullscreen, toggleFullscreen]);

  return (
    <div
      className={styles.screen}
      data-cursor-hidden={isPointerIdle || undefined}
    >
      <PageMeta title={t("vj:screen.metaTitle")} noIndex />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
        <VjScreenVisuals show={show} />
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
                renderer={show.renderer}
                health={show.health}
                eventCard={show.eventCard}
                mic={show.mic}
                isLead={stage.isLead}
                tempoSource={show.displayState?.tempo.source ?? null}
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
