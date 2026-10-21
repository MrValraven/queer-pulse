import { memo } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { ImageSlot } from "../../../shared/components/ui";
import { useStudioHideExplicit } from "../api/useStudioPlaybackPreferences";
import { StudioTrackMenuAt } from "../player/ui/StudioTrackMenu";
import hiddenCss from "../StudioHiddenTrack.module.css";
import { STUDIO_EXIT, STUDIO_FADE, studioStaggerDelay } from "../studioMotion";
import { StudioTrackRowLead } from "./StudioTrackRowLead";
import {
  StudioTrackRowActions,
  StudioTrackRowMain,
  type StudioTrackRowAction,
} from "./StudioTrackRowParts";
import { StudioTrackRowUnavailable } from "./StudioTrackRowUnavailable";
import {
  ROW_LAYOUT_TRANSITION,
  studioTrackRowMenuTrack,
} from "./studioTrackRow.types";
import {
  areTrackRowPropsEqual,
  type StudioTrackRowProps,
} from "./studioTrackRowProps";
import { useStudioTrackRowInteractions } from "./useStudioTrackRowInteractions";
import css from "./StudioTrackRow.module.css";

export type {
  StudioTrackRowAction,
  StudioTrackRowHeadingLevel,
  StudioTrackRowLikeOptions,
} from "./StudioTrackRowParts";
export type {
  StudioTrackRowRelease,
  StudioTrackSummary,
} from "./studioTrackRow.types";
export type {
  StudioTrackRowDropTarget,
  StudioTrackRowProps,
} from "./studioTrackRowProps";
export { StudioTrackRowUnavailable } from "./StudioTrackRowUnavailable";

const NO_ACTIONS_HIDDEN: readonly StudioTrackRowAction[] = [];

/** Rows past this place in a list appear without the arrival fade, so a
 *  long page that pages in never animates hundreds of rows. */
const ANIMATED_ARRIVAL_ROWS = 20;

type StudioTrackRowBodyProps = StudioTrackRowProps & {
  number: number;
  shouldHideExplicit: boolean;
};

/** Reads "Hide explicit tracks" for a row whose list did not pass it. */
function StudioTrackRowWithSetting(
  props: Omit<StudioTrackRowBodyProps, "shouldHideExplicit">,
) {
  const shouldHideExplicit = useStudioHideExplicit();
  return (
    <StudioTrackRowBody {...props} shouldHideExplicit={shouldHideExplicit} />
  );
}

function StudioTrackRowComponent(props: StudioTrackRowProps) {
  const { track, isOwnerView = false, shouldHideExplicit } = props;
  const number = props.index !== undefined ? props.index + 1 : track.position;
  if (track.isWithheld && !isOwnerView)
    return (
      <StudioTrackRowUnavailable
        number={number}
        showCover={props.showCover}
        leading={props.leading}
        headingLevel={props.headingLevel}
        details={props.details}
        isLayoutAnimated={props.isLayoutAnimated}
      />
    );
  if (shouldHideExplicit === undefined)
    return <StudioTrackRowWithSetting {...props} number={number} />;
  return (
    <StudioTrackRowBody
      {...props}
      number={number}
      shouldHideExplicit={shouldHideExplicit}
    />
  );
}

/** The one Studio track row, memoised. One Tab stop per row, the lead cell
 *  (play, or the checkbox while selecting; the title on a hidden or blocked
 *  row), where Enter and Space act natively. Up and Down move between rows,
 *  Left and Right across the row's controls, Shift+F10 or the Menu key open
 *  the track menu, as do right-click and long-press. Selection mode takes
 *  Shift ranges. A hidden explicit track shows its number greyed with a
 *  link to the setting; a listener's withheld track keeps its place and
 *  offers nothing. */
export const StudioTrackRow = memo(
  StudioTrackRowComponent,
  areTrackRowPropsEqual,
);

function StudioTrackRowBody({
  track,
  number,
  index = 0,
  showCover = true,
  showRelease = true,
  showArtist = true,
  isCurrent = false,
  isPlaying = false,
  onPlay,
  selection,
  selectionId = track.id,
  extraActions,
  leading,
  headingLevel = 3,
  trailing,
  details,
  isDraggable = false,
  dropTarget,
  isPlayBlocked: isReleaseBlocked = false,
  hiddenActions = NO_ACTIONS_HIDDEN,
  likeOptions,
  isLayoutAnimated = false,
  shouldHideExplicit,
  rowRef,
  className,
}: StudioTrackRowBodyProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const menuTrack = studioTrackRowMenuTrack(track);
  const isHidden = shouldHideExplicit && track.isExplicit;
  const isPlayBlocked = isReleaseBlocked || !track.hasAudio;
  const isRowPlaying = isCurrent && isPlaying;
  const isSelecting = selection?.isSelecting ?? false;
  const isSelected = selection?.isSelected(selectionId) ?? false;
  const {
    setRowElement,
    focusTargetRef,
    rowHandlers,
    menuPoint,
    hasMenuMounted,
    closeMenu,
  } = useStudioTrackRowInteractions({
    rowRef,
    selection,
    selectionId,
    isSelecting,
    hasMenu: !hiddenActions.includes("menu"),
    onPlay: isPlayBlocked || isHidden ? null : onPlay,
    dragPayload:
      isDraggable && !isHidden ? JSON.stringify({ trackId: track.id }) : null,
    dragUrl: new URL(track.href, window.location.origin).toString(),
  });

  const isArrivalAnimated = index < ANIMATED_ARRIVAL_ROWS;
  return (
    <>
      <m.li
        ref={setRowElement}
        layout={isLayoutAnimated && !reducedMotion ? "position" : false}
        initial={
          isArrivalAnimated
            ? { opacity: 0, ...(reducedMotion ? {} : { y: 6 }) }
            : false
        }
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: STUDIO_EXIT }}
        transition={
          reducedMotion
            ? { duration: 0.12 }
            : {
                ...STUDIO_FADE,
                delay: studioStaggerDelay(index),
                layout: ROW_LAYOUT_TRANSITION,
              }
        }
        data-studio-track-row=""
        data-selection-id={selectionId}
        data-selection-list={selection?.listId}
        data-exiting={!isPresent || undefined}
        data-current={isCurrent || undefined}
        data-playing={isRowPlaying || undefined}
        data-menu-open={menuPoint !== null || undefined}
        data-selecting={isSelecting || undefined}
        data-selected={isSelected || undefined}
        data-hidden={isHidden || undefined}
        aria-current={isCurrent ? "true" : undefined}
        className={[
          css.row,
          leading !== undefined && css.hasLeading,
          showCover && css.hasCover,
          trailing !== undefined && css.hasTrailing,
          isHidden && hiddenCss.hidden,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rowHandlers}
        onDragOver={dropTarget?.onDragOver}
        onDrop={dropTarget?.onDrop}
      >
        {leading !== undefined && <div className={css.leading}>{leading}</div>}
        <StudioTrackRowLead
          mode={isSelecting ? "select" : isHidden ? "hidden" : "play"}
          number={number}
          title={track.title}
          isPlaying={isRowPlaying}
          isPlayBlocked={isPlayBlocked}
          isSelected={isSelected}
          onPlay={onPlay}
          onToggleSelect={(withShift) =>
            selection?.toggle(selectionId, withShift)
          }
        />
        {showCover && (
          <div className={css.cover}>
            <ImageSlot
              src={track.release.coverUrl ?? undefined}
              tint={track.release.tint}
              width={40}
              height={40}
              radius={6}
              placeholder=""
            />
          </div>
        )}
        <StudioTrackRowMain
          track={track}
          headingLevel={headingLevel}
          showArtist={showArtist}
          showRelease={showRelease}
          isHidden={isHidden}
          isCurrent={isCurrent}
          isTitleFocusTarget={!isSelecting && (isHidden || isPlayBlocked)}
          details={details}
        />
        {trailing !== undefined && (
          <div className={css.trailing}>{trailing}</div>
        )}
        <StudioTrackRowActions
          track={track}
          isPlayBlocked={isReleaseBlocked}
          hiddenActions={hiddenActions}
          extraActions={extraActions}
          menuTrack={menuTrack}
          likeOptions={likeOptions}
        />
      </m.li>
      {/* Outside the row, so presses inside the portalled menu never reach
          the row's long-press handlers through React's tree. */}
      {hasMenuMounted && (
        <StudioTrackMenuAt
          trackId={track.id}
          track={menuTrack}
          point={menuPoint}
          onClose={closeMenu}
          returnFocusRef={focusTargetRef}
        />
      )}
    </>
  );
}
