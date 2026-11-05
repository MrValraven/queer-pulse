import { useEffect, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiXCircle, FiZap } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjEffects,
  type VjPackDTO,
  type VjScreenStatus,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { Button } from "../../../shared/components/ui/Button";
import { Select } from "../../../shared/components/ui/Select";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  summariseVjScreens,
  vjScreensSummaryKey,
} from "../live/vjScreensSummary";
import { VjEffectsFrame } from "../screen/VjEffectsFrame";
import { VjOverlayText } from "../screen/VjOverlayText";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import styles from "./VjRemote.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const STROBE_TICK_MS = 250;
const MIRROR_FADE_SECONDS = 0.25;

/** Whole seconds left of the server's 10 s strobe, from its start time. */
function strobeSecondsLeftAt(effects: VjEffects, now: number): number {
  if (!effects.isStrobing || effects.strobeStartedAt === null) return 0;
  const endsAt = effects.strobeStartedAt + VJ_LIMITS.strobeMaxDurationMs;
  const secondsLeft = Math.ceil((endsAt - now) / 1000);
  const maxSeconds = VJ_LIMITS.strobeMaxDurationMs / 1000;
  return Math.min(maxSeconds, Math.max(0, secondsLeft));
}

function useStrobeSecondsLeft(effects: VjEffects | null): number {
  const [now, setNow] = useState(() => Date.now());
  const isStrobing = effects?.isStrobing ?? false;
  useEffect(() => {
    if (!isStrobing) return undefined;
    // The first tick lands within 250 ms; until then the count reads from the
    // last tick, clamped to the 10 s the strobe can run.
    const timer = setInterval(() => setNow(Date.now()), STROBE_TICK_MS);
    return () => clearInterval(timer);
  }, [isStrobing]);
  return effects === null ? 0 : strobeSecondsLeftAt(effects, now);
}

interface VjRemoteMirrorProps {
  state: VjStageState | null;
  liveClip: VjClipDTO | null;
}

/**
 * The 16:9 mirror of the screen: the live clip's thumbnail under the current
 * effects, a still black layer while blackout is on, a Strobe chip with its
 * countdown (the mirror itself never flashes) and the overlay text.
 */
function VjRemoteMirror({ state, liveClip }: VjRemoteMirrorProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fade = { duration: reducedMotion ? 0 : MIRROR_FADE_SECONDS };
  const effects = state?.effects ?? null;
  const strobeSecondsLeft = useStrobeSecondsLeft(effects);
  const isNothingLive = state !== null && state.liveClipId === null;
  const shownClip =
    liveClip !== null && liveClip.id === state?.liveClipId ? liveClip : null;

  return (
    <div className={styles.mirror} data-vj-remote-mirror="">
      {effects !== null ? (
        <VjEffectsFrame effects={effects}>
          <AnimatePresence initial={false}>
            {shownClip !== null ? (
              <m.img
                key={shownClip.id}
                className={styles.mirrorThumbnail}
                src={shownClip.thumbnailUrl}
                alt=""
                width={shownClip.width}
                height={shownClip.height}
                data-vj-mirror-clip={shownClip.id}
                data-fit={shownClip.fitMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              />
            ) : null}
          </AnimatePresence>
        </VjEffectsFrame>
      ) : null}
      <AnimatePresence initial={false}>
        {effects?.isBlackout ? (
          <m.div
            key="blackout"
            className={styles.mirrorBlackout}
            data-vj-mirror-blackout=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {isNothingLive ? (
          <m.p
            key="nothing-live"
            className={styles.mirrorNote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {t("vj:remote.nothingLive")}
          </m.p>
        ) : null}
      </AnimatePresence>
      {state !== null ? (
        <VjOverlayText overlay={state.overlay} size="mirror" />
      ) : null}
      <AnimatePresence initial={false}>
        {effects?.isStrobing ? (
          <m.p
            key="strobe"
            className={styles.strobeChip}
            data-vj-strobe-chip=""
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={fade}
          >
            <FiZap aria-hidden="true" focusable="false" />
            <span>{t("vj:effects.strobe")}</span>
            <span className={styles.strobeChipTime}>
              {t("vj:effects.strobeRemaining", {
                seconds: strobeSecondsLeft,
              })}
            </span>
          </m.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * How many screens are live. While the remote is cut off it cannot know, so
 * the line says so in a dimmed tone and the dot stays grey.
 */
function VjRemoteScreensLine({
  screens,
  isKnown,
}: {
  screens: readonly VjScreenStatus[];
  isKnown: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  const summary = summariseVjScreens(screens);
  const { key, values } = isKnown
    ? vjScreensSummaryKey(summary)
    : { key: "vj:remote.screens.unknown", values: {} };
  return (
    <p
      role="status"
      className={styles.screensLine}
      data-vj-screens={isKnown ? summary.kind : "unknown"}
    >
      <span className={styles.screensDot} aria-hidden="true" />
      {t(key, values)}
    </p>
  );
}

interface VjRemoteLiveStripProps {
  state: VjStageState | null;
  liveClip: VjClipDTO | null;
  screens: readonly VjScreenStatus[];
  packs: readonly VjPackDTO[];
  isBlocked: boolean;
  /** False while the remote is cut off, so the screens line cannot be trusted. */
  isScreensKnown: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
  run: VjRun;
}

/** Holds a control while its command waits for the ack. */
function useHeldCommand(): {
  isHeld: boolean;
  hold: (send: () => Promise<unknown>) => void;
} {
  const [heldCount, setHeldCount] = useState(0);
  const hold = (send: () => Promise<unknown>) => {
    setHeldCount((count) => count + 1);
    void send().finally(() => setHeldCount((count) => count - 1));
  };
  return { isHeld: heldCount > 0, hold };
}

export function VjRemoteLiveStrip({
  state,
  liveClip,
  screens,
  packs,
  isBlocked,
  isScreensKnown,
  blockedReasonId,
  run,
}: VjRemoteLiveStripProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const packCommand = useHeldCommand();
  const clearCommand = useHeldCommand();
  const isBlack = state === null || state.liveClipId === null;
  const isClearBlocked = isBlocked || isBlack || clearCommand.isHeld;
  const liveTitle = liveClip !== null && !isBlack ? liveClip.title : "";
  const packOptions = packs.map((pack) => ({
    value: pack.id,
    label: pack.name,
  }));

  return (
    <section className={styles.liveStrip} aria-labelledby="vj-remote-live">
      <div className={styles.liveHeading}>
        <h2 id="vj-remote-live" className={styles.sectionTitle}>
          {t("vj:remote.liveLabel")}
        </h2>
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={liveTitle}
            className={styles.liveTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : MIRROR_FADE_SECONDS }}
          >
            {liveTitle}
          </m.p>
        </AnimatePresence>
      </div>
      <VjRemoteMirror state={state} liveClip={liveClip} />
      <div className={styles.liveSide}>
        <VjRemoteScreensLine screens={screens} isKnown={isScreensKnown} />
        <div className={styles.liveActions}>
          <div
            className={styles.packPicker}
            data-blocked={isBlocked ? "true" : undefined}
          >
            <Select
              label={t("vj:remote.packLabel")}
              placeholder={t("vj:remote.packPlaceholder")}
              options={packOptions}
              value={state?.activePackId ?? null}
              searchable={false}
              aria-describedby={isBlocked ? blockedReasonId : undefined}
              onChange={(packId) => {
                if (isBlocked || packCommand.isHeld) return;
                if (packId === (state?.activePackId ?? null)) return;
                packCommand.hold(() => run("setPack", packId));
              }}
            />
          </div>
          <Button
            variant="stage-ghost"
            className={styles.clearButton}
            aria-disabled={isClearBlocked}
            aria-describedby={isBlocked ? blockedReasonId : undefined}
            onClick={() => {
              if (isClearBlocked) return;
              clearCommand.hold(() => run("goClip", null));
            }}
          >
            <FiXCircle aria-hidden="true" focusable="false" />
            {t("vj:remote.clearScreen")}
          </Button>
        </div>
      </div>
    </section>
  );
}
