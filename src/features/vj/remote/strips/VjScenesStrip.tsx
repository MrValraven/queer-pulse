import {
  useEffect,
  useRef,
  type JSX,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, m } from "motion/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiPause,
  FiPlay,
  FiPlus,
  FiRotateCcw,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type {
  VjSceneDTO,
  VjSetlistDTO,
  VjSetlistPlaybackStatus,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  VJ_SETLIST_STRIP_PLAY_CONTROL_KEYS,
  vjSetlistNextIndex,
  vjSetlistPlayControlOf,
  vjSetlistPreviousIndex,
  type VjSetlistPlayControl,
} from "../rules/vjSetlistPlayback";
import { useVjHelpDescribedBy } from "../top/useVjHelpDescribedBy";
import { vjHiddenEdgesOf } from "../top/vjPackTabsScroll";
import styles from "./VjStrips.module.css";

/** The app's ease-out token (--ease-out) at its fast duration (--dur-fast). */
const VJ_STRIP_CHIP_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_STRIP_INSTANT = { duration: 0 };
/** A chip enters and leaves with opacity and scale; its neighbours slide through `layout`. */
const VJ_STRIP_CHIP_PRESENCE = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export interface VjScenesStripProps {
  scenes: readonly VjSceneDTO[];
  activeSetlist: VjSetlistDTO | null;
  setlistIndex: number | null;
  /** The scene whose recall was sent and has not shown in the state yet. */
  pendingSceneId: string | null;
  isBlocked: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
  isSaving: boolean;
  onRecall: (sceneId: string) => void;
  onSaveScene: () => void;
  onSetlistNext: () => void;
  onSetlistPrevious: () => void;
  /** The active sequence's playback status: which play control the group shows. */
  setlistStatus: VjSetlistPlaybackStatus;
  /** The active sequence's Loop: Next from the last step and Previous from the first go round. */
  isSetlistLooping: boolean;
  /** A Play, Pause or step select waits for its ack. */
  isSetlistPlayPending: boolean;
  /** Play, Pause, Resume or Play again; the tapped chip anchors the flash warning. */
  onSetlistTogglePlaying: (anchor: HTMLElement) => void;
  /** The scene recalled last when the caller tracks it; by default the active set list's current scene. */
  liveSceneId?: string | null;
  /** Opens the Scenes sheet (R20), which owns rename, delete and set lists. No chip without it. */
  onOpenScenesSheet?: () => void;
}

/** The scene on screen: the caller's answer, else the set list item recalled last. */
function vjLiveSceneIdOf(
  activeSetlist: VjSetlistDTO | null,
  setlistIndex: number | null,
  liveSceneId: string | null | undefined,
): string | null {
  if (liveSceneId !== undefined) return liveSceneId;
  if (activeSetlist === null || setlistIndex === null) return null;
  return activeSetlist.items[setlistIndex]?.sceneId ?? null;
}

/**
 * Writes which edges of the scrolling chips hide something onto the scroller,
 * for the CSS edge fade the pack tabs use. The row's tools sit outside it, so
 * a fade only ever meets chips.
 */
function useVjScenesEdgeFade(
  scenesCount: number,
  hasSetlist: boolean,
): RefObject<HTMLDivElement | null> {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller === null) return undefined;
    const markHiddenEdges = () => {
      const { hasHiddenStart, hasHiddenEnd } = vjHiddenEdgesOf(scroller);
      scroller.dataset.vjFadeStart = String(hasHiddenStart);
      scroller.dataset.vjFadeEnd = String(hasHiddenEnd);
    };
    markHiddenEdges();
    scroller.addEventListener("scroll", markHiddenEdges, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(markHiddenEdges);
    observer?.observe(scroller);
    // A scene added or removed changes the scroll width without resizing the scroller.
    return () => {
      scroller.removeEventListener("scroll", markHiddenEdges);
      observer?.disconnect();
    };
  }, [scenesCount, hasSetlist]);
  return scrollerRef;
}

function useChipTransition(): {
  transition: typeof VJ_STRIP_CHIP_TRANSITION | typeof VJ_STRIP_INSTANT;
} {
  const { reducedMotion } = useMotionPrefs();
  return {
    transition: reducedMotion ? VJ_STRIP_INSTANT : VJ_STRIP_CHIP_TRANSITION,
  };
}

interface VjSceneChipProps {
  scene: VjSceneDTO;
  isLive: boolean;
  isPending: boolean;
  isBlocked: boolean;
  /** Set while blocked: the status line's id. */
  describedBy: string | undefined;
  onRecall: (sceneId: string) => void;
}

function VjSceneChip({
  scene,
  isLive,
  isPending,
  isBlocked,
  describedBy,
  onRecall,
}: VjSceneChipProps): JSX.Element {
  const { t } = useTranslation();
  const { transition } = useChipTransition();
  const helpDescribedBy = useVjHelpDescribedBy();
  return (
    <m.button
      type="button"
      layout="position"
      className={styles.chip}
      data-vj-scene-chip={scene.id}
      data-live={isLive ? "true" : undefined}
      data-pending={isPending ? "true" : undefined}
      aria-current={isLive ? "true" : undefined}
      aria-disabled={isBlocked || undefined}
      aria-describedby={helpDescribedBy("sceneChip", describedBy)}
      aria-label={t("vj:strip.recallAria", { name: scene.name })}
      {...VJ_STRIP_CHIP_PRESENCE}
      transition={transition}
      onClick={() => {
        if (isBlocked) return;
        onRecall(scene.id);
      }}
    >
      <span className={styles.chipFace}>
        <span className={styles.chipName}>{scene.name}</span>
      </span>
    </m.button>
  );
}

/** The play chip's icon for each play control. */
const VJ_SETLIST_PLAY_ICONS: Readonly<Record<VjSetlistPlayControl, IconType>> =
  {
    play: FiPlay,
    pause: FiPause,
    resume: FiPlay,
    playAgain: FiRotateCcw,
  };

type VjSetlistGroupProps = Pick<
  VjScenesStripProps,
  | "setlistIndex"
  | "onSetlistNext"
  | "onSetlistPrevious"
  | "setlistStatus"
  | "isSetlistLooping"
  | "isSetlistPlayPending"
  | "onSetlistTogglePlaying"
> & {
  setlist: VjSetlistDTO;
  isBlocked: boolean;
  /** Set while blocked: the status line's id. */
  describedBy: string | undefined;
};

/**
 * The sequence's play chip: Play, Pause, Resume or Play again as the status
 * asks. While the sequence plays, the chip carries the coral wash and the
 * pause icon, so the mark never rests on colour alone.
 */
function VjSetlistPlayChip({
  setlistStatus,
  isSetlistPlayPending,
  isHeld,
  describedBy,
  onSetlistTogglePlaying,
}: Pick<
  VjSetlistGroupProps,
  | "setlistStatus"
  | "isSetlistPlayPending"
  | "describedBy"
  | "onSetlistTogglePlaying"
> & { isHeld: boolean }): JSX.Element {
  const { t } = useTranslation();
  const playControl = vjSetlistPlayControlOf(setlistStatus);
  const PlayIcon = VJ_SETLIST_PLAY_ICONS[playControl];
  return (
    <button
      type="button"
      className={`${styles.chip} ${styles.iconChip}`}
      data-vj-setlist-play={playControl}
      data-live={setlistStatus === "playing" ? "true" : undefined}
      aria-label={t(VJ_SETLIST_STRIP_PLAY_CONTROL_KEYS[playControl])}
      aria-disabled={isHeld || undefined}
      aria-busy={isSetlistPlayPending || undefined}
      aria-describedby={describedBy}
      onClick={(event) => {
        if (isHeld) return;
        onSetlistTogglePlaying(event.currentTarget);
      }}
    >
      <span className={styles.chipFace}>
        <PlayIcon aria-hidden="true" focusable="false" fill="none" />
      </span>
    </button>
  );
}

/**
 * Previous step, the play chip, "3 of 12", Next step. Nothing recalled yet
 * reads as 0, so Next starts the list; with Loop on, Previous from step 1
 * or from nothing recalled yet, and Next from the last step, go round.
 */
function VjSetlistGroup({
  setlist,
  setlistIndex,
  isBlocked,
  describedBy,
  onSetlistNext,
  onSetlistPrevious,
  setlistStatus,
  isSetlistLooping,
  isSetlistPlayPending,
  onSetlistTogglePlaying,
}: VjSetlistGroupProps): JSX.Element {
  const { t } = useTranslation();
  const { transition } = useChipTransition();
  const helpDescribedBy = useVjHelpDescribedBy();
  const stepDescribedBy = helpDescribedBy("setlistStep", describedBy);
  const total = setlist.items.length;
  const position = setlistIndex === null ? 0 : setlistIndex + 1;
  const isPreviousBlocked =
    isBlocked ||
    vjSetlistPreviousIndex(setlistIndex, total, isSetlistLooping) === null;
  const isNextBlocked =
    isBlocked ||
    vjSetlistNextIndex(setlistIndex, total, isSetlistLooping) === null;
  return (
    <m.div
      layout="position"
      className={styles.setlistGroup}
      data-vj-setlist-group={setlist.id}
      {...VJ_STRIP_CHIP_PRESENCE}
      transition={transition}
    >
      <button
        type="button"
        className={`${styles.chip} ${styles.iconChip}`}
        aria-label={t("vj:strip.setlistPrevious")}
        aria-disabled={isPreviousBlocked || undefined}
        aria-describedby={stepDescribedBy}
        onClick={() => {
          if (isPreviousBlocked) return;
          onSetlistPrevious();
        }}
      >
        <span className={styles.chipFace}>
          <FiChevronLeft aria-hidden="true" focusable="false" fill="none" />
        </span>
      </button>
      <VjSetlistPlayChip
        setlistStatus={setlistStatus}
        isSetlistPlayPending={isSetlistPlayPending}
        isHeld={isBlocked || isSetlistPlayPending || total === 0}
        describedBy={helpDescribedBy("setlistPlay", describedBy)}
        onSetlistTogglePlaying={onSetlistTogglePlaying}
      />
      <span className={styles.setlistPosition}>
        {t("vj:strip.setlistPosition", { position, total })}
      </span>
      <button
        type="button"
        className={`${styles.chip} ${styles.iconChip}`}
        aria-label={t("vj:strip.setlistNext")}
        aria-disabled={isNextBlocked || undefined}
        aria-describedby={stepDescribedBy}
        onClick={() => {
          if (isNextBlocked) return;
          onSetlistNext();
        }}
      >
        <span className={styles.chipFace}>
          <FiChevronRight aria-hidden="true" focusable="false" fill="none" />
        </span>
      </button>
    </m.div>
  );
}

interface VjSceneToolsProps {
  isSaving: boolean;
  onSaveScene: () => void;
  onOpenScenesSheet?: () => void;
  /**
   * The active sequence's group. While one is active it takes Save scene's
   * place, so Previous, Play and Next stay in reach at any width (Save scene
   * stays in the Scenes sheet).
   */
  setlistGroup: ReactNode;
}

/**
 * The row's tail, pinned beside the scrolling chips: Save scene, or the
 * active sequence's group in its place, then the door to the Scenes sheet.
 * On a narrow row Save scene shrinks to its icon (the aria-label keeps its
 * name).
 */
function VjSceneTools({
  isSaving,
  onSaveScene,
  onOpenScenesSheet,
  setlistGroup,
}: VjSceneToolsProps): JSX.Element {
  const { t } = useTranslation();
  const { transition } = useChipTransition();
  const helpDescribedBy = useVjHelpDescribedBy();
  return (
    <div className={styles.sceneTools}>
      <AnimatePresence initial={false}>
        {setlistGroup ?? (
          <m.button
            key="save-scene"
            type="button"
            layout="position"
            {...VJ_STRIP_CHIP_PRESENCE}
            transition={transition}
            className={`${styles.chip} ${styles.saveChip}`}
            data-vj-save-scene=""
            aria-label={t("vj:strip.saveScene")}
            aria-disabled={isSaving || undefined}
            aria-busy={isSaving || undefined}
            aria-describedby={helpDescribedBy("saveScene")}
            onClick={() => {
              if (isSaving) return;
              onSaveScene();
            }}
          >
            <span className={styles.chipFace}>
              <FiPlus aria-hidden="true" focusable="false" fill="none" />
              <span className={styles.chipName}>{t("vj:strip.saveScene")}</span>
            </span>
          </m.button>
        )}
      </AnimatePresence>
      {onOpenScenesSheet !== undefined ? (
        <m.button
          type="button"
          layout="position"
          className={`${styles.chip} ${styles.iconChip}`}
          aria-label={t("vj:strip.openScenes")}
          aria-describedby={helpDescribedBy("sceneList")}
          onClick={onOpenScenesSheet}
        >
          <span className={styles.chipFace}>
            <FiList aria-hidden="true" focusable="false" fill="none" />
          </span>
        </m.button>
      ) : null}
    </div>
  );
}

/**
 * The scenes strip: one chip per scene (a tap recalls it; the live one
 * carries the coral wash, a recall on its way a coral ring); only these
 * scroll sideways. Pinned after them: Save scene, or while a sequence is
 * active its group (Previous step, the play chip, "3 of 12" where the row
 * has room, Next step) in Save scene's place, then the Scenes button.
 * Rename, delete and editing sequences live in the Scenes sheet; this row
 * recalls, saves, plays and steps.
 */
export function VjScenesStrip({
  scenes,
  activeSetlist,
  setlistIndex,
  pendingSceneId,
  isBlocked,
  blockedReasonId,
  isSaving,
  onRecall,
  onSaveScene,
  onSetlistNext,
  onSetlistPrevious,
  setlistStatus,
  isSetlistLooping,
  isSetlistPlayPending,
  onSetlistTogglePlaying,
  liveSceneId,
  onOpenScenesSheet,
}: VjScenesStripProps): JSX.Element {
  const { t } = useTranslation();
  const { transition } = useChipTransition();
  const shownLiveSceneId = vjLiveSceneIdOf(
    activeSetlist,
    setlistIndex,
    liveSceneId,
  );
  const blockedDescription = isBlocked ? blockedReasonId : undefined;
  const scrollerRef = useVjScenesEdgeFade(
    scenes.length,
    activeSetlist !== null,
  );
  return (
    <div
      className={styles.sceneRow}
      role="group"
      aria-label={t("vj:strip.scenes")}
      data-vj-scenes-strip=""
    >
      <div
        ref={scrollerRef}
        className={`${styles.scroller} ${styles.sceneScroller}`}
      >
        <AnimatePresence initial={false}>
          {scenes.map((scene) => (
            <VjSceneChip
              key={scene.id}
              scene={scene}
              isLive={scene.id === shownLiveSceneId}
              isPending={scene.id === pendingSceneId}
              isBlocked={isBlocked}
              describedBy={blockedDescription}
              onRecall={onRecall}
            />
          ))}
          {scenes.length === 0 ? (
            <m.span
              key="empty"
              layout="position"
              className={styles.emptyScenes}
              data-vj-scenes-empty=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              {t("vj:strip.noScenes")}
            </m.span>
          ) : null}
        </AnimatePresence>
      </div>
      <VjSceneTools
        isSaving={isSaving}
        onSaveScene={onSaveScene}
        onOpenScenesSheet={onOpenScenesSheet}
        setlistGroup={
          activeSetlist === null ? null : (
            <VjSetlistGroup
              key={`setlist-${activeSetlist.id}`}
              setlist={activeSetlist}
              setlistIndex={setlistIndex}
              isBlocked={isBlocked}
              describedBy={blockedDescription}
              onSetlistNext={onSetlistNext}
              onSetlistPrevious={onSetlistPrevious}
              setlistStatus={setlistStatus}
              isSetlistLooping={isSetlistLooping}
              isSetlistPlayPending={isSetlistPlayPending}
              onSetlistTogglePlaying={onSetlistTogglePlaying}
            />
          )
        }
      />
    </div>
  );
}
