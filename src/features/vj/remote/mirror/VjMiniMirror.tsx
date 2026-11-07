import { useMemo, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMonitor, FiZap } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type {
  VjClipDTO,
  VjEventCardDTO,
  VjStageState,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { vjClockReaderOf } from "../../engine/vjEngineLook";
import { VjEffectsFrame } from "../../screen/VjEffectsFrame";
import { VjOverlayLayer } from "../../screen/overlay/VjOverlayLayer";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import { useVjSyncedNow } from "../hooks/useVjSyncedNow";
import {
  vjMirrorClipFor,
  vjMirrorUndrawnCount,
  vjStrobeSecondsLeft,
} from "./vjMirrorStyle";
import styles from "./VjMirror.module.css";

/** The app's ease token (--ease) at its base duration (--dur-base). */
const VJ_MIRROR_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_MIRROR_FADE = { duration: 0.25, ease: VJ_MIRROR_EASE };
const VJ_MIRROR_INSTANT = { duration: 0 };

/** The engine's clock reader, typed from the one adapter the mirror imports. */
type VjMirrorClockReader = ReturnType<typeof vjClockReaderOf>;

interface VjMirrorFade {
  duration: number;
  ease?: typeof VJ_MIRROR_EASE;
}

interface VjMirrorPictureProps {
  shownState: VjStageState;
  clockReader: VjMirrorClockReader;
  liveClip: VjClipDTO | null;
  mixClip: VjClipDTO | null;
  fade: VjMirrorFade;
}

/**
 * The picture under the engine's DOM effects frame: the live clip's
 * thumbnail or the generator's swatch, the mix clip on top at the
 * crossfader's amount, then the blackout as a still black layer. The strobe
 * stays off here, so the mirror never flashes.
 */
function VjMirrorPicture({
  shownState,
  clockReader,
  liveClip,
  mixClip,
  fade,
}: VjMirrorPictureProps): JSX.Element {
  const settings = shownState.effects.settings;
  const frameEffects = useMemo(
    () => ({ settings, isStrobing: false }),
    [settings],
  );
  const shownClip = vjMirrorClipFor(liveClip, shownState.liveClipId);
  const generatorId = shownState.liveGeneratorId;
  const mix = shownState.mix;
  const shownMixClip =
    mix.amount > 0 ? vjMirrorClipFor(mixClip, mix.clipId) : null;
  const sourceKey = shownClip?.id ?? generatorId ?? "black";

  return (
    <>
      <VjEffectsFrame
        effects={frameEffects}
        tempo={shownState.tempo}
        clock={clockReader}
      >
        <AnimatePresence initial={false}>
          <m.div
            key={sourceKey}
            className={styles.source}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {shownClip !== null ? (
              <img
                className={styles.thumbnail}
                src={shownClip.thumbnailUrl}
                alt=""
                width={shownClip.width}
                height={shownClip.height}
                data-fit={shownClip.fitMode}
                data-vj-mirror-clip={shownClip.id}
              />
            ) : null}
            {shownClip === null && generatorId !== null ? (
              <div
                className={styles.generator}
                data-generator={generatorId}
                data-generator-variant={
                  shownState.liveGeneratorVariant ?? undefined
                }
                data-vj-mirror-generator={generatorId}
              />
            ) : null}
          </m.div>
        </AnimatePresence>
        {shownMixClip !== null ? (
          <img
            className={styles.mixThumbnail}
            src={shownMixClip.thumbnailUrl}
            alt=""
            width={shownMixClip.width}
            height={shownMixClip.height}
            style={{ opacity: mix.amount }}
            data-blend={mix.blendMode}
            data-fit={shownMixClip.fitMode}
            data-vj-mirror-mix={shownMixClip.id}
          />
        ) : null}
      </VjEffectsFrame>
      <AnimatePresence initial={false}>
        {shownState.effects.isBlackout ? (
          <m.div
            key="blackout"
            className={styles.blackout}
            data-vj-mirror-blackout=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

interface VjMirrorChipsProps {
  shownState: VjStageState;
  clock: VjRemoteClock;
  isExpanded: boolean;
  fade: VjMirrorFade;
}

/**
 * Two chips over the picture: the strobe with its seconds left (the mirror
 * shows the strobe as words), and how many effects only the WebGL engine on
 * the projector draws. The small mirror shows the count; the large one says
 * it in full.
 */
function VjMirrorChips({
  shownState,
  clock,
  isExpanded,
  fade,
}: VjMirrorChipsProps): JSX.Element {
  const { t } = useTranslation();
  const effects = shownState.effects;
  const serverNow = useVjSyncedNow(clock, { isEnabled: effects.isStrobing });
  const strobeSeconds = vjStrobeSecondsLeft(effects, serverNow);
  const undrawnCount = vjMirrorUndrawnCount(effects.settings);
  const undrawnSentence = t("vj:mirror.projectorOnly", {
    count: undrawnCount,
  });
  const chipMotion = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: fade,
  };

  return (
    <AnimatePresence initial={false}>
      {effects.isStrobing ? (
        <m.p
          key="strobe"
          className={styles.strobeChip}
          data-vj-strobe-chip=""
          {...chipMotion}
        >
          <FiZap aria-hidden="true" focusable="false" fill="none" />
          <span className={isExpanded ? undefined : "visuallyHidden"}>
            {t("vj:effects.strobe")}
          </span>
          <span className={styles.chipNumber}>
            {t("vj:effects.strobeRemaining", { seconds: strobeSeconds })}
          </span>
        </m.p>
      ) : null}
      {undrawnCount > 0 ? (
        <m.p
          key="undrawn"
          className={styles.undrawnChip}
          data-vj-mirror-undrawn={undrawnCount}
          {...chipMotion}
        >
          <FiMonitor aria-hidden="true" focusable="false" fill="none" />
          {isExpanded ? (
            <span>{undrawnSentence}</span>
          ) : (
            <>
              <span className={styles.chipNumber} aria-hidden="true">
                {undrawnCount}
              </span>
              <span className="visuallyHidden">{undrawnSentence}</span>
            </>
          )}
        </m.p>
      ) : null}
    </AnimatePresence>
  );
}

export interface VjMiniMirrorProps {
  shownState: VjStageState | null;
  clock: VjRemoteClock;
  liveClip: VjClipDTO | null;
  mixClip: VjClipDTO | null;
  eventCardData: VjEventCardDTO | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * The 16:9 mirror of what the screens show now. It draws through the
 * projector's own DOM pieces (VjEffectsFrame, VjOverlayLayer at size
 * "mirror"), so effects, text, countdown, logo and event card match the
 * screens' DOM path. A tap grows it to the full row and a second tap shrinks
 * it, through a layout animation.
 */
export function VjMiniMirror({
  shownState,
  clock,
  liveClip,
  mixClip,
  eventCardData,
  isExpanded,
  onToggleExpanded,
}: VjMiniMirrorProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fade = reducedMotion ? VJ_MIRROR_INSTANT : VJ_MIRROR_FADE;
  const clockReader = useMemo(() => vjClockReaderOf(clock), [clock]);

  return (
    <m.div
      layout
      transition={{ layout: fade }}
      className={styles.mirror}
      data-vj-mini-mirror=""
      data-expanded={isExpanded ? "true" : "false"}
    >
      {shownState !== null ? (
        <>
          <VjMirrorPicture
            shownState={shownState}
            clockReader={clockReader}
            liveClip={liveClip}
            mixClip={mixClip}
            fade={fade}
          />
          <VjOverlayLayer
            overlay={shownState.overlay}
            countdown={shownState.countdown}
            logo={shownState.logo}
            eventCard={shownState.eventCard}
            eventCardData={eventCardData}
            clock={clockReader}
            size="mirror"
          />
          <VjMirrorChips
            shownState={shownState}
            clock={clock}
            isExpanded={isExpanded}
            fade={fade}
          />
        </>
      ) : null}
      <button
        type="button"
        className={styles.mirrorToggle}
        aria-expanded={isExpanded}
        aria-label={t(isExpanded ? "vj:mirror.collapse" : "vj:mirror.expand")}
        onClick={onToggleExpanded}
      />
    </m.div>
  );
}
