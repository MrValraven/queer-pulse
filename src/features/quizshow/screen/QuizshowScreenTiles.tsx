import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { QuizshowScreenLanguage } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QUIZSHOW_SWATCHES } from "../quizshowSwatches";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { useStageScreenLanguage } from "./QuizshowScreenChrome";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import type { ScreenTile } from "./quizshowScreenTileModel";
import { SCREEN_EASE, SCREEN_EASE_OUT } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

/** The tiles rise in one after another when the question opens. The stagger
 *  stops growing after the fourth tile, so the last one always lands by
 *  400ms, six order rows included. */
const RISE_DURATION_S = 0.3;
const RISE_STAGGER_S = 0.025;
const RISE_STAGGER_STEPS_MAX = 4;
const RISE_OFFSET_PX = 28;
/** Past this many characters an answer reads as a sentence; the grid steps its type down. */
const LONG_ANSWER_CHARACTERS = 40;

/**
 * The answer as the tile draws it: under 'both' with two different, filled
 * sides, the EN and PT lines together (the rule QuizshowStageText draws by);
 * otherwise the tile's one-language text. Its length steps the type down,
 * and the tile's accessible name reads both lines.
 */
function drawnTextOf(
  tile: ScreenTile,
  screenLanguage: QuizshowScreenLanguage | null,
): string {
  if (screenLanguage !== "both" || tile.optionText === null) return tile.text;
  const englishText = tile.optionText.en.trim();
  const portugueseText = tile.optionText.pt.trim();
  if (
    englishText === "" ||
    portugueseText === "" ||
    englishText === portugueseText
  ) {
    return tile.text;
  }
  return `${englishText}, ${portugueseText}`;
}

interface TileListProps {
  tiles: ScreenTile[];
  isColumn: boolean;
  size: QuizshowScreenStageSize;
  /** `read`: the question shows alone, the tiles wait out of sight. */
  isWaiting: boolean;
}

/** The answer tiles. They rise in at `open`, and an order question's rows glide into the right order at the reveal. */
export function TileList({ tiles, isColumn, size, isWaiting }: TileListProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // The stage's screen language: under 'both' an option shows EN, then PT (C6.26).
  const screenLanguage = useStageScreenLanguage();
  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: SCREEN_EASE };
  const riseOffset = reducedMotion ? 0 : RISE_OFFSET_PX;
  const hasLongAnswer = tiles.some(
    (tile) => drawnTextOf(tile, screenLanguage).length > LONG_ANSWER_CHARACTERS,
  );
  return (
    <ul
      className={isColumn ? styles.tileColumn : styles.tileGrid}
      data-long={hasLongAnswer ? "true" : undefined}
      aria-hidden={isWaiting ? "true" : undefined}
    >
      {tiles.map((tile, tileIndex) => {
        const answerLabel = t("quizshow:stage.answerLabel", {
          letter: tile.letter,
          shape: t(QUIZSHOW_SWATCHES[tile.colorKey].labelKey),
          text: drawnTextOf(tile, screenLanguage),
        });
        return (
          <m.li
            key={tile.key}
            layout={reducedMotion ? false : "position"}
            initial={false}
            animate={
              isWaiting ? { opacity: 0, y: riseOffset } : { opacity: 1, y: 0 }
            }
            transition={{
              layout: layoutTransition,
              default: {
                duration: reducedMotion ? 0 : RISE_DURATION_S,
                delay:
                  reducedMotion || isWaiting
                    ? 0
                    : Math.min(tileIndex, RISE_STAGGER_STEPS_MAX) *
                      RISE_STAGGER_S,
                ease: SCREEN_EASE_OUT,
              },
            }}
            data-tile-state={tile.state}
          >
            <QuizshowAnswerTile
              colorKey={tile.colorKey}
              letter={tile.letter}
              text={tile.text}
              quizText={
                tile.optionText === null || screenLanguage === null
                  ? null
                  : { text: tile.optionText, language: screenLanguage }
              }
              size={size}
              state={tile.state}
              share={tile.share}
              ariaLabel={
                tile.state === "correct"
                  ? `${t("quizshow:stage.correctAnswer")}, ${answerLabel}`
                  : answerLabel
              }
            />
          </m.li>
        );
      })}
    </ul>
  );
}
