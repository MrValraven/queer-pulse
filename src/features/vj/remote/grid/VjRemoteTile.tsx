import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type { VjClipDTO, VjQuantize } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjClipReadiness } from "../../live/vjScreensSummary";
import { useVjLongPress } from "../hooks/useVjLongPress";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import { VjFavoriteStar } from "./VjFavoriteStar";
import { VjTilePreview } from "./VjTilePreview";
import { VJ_GRID_ITEM_ATTRIBUTE } from "./useVjGridFocus";
import styles from "./VjGrid.module.css";

export interface VjTileState {
  isLive: boolean;
  /** Its `goClip` waits for the stage's answer. */
  isPending: boolean;
  /** Cued: Go sends it. */
  isArmed: boolean;
  /** A quantized change to this clip waits for the next beat or bar. */
  pendingQuantize: VjQuantize | null;
  readiness: VjClipReadiness;
}

/** The shared Collapse curve and its fast length, for tags and rings. */
const VJ_TILE_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_TILE_MOTION_SECONDS = 0.2;

type VjTranslate = ReturnType<typeof useTranslation>["t"];

/** A tile is dimmed until every covering screen holds its clip. */
function isVjTileDimmed(readiness: VjClipReadiness): boolean {
  return (
    readiness.state === "queued" ||
    readiness.state === "loading" ||
    readiness.state === "failed"
  );
}

/** The v1 readiness line: progress, the wait, or the failure and its reason. */
function vjTileReadinessNoteOf(
  readiness: VjClipReadiness,
  t: VjTranslate,
): string | null {
  if (readiness.state === "failed") {
    const failedLine = t("vj:remote.clipFailed");
    return readiness.failure === null
      ? failedLine
      : `${failedLine}. ${t(`vj:preload.failure.${readiness.failure}`)}`;
  }
  if (readiness.state === "loading") {
    return t("vj:remote.clipLoading", {
      percent: Math.round(readiness.progress * 100),
    });
  }
  if (readiness.state === "queued") return t("vj:remote.clipQueued");
  return null;
}

function pendingQuantizeKeyOf(pendingQuantize: VjQuantize | null) {
  if (pendingQuantize === "beat") return "vj:grid.pendingBeat";
  if (pendingQuantize === "bar") return "vj:grid.pendingBar";
  return null;
}

/** One tag on the tile that fades and scales in and out. */
function VjTileTag({
  isShown,
  className,
  id,
  dataName,
  children,
}: {
  isShown: boolean;
  className: string;
  id?: string;
  dataName: string;
  children: ReactNode;
}): JSX.Element {
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : VJ_TILE_MOTION_SECONDS,
    ease: VJ_TILE_EASE,
  };
  return (
    <AnimatePresence initial={false}>
      {isShown ? (
        <m.span
          key={dataName}
          id={id}
          className={className}
          {...{ [`data-vj-${dataName}`]: "" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={transition}
        >
          {children}
        </m.span>
      ) : null}
    </AnimatePresence>
  );
}

export interface VjRemoteTileProps {
  clip: VjClipDTO;
  index: number;
  state: VjTileState;
  isCueMode: boolean;
  isBlocked: boolean;
  blockedReasonId?: string;
  tabIndex: 0 | -1;
  onTapClip: (clipId: string, index: number) => void;
  onToggleFavorite: (clipId: string, isFavorite: boolean) => void;
}

/**
 * One clip tile: a square holding the main button (thumbnail, title on a
 * bottom gradient, Live, Cued and next beat or bar tags, a pending ring,
 * readiness as a progress bar and a dim, a failure badge) and the favorite
 * star beside it. A tap plays or cues the clip; a long press peeks at its
 * moving preview and the click that follows sends nothing. While MIDI learn
 * runs, a press picks the tile's slot and sends nothing.
 */
export function VjRemoteTile({
  clip,
  index,
  state,
  isCueMode,
  isBlocked,
  blockedReasonId,
  tabIndex,
  onTapClip,
  onToggleFavorite,
}: VjRemoteTileProps): JSX.Element {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLButtonElement>(null);
  const readinessId = useId();
  const cuedId = useId();
  const pendingChipId = useId();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { isPickable, learnProps } = useVjMidiLearnTarget({
    kind: "clipSlot",
    index,
  });
  const { handlers, consumeClick } = useVjLongPress({
    isEnabled: !isPickable,
    onLongPressStart: () => setIsPreviewOpen(true),
    onLongPressEnd: () => setIsPreviewOpen(false),
  });

  const { readiness, isLive, isArmed, isPending } = state;
  const readinessNote = vjTileReadinessNoteOf(readiness, t);
  const isFailed = readiness.state === "failed";
  const hasProgress =
    readiness.state === "queued" || readiness.state === "loading";
  const pendingKey = pendingQuantizeKeyOf(state.pendingQuantize);
  const isCuedShown = isCueMode && isArmed;
  const describedBy = [
    readinessNote !== null ? readinessId : null,
    isCuedShown ? cuedId : null,
    pendingKey !== null ? pendingChipId : null,
    isBlocked ? (blockedReasonId ?? null) : null,
  ].filter((id): id is string => id !== null);
  const progressStyle = {
    transform: `scaleX(${readiness.progress})`,
  } satisfies CSSProperties;

  return (
    <div
      className={styles.tile}
      data-vj-tile=""
      data-live={isLive ? "true" : "false"}
      data-armed={isCuedShown ? "true" : "false"}
      data-pending={isPending ? "true" : "false"}
    >
      <button
        ref={mainRef}
        type="button"
        className={styles.tileMain}
        {...{ [VJ_GRID_ITEM_ATTRIBUTE]: "" }}
        tabIndex={tabIndex}
        aria-label={t(isCueMode ? "vj:grid.cueAria" : "vj:remote.clipAria", {
          title: clip.title,
        })}
        aria-describedby={
          describedBy.length > 0 ? describedBy.join(" ") : undefined
        }
        aria-current={isLive ? "true" : undefined}
        aria-disabled={isBlocked}
        data-readiness={readiness.state}
        data-dimmed={isVjTileDimmed(readiness) ? "true" : undefined}
        {...handlers}
        {...learnProps}
        onContextMenu={(event) => event.preventDefault()}
        onClick={() => {
          if (consumeClick() || isBlocked) return;
          onTapClip(clip.id, index);
        }}
      >
        <span className={styles.tileMedia}>
          <img
            className={styles.tileThumbnail}
            src={clip.thumbnailUrl}
            alt=""
            width={clip.width}
            height={clip.height}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </span>
        <span className={styles.tileShade}>
          <span className={styles.tileTitle}>{clip.title}</span>
        </span>
        <span className={styles.tileTags}>
          <VjTileTag
            isShown={isFailed}
            className={styles.failBadge ?? ""}
            dataName="failure-badge"
          >
            <FiAlertTriangle aria-hidden="true" fill="none" />
          </VjTileTag>
          <VjTileTag
            isShown={isLive}
            className={styles.liveTag ?? ""}
            dataName="live-tag"
          >
            {t("vj:remote.clipLive")}
          </VjTileTag>
          <VjTileTag
            isShown={isCuedShown}
            className={styles.cuedTag ?? ""}
            id={cuedId}
            dataName="cued-tag"
          >
            {t("vj:grid.cued")}
          </VjTileTag>
          <VjTileTag
            isShown={pendingKey !== null}
            className={styles.pendingChip ?? ""}
            id={pendingChipId}
            dataName="pending-chip"
          >
            {pendingKey !== null ? t(pendingKey) : null}
          </VjTileTag>
        </span>
        <VjTileTag
          isShown={isPending}
          className={styles.pendingRing ?? ""}
          dataName="pending-ring"
        >
          {null}
        </VjTileTag>
        <VjTileTag
          isShown={hasProgress}
          className={styles.tileProgress ?? ""}
          dataName="progress"
        >
          <span
            className={styles.tileProgressFill}
            style={progressStyle}
            data-vj-progress-value={readiness.progress}
          />
        </VjTileTag>
        {readinessNote !== null ? (
          <span
            id={readinessId}
            className="visuallyHidden"
            data-vj-readiness-line=""
          >
            {readinessNote}
          </span>
        ) : null}
      </button>
      <VjFavoriteStar
        clipId={clip.id}
        title={clip.title}
        isFavorite={clip.isFavorite}
        tabIndex={tabIndex}
        onToggleFavorite={onToggleFavorite}
      />
      <VjTilePreview
        clip={clip}
        anchorRef={mainRef}
        isOpen={isPreviewOpen}
        note={readinessNote}
      />
    </div>
  );
}
