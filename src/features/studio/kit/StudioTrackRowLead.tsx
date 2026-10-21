import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StudioPlayPauseIcon } from "../player/ui/StudioIconSwap";
import { StudioHiddenTrackNumber } from "../StudioHiddenTrack";
import { STUDIO_FADE, STUDIO_SPRING } from "../studioMotion";
import css from "./StudioTrackRow.module.css";

export type StudioTrackRowLeadMode = "play" | "select" | "hidden";

interface StudioTrackRowLeadProps {
  mode: StudioTrackRowLeadMode;
  number: number;
  title: string;
  isPlaying: boolean;
  isPlayBlocked: boolean;
  isSelected: boolean;
  onPlay: () => void;
  onToggleSelect: (withShift: boolean) => void;
}

/** The Tab stop's attributes: only a present (not exiting) control holds
 *  it, so focus never lands on a layer that is fading out. */
function focusProps(isFocusTarget: boolean) {
  return isFocusTarget
    ? { tabIndex: 0, "data-studio-row-focus": "" }
    : { tabIndex: -1 };
}

/** Three bars that bounce while the row plays and rest still when paused
 *  or under reduced motion. Decorative: the row's aria-current and the play
 *  button's Pause label carry the state. */
function StudioRowEqualizer({ isMoving }: { isMoving: boolean }) {
  return (
    <span
      className={css.equalizer}
      data-moving={isMoving || undefined}
      aria-hidden="true"
    >
      <span className={css.equalizerBar} />
      <span className={css.equalizerBar} />
      <span className={css.equalizerBar} />
    </span>
  );
}

function StudioRowPlayButton({
  number,
  title,
  isPlaying,
  isPlayBlocked,
  onPlay,
}: Pick<
  StudioTrackRowLeadProps,
  "number" | "title" | "isPlaying" | "isPlayBlocked" | "onPlay"
>) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <IconButton
      {...focusProps(isPresent && !isPlayBlocked)}
      className={css.playButton}
      aria-label={t(
        isPlaying ? "studio:release.pauseTrack" : "studio:release.playTrack",
        { title },
      )}
      aria-disabled={isPlayBlocked || undefined}
      onClick={() => {
        if (!isPlayBlocked) onPlay();
      }}
    >
      <span className={css.leadNumber} aria-hidden="true">
        {number}
      </span>
      <StudioRowEqualizer isMoving={isPlaying && !reducedMotion} />
      <span className={css.leadIcon} aria-hidden="true">
        <StudioPlayPauseIcon isPlaying={isPlaying} />
      </span>
    </IconButton>
  );
}

function StudioRowCheckbox({
  title,
  isSelected,
  onToggleSelect,
}: Pick<StudioTrackRowLeadProps, "title" | "isSelected" | "onToggleSelect">) {
  const { t } = useTranslation();
  const isPresent = useIsPresent();
  return (
    <label className={css.check}>
      <input
        {...focusProps(isPresent)}
        type="checkbox"
        className={css.checkInput}
        checked={isSelected}
        readOnly
        aria-label={t("studio:trackRow.selectAria", { title })}
        onClick={(event) => onToggleSelect(event.shiftKey)}
      />
      <span className={css.checkBox} aria-hidden="true">
        <FiCheck className={css.checkMark} />
      </span>
    </label>
  );
}

/** The row's first cell: the number that turns into play or pause on hover
 *  and focus, the equaliser on the playing row, the checkbox in selection
 *  mode, or the inert number of a hidden explicit track. The checkbox and
 *  the play button swap in one grid cell with a spring. */
export function StudioTrackRowLead(props: StudioTrackRowLeadProps) {
  const { reducedMotion } = useMotionPrefs();
  const { mode } = props;
  const enter = reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 };
  const transition = reducedMotion
    ? { duration: 0.12 }
    : { ...STUDIO_SPRING, opacity: STUDIO_FADE };
  return (
    <div className={css.lead}>
      <AnimatePresence initial={false}>
        <m.span
          key={mode}
          className={css.leadLayer}
          initial={enter}
          animate={{ opacity: 1, scale: 1 }}
          exit={enter}
          transition={transition}
        >
          {mode === "select" ? (
            <StudioRowCheckbox
              title={props.title}
              isSelected={props.isSelected}
              onToggleSelect={props.onToggleSelect}
            />
          ) : mode === "hidden" ? (
            <StudioHiddenTrackNumber position={props.number} />
          ) : (
            <StudioRowPlayButton {...props} />
          )}
        </m.span>
      </AnimatePresence>
    </div>
  );
}
