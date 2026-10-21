import { useMemo } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiMenu,
  FiMove,
  FiTrash2,
} from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistEntryView } from "./api/studio.adapters";
import {
  StudioTrackRow,
  StudioTrackRowUnavailable,
} from "./kit/StudioTrackRow";
import { StudioMenu, type StudioMenuItem } from "./kit/StudioMenu";
import { startEntryDrag } from "./studioPlaylistEntryDrag";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import { StudioPlaylistAddedBy } from "./StudioPlaylistAddedBy";
import css from "./StudioPlaylistPage.module.css";

const FINE_POINTER = "(pointer: fine)";

export type PlaylistEntryControl = "moveUp" | "moveDown" | "remove";

export type RegisterEntryControl = (
  entryId: string,
  control: PlaylistEntryControl,
  element: HTMLButtonElement | null,
) => void;

interface StudioPlaylistEntryRowProps {
  entry: StudioPlaylistEntryView;
  /** The row's place in the list as shown (search and sort included). */
  index: number;
  rowCount: number;
  /** The owner or an editor: Remove, and while the list shows its own
   *  order, a drag handle, Move up and Move down. */
  hasEditRights: boolean;
  /** The list shows its own order (no search, no sort): rows can move. */
  isReorderable: boolean;
  /** The playlist has editors: each row says who added it. */
  isCollaborative: boolean;
  /** A playlist write is saving (a move or a removal): moves, drags and
   *  Remove wait, and aria-disabled keeps focus on the pressed button. */
  isBusy: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  /** Left out, each row reads "Hide explicit tracks" itself. */
  shouldHideExplicit?: boolean;
  selection?: StudioRowSelection;
  registerControl: RegisterEntryControl;
  /** Play, Move and Remove are stable per row (the list keeps one of each
   *  per entry), so the memoised row and its controls stay still. Drops
   *  land on the list itself, so no row needs a handler of its own. */
  onPlay: () => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}

function EntryControls({
  entry,
  title,
  index,
  rowCount,
  isBusy,
  isReorderable,
  registerControl,
  onMove,
  onRemove,
}: Pick<
  StudioPlaylistEntryRowProps,
  | "entry"
  | "index"
  | "rowCount"
  | "isBusy"
  | "isReorderable"
  | "registerControl"
  | "onMove"
  | "onRemove"
> & { title: string }) {
  const { t } = useTranslation();
  const isMoveUpBlocked = isBusy || index === 0;
  const isMoveDownBlocked = isBusy || index === rowCount - 1;
  const canMove = entry.isAvailable && isReorderable;
  return (
    <>
      <EntryPhoneMenu
        title={title}
        canMove={canMove}
        isMoveUpBlocked={isMoveUpBlocked}
        isMoveDownBlocked={isMoveDownBlocked}
        isBusy={isBusy}
        removeLabel={
          entry.isAvailable
            ? t("studio:playlist.row.remove", { title })
            : t("studio:playlist.row.removeUnavailable", {
                position: entry.position,
              })
        }
        onMove={onMove}
        onRemove={onRemove}
      />
      {/* Below --sm the row keeps the heart and "..." alone and these move
          into the menu above (and Remove into selection mode); with a mouse
          they come up with the row. */}
      <span className={css.controls} data-studio-row-extra="menu">
        {canMove && (
          <>
            <IconButton
              ref={(element: HTMLButtonElement | null) =>
                registerControl(entry.entryId, "moveUp", element)
              }
              size="sm"
              className={css.control}
              aria-disabled={isMoveUpBlocked || undefined}
              aria-label={t("studio:playlist.row.moveUp", { title })}
              onClick={() => {
                if (!isMoveUpBlocked) onMove(-1);
              }}
            >
              <FiArrowUp aria-hidden />
            </IconButton>
            <IconButton
              ref={(element: HTMLButtonElement | null) =>
                registerControl(entry.entryId, "moveDown", element)
              }
              size="sm"
              className={css.control}
              aria-disabled={isMoveDownBlocked || undefined}
              aria-label={t("studio:playlist.row.moveDown", { title })}
              onClick={() => {
                if (!isMoveDownBlocked) onMove(1);
              }}
            >
              <FiArrowDown aria-hidden />
            </IconButton>
          </>
        )}
        <IconButton
          ref={(element: HTMLButtonElement | null) =>
            registerControl(entry.entryId, "remove", element)
          }
          size="sm"
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
        </IconButton>
      </span>
    </>
  );
}

/** The phone's one control for an entry: a menu with Move up, Move down
 *  and Remove, in place of three buttons that would squeeze the title. */
function EntryPhoneMenu({
  title,
  canMove,
  isMoveUpBlocked,
  isMoveDownBlocked,
  isBusy,
  removeLabel,
  onMove,
  onRemove,
}: {
  title: string;
  canMove: boolean;
  isMoveUpBlocked: boolean;
  isMoveDownBlocked: boolean;
  isBusy: boolean;
  removeLabel: string;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const label = t("studio:playlist.row.arrangeMenu", { title });
  const moveItems: StudioMenuItem[] = canMove
    ? [
        {
          id: "moveUp",
          label: t("studio:playlist.row.moveUp", { title }),
          icon: <FiArrowUp aria-hidden />,
          isDisabled: isMoveUpBlocked,
          onSelect: () => onMove(-1),
        },
        {
          id: "moveDown",
          label: t("studio:playlist.row.moveDown", { title }),
          icon: <FiArrowDown aria-hidden />,
          isDisabled: isMoveDownBlocked,
          onSelect: () => onMove(1),
        },
        { id: "removeSeparator", type: "separator" },
      ]
    : [];
  return (
    <span className={css.phoneMenu}>
      <StudioMenu
        trigger={
          <IconButton size="sm" className={css.control} aria-label={label}>
            <FiMove aria-hidden />
          </IconButton>
        }
        label={label}
        items={[
          ...moveItems,
          {
            id: "remove",
            label: removeLabel,
            icon: <FiTrash2 aria-hidden />,
            tone: "danger",
            isDisabled: isBusy,
            onSelect: onRemove,
          },
        ]}
      />
    </span>
  );
}

/** One playlist entry on the shared track row: play inside the playlist,
 *  the explicit badge, artist and release links, the heart, Add to
 *  playlist, the track menu, and a checkbox in selection mode. The owner
 *  and editors also get a drag handle, Move up, Move down and Remove, and
 *  on a collaborative playlist who added it. An unavailable entry (owner
 *  and editors only) reads Withdrawn when our team took its release down,
 *  else No longer available, and offers Remove only. Rows glide to a new
 *  place and fade out on removal. */
export function StudioPlaylistEntryRow(props: StudioPlaylistEntryRowProps) {
  const { t } = useTranslation();
  const { entry, index, hasEditRights, isReorderable, isBusy } = props;
  const track = entry.track;
  const unavailableLabel =
    entry.unavailableReason === "withdrawn"
      ? t("studio:withdrawnLive.rowLabel")
      : t("studio:playlist.row.unavailable");
  const title = track?.title ?? unavailableLabel;
  const { rowCount, registerControl, onMove, onRemove, isCollaborative } =
    props;
  const isMovable = entry.isAvailable && isReorderable;
  // Native drag needs a fine pointer; a touch row gives the column back to
  // the title and moves through Move up and Move down.
  const canDrag = useMediaQuery(FINE_POINTER);
  const handle = useMemo(
    () =>
      !hasEditRights || !canDrag ? undefined : isMovable ? (
        <span
          className={css.handle}
          aria-hidden
          draggable={!isBusy}
          onDragStart={(event) => startEntryDrag(event, entry.entryId)}
        >
          <FiMenu />
        </span>
      ) : (
        // An entry that cannot move keeps the column with an empty cell.
        <span className={css.handle} aria-hidden />
      ),
    [hasEditRights, canDrag, isMovable, isBusy, entry.entryId],
  );
  const controls = useMemo(
    () =>
      hasEditRights ? (
        <EntryControls
          entry={entry}
          title={title}
          index={index}
          rowCount={rowCount}
          isBusy={isBusy}
          isReorderable={isReorderable}
          registerControl={registerControl}
          onMove={onMove}
          onRemove={onRemove}
        />
      ) : undefined,
    [
      hasEditRights,
      entry,
      title,
      index,
      rowCount,
      isBusy,
      isReorderable,
      registerControl,
      onMove,
      onRemove,
    ],
  );
  const addedBy = entry.addedBy;
  const details = useMemo(
    () =>
      isCollaborative && addedBy ? (
        <StudioPlaylistAddedBy person={addedBy} />
      ) : undefined,
    [isCollaborative, addedBy],
  );
  if (!track)
    return (
      <StudioTrackRowUnavailable
        number={index + 1}
        label={unavailableLabel}
        leading={handle}
        actions={controls}
      />
    );
  return (
    <StudioTrackRow
      track={track}
      index={index}
      isCurrent={props.isCurrent}
      isPlaying={props.isPlaying}
      onPlay={props.onPlay}
      selection={props.selection}
      selectionId={entry.entryId}
      shouldHideExplicit={props.shouldHideExplicit}
      leading={handle}
      extraActions={controls}
      details={details}
      isLayoutAnimated
      isDraggable
    />
  );
}
