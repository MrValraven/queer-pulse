import type { DragEvent } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import {
  FiArrowDown,
  FiArrowUp,
  FiMenu,
  FiPause,
  FiPlay,
  FiTrash2,
} from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistEntryView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import {
  StudioHiddenTrackNote,
  StudioHiddenTrackNumber,
} from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import releaseStyles from "./StudioRelease.module.css";
import css from "./StudioPlaylistPage.module.css";

/** The id a dragged row carries, kept apart from anything else dropped. */
const ENTRY_DRAG_TYPE = "application/x-studio-playlist-entry";

export type PlaylistEntryControl = "moveUp" | "moveDown" | "remove";

export type RegisterEntryControl = (
  entryId: string,
  control: PlaylistEntryControl,
  element: HTMLButtonElement | null,
) => void;

function startEntryDrag(event: DragEvent<HTMLSpanElement>, entryId: string) {
  event.dataTransfer.setData(ENTRY_DRAG_TYPE, entryId);
  event.dataTransfer.effectAllowed = "move";
  const rowElement = event.currentTarget.closest("li");
  if (rowElement) event.dataTransfer.setDragImage(rowElement, 16, 16);
}

interface StudioPlaylistEntryRowProps {
  entry: StudioPlaylistEntryView;
  index: number;
  rowCount: number;
  isOwner: boolean;
  /** A playlist write is saving (a move or a removal): moves, drags and
   *  Remove wait, and aria-disabled keeps focus on the pressed button. */
  isBusy: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  registerControl: RegisterEntryControl;
  onPlay: () => void;
  onMove: (offset: -1 | 1) => void;
  onDropAt: (draggedEntryId: string) => void;
  onRemove: () => void;
}

function EntryControls({
  entry,
  title,
  index,
  rowCount,
  isBusy,
  registerControl,
  onMove,
  onRemove,
}: Pick<
  StudioPlaylistEntryRowProps,
  | "entry"
  | "index"
  | "rowCount"
  | "isBusy"
  | "registerControl"
  | "onMove"
  | "onRemove"
> & { title: string }) {
  const { t } = useTranslation();
  const isMoveUpBlocked = isBusy || index === 0;
  const isMoveDownBlocked = isBusy || index === rowCount - 1;
  return (
    <div className={css.controls}>
      {entry.isAvailable && (
        <>
          <button
            type="button"
            ref={(element) => registerControl(entry.entryId, "moveUp", element)}
            className={css.control}
            aria-disabled={isMoveUpBlocked || undefined}
            aria-label={t("studio:playlist.row.moveUp", { title })}
            onClick={() => {
              if (!isMoveUpBlocked) onMove(-1);
            }}
          >
            <FiArrowUp aria-hidden />
          </button>
          <button
            type="button"
            ref={(element) =>
              registerControl(entry.entryId, "moveDown", element)
            }
            className={css.control}
            aria-disabled={isMoveDownBlocked || undefined}
            aria-label={t("studio:playlist.row.moveDown", { title })}
            onClick={() => {
              if (!isMoveDownBlocked) onMove(1);
            }}
          >
            <FiArrowDown aria-hidden />
          </button>
        </>
      )}
      <button
        type="button"
        ref={(element) => registerControl(entry.entryId, "remove", element)}
        className={css.control}
        aria-disabled={isBusy || undefined}
        aria-label={
          entry.isAvailable
            ? t("studio:playlist.row.remove", { title })
            : t("studio:playlist.row.removeUnavailable", {
                position: entry.position,
              })
        }
        onClick={() => {
          if (!isBusy) onRemove();
        }}
      >
        <FiTrash2 aria-hidden />
      </button>
    </div>
  );
}

/** One playlist entry: play inside the playlist, open the track, and for
 *  the owner a drag handle, Move up, Move down and Remove. An unavailable
 *  entry (owner only) reads Withdrawn when our team took its release down,
 *  else No longer available, and offers Remove only. An explicit track
 *  hidden by the member's settings shows its number in place of the play
 *  button. Rows glide to a new place and fade out on removal. */
export function StudioPlaylistEntryRow(props: StudioPlaylistEntryRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { entry, isOwner, isBusy, isCurrent, isPlaying } = props;
  const shouldHideExplicit = useStudioHideExplicit();
  const track = entry.track;
  const isHidden = shouldHideExplicit && track?.isExplicit === true;
  const unavailableLabel =
    entry.unavailableReason === "withdrawn"
      ? t("studio:withdrawnLive.rowLabel")
      : t("studio:playlist.row.unavailable");
  const title = track?.title ?? unavailableLabel;
  return (
    <m.li
      layout="position"
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
      className={[
        styles.setRow,
        css.row,
        isOwner && css.rowOwner,
        !entry.isAvailable && css.rowUnavailable,
        isHidden && hiddenCss.hidden,
        isCurrent && styles.setRowNow,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isCurrent ? "true" : undefined}
      onDragOver={(event) => {
        if (isOwner && event.dataTransfer.types.includes(ENTRY_DRAG_TYPE))
          event.preventDefault();
      }}
      onDrop={(event) => {
        const draggedEntryId = event.dataTransfer.getData(ENTRY_DRAG_TYPE);
        if (!isOwner || !draggedEntryId) return;
        event.preventDefault();
        props.onDropAt(draggedEntryId);
      }}
    >
      {isOwner &&
        (entry.isAvailable ? (
          <span
            className={css.handle}
            aria-hidden
            draggable={!isBusy}
            onDragStart={(event) => startEntryDrag(event, entry.entryId)}
          >
            <FiMenu />
          </span>
        ) : (
          // An unavailable entry cannot move: the empty cell keeps the grid.
          <span className={css.handle} aria-hidden />
        ))}
      {track && !isHidden ? (
        <button
          type="button"
          className={releaseStyles.rowPlay}
          aria-disabled={!track.hasAudio || undefined}
          aria-label={
            isPlaying
              ? t("studio:release.pauseTrack", { title })
              : t("studio:release.playTrack", { title })
          }
          onClick={() => {
            if (track.hasAudio) props.onPlay();
          }}
        >
          <span className={releaseStyles.rowNumber} aria-hidden>
            {entry.position}
          </span>
          <span className={releaseStyles.rowIcon} aria-hidden>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </span>
        </button>
      ) : track ? (
        <StudioHiddenTrackNumber position={entry.position} />
      ) : (
        <span className={css.position} aria-hidden>
          {entry.position}
        </span>
      )}
      <div className={styles.srCov}>
        <ImageSlot
          src={track?.release.coverUrl ?? undefined}
          tint={track?.release.tint ?? "plum"}
          width={36}
          height={36}
          radius={5}
          placeholder=""
        />
      </div>
      <div className={css.main}>
        <h5>
          {track ? (
            <Link to={track.href} className={kit.titleLink}>
              {track.title}
            </Link>
          ) : (
            title
          )}
        </h5>
        {track && (
          <div className={styles.who}>
            {`${track.release.artist.name} · ${track.release.title}`}
          </div>
        )}
        {isHidden && <StudioHiddenTrackNote />}
      </div>
      <div className={`${styles.tm} ${css.duration} ${releaseStyles.timeCell}`}>
        {track?.durationLabel ?? ""}
        {track && (
          <StudioTrackMenu
            track={{
              id: track.id,
              title: track.title,
              href: track.href,
              hasAudio: track.hasAudio,
              isExplicit: track.isExplicit,
            }}
          />
        )}
      </div>
      {isOwner && <EntryControls {...props} title={title} />}
    </m.li>
  );
}
