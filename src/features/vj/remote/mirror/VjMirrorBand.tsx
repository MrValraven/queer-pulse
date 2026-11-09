import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiSkipForward } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type {
  VjClipDTO,
  VjEventCardDTO,
  VjQuantize,
} from "../../../../shared/contracts/vj";
import { Button } from "../../../../shared/components/ui/Button";
import type { TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjMirrorFrames } from "../hooks/useVjMirrorFrames";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import type { VjMirrorRing as VjMirrorRingValue } from "../rules/vjMirrorRing";
import type { VjNextUp } from "../rules/vjNextUp";
import { useVjHelpDescribedBy } from "../top/useVjHelpDescribedBy";
import {
  VjHelpLegend,
  VjHelpMarker,
  VjHelpShape,
  type VjHelpLegendItem,
} from "../top/VjHelpLegend";
import { VjMiniMirror } from "./VjMiniMirror";
import { VjMirrorRing } from "./VjMirrorRing";
import {
  vjMirrorLiveOf,
  vjMirrorNextCopy,
  vjMirrorPendingOf,
  vjMirrorQuantizeKey,
  type VjMirrorLive,
} from "./vjMirrorStyle";
import styles from "./VjMirror.module.css";

/** The app's ease token (--ease) at its base duration (--dur-base). */
const VJ_BAND_MOTION = { duration: 0.25, ease: [0.22, 0.68, 0.16, 1] as const };
const VJ_BAND_INSTANT = { duration: 0 };

/** The words for a clip, a generator or a black screen on the Live and Next lines. */
function vjMirrorLiveText(live: VjMirrorLive, t: TFunction): string {
  if (live.kind === "clip") return live.title;
  if (live.kind === "generator") {
    return t("vj:mirror.generatorLive", { name: t(live.nameKey) });
  }
  return t("vj:remote.nothingLive");
}

/** The mirror band's help legend: the mirror, the Live and Next lines, the ring and Skip. */
function useVjMirrorLegendItems({
  hasRing,
  canSkip,
}: {
  hasRing: boolean;
  canSkip: boolean;
}): VjHelpLegendItem[] {
  const { t } = useTranslation();
  const items: VjHelpLegendItem[] = [
    {
      id: "miniMirror",
      marker: <VjHelpMarker icon={<VjHelpShape kind="mirror" />} />,
      text: t("vj:help.miniMirror"),
    },
    {
      id: "nowPlaying",
      marker: <VjHelpMarker label={t("vj:mirror.live")} tone="live" />,
      text: t("vj:help.nowPlaying"),
    },
    {
      id: "nextUp",
      marker: <VjHelpMarker label={t("vj:mirror.next")} tone="mute" />,
      text: t("vj:help.nextUp"),
    },
  ];
  if (hasRing) {
    items.push({
      id: "shuffleTimer",
      marker: <VjHelpMarker icon={<VjHelpShape kind="ring" />} />,
      text: t("vj:help.shuffleTimer"),
    });
  }
  if (canSkip) {
    items.push({
      id: "skip",
      marker: (
        <VjHelpMarker
          icon={
            <FiSkipForward aria-hidden="true" focusable="false" fill="none" />
          }
        />
      ),
      text: t("vj:help.skip"),
    });
  }
  return items;
}

export interface VjMirrorBandProps {
  frames: VjMirrorFrames;
  clock: VjRemoteClock;
  liveClip: VjClipDTO | null;
  mixClip: VjClipDTO | null;
  /** The active pack's card: useVjPackEvent(activePackId, { isEnabled }).data?.card ?? null (R27 passes it). */
  eventCardData: VjEventCardDTO | null;
  nextUp: VjNextUp;
  nextUpTitle: string | null;
  /**
   * The clip `frames.pendingState.liveClipId` names, so the Next line can
   * name a quantized change while it waits; null or left out keeps the
   * next-up copy for a waiting clip.
   */
  pendingClip?: VjClipDTO | null;
  pendingQuantize: VjQuantize;
  ring: VjMirrorRingValue;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  canSkip: boolean;
  onSkip: () => void;
  isBlocked: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
}

/**
 * The sticky mirror band: the mini mirror of what the screens show now
 * (frames.shownState, so a quantized change shows only once its applyAt
 * lands), the Live and Next lines, the countdown ring and, with a lead
 * screen's next clip, a Skip button. 60px tall at phone width; the expanded
 * mirror takes the whole row and the lines move under it. While help
 * captions are on, a legend folds open under the band.
 */
export function VjMirrorBand({
  frames,
  clock,
  liveClip,
  mixClip,
  eventCardData,
  nextUp,
  nextUpTitle,
  pendingClip = null,
  pendingQuantize,
  ring,
  isExpanded,
  onToggleExpanded,
  canSkip,
  onSkip,
  isBlocked,
  blockedReasonId,
}: VjMirrorBandProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const motionTransition = reducedMotion ? VJ_BAND_INSTANT : VJ_BAND_MOTION;
  const helpDescribedBy = useVjHelpDescribedBy();
  const legendItems = useVjMirrorLegendItems({
    hasRing: ring.kind !== "none",
    canSkip,
  });
  const live = vjMirrorLiveOf(frames.shownState, liveClip);
  const liveText = vjMirrorLiveText(live, t);
  const quantizeKey =
    frames.pendingState !== null ? vjMirrorQuantizeKey(pendingQuantize) : null;
  // While a quantized change waits, Next names what lands on the beat or bar.
  const pending =
    quantizeKey === null
      ? null
      : vjMirrorPendingOf(frames.shownState, frames.pendingState, pendingClip);
  const nextCopy = vjMirrorNextCopy(nextUp, nextUpTitle);
  const nextText =
    pending === null
      ? t(nextCopy.key, nextCopy.values)
      : vjMirrorLiveText(pending, t);
  const fadeMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: motionTransition,
  };

  return (
    <>
      <div
        className={styles.band}
        data-vj-mirror-band=""
        data-expanded={isExpanded ? "true" : "false"}
      >
        <VjMiniMirror
          shownState={frames.shownState}
          clock={clock}
          liveClip={liveClip}
          mixClip={mixClip}
          eventCardData={eventCardData}
          isExpanded={isExpanded}
          onToggleExpanded={onToggleExpanded}
          toggleDescribedBy={helpDescribedBy("miniMirror")}
        />
        <m.div
          layout="position"
          transition={{ layout: motionTransition }}
          className={styles.lines}
        >
          <p className={styles.line} data-vj-mirror-live={live.kind}>
            <span className={styles.lineLabel} data-tone="live">
              {t("vj:mirror.live")}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={liveText}
                className={styles.lineText}
                {...fadeMotion}
              >
                {liveText}
              </m.span>
            </AnimatePresence>
          </p>
          <p
            className={styles.line}
            data-vj-mirror-next={pending === null ? nextUp.kind : "pending"}
          >
            <span className={styles.lineLabel}>{t("vj:mirror.next")}</span>
            <AnimatePresence initial={false}>
              {quantizeKey !== null ? (
                <m.span
                  key={quantizeKey}
                  className={styles.pendingChip}
                  data-vj-mirror-pending={pendingQuantize}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={motionTransition}
                >
                  {t(quantizeKey)}
                </m.span>
              ) : null}
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={nextText}
                className={styles.lineText}
                {...fadeMotion}
              >
                {nextText}
              </m.span>
            </AnimatePresence>
          </p>
        </m.div>
        <m.div
          layout="position"
          transition={{ layout: motionTransition }}
          className={styles.ringCell}
        >
          <VjMirrorRing ring={ring} />
        </m.div>
        <AnimatePresence initial={false}>
          {canSkip ? (
            <m.div
              key="skip"
              className={styles.skipCell}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={motionTransition}
            >
              <Button
                variant="stage-ghost"
                className={styles.skip}
                aria-label={t("vj:mirror.skip")}
                aria-disabled={isBlocked}
                aria-describedby={helpDescribedBy(
                  "skip",
                  isBlocked ? blockedReasonId : undefined,
                )}
                data-vj-mirror-skip=""
                onClick={() => {
                  if (isBlocked) return;
                  onSkip();
                }}
              >
                <FiSkipForward
                  aria-hidden="true"
                  focusable="false"
                  fill="none"
                />
              </Button>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
      <VjHelpLegend items={legendItems} placement="afterInGap" />
    </>
  );
}
