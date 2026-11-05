import type { CSSProperties } from "react";
import { m } from "motion/react";
import { FiUser } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import type { QuizshowTeamColorKey } from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { QuizshowShape } from "../QuizshowShape";
import { QUIZSHOW_SWATCHES } from "../quizshowSwatches";
import styles from "./QuizshowPlayerLobby.module.css";

/** One slow breath outward, every 2.6 s: the chip is alive without asking to be looked at. */
const PULSE_TRANSITION = {
  duration: 2.6,
  ease: [0.16, 1, 0.3, 1],
  repeat: Infinity,
  repeatDelay: 0.4,
} as const;

interface QuizshowLobbyChipProps {
  screenName: string;
  /** The player's team shape and colour; null plays solo in the stage coral. */
  teamColorKey: QuizshowTeamColorKey | null;
}

/** The player's own chip in the lobby, with a gentle pulse in their team colour. */
export function QuizshowLobbyChip({
  screenName,
  teamColorKey,
}: QuizshowLobbyChipProps) {
  const { reducedMotion } = useMotionPrefs();
  const chipStyle = {
    "--chip-color":
      teamColorKey === null
        ? "var(--accent)"
        : QUIZSHOW_SWATCHES[teamColorKey].fillVar,
  } as CSSProperties;
  return (
    <span className={styles.chipStage} style={chipStyle}>
      <span className={styles.chip}>
        <span className={styles.chipMark} aria-hidden="true">
          {/* The halo is a fixed circle around the mark, so a long name never balloons with it. */}
          {reducedMotion ? (
            <span className={styles.chipPulse} />
          ) : (
            <m.span
              className={styles.chipPulse}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={PULSE_TRANSITION}
            />
          )}
          {teamColorKey === null ? (
            <FiUser fill="none" />
          ) : (
            <QuizshowShape
              colorKey={teamColorKey}
              size="small"
              label={null}
              isGlowing
            />
          )}
        </span>
        <span className={styles.chipName}>{screenName}</span>
      </span>
    </span>
  );
}

/** How many people have joined so far; the figure rolls as players arrive. */
export function QuizshowLobbyCount({ playerCount }: { playerCount: number }) {
  const format = useFormat();
  return (
    <p className={styles.count}>
      <span className={styles.countDot} aria-hidden="true" />
      <Translation
        i18nKey="quizshow:live.players"
        values={{ count: playerCount }}
        slots={{
          count: (
            <RollingNumber
              className={styles.countFigure}
              value={format.number(playerCount)}
              numericValue={playerCount}
            />
          ),
        }}
      />
    </p>
  );
}
