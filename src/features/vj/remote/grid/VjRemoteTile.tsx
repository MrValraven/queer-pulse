import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type { VjClipDTO, VjQuantize } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpDescribedBy } from "../top/useVjHelpDescribedBy";
import type { VjClipReadiness } from "../../live/vjScreensSummary";
import { useVjLongPress } from "../hooks/useVjLongPress";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import { VjFailureBadge } from "./VjFailureBadge";
import { VjFavoriteStar } from "./VjFavoriteStar";
import { VjTilePreview } from "./VjTilePreview";
import { VJ_GRID_ITEM_ATTRIBUTE } from "./useVjGridFocus";
import styles from "./VjGrid.module.css";
import { VJ_TILE_EASE, VJ_TILE_MOTION_SECONDS } from "./vjTileMotion";

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
  /** Opens the sheet of clips that couldn't load, on this clip's row. */
  onShowFailure: (clipId: string) => void;
}

/**
 * One clip tile: a square holding the main button (thumbnail, title on a
 * bottom gradient, Live, Cued and next beat or bar tags, a pending ring,
 * readiness as a progress bar and a dim, a slot for the failure badge), and
 * beside it the failure badge (it opens the sheet that says why) and the
 * favorite star. A tap plays or cues the clip; a long press peeks at its
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
  onShowFailure,
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

  const helpDescribedBy = useVjHelpDescribedBy();
  const { readiness, isLive, isArmed, isPending } = state;
  const readinessNote = vjTileReadinessNoteOf(readiness, t);
  const isFailed = readiness.state === "failed";
  const hasProgress =
    readiness.state === "queued" || readiness.state === "loading";
  const pendingKey = pendingQuantizeKeyOf(state.pendingQuantize);
  const isCuedShown = isCueMode && isArmed;
  const describedBy = helpDescribedBy(
    "clipTile",
    readinessNote !== null ? readinessId : undefined,
    isCuedShown ? cuedId : undefined,
    pendingKey !== null ? pendingChipId : undefined,
    isBlocked ? blockedReasonId : undefined,
  );
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
        aria-describedby={describedBy}
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
          {/* Holds the badge's place, so the tags after it clear the badge button. */}
          <VjTileTag
            isShown={isFailed}
            className={styles.failBadgeSlot ?? ""}
            dataName="failure-slot"
          >
            {null}
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
      <VjFailureBadge
        isShown={isFailed}
        clipId={clip.id}
        title={clip.title}
        tabIndex={tabIndex}
        isPickable={isPickable}
        onShowFailure={onShowFailure}
      />
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
