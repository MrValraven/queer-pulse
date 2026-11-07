/**
 * The remote's dock (plan R27): the status line, the reset notice and the
 * MIDI learn banner, then the tempo bar, the transition row, the effect pads
 * and the action row. On a phone it is fixed to the bottom of the viewport
 * (portaled to the body, above the consent inset) and reports its height so
 * the grid's last row clears it; in the split layout it is the sticky right
 * column and adds the crossfader on top, always in reach. There the pads take
 * the column's free height and the action row sits at the bottom; when a short
 * window makes the column scroll, the action row stays stuck to its bottom edge
 * with Blackout in reach.
 *
 * Two designs share this structure (useVjDockVariant, `?dock=pads`): the
 * polished rows, which head each section of the split column with a small
 * caption (Mix, Tempo, Transition, Effects), and the Performance pads, which
 * draw the tempo bar and the transition row as one compact strip. The root
 * carries `data-vj-dock-variant`, and the rows' CSS modules style each design
 * from it.
 */
import {
  useCallback,
  useEffect,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  createVjStageState,
  type VjEffectId,
  type VjEffectSettingPatch,
  type VjSpeed,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjStageCommands } from "../../live/useVjStage";
import type { VjTempoPatch } from "../dock/VjBpmPopover";
import { VjDockActions } from "../dock/VjDockActions";
import { VjPadsRow } from "../dock/VjPadsRow";
import { VjTempoBar } from "../dock/VjTempoBar";
import { VjTransitionRow } from "../dock/VjTransitionRow";
import {
  useVjDockVariant,
  type VjDockVariant,
} from "../hooks/useVjDockVariant";
import { VjCrossfader } from "../kit/VjCrossfader";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import { VjMidiLearnBanner } from "../sheets/midi/VjMidiLearnBanner";
import {
  useVjCrossfaderSend,
  type VjMixPatch,
} from "../sheets/mix/useVjCrossfaderSend";
import { VjRemoteStatusLine } from "../VjRemoteStatusLine";
import { VJ_RESET_DONE_KEY } from "./useVjRemoteActions";
import type { VjRemoteSession } from "./VjRemoteShell";
import styles from "./VjRemoteDock.module.css";

/** Defaults the rows draw before the first state lands (every control is blocked then). */
const VJ_WAITING_STATE = createVjStageState("waiting", 0);

/** The app's ease-out token (--ease-out) at its base duration (--dur-base). */
const VJ_DOCK_ENTER = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };
const VJ_DOCK_INSTANT = { duration: 0 };

/** Reports an element's border-box height whenever it changes, and 0 once it is gone. */
function useReportedHeight(
  onHeightChange: (heightPx: number) => void,
): (element: HTMLElement | null) => void {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (element === null || typeof ResizeObserver === "undefined") {
      onHeightChange(0);
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      onHeightChange(element.getBoundingClientRect().height);
    });
    observer.observe(element);
    onHeightChange(element.getBoundingClientRect().height);
    return () => {
      observer.disconnect();
      onHeightChange(0);
    };
  }, [element, onHeightChange]);
  return setElement;
}

/**
 * Whether an element's content runs past its height, re-checked whenever the
 * element or one of its children resizes. The split column sets
 * `data-vj-dock-overflow` from it, which shows the stuck action row's backing.
 */
function useIsOverflowing(): [(element: HTMLElement | null) => void, boolean] {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  useEffect(() => {
    if (element === null || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    // The observer reports every observed box once on observe, so this also
    // runs the first check.
    const check = () => {
      // 1px of slack absorbs subpixel rounding at fractional zoom levels.
      const hasOverflow = element.scrollHeight > element.clientHeight + 1;
      setIsOverflowing((previous) =>
        previous === hasOverflow ? previous : hasOverflow,
      );
    };
    const observer = new ResizeObserver(check);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, element !== null && isOverflowing];
}

/**
 * Keeps keyboard focus clear of the fixed dock: the document scrolls a
 * focused control up past the dock's measured height.
 */
function useScrollPaddingForDock(dockHeight: number): void {
  useEffect(() => {
    if (dockHeight <= 0) return undefined;
    const rootStyle = document.documentElement.style;
    const previous = rootStyle.scrollPaddingBlockEnd;
    rootStyle.scrollPaddingBlockEnd = `${dockHeight}px`;
    return () => {
      rootStyle.scrollPaddingBlockEnd = previous;
    };
  }, [dockHeight]);
}

/** The reset notice: a polite status line that folds open while the dispatcher holds a key. */
function VjDockInfoLine({ infoKey }: { infoKey: string | null }): JSX.Element {
  const { t } = useTranslation();
  const [shownKey, setShownKey] = useState(infoKey);
  // Keeps the last words drawn while the line folds away.
  if (infoKey !== null && infoKey !== shownKey) setShownKey(infoKey);
  return (
    <div role="status" className={styles.noticeSlot}>
      <Collapse isOpen={infoKey !== null}>
        <p className={styles.infoLine} data-vj-dock-info="">
          <FiCheck aria-hidden="true" focusable="false" fill="none" />
          <span>{shownKey === null ? "" : t(shownKey)}</span>
        </p>
      </Collapse>
    </div>
  );
}

/** The split dock's crossfader, sending through the same throttle as the Mix sheet. */
function VjDockCrossfader({ session }: { session: VjRemoteSession }) {
  const { latestState, stateRevision, isBlocked, run } = session;
  const { learnProps, isPickable } = useVjMidiLearnTarget({
    kind: "crossfader",
  });
  const setMix = useCallback(
    (patch: VjMixPatch) => run("setMix", patch),
    [run],
  );
  const crossfader = useVjCrossfaderSend({
    mix: latestState?.mix ?? null,
    stateRevision,
    isBlocked,
    setMix,
  });
  return (
    <div className={styles.crossfaderRow} {...learnProps}>
      <VjCrossfader
        value={crossfader.value}
        onChange={crossfader.change}
        onRelease={crossfader.release}
        isBlocked={isBlocked || isPickable}
        describedBy={session.blockedReasonId}
        hasMixClip={(latestState?.mix.clipId ?? null) !== null}
      />
    </div>
  );
}

/** A section caption in the split column's polished dock. */
function VjDockHeading({ children }: { children: ReactNode }): JSX.Element {
  return <h2 className={styles.sectionHeading}>{children}</h2>;
}

/** The dock's controls, top to bottom, reading the newest received state. */
function VjDockRows({
  session,
  variant,
}: {
  session: VjRemoteSession;
  variant: VjDockVariant;
}): JSX.Element {
  const { t } = useTranslation();
  const { latestState, run, actions, cue, library, isBlocked, sheets } =
    session;
  const state = latestState ?? VJ_WAITING_STATE;
  const isSplit = session.layout.layout === "split";
  const hasHeadings = isSplit && variant === "polish";
  const leadScreen = session.stage.screens.find(
    (screen) => screen.isConnected && screen.isLead,
  );
  const latestLiveClip =
    latestState?.liveClipId == null
      ? null
      : (library.clipsById.get(latestState.liveClipId) ?? null);
  const armedClipTitle =
    cue.armedClipId === null
      ? null
      : (library.clipsById.get(cue.armedClipId)?.title ?? null);
  const { onRefused } = session;

  const setTempo = useCallback(
    (patch: VjTempoPatch) => run("setTempo", patch),
    [run],
  );
  const setTransition = useCallback(
    (patch: Parameters<VjStageCommands["setTransition"]>[0]) =>
      run("setTransition", patch),
    [run],
  );
  const setSpeed = useCallback(
    (speed: VjSpeed) => run("setEffects", { speed }),
    [run],
  );
  const setEffectSetting = useCallback(
    (effectId: VjEffectId, patch: VjEffectSettingPatch) => {
      const settings: Partial<Record<VjEffectId, VjEffectSettingPatch>> = {};
      settings[effectId] = patch;
      return run("setEffects", { settings });
    },
    [run],
  );

  return (
    <div role="group" className={styles.rows}>
      {hasHeadings ? (
        <VjDockHeading>{t("vj:dock.sectionMix")}</VjDockHeading>
      ) : null}
      {isSplit ? <VjDockCrossfader session={session} /> : null}
      <div className={styles.strip} data-vj-dock-strip="">
        {hasHeadings ? (
          <VjDockHeading>{t("vj:tempo.label")}</VjDockHeading>
        ) : null}
        <VjTempoBar
          tempo={latestState?.tempo ?? null}
          clock={session.clock}
          leadMic={leadScreen?.mic ?? null}
          isBlocked={isBlocked}
          blockedReasonId={session.blockedReasonId}
          dispatch={actions.dispatch}
          setTempo={setTempo}
        />
        {hasHeadings ? (
          <VjDockHeading>{t("vj:transition.title")}</VjDockHeading>
        ) : null}
        <VjTransitionRow
          transition={latestState?.transition ?? null}
          tempo={latestState?.tempo ?? null}
          speed={state.effects.speed}
          liveMediaKind={latestLiveClip?.mediaKind ?? null}
          isBlocked={isBlocked}
          blockedReasonId={session.blockedReasonId}
          stateRevision={session.stateRevision}
          hasFlashConsent={session.flashConsent.hasConsented}
          onNeedFlashConsent={actions.requestFlashConsent}
          setTransition={setTransition}
          setSpeed={setSpeed}
          onRefused={(refusal) => onRefused(refusal.errorKey)}
        />
      </div>
      {hasHeadings ? (
        <VjDockHeading>{t("vj:dock.sectionEffects")}</VjDockHeading>
      ) : null}
      <div className={styles.padsSlot}>
        <VjPadsRow
          pads={session.dockPads.pads}
          effects={state.effects}
          isOnOf={actions.padIsOn}
          isPendingOf={actions.padIsPending}
          isBlocked={isBlocked}
          blockedReasonId={session.blockedReasonId}
          layout={session.layout.layout}
          stateRevision={session.stateRevision}
          onPadSend={actions.onPadSend}
          setEffectSetting={setEffectSetting}
          onOpenLibrary={() => sheets.open("effects")}
          serverNow={session.clock.serverNow}
        />
      </div>
      <div className={styles.actionsSlot}>
        <VjDockActions
          isBlackout={actions.blackoutIsOn(state.effects.isBlackout)}
          isBlackoutPending={actions.isBlackoutPending}
          isCueMode={cue.isCueMode}
          armedClipTitle={armedClipTitle}
          isBlocked={isBlocked}
          blockedReasonId={session.blockedReasonId}
          isResetDone={actions.infoKey === VJ_RESET_DONE_KEY}
          dispatch={actions.dispatch}
          onTurnOnCueMode={() => cue.setCueMode(true)}
          onOpenMore={() => sheets.open("more")}
        />
      </div>
    </div>
  );
}

export interface VjRemoteDockProps {
  session: VjRemoteSession;
  /** The phone dock's border-box height; 0 in the split layout. */
  onHeightChange: (heightPx: number) => void;
}

export function VjRemoteDock({
  session,
  onHeightChange,
}: VjRemoteDockProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const variant = useVjDockVariant();
  const isPhone = session.layout.layout === "phone";
  const [phoneHeight, setPhoneHeight] = useState(0);
  const reportHeight = useCallback(
    (heightPx: number) => {
      setPhoneHeight(heightPx);
      onHeightChange(heightPx);
    },
    [onHeightChange],
  );
  const measureRef = useReportedHeight(reportHeight);
  const [columnRef, isColumnOverflowing] = useIsOverflowing();
  useScrollPaddingForDock(isPhone ? phoneHeight : 0);

  const content: ReactNode = (
    <>
      <div className={styles.notices}>
        {/* A slot of its own, so the line takes no room while it is folded. */}
        <div className={styles.statusSlot}>
          <VjRemoteStatusLine
            id={session.statusLineId}
            offlineReason={session.offlineReason}
            errorKey={session.errorKey}
            values={session.errorValues}
          />
        </div>
        <VjDockInfoLine infoKey={session.actions.infoKey} />
        <VjMidiLearnBanner />
      </div>
      <VjDockRows session={session} variant={variant} />
    </>
  );

  if (!isPhone) {
    return (
      <section
        ref={columnRef}
        className={styles.column}
        aria-label={t("vj:dock.label")}
        data-vj-remote-dock="split"
        data-vj-dock-variant={variant}
        data-vj-dock-overflow={isColumnOverflowing ? "" : undefined}
      >
        {content}
      </section>
    );
  }

  return createPortal(
    <m.section
      ref={measureRef}
      className={styles.dock}
      aria-label={t("vj:dock.label")}
      data-theme="dark"
      data-vj-remote=""
      data-vj-remote-dock="phone"
      data-vj-dock-variant={variant}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? VJ_DOCK_INSTANT : VJ_DOCK_ENTER}
    >
      <div className={styles.inner}>{content}</div>
    </m.section>,
    document.body,
  );
}
